import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

interface JwtPayload {
    id: string;
    role?: string;
    iat?: number;
    exp?: number;
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ message: "Missing token" });

    const token = auth.slice("Bearer ".length).trim();
    const secret = process.env.JWT_SECRET || "change-this-secret";

    try {
        const payload = jwt.verify(token, secret) as JwtPayload;
        if (!payload || !payload.id) return res.status(401).json({ message: "Invalid token" });

        // Attach user id & role to req.user (minimal)
        (req as any).user = { id: payload.id, role: payload.role };

        // Optionally: load user from DB and attach full profile (without password)
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOneBy({ id: payload.id });
        if (user) {
            (req as any).currentUser = user;
        }

        return next();
    } catch (err) {
        console.error("auth middleware verify error:", err);
        return res.status(401).json({ message: "Invalid token" });
    }
}

export function requireRole(role: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const u = (req as any).user as { id?: string; role?: string } | undefined;
        if (!u || u.role !== role) return res.status(403).json({ message: "Forbidden" });
        next();
    };
}