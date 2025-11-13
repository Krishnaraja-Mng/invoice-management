import { AppDataSource } from "../api/src/data-source";
import { User } from "../api/src/entities/User";

async function run() {
    await AppDataSource.initialize();
    const userRepo = AppDataSource.getRepository(User);

    // Create system user (for internal references)
    const systemId = "00000000-0000-0000-0000-000000000000";
    const existingSystem = await userRepo.findOneBy({ id: systemId });
    if (!existingSystem) {
        const systemUser = userRepo.create({
            id: systemId,
            name: "system",
            email: null,
            createdById: systemId,
            updatedById: systemId,
        } as Partial<User>);
        await userRepo.save(systemUser);
        console.log("✓ Inserted system user");
    } else {
        console.log("✓ System user already exists");
    }

    // Create default admin user
    const adminEmail = "admin@example.com";
    const existingAdmin = await userRepo.findOneBy({ email: adminEmail });
    if (!existingAdmin) {
        const adminUser = userRepo.create({
            name: "Admin User",
            email: adminEmail,
            // Hashed password for "admin@123"
            password: "$2a$10$4T5GanZ9yjCIb5k9c43YvefP0yMChHwl41GJ62BdvEyMfA27.ZmVu",
            role: "admin",
            createdById: systemId,
            updatedById: systemId,
        } as Partial<User>);
        await userRepo.save(adminUser);
        console.log("✓ Inserted default admin user (email: admin@example.com, password: admin@123)");
    } else {
        console.log("✓ Admin user already exists");
    }

    await AppDataSource.destroy();
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});