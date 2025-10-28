import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { Customer } from "./Customer";
import { User } from "./User";

/**
 * Transformer to convert Postgres numeric <-> JS number
 */
const numericTransformer = {
    to: (value?: number | null) => (value === undefined ? null : value),
    from: (value: string | null) => (value === null ? 0 : parseFloat(value)),
};

export type LineItem = {
    description: string;
    quantity: number;
    unitPrice: number;
    line_price_total?: number;
};

@Entity({ name: "invoices" })
export class Invoice {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "text", name: "invoice_number", nullable: true })
    invoiceNumber!: string | null;

    @Column({ type: "uuid", name: "customer_id", nullable: true })
    customerId!: string | null;

    @ManyToOne(() => Customer, (customer) => customer.invoices, {
        nullable: true,
        onDelete: "SET NULL",
    })
    @JoinColumn({ name: "customer_id" })
    customer!: Customer | null;

    @Column({ type: "text", name: "customer_name", nullable: false })
    customerName!: string;

    @Column({ type: "jsonb", nullable: true, name: "line_items" })
    lineItems!: LineItem[] | null;

    @Column({
        type: "numeric",
        precision: 12,
        scale: 2,
        default: 0,
        name: "subtotal",
        transformer: numericTransformer,
    })
    subtotal!: number;

    @Column({
        type: "numeric",
        precision: 12,
        scale: 2,
        default: 0,
        name: "sgst_amount",
        transformer: numericTransformer,
    })
    sgstAmount!: number;

    @Column({
        type: "numeric",
        precision: 12,
        scale: 2,
        default: 0,
        name: "cgst_amount",
        transformer: numericTransformer,
    })
    cgstAmount!: number;

    @Column({
        type: "numeric",
        precision: 12,
        scale: 2,
        default: 0,
        name: "igst_amount",
        transformer: numericTransformer,
    })
    igstAmount!: number;

    @Column({
        type: "numeric",
        precision: 12,
        scale: 2,
        default: 0,
        name: "total_tax_amount",
        transformer: numericTransformer,
    })
    totalTaxAmount!: number;

    @Column({ type: "integer", default: 0, name: "sgst_percent" })
    sgstPercent!: number;

    @Column({ type: "integer", default: 0, name: "cgst_percent" })
    cgstPercent!: number;

    @Column({ type: "integer", default: 0, name: "igst_percent" })
    igstPercent!: number;

    @Column({
        type: "numeric",
        precision: 12,
        scale: 2,
        default: 0,
        name: "total_amount",
        transformer: numericTransformer,
    })
    totalAmount!: number;

    @Column({
        type: "varchar",
        length: 50,
        default: "draft",
        name: "status",
    })
    status!: "draft" | "sent" | "invoice amount paid" | "closed" | "cancelled";

    @Column({
        type: "uuid",
        name: "created_by",
        nullable: false,
        default: "'00000000-0000-0000-0000-000000000000'",
    })
    createdById!: string;

    @ManyToOne(() => User, (user) => user.createdInvoices, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "created_by" })
    createdBy!: User | null;

    @Column({
        type: "uuid",
        name: "updated_by",
        nullable: false,
        default: "'00000000-0000-0000-0000-000000000000'",
    })
    updatedById!: string;

    @ManyToOne(() => User, (user) => user.updatedInvoices, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "updated_by" })
    updatedBy!: User | null;

    @Column({ type: "uuid", name: "invoice_belongs_to", nullable: true })
    invoiceBelongsToId!: string | null;

    @ManyToOne(() => User, (user) => user.createdInvoices, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "invoice_belongs_to" })
    invoiceBelongsTo!: User | null;

    @CreateDateColumn({ type: "timestamptz", name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
    updatedAt!: Date;
}