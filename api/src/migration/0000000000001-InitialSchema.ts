import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema0000000000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                email TEXT UNIQUE,
                password VARCHAR(255),
                role VARCHAR(20) NOT NULL DEFAULT 'user',
                address VARCHAR(500),
                gst_registered BOOLEAN DEFAULT false,
                gst_number VARCHAR(15),
                pan_number VARCHAR(10),
                service_provider_state VARCHAR(30),
                service_provider_state_code VARCHAR(2),
                created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
                updated_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        // Create customers table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS customers (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                address VARCHAR(500),
                gst_number VARCHAR(15),
                pan_number VARCHAR(10),
                created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
                updated_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        // Create invoices table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS invoices (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                invoice_number TEXT,
                customer_id UUID,
                customer_name TEXT NOT NULL,
                line_items JSONB,
                subtotal NUMERIC(12, 2) DEFAULT 0,
                sgst_amount NUMERIC(12, 2) DEFAULT 0,
                cgst_amount NUMERIC(12, 2) DEFAULT 0,
                igst_amount NUMERIC(12, 2) DEFAULT 0,
                total_tax_amount NUMERIC(12, 2) DEFAULT 0,
                sgst_percent INTEGER DEFAULT 0,
                cgst_percent INTEGER DEFAULT 0,
                igst_percent INTEGER DEFAULT 0,
                total_amount NUMERIC(12, 2) DEFAULT 0,
                status VARCHAR(50) DEFAULT 'draft',
                created_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
                updated_by UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
                invoice_belongs_to UUID,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                CONSTRAINT fk_invoices_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
                CONSTRAINT fk_invoices_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
                CONSTRAINT fk_invoices_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
                CONSTRAINT fk_invoices_belongs_to FOREIGN KEY (invoice_belongs_to) REFERENCES users(id) ON DELETE SET NULL
            );
        `);

        // Add foreign key constraints to users table (self-referential)
        await queryRunner.query(`
            ALTER TABLE users
                ADD CONSTRAINT fk_users_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
                ADD CONSTRAINT fk_users_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
        `);

        // Add foreign key constraints to customers table
        await queryRunner.query(`
            ALTER TABLE customers
                ADD CONSTRAINT fk_customers_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
                ADD CONSTRAINT fk_customers_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
        `);

        // Create indexes for performance
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
            CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
            CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
            CREATE INDEX IF NOT EXISTS idx_invoices_belongs_to ON invoices(invoice_belongs_to);
            CREATE INDEX IF NOT EXISTS idx_invoices_created_by ON invoices(created_by);
        `);

        // Insert the system user
        await queryRunner.query(`
            INSERT INTO users (id, name, email, created_by, updated_by)
            VALUES ('00000000-0000-0000-0000-000000000000', 'system', NULL, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000')
            ON CONFLICT (id) DO NOTHING;
        `);

        // Insert the default admin user
        await queryRunner.query(`
            INSERT INTO users (name, email, password, role, created_by, updated_by)
            VALUES ('Admin User', 'admin@varcade.com', '$2a$10$4T5GanZ9yjCIb5k9c43YvefP0yMChHwl41GJ62BdvEyMfA27.ZmVu', 'admin', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000')
            ON CONFLICT (email) DO NOTHING;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order (respecting foreign key constraints)
        await queryRunner.query(`DROP TABLE IF EXISTS invoices CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS customers CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS users CASCADE;`);
    }
}
