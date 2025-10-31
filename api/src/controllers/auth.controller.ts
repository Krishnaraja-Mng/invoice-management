import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { RegisterDto } from "../dto/register.dto";
import { LoginDto } from "../dto/login.dto";
import { AuthService } from "../services/auth.service";

export class AuthController {
    private userRepo = AppDataSource.getRepository(User);
    private authService: AuthService | null = null;

    private getAuthService(): AuthService {
        if (!this.authService) {
            this.authService = new AuthService(this.userRepo);
        }
        return this.authService;
    }

    // POST /auth/register
    async register(req: Request, res: Response) {
        try {
            const dto = plainToInstance(RegisterDto, req.body);
            const errors = await validate(dto);
            if (errors.length) return res.status(400).json({ errors });

            const existing = await this.userRepo.findOneBy({ email: dto.email });
            if (existing) return res.status(409).json({ message: "Email already in use" });

            const authService = this.getAuthService();
            const hashed = await authService.hashPassword(dto.password);

            const user = this.userRepo.create({
                name: dto.name,
                email: dto.email,
                password: hashed,
                role: "user",
                createdById: "00000000-0000-0000-0000-000000000000",
                updatedById: "00000000-0000-0000-0000-000000000000",
            } as Partial<User>);

            const saved = await this.userRepo.save(user);

            // sign token with id and role
            const token = authService.signToken({ id: saved.id, role: saved.role });

            // remove password before returning
            // note: because password column is select:false, saved.password is undefined here
            const result = { id: saved.id, name: saved.name, email: saved.email, role: saved.role };

            return res.status(201).json({ user: result, token });
        } catch (err) {
            console.error("Register error:", err);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    // POST /auth/login
    async login(req: Request, res: Response) {
        try {
            const dto = plainToInstance(LoginDto, req.body);
            const errors = await validate(dto);
            if (errors.length) return res.status(400).json({ errors });

            // need to select password (select:false in entity)
            const user = await this.userRepo
                .createQueryBuilder("user")
                .addSelect("user.password")
                .where("user.email = :email", { email: dto.email })
                .getOne();

            if (!user || !user.password) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const authService = this.getAuthService();
            const ok = await authService.comparePassword(dto.password, user.password);
            if (!ok) return res.status(401).json({ message: "Invalid credentials" });

            const token = authService.signToken({ id: user.id, role: user.role });

            const result = { id: user.id, name: user.name, email: user.email, role: user.role };
            return res.json({ user: result, token });
        } catch (err) {
            console.error("Login error:", err);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}