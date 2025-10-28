import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Invoice, LineItem } from "../entities/Invoice";
import { Customer } from "../entities/Customer";
import { User } from "../entities/User";
import { Repository } from "typeorm";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CreateInvoiceDto } from "../dto/create-invoice.dto";

/**
 * InvoiceController
 *
 * Routes wiring (api/src/routes/invoices.ts) expects:
 * - POST   /         -> create
 * - GET    /         -> list
 * - GET    /:id      -> getById
 * - PUT    /:id      -> update
 * - DELETE /:id      -> delete  (admin-only via requireRole)
 *
 * The route-level middleware enforces authentication and ownership where required.
 * Controller still performs basic defensive checks.
 */
export class InvoiceController {
    private invoiceRepo: Repository<Invoice>;
    private customerRepo: Repository<Customer>;
    private userRepo: Repository<User>;

    constructor() {
        this.invoiceRepo = AppDataSource.getRepository(Invoice);
        this.customerRepo = AppDataSource.getRepository(Customer);
        this.userRepo = AppDataSource.getRepository(User);
    }

    // POST /invoices
    async create(req: Request, res: Response) {
        try {
            const dto = plainToInstance(CreateInvoiceDto, req.body);
            const errors = await validate(dto as any);
            if (errors.length > 0) {
                return res.status(400).json({ errors });
            }

            // compute per-line totals
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

            const subtotal = Number(
                lineItems.reduce((s, it) => s + (it.line_price_total || 0), 0).toFixed(2)
            );

            const sgstPercent = Number(dto.sgstPercent || 0);
            const cgstPercent = Number(dto.cgstPercent || 0);
            const igstPercent = Number(dto.igstPercent || 0);

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

            // set audit and ownership fields from authenticated user if available
            const authUser = (req as any).user as { id?: string } | undefined;
            if (authUser && authUser.id) {
                invoice.createdById = authUser.id;
                invoice.updatedById = authUser.id;
                invoice.invoiceBelongsToId = authUser.id;
            }

            const saved = await this.invoiceRepo.save(invoice);
            return res.status(201).json(saved);
        } catch (err) {
            console.error("Invoice create error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // GET /invoices
    // Supports: page, limit, status, customerId query params
    async list(req: Request, res: Response) {
        try {
            const user = (req as any).user as { id?: string; role?: string } | undefined;
            if (!user || !user.id) return res.status(401).json({ message: "Unauthenticated" });

            const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
            const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || "20", 10)));
            const skip = (page - 1) * limit;

            const status = req.query.status as string | undefined;
            const customerId = req.query.customerId as string | undefined;

            const qb = this.invoiceRepo.createQueryBuilder("invoice");

            // Apply filters
            if (status) {
                qb.andWhere("invoice.status = :status", { status });
            }
            if (customerId) {
                qb.andWhere("invoice.customer_id = :customerId", { customerId });
            }

            // Non-admins only see invoices they own or created
            if (user.role !== "admin") {
                qb.andWhere(
                    "(invoice.invoice_belongs_to = :uid OR invoice.created_by = :uid)",
                    { uid: user.id }
                );
            }

            qb.orderBy("invoice.created_at", "DESC").skip(skip).take(limit);

            const [items, total] = await qb.getManyAndCount();

            return res.json({
                data: items,
                meta: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            });
        } catch (err) {
            console.error("Invoice list error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // GET /invoices/:id
    async getById(req: Request, res: Response) {
        try {
            const id = req.params.id;
            if (!id) return res.status(400).json({ message: "Missing id" });

            const invoice = await this.invoiceRepo.findOne({
                where: { id },
                relations: ["customer", "createdBy", "updatedBy", "invoiceBelongsTo"],
            });

            if (!invoice) return res.status(404).json({ message: "Invoice not found" });

            return res.json(invoice);
        } catch (err) {
            console.error("Invoice getById error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // PUT /invoices/:id
    async update(req: Request, res: Response) {
        try {
            const id = req.params.id;
            if (!id) return res.status(400).json({ message: "Missing id" });

            const existing = await this.invoiceRepo.findOneBy({ id });
            if (!existing) return res.status(404).json({ message: "Not found" });

            const dto = plainToInstance(CreateInvoiceDto, req.body);
            const errors = await validate(dto as any);
            if (errors.length > 0) {
                return res.status(400).json({ errors });
            }

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

            const subtotal = Number(
                lineItems.reduce((s, it) => s + (it.line_price_total || 0), 0).toFixed(2)
            );

            const sgstPercent = Number(dto.sgstPercent ?? existing.sgstPercent ?? 0);
            const cgstPercent = Number(dto.cgstPercent ?? existing.cgstPercent ?? 0);
            const igstPercent = Number(dto.igstPercent ?? existing.igstPercent ?? 0);

            const sgstAmount = Number(((subtotal * sgstPercent) / 100).toFixed(2));
            const cgstAmount = Number(((subtotal * cgstPercent) / 100).toFixed(2));
            const igstAmount = Number(((subtotal * igstPercent) / 100).toFixed(2));
            const totalTaxAmount = Number((sgstAmount + cgstAmount + igstAmount).toFixed(2));
            const totalAmount = Number((subtotal + totalTaxAmount).toFixed(2));

            existing.invoiceNumber = dto.invoiceNumber ?? existing.invoiceNumber;
            existing.customerId = dto.customerId ?? existing.customerId;
            existing.customerName = dto.customerName ?? existing.customerName;
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
            console.error("Invoice update error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // DELETE /invoices/:id  (admin-only route)
    async delete(req: Request, res: Response) {
        try {
            const id = req.params.id;
            if (!id) return res.status(400).json({ message: "Missing id" });

            const existing = await this.invoiceRepo.findOneBy({ id });
            if (!existing) return res.status(404).json({ message: "Not found" });

            await this.invoiceRepo.remove(existing);
            return res.status(204).send();
        } catch (err) {
            console.error("Invoice delete error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
}