const { Client } = require('pg');
const crypto = require('crypto');

async function run() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'maintainiq'
  });
  
  await client.connect();

  try {
    // 1. Get an asset
    let assetRes = await client.query('SELECT * FROM assets LIMIT 1');
    if (assetRes.rows.length === 0) {
      console.log('No assets found. Creating one...');
      const id = crypto.randomUUID();
      await client.query(
        'INSERT INTO assets (id, name, code, category, location, condition, status, "qrCodeUrl", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())',
        [id, 'HVAC Roof Unit', 'HVAC-01', 'HVAC', 'Roof', 'Good', 'Operational', 'http']
      );
      assetRes = await client.query('SELECT * FROM assets LIMIT 1');
    }
    const assetId = assetRes.rows[0].id;

    // 2. Get a technician
    let techRes = await client.query('SELECT * FROM users WHERE role = $1 LIMIT 1', ['technician']);
    if (techRes.rows.length === 0) {
      console.log('No technicians found. Please create one.');
      techRes = await client.query('SELECT * FROM users LIMIT 1');
    }
    const techId = techRes.rows[0].id;

    console.log('Creating Seed Issue 1...');
    const issue1Id = crypto.randomUUID();
    await client.query(
      'INSERT INTO issues (id, "issueNumber", title, description, priority, category, status, "assetId", "assignedTechnicianId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW() - INTERVAL \'2 days\', NOW() - INTERVAL \'1 day\')',
      [issue1Id, 'ISS-8885', 'Leaking AC Unit', 'AC unit is leaking water heavily.', 'High', 'HVAC', 'Resolved', assetId, techId]
    );

    const maint1Id = crypto.randomUUID();
    await client.query(
      'INSERT INTO maintenance_records (id, "workPerformed", "partsUsed", "finalCondition", "issueId", "technicianId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL \'1 day\', NOW() - INTERVAL \'1 day\')',
      [maint1Id, 'Cleared the drain line and replaced the secondary pan.', '[]', 'Excellent', issue1Id, techId]
    );

    console.log('Creating Seed Issue 2...');
    const issue2Id = crypto.randomUUID();
    await client.query(
      'INSERT INTO issues (id, "issueNumber", title, description, priority, category, status, "assetId", "assignedTechnicianId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW() - INTERVAL \'5 hours\', NOW() - INTERVAL \'1 hour\')',
      [issue2Id, 'ISS-8886', 'Flickering Lights', 'Lights in the hallway flicker constantly.', 'Medium', 'Electrical', 'Resolved', assetId, techId]
    );

    const maint2Id = crypto.randomUUID();
    await client.query(
      'INSERT INTO maintenance_records (id, "workPerformed", "partsUsed", "finalCondition", "issueId", "technicianId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL \'1 hour\', NOW() - INTERVAL \'1 hour\')',
      [maint2Id, 'Replaced the faulty ballast in the light fixture.', '[]', 'Good', issue2Id, techId]
    );

    console.log('Seed completed successfully!');
  } catch (err) {
    console.error('Error seeding:', err);
  } finally {
    await client.end();
  }
}
run();
