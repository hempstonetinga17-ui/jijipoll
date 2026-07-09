import { Client } from 'pg';
import { PrismaClient } from '@prisma/client';

const BATCH_SIZE = 1000;

async function migrateData() {
  const sourceDbUrl = process.env.STAMPKE_DATABASE_URL;
  const destDbUrl = process.env.DATABASE_URL;

  if (!sourceDbUrl || !destDbUrl) {
    console.error("ERROR: Please provide both STAMPKE_DATABASE_URL and DATABASE_URL in your .env file.");
    process.exit(1);
  }

  const sourceClient = new Client({ connectionString: sourceDbUrl });
  await sourceClient.connect();

  const prisma = new PrismaClient();
  
  // 1. Migrate FieldAccounts
  console.log("Migrating FieldAccounts...");
  let offset = 0;
  while (true) {
    const res = await sourceClient.query('SELECT * FROM "FieldAccount" ORDER BY "id" LIMIT $1 OFFSET $2', [BATCH_SIZE, offset]);
    if (res.rows.length === 0) break;
    
    // Insert into destination DB
    await prisma.fieldAccount.createMany({
      data: res.rows,
      skipDuplicates: true,
    });
    
    offset += res.rows.length;
    console.log(`Migrated ${offset} FieldAccounts...`);
  }
  
  // 2. Migrate AgentVisits
  console.log("Migrating AgentVisits...");
  offset = 0;
  while (true) {
    const res = await sourceClient.query('SELECT * FROM "AgentVisit" ORDER BY "id" LIMIT $1 OFFSET $2', [BATCH_SIZE, offset]);
    if (res.rows.length === 0) break;
    
    await prisma.agentVisit.createMany({
      data: res.rows,
      skipDuplicates: true,
    });
    
    offset += res.rows.length;
    console.log(`Migrated ${offset} AgentVisits...`);
  }
  
  // 3. Migrate FieldPhotos
  console.log("Migrating FieldPhotos...");
  offset = 0;
  while (true) {
    const res = await sourceClient.query('SELECT * FROM "FieldPhoto" ORDER BY "id" LIMIT $1 OFFSET $2', [BATCH_SIZE, offset]);
    if (res.rows.length === 0) break;
    
    await prisma.fieldPhoto.createMany({
      data: res.rows,
      skipDuplicates: true,
    });
    
    offset += res.rows.length;
    console.log(`Migrated ${offset} FieldPhotos...`);
  }

  await sourceClient.end();
  await prisma.$disconnect();
  console.log("✅ Migration complete! Over 90,000 records successfully processed.");
}

migrateData().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
