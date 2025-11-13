import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { adminMiddleware } from "../middleware/admin.middleware";

const router = Router();

// All user routes require authentication (handled by parent router in index.ts)

// Get all users (admin only)
router.get("/", adminMiddleware, UserController.getUsers);

// Get single user by ID (admin only or self)
router.get("/:id", UserController.getUser);

// Create new user (admin only)
router.post("/", adminMiddleware, UserController.createUser);

// Update user (admin only or self)
router.put("/:id", UserController.updateUser);

// Soft delete user by deactivating (admin only)
router.delete("/:id", adminMiddleware, UserController.deleteUser);

// Reactivate deactivated user (admin only)
router.post("/:id/reactivate", adminMiddleware, UserController.reactivateUser);

export default router;
