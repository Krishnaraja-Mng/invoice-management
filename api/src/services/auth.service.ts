import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Repository } from "typeorm";
import { User } from "../entities/User";

const JWT_EXPIRES_IN = "7d";

export class AuthService {
    userRepo: Repository<User>;
    jwtSecret: string;

    constructor(userRepo: Repository<User>) {
        this.userRepo = userRepo;
        this.jwtSecret = process.env.JWT_SECRET || "change-this-secret";
    }

    async hashPassword(plain: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(plain, salt);
    }

    async comparePassword(plain: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(plain, hashed);
    }

    signToken(payload: { id: string; role?: string }) {
        return jwt.sign(payload, this.jwtSecret, { expiresIn: JWT_EXPIRES_IN });
    }

    verifyToken(token: string) {
        try {
            return jwt.verify(token, this.jwtSecret) as any;
        } catch (err) {
            return null;
        }
    }
}