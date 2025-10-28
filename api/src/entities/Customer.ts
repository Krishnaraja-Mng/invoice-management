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
import { User } from "./User";

@Entity({ name: "customers" })
export class Customer {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "text", nullable: false })
    name!: string;

    @Column({ type: "text", nullable: true })
    email!: string | null;

    @Column({ type: "text", nullable: true })
    phone!: string | null;

    @Column({ type: "varchar", length: 500, nullable: true })
    address!: string | null;

    @Column({ type: "varchar", length: 15, name: "gst_number", nullable: true })
    gstNumber!: string | null;

    @Column({ type: "varchar", length: 10, name: "pan_number", nullable: true })
    panNumber!: string | null;

    @Column({
        type: "uuid",
        name: "created_by",
        nullable: false,
        default: "'00000000-0000-0000-0000-000000000000'",
    })
    createdById!: string;

    @ManyToOne(() => User, (user) => user.createdCustomers, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "created_by" })
    createdBy!: User | null;

    @Column({
        type: "uuid",
        name: "updated_by",
        nullable: false,
        default: "'00000000-0000-0000-0000-000000000000'",
    })
    updatedById!: string;

    @ManyToOne(() => User, (user) => user.updatedCustomers, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "updated_by" })
    updatedBy!: User | null;

    @CreateDateColumn({ type: "timestamptz", name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
    updatedAt!: Date;

    @OneToMany(() => Invoice, (invoice) => invoice.customer)
    invoices!: Invoice[];
}