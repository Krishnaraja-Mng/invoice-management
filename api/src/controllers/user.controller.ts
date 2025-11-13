import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";

export class UserController {
    /**
     * Get all active users (admin only)
     */
    static async getUsers(req: Request, res: Response): Promise<Response> {
        try {
            const userRepo = AppDataSource.getRepository(User);
            
            // Only return active users by default
            const users = await userRepo.find({
                where: { isActive: true },
                order: { createdAt: "DESC" },
                select: ["id", "name", "email", "role", "address", "gstRegistered", "gstNumber", "panNumber", "serviceProviderState", "serviceProviderStateCode", "isActive", "createdAt", "updatedAt"]
            });

            return res.json(users);
        } catch (error) {
            console.error("Error fetching users:", error);
            return res.status(500).json({ message: "Failed to fetch users" });
        }
    }

    /**
     * Get a single user by ID
     */
    static async getUser(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const userRepo = AppDataSource.getRepository(User);

            const user = await userRepo.findOne({
                where: { id },
                select: ["id", "name", "email", "role", "address", "gstRegistered", "gstNumber", "panNumber", "serviceProviderState", "serviceProviderStateCode", "isActive", "createdAt", "updatedAt"]
            });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            return res.json(user);
        } catch (error) {
            console.error("Error fetching user:", error);
            return res.status(500).json({ message: "Failed to fetch user" });
        }
    }

    /**
     * Create a new user (admin only)
     */
    static async createUser(req: Request, res: Response): Promise<Response> {
        try {
            const {
                name,
                email,
                password,
                role = "user",
                address,
                gstRegistered = false,
                gstNumber,
                panNumber,
                serviceProviderState,
                serviceProviderStateCode
            } = req.body;

            // Validation
            if (!name || !email) {
                return res.status(400).json({ message: "Name and email are required" });
            }

            if (!password || password.length < 6) {
                return res.status(400).json({ message: "Password must be at least 6 characters" });
            }

            const userRepo = AppDataSource.getRepository(User);

            // Check if email already exists
            const existingUser = await userRepo.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: "Email already exists" });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new user
            const newUser = userRepo.create({
                name,
                email,
                password: hashedPassword,
                role,
                address,
                gstRegistered,
                gstNumber,
                panNumber,
                serviceProviderState,
                serviceProviderStateCode,
                isActive: true,
                createdById: req.user?.id || "00000000-0000-0000-0000-000000000000",
                updatedById: req.user?.id || "00000000-0000-0000-0000-000000000000"
            });

            await userRepo.save(newUser);

            // Return user without password
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password: _, ...userWithoutPassword } = newUser;
            return res.status(201).json(userWithoutPassword);
        } catch (error) {
            console.error("Error creating user:", error);
            return res.status(500).json({ message: "Failed to create user" });
        }
    }

    /**
     * Update an existing user (admin only or self)
     */
    static async updateUser(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const {
                name,
                email,
                password,
                role,
                address,
                gstRegistered,
                gstNumber,
                panNumber,
                serviceProviderState,
                serviceProviderStateCode
            } = req.body;

            const userRepo = AppDataSource.getRepository(User);

            // Find user
            const user = await userRepo.findOne({
                where: { id },
                select: ["id", "name", "email", "password", "role", "address", "gstRegistered", "gstNumber", "panNumber", "serviceProviderState", "serviceProviderStateCode", "isActive", "createdById", "updatedById"]
            });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Check if user is active
            if (!user.isActive) {
                return res.status(400).json({ message: "Cannot update deactivated user" });
            }

            // Check authorization: admin can update anyone, users can only update themselves
            if (req.user?.role !== "admin" && req.user?.id !== id) {
                return res.status(403).json({ message: "Not authorized to update this user" });
            }

            // Update fields
            if (name) user.name = name;
            if (email && email !== user.email) {
                // Check if new email is already taken
                const existingUser = await userRepo.findOne({ where: { email } });
                if (existingUser && existingUser.id !== id) {
                    return res.status(400).json({ message: "Email already exists" });
                }
                user.email = email;
            }
            if (password) {
                if (password.length < 6) {
                    return res.status(400).json({ message: "Password must be at least 6 characters" });
                }
                user.password = await bcrypt.hash(password, 10);
            }
            
            // Only admin can update role
            if (role && req.user?.role === "admin") {
                user.role = role;
            }

            if (address !== undefined) user.address = address;
            if (gstRegistered !== undefined) user.gstRegistered = gstRegistered;
            if (gstNumber !== undefined) user.gstNumber = gstNumber;
            if (panNumber !== undefined) user.panNumber = panNumber;
            if (serviceProviderState !== undefined) user.serviceProviderState = serviceProviderState;
            if (serviceProviderStateCode !== undefined) user.serviceProviderStateCode = serviceProviderStateCode;

            user.updatedById = req.user?.id || "00000000-0000-0000-0000-000000000000";

            await userRepo.save(user);

            // Return user without password
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password: _, ...userWithoutPassword } = user;
            return res.json(userWithoutPassword);
        } catch (error) {
            console.error("Error updating user:", error);
            return res.status(500).json({ message: "Failed to update user" });
        }
    }

    /**
     * Soft delete a user by deactivating (admin only)
     */
    static async deleteUser(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const userRepo = AppDataSource.getRepository(User);

            // Find user
            const user = await userRepo.findOne({ where: { id } });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Prevent deactivating system user
            if (id === "00000000-0000-0000-0000-000000000000") {
                return res.status(400).json({ message: "Cannot deactivate system user" });
            }

            // Prevent self-deactivation
            if (req.user?.id === id) {
                return res.status(400).json({ message: "Cannot deactivate yourself" });
            }

            // Check if already deactivated
            if (!user.isActive) {
                return res.status(400).json({ message: "User is already deactivated" });
            }

            // Soft delete by setting isActive to false
            user.isActive = false;
            user.updatedById = req.user?.id || "00000000-0000-0000-0000-000000000000";

            await userRepo.save(user);

            return res.json({ message: "User deactivated successfully", userId: id });
        } catch (error) {
            console.error("Error deactivating user:", error);
            return res.status(500).json({ message: "Failed to deactivate user" });
        }
    }

    /**
     * Reactivate a deactivated user (admin only)
     */
    static async reactivateUser(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const userRepo = AppDataSource.getRepository(User);

            // Find user
            const user = await userRepo.findOne({ where: { id } });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Check if already active
            if (user.isActive) {
                return res.status(400).json({ message: "User is already active" });
            }

            // Reactivate user
            user.isActive = true;
            user.updatedById = req.user?.id || "00000000-0000-0000-0000-000000000000";

            await userRepo.save(user);

            return res.json({ message: "User reactivated successfully", userId: id });
        } catch (error) {
            console.error("Error reactivating user:", error);
            return res.status(500).json({ message: "Failed to reactivate user" });
        }
    }
}
