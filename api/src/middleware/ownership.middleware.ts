import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Invoice } from "../entities/Invoice";

export async function checkInvoiceOwnerOrAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        const invoiceId = req.params.id;
        if (!invoiceId) return res.status(400).json({ message: "Missing invoice id" });

        const user = req.user;
        if (!user?.id) return res.status(401).json({ message: "Unauthenticated" });

        // Admin bypass
        if (user.role === "admin") return next();

        const repo = AppDataSource.getRepository(Invoice);
        const invoice = await repo.findOne({ where: { id: invoiceId } });

        if (!invoice) return res.status(404).json({ message: "Invoice not found" });

        // Check ownership: compare invoiceBelongsToId OR createdById
        if (invoice.invoiceBelongsToId && invoice.invoiceBelongsToId === user.id) return next();
        if (invoice.createdById && invoice.createdById === user.id) return next();

        return res.status(403).json({ message: "Forbidden: not owner" });
    } catch (err) {
        console.error("ownership check error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}