import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { Invoice } from "./Invoice";
import { Customer } from "./Customer";

@Entity({ name: "users" })
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "text", nullable: false })
    name!: string;

    @Column({ type: "text", nullable: true, unique: true })
    email!: string | null;

    // hashed password, not selected by default for safety
    @Column({ type: "varchar", length: 255, nullable: true, select: false })
    password!: string | null;

    // role: 'user' | 'admin'
    @Column({ type: "varchar", length: 20, nullable: false, default: "user" })
    role!: string;

    @Column({ type: "varchar", length: 500, nullable: true })
    address!: string | null;

    @Column({ type: "boolean", name: "gst_registered", default: false })
    gstRegistered!: boolean;

    @Column({ type: "varchar", length: 15, name: "gst_number", nullable: true })
    gstNumber!: string | null;

    @Column({ type: "varchar", length: 10, name: "pan_number", nullable: true })
    panNumber!: string | null;

    @Column({ type: "varchar", length: 30, name: "service_provider_state", nullable: true })
    serviceProviderState!: string | null;

    @Column({ type: "varchar", length: 2, name: "service_provider_state_code", nullable: true })
    serviceProviderStateCode!: string | null;

    // created_by / updated_by (self-referential). DB default sentinel UUID inserted by migration.
    @Column({
        type: "uuid",
        name: "created_by",
        nullable: false,
        default: "'00000000-0000-0000-0000-000000000000'",
    })
    createdById!: string;

    @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "created_by" })
    createdBy!: User | null;

    @Column({
        type: "uuid",
        name: "updated_by",
        nullable: false,
        default: "'00000000-0000-0000-0000-000000000000'",
    })
    updatedById!: string;

    @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "updated_by" })
    updatedBy!: User | null;

    @CreateDateColumn({ type: "timestamptz", name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
    updatedAt!: Date;

    // relations
    @OneToMany(() => Invoice, (invoice) => invoice.createdBy)
    createdInvoices!: Invoice[];

    @OneToMany(() => Invoice, (invoice) => invoice.updatedBy)
    updatedInvoices!: Invoice[];

    @OneToMany(() => Customer, (customer) => customer.createdBy)
    createdCustomers!: Customer[];

    @OneToMany(() => Customer, (customer) => customer.updatedBy)
    updatedCustomers!: Customer[];
}