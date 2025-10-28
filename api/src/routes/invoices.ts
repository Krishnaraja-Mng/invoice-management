import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Invoice } from "../entities/Invoice";

const router = Router();

router.get("/", async (_req, res) => {
    const repo = AppDataSource.getRepository(Invoice);
    const all = await repo.find();
    res.json(all);
});

router.post("/", async (req, res) => {
    const repo = AppDataSource.getRepository(Invoice);
    const invoice = repo.create(req.body);
    await repo.save(invoice);
    res.status(201).json(invoice);
});

router.get("/:id", async (req, res) => {
    const repo = AppDataSource.getRepository(Invoice);
    const found = await repo.findOneBy({ id: req.params.id });
    if (!found) return res.status(404).json({ message: "Not found" });
    res.json(found);
});

export default router;