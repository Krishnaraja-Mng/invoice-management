import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source";
import invoiceRoutes from "./routes/invoices";

dotenv.config();

const app = express();
app.use(express.json());

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source initialized");

        app.get("/health", (_req, res) => res.json({ ok: true }));

        app.use("/invoices", invoiceRoutes);

        const port = process.env.PORT || 4000;
        app.listen(port, () => console.log(`Server listening on ${port}`));
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err);
    });