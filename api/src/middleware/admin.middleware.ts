import { Request, Response, NextFunction } from "express";

/**
 * Middleware to check if the authenticated user has admin role
 * Must be used after authMiddleware
 */
export function adminMiddleware(req: Request, res: Response, next: NextFunction): Response | void {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    next();
}
