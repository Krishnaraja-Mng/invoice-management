import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Invoice, LineItem } from "../entities/Invoice";
import { Customer } from "../entities/Customer";
import { User } from "../entities/User";
import { Repository } from "typeorm";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CreateInvoiceDto } from "../dto/create-invoice";

export class InvoiceController {
    private invoiceRepo: Repository<Invoice>;
    private customerRepo: Repository<Customer>;
    private userRepo: Repository<User>;

    constructor() {
        this.invoiceRepo = AppDataSource.getRepository(Invoice);
        this.customerRepo = AppDataSource.getRepository(Customer);
        this.userRepo = AppDataSource.getRepository(User);
    }

    // Create invoice: validates DTO, computes line_price_total, subtotal, tax amounts, totals
    async create(req: Request, res: Response) {
        try {
            const dto = plainToInstance(CreateInvoiceDto, req.body);
            const errors = await validate(dto as any);
            if (errors.length > 0) {
                return res.status(400).json({ errors });
            }

            // compute line_price_total for each line
            const lineItemsInput = (dto as any).lineItems || [];
            const lineItems: LineItem[] = lineItemsInput.map((li: any) => {
                const q = Number(li.quantity) || 0;
                const up = Number(li.unitPrice) || 0;
                return {
                    description: li.description,
                    quantity: q,
                    unitPrice: up,
                    line_price_total: Number((q * up).toFixed(2)),
                };
            });

            // subtotal = sum(line_price_total)
            const subtotal = lineItems.reduce((s, it) => s + (it.line_price_total || 0), 0);

            // tax percents passed or default to 0
            const sgstPercent = Number(dto.sgstPercent || 0);
            const cgstPercent = Number(dto.cgstPercent || 0);
            const igstPercent = Number(dto.igstPercent || 0);

            // compute tax amounts (apply to subtotal)
            const sgstAmount = Number(((subtotal * sgstPercent) / 100).toFixed(2));
            const cgstAmount = Number(((subtotal * cgstPercent) / 100).toFixed(2));
            const igstAmount = Number(((subtotal * igstPercent) / 100).toFixed(2));

            const totalTaxAmount = Number((sgstAmount + cgstAmount + igstAmount).toFixed(2));
            const totalAmount = Number((subtotal + totalTaxAmount).toFixed(2));

            const invoice = this.invoiceRepo.create({
                invoiceNumber: dto.invoiceNumber || null,
                customerId: dto.customerId || null,
                customerName: dto.customerName,
                lineItems,
                subtotal,
                sgstAmount,
                cgstAmount,
                igstAmount,
                totalTaxAmount,
                sgstPercent,
                cgstPercent,
                igstPercent,
                totalAmount,
                status: "draft",
            } as Partial<Invoice>);

            // set created_by, updated_by, invoice_belongs_to from authenticated user if present
            // assume auth middleware sets req.user = { id: string, name: string, ... }
            const authUser = (req as any).user as { id?: string } | undefined;
            if (authUser && authUser.id) {
                invoice.createdById = authUser.id;
                invoice.updatedById = authUser.id;
                invoice.invoiceBelongsToId = authUser.id;
            } else {
                // leave defaults (system user) if unauthenticated
            }

            const saved = await this.invoiceRepo.save(invoice);
            return res.status(201).json(saved);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // Update invoice: recompute totals and set updated_by
    async update(req: Request, res: Response) {
        try {
            const id = req.params.id;
            const existing = await this.invoiceRepo.findOneBy({ id });
            if (!existing) return res.status(404).json({ message: "Not found" });

            const dto = plainToInstance(CreateInvoiceDto, req.body);
            const errors = await validate(dto as any);
            if (errors.length > 0) {
                return res.status(400).json({ errors });
            }

            // compute line items and totals as in create
            const lineItemsInput = (dto as any).lineItems || [];
            const lineItems: LineItem[] = lineItemsInput.map((li: any) => {
                const q = Number(li.quantity) || 0;
                const up = Number(li.unitPrice) || 0;
                return {
                    description: li.description,
                    quantity: q,
                    unitPrice: up,
                    line_price_total: Number((q * up).toFixed(2)),
                };
            });

            const subtotal = lineItems.reduce((s, it) => s + (it.line_price_total || 0), 0);
            const sgstPercent = Number(dto.sgstPercent || existing.sgstPercent || 0);
            const cgstPercent = Number(dto.cgstPercent || existing.cgstPercent || 0);
            const igstPercent = Number(dto.igstPercent || existing.igstPercent || 0);

            const sgstAmount = Number(((subtotal * sgstPercent) / 100).toFixed(2));
            const cgstAmount = Number(((subtotal * cgstPercent) / 100).toFixed(2));
            const igstAmount = Number(((subtotal * igstPercent) / 100).toFixed(2));
            const totalTaxAmount = Number((sgstAmount + cgstAmount + igstAmount).toFixed(2));
            const totalAmount = Number((subtotal + totalTaxAmount).toFixed(2));

            existing.invoiceNumber = dto.invoiceNumber || existing.invoiceNumber;
            existing.customerId = dto.customerId || existing.customerId;
            existing.customerName = dto.customerName || existing.customerName;
            existing.lineItems = lineItems;
            existing.subtotal = subtotal;
            existing.sgstAmount = sgstAmount;
            existing.cgstAmount = cgstAmount;
            existing.igstAmount = igstAmount;
            existing.totalTaxAmount = totalTaxAmount;
            existing.sgstPercent = sgstPercent;
            existing.cgstPercent = cgstPercent;
            existing.igstPercent = igstPercent;
            existing.totalAmount = totalAmount;

            const authUser = (req as any).user as { id?: string } | undefined;
            if (authUser && authUser.id) {
                existing.updatedById = authUser.id;
            }

            const saved = await this.invoiceRepo.save(existing);
            return res.json(saved);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
}