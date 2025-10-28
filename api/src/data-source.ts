import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Invoice } from "./entities/Invoice";
import { Customer } from "./entities/Customer";
import { User } from "./entities/User";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    database: "invoices_db",
    synchronize: false, // keep migrations in production
    logging: false,
    entities: [Invoice, Customer, User],
    migrations: [__dirname + "/migration/*.{ts,js}"],
});