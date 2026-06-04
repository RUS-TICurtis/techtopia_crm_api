
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Read and parse .env manually
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      process.env[key] = value;
    }
  });
}

const client = new Client({
  host: process.env.DB_HOST || 'postgresql-curtispapa.alwaysdata.net',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'curtispapa',
  password: process.env.DB_PASSWORD || '!b8Tkx4Zs2_wF!H',
  database: process.env.DB_NAME || 'curtispapa_crm',
});

async function main() {
  console.log('Connecting to PostgreSQL database...');
  await client.connect();
  console.log('Connected successfully!');

  // Wiping/truncating existing database tables to enforce clean empty states and correct tenant ID
  console.log('Truncating existing tables to start clean...');
  const tables = [
    'users', 'payment_transactions', 'budgets', 'expense_categories', 'expenses', 
    'finance_audit_logs', 'invoices', 'invoice_items', 'vendors', 'purchase_orders', 
    'tax_records', 'settlements', 'subscription_plans', 'subscriptions', 'tickets', 
    'projects', 'milestones', 'tasks', 'comments', 'departments', 'employees', 
    'attendance', 'leave_requests', 'performance_reviews', 'conversations', 'messages', 
    'notifications', 'companies', 'contacts', 'leads', 'pipelines', 'pipeline_stages', 
    'opportunities', 'quotes', 'contracts', 'ai_agents', 'ai_conversations', 
    'ai_actions', 'ai_recommendations'
  ];

  for (const table of tables) {
    try {
      await client.query(`TRUNCATE TABLE "${table}" CASCADE;`);
      console.log(`Truncated table: ${table}`);
    } catch (err) {
      console.warn(`Could not truncate table ${table} (it might not exist yet):`, err.message);
    }
  }

  // Running the fixed migrations
  const migrationFile = path.join(__dirname, 'db_migration_fixed.sql');
  console.log('Running unified fixed migration script...');
  const sql = fs.readFileSync(migrationFile, 'utf-8');
  await client.query(sql);
  console.log('Migration script executed successfully.');

  await client.end();
  console.log('All migrations completed!');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
