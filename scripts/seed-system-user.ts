import { AppDataSource } from "../api/src/data-source";
import { User } from "../api/src/entities/User";

async function run() {
    await AppDataSource.initialize();
    const userRepo = AppDataSource.getRepository(User);

    const systemId = "00000000-0000-0000-0000-000000000000";
    const existing = await userRepo.findOneBy({ id: systemId });
    if (!existing) {
        const systemUser = userRepo.create({
            id: systemId,
            name: "system",
            email: null,
            createdById: systemId,
            updatedById: systemId,
        } as Partial<User>);
        await userRepo.save(systemUser);
        console.log("Inserted system user");
    } else {
        console.log("System user already exists");
    }

    await AppDataSource.destroy();
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});