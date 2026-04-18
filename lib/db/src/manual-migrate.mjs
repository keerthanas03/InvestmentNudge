import pg from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './.env' });

const { Pool } = pg;

async function runMigration() {
  console.log('Connecting to:', process.env.DATABASE_URL);
  const pool = new Pool({ 
    connectionString: 'postgresql://postgres:Keerthana%402383@[2406:da14:271:9922:47ca:9544:64f9:61c7]:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('Connected successfully!');

    console.log('Adding columns to nudge_rules...');
    await client.query(`
      ALTER TABLE nudge_rules 
      ADD COLUMN IF NOT EXISTS investment_type TEXT NOT NULL DEFAULT 'stocks',
      ADD COLUMN IF NOT EXISTS investment_value REAL NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS nudge_intensity TEXT NOT NULL DEFAULT 'medium';
    `);
    console.log('Columns added successfully!');

    client.release();
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

runMigration();
