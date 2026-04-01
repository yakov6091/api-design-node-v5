import { db } from "../../src/db/connection.ts";
import { users, habits, entries, tags, habitTags } from "../../src/db/schema.ts";
import { sql } from "drizzle-orm";

export default async function setup() {
    console.log('💾 Setting up the test db');
    try {
        // Drop tables if they exist
        await db.execute(sql`DROP TABLE IF EXISTS ${habitTags} CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS ${entries} CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS ${habits} CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS ${tags} CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`);

        // Create tables
        console.log('🚀 Creating tables...');
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "users" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "email" varchar(255) NOT NULL UNIQUE,
                "username" varchar(50) NOT NULL UNIQUE,
                "password" varchar(255) NOT NULL,
                "first_name" varchar(50),
                "last_name" varchar(50),
                "created_at" timestamp DEFAULT now() NOT NULL,
                "update_at" timestamp DEFAULT now() NOT NULL
            )
        `);

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "habits" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
                "name" varchar(100) NOT NULL,
                "description" text,
                "frequency" varchar(20) NOT NULL,
                "target_count" integer DEFAULT 1,
                "is_active" boolean DEFAULT true NOT NULL,
                "created_at" timestamp DEFAULT now() NOT NULL,
                "updated_at" timestamp DEFAULT now() NOT NULL
            )
        `);

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "entries" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "habit_id" uuid NOT NULL REFERENCES "habits"("id") ON DELETE CASCADE,
                "completion_date" timestamp DEFAULT now() NOT NULL,
                "note" text,
                "created_at" timestamp DEFAULT now() NOT NULL
            )
        `);

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "tags" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "name" varchar(50) NOT NULL UNIQUE,
                "color" varchar(7) DEFAULT '#6b7280',
                "created_at" timestamp DEFAULT now() NOT NULL,
                "update_at" timestamp DEFAULT now() NOT NULL
            )
        `);

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "habitTags" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "habit_id" uuid NOT NULL REFERENCES "habits"("id") ON DELETE CASCADE,
                "tag_id" uuid NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,
                "created_at" timestamp DEFAULT now() NOT NULL
            )
        `);

        console.log('✅ Test DB created');
    } catch (error) {
        console.error('❌ Fail to setup test db', error);
        throw error;
    }

    return async () => {
        console.log('🧹 Tearing down test database...');
        try {
            // Final cleanup - drop all test data
            await db.execute(sql`DROP TABLE IF EXISTS ${habitTags} CASCADE`);
            await db.execute(sql`DROP TABLE IF EXISTS ${entries} CASCADE`);
            await db.execute(sql`DROP TABLE IF EXISTS ${habits} CASCADE`);
            await db.execute(sql`DROP TABLE IF EXISTS ${tags} CASCADE`);
            await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`);

            console.log('✅ Test database teardown complete');
            process.exit(0);
        } catch (error) {
            console.error('❌ Failed to teardown test database:', error);
        }
    };
};