import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialSchema0000000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // extensions
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // users
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        email text NULL UNIQUE,
        address varchar(500) NULL,
        gst_registered boolean NOT NULL DEFAULT false,
        gst_number varchar(15) NULL,
        pan_number varchar(10) NULL,
        service_provider_state varchar(30) NULL,
        service_provider_state_code varchar(2) NULL,
        created_by uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
        updated_by uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      INSERT INTO users (id, name, email, created_by, updated_by, created_at, updated_at)
      VALUES (
        '00000000-0000-0000-0000-000000000000',
        'system',
        NULL,
        '00000000-0000-0000-0000-000000000000',
        '00000000-0000-0000-0000-000000000000',
        now(),
        now()
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_gst_number ON users (gst_number);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_pan_number ON users (pan_number);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_state_code ON users (service_provider_state_code);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_created_by ON users (created_by);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_updated_by ON users (updated_by);`);

    // users trigger updated_at
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION users_set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at := now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_users_set_updated_at ON users;`);
    await queryRunner.query(`
      CREATE TRIGGER trg_users_set_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION users_set_updated_at();
    `);

    // users CHECK constraints
    await queryRunner.query(`
      ALTER TABLE users
      ADD CONSTRAINT IF NOT EXISTS chk_users_gst_number_required
        CHECK (
          NOT gst_registered
          OR (gst_number IS NOT NULL AND char_length(gst_number) = 15 AND gst_number ~ '^[A-Za-z0-9]{15}$')
        );
    `);
    await queryRunner.query(`
      ALTER TABLE users
      ADD CONSTRAINT IF NOT EXISTS chk_users_pan_format
        CHECK (
          pan_number IS NULL
          OR (char_length(pan_number) = 10 AND pan_number ~ '^[A-Za-z0-9]{10}$')
        );
    `);
    await queryRunner.query(`
      ALTER TABLE users
      ADD CONSTRAINT IF NOT EXISTS chk_users_state_code_format
        CHECK (
          service_provider_state_code IS NULL
          OR (service_provider_state_code ~ '^[A-Z]{2}$')
        );
    `);

    // customers
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        email text NULL,
        phone text NULL,
        address varchar(500) NULL,
        gst_number varchar(15) NULL,
        pan_number varchar(10) NULL,
        created_by uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
        updated_by uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_customers_email ON customers (email);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_customers_gst_number ON customers (gst_number);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_customers_pan_number ON customers (pan_number);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_customers_created_by ON customers (created_by);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_customers_updated_by ON customers (updated_by);`);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION customers_set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at := now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_customers_set_updated_at ON customers;`);
    await queryRunner.query(`
      CREATE TRIGGER trg_customers_set_updated_at
      BEFORE UPDATE ON customers
      FOR EACH ROW
      EXECUTE FUNCTION customers_set_updated_at();
    `);

    // invoices
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_number text NULL,
        customer_id uuid NULL,
        customer_name text NOT NULL,
        line_items jsonb NULL,
        subtotal numeric(12,2) NOT NULL DEFAULT 0.00,
        sgst_amount numeric(12,2) NOT NULL DEFAULT 0.00,
        cgst_amount numeric(12,2) NOT NULL DEFAULT 0.00,
        igst_amount numeric(12,2) NOT NULL DEFAULT 0.00,
        total_tax_amount numeric(12,2) NOT NULL DEFAULT 0.00,
        sgst_percent integer NOT NULL DEFAULT 0,
        cgst_percent integer NOT NULL DEFAULT 0,
        igst_percent integer NOT NULL DEFAULT 0,
        total_amount numeric(12,2) NOT NULL DEFAULT 0.00,
        status varchar(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','invoice amount paid','closed','cancelled')),
        created_by uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
        updated_by uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
        invoice_belongs_to uuid NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices (invoice_number);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices (customer_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices (status);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices (created_at);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_invoices_created_by ON invoices (created_by);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_invoices_updated_by ON invoices (updated_by);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_invoices_belongs_to ON invoices (invoice_belongs_to);`);

    // triggers
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION invoices_set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at := now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_invoices_set_updated_at ON invoices;`);
    await queryRunner.query(`
      CREATE TRIGGER trg_invoices_set_updated_at
      BEFORE UPDATE ON invoices
      FOR EACH ROW
      EXECUTE FUNCTION invoices_set_updated_at();
    `);

    // foreign keys (added via ALTER to avoid ordering issues)
    await queryRunner.query(`
      ALTER TABLE customers
        ADD CONSTRAINT IF NOT EXISTS fk_customers_created_by_users FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE customers
        ADD CONSTRAINT IF NOT EXISTS fk_customers_updated_by_users FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE invoices
        ADD CONSTRAINT IF NOT EXISTS fk_invoices_customer_id_customers FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE invoices
        ADD CONSTRAINT IF NOT EXISTS fk_invoices_created_by_users FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE invoices
        ADD CONSTRAINT IF NOT EXISTS fk_invoices_updated_by_users FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE invoices
        ADD CONSTRAINT IF NOT EXISTS fk_invoices_belongs_to_users FOREIGN KEY (invoice_belongs_to) REFERENCES users(id) ON DELETE SET NULL;
    `);

    // customer/user self-referential fks
    await queryRunner.query(`
      ALTER TABLE users
        ADD CONSTRAINT IF NOT EXISTS fk_users_created_by_users FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE users
        ADD CONSTRAINT IF NOT EXISTS fk_users_updated_by_users FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // drop in reverse order
    await queryRunner.query(`ALTER TABLE invoices DROP CONSTRAINT IF EXISTS fk_invoices_belongs_to_users;`);
    await queryRunner.query(`ALTER TABLE invoices DROP CONSTRAINT IF EXISTS fk_invoices_updated_by_users;`);
    await queryRunner.query(`ALTER TABLE invoices DROP CONSTRAINT IF EXISTS fk_invoices_created_by_users;`);
    await queryRunner.query(`ALTER TABLE invoices DROP CONSTRAINT IF EXISTS fk_invoices_customer_id_customers;`);

    await queryRunner.query(`ALTER TABLE customers DROP CONSTRAINT IF EXISTS fk_customers_updated_by_users;`);
    await queryRunner.query(`ALTER TABLE customers DROP CONSTRAINT IF EXISTS fk_customers_created_by_users;`);

    await queryRunner.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_updated_by_users;`);
    await queryRunner.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_created_by_users;`);

    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_invoices_set_updated_at ON invoices;`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS invoices_set_updated_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_invoices_belongs_to;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_invoices_updated_by;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_invoices_created_by;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_invoices_created_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_invoices_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_invoices_customer_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_invoices_invoice_number;`);
    await queryRunner.query(`DROP TABLE IF EXISTS invoices;`);

    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_customers_set_updated_at ON customers;`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS customers_set_updated_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customers_gst_number;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customers_pan_number;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customers_updated_by;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customers_created_by;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customers_email;`);
    await queryRunner.query(`DROP TABLE IF EXISTS customers;`);

    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_users_set_updated_at ON users;`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS users_set_updated_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_state_code;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_pan_number;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_gst_number;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_updated_by;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_created_by;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email;`);
    await queryRunner.query(`DROP TABLE IF EXISTS users;`);

    // leave extension in place (optional to drop)
  }
}