const { Client } = require('c:/Users/Curtis/Documents/_Github/advanced_crm_hub/crm_api/node_modules/pg');
const fs = require('fs');

// Read and parse .env manually
const envPath = 'c:/Users/Curtis/Documents/_Github/advanced_crm_hub/crm_api/.env';
const dotenvContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
dotenvContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const parts = trimmed.split('=');
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    env[key] = value;
  }
});

const client = new Client({
  host: env.DB_HOST,
  port: parseInt(env.DB_PORT || '5432', 10),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});

async function main() {
  await client.connect();
  const res = await client.query(`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    ORDER BY table_name, column_name;
  `);
  fs.writeFileSync('schema_columns.json', JSON.stringify(res.rows, null, 2));
  console.log('Schema written to schema_columns.json');
  await client.end();
}

main().catch(console.error);
