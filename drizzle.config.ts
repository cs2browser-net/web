import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    dialect: 'postgresql',
    out: './generated/drizzle',
    schema: './generated/drizzle/schema.ts',
    dbCredentials: {
        url: process.env.DATABASE_URL!
    },
    verbose: true,
    strict: true,
});