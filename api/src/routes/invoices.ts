import { Router } from "express";
import { InvoiceController } from "../controllers/invoice.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkInvoiceOwnerOrAdmin } from "../middleware/ownership.middleware";

const router = Router();
const controller = new InvoiceController();

// Protect all invoice routes
router.use(authMiddleware);

// POST /invoices       -> authenticated users create invoices
router.post("/", (req, res) => controller.create(req, res));

// GET /invoices        -> list invoices for the authenticated user (or admin)
router.get("/", (req, res) => controller.list(req, res));

// GET /invoices/:id    -> either owner or admin can view
router.get("/:id", checkInvoiceOwnerOrAdmin, (req, res) => controller.getById(req, res));

// PUT /invoices/:id    -> owner or admin can update
router.put("/:id", checkInvoiceOwnerOrAdmin, (req, res) => controller.update(req, res));

// DELETE /invoices/:id -> admin only
import { requireRole } from "../middleware/auth.middleware";
router.delete("/:id", requireRole("admin"), (req, res) => controller.delete(req, res));

export default router;