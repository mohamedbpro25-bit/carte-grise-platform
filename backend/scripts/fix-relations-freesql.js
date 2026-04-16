const mysql = require('mysql2/promise');

async function run() {
  const c = await mysql.createConnection({
    host: 'sql7.freesqldatabase.com',
    port: 3306,
    user: 'sql7823235',
    password: 'spiQTQBNxd',
    database: 'sql7823235',
    multipleStatements: true,
  });

  const statements = [
    "ALTER TABLE dossiers ADD COLUMN userId VARCHAR(36) NULL",
    "UPDATE dossiers SET userId = user_id WHERE userId IS NULL",
    "ALTER TABLE dossiers ADD INDEX idx_dossiers_userId (userId)",
    "ALTER TABLE dossiers ADD CONSTRAINT fk_dossiers_userId FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE",

    "ALTER TABLE vehicles ADD COLUMN dossierId VARCHAR(36) NULL",
    "UPDATE vehicles SET dossierId = dossier_id WHERE dossierId IS NULL",
    "ALTER TABLE vehicles ADD INDEX idx_vehicles_dossierId (dossierId)",
    "ALTER TABLE vehicles ADD CONSTRAINT fk_vehicles_dossierId FOREIGN KEY (dossierId) REFERENCES dossiers(id) ON DELETE CASCADE",

    "ALTER TABLE documents ADD COLUMN dossierId VARCHAR(36) NULL",
    "UPDATE documents SET dossierId = dossier_id WHERE dossierId IS NULL",
    "ALTER TABLE documents ADD INDEX idx_documents_dossierId (dossierId)",
    "ALTER TABLE documents ADD CONSTRAINT fk_documents_dossierId FOREIGN KEY (dossierId) REFERENCES dossiers(id) ON DELETE CASCADE",

    "ALTER TABLE payments ADD COLUMN dossierId VARCHAR(36) NULL",
    "UPDATE payments SET dossierId = dossier_id WHERE dossierId IS NULL",
    "ALTER TABLE payments ADD INDEX idx_payments_dossierId (dossierId)",
    "ALTER TABLE payments ADD CONSTRAINT fk_payments_dossierId FOREIGN KEY (dossierId) REFERENCES dossiers(id) ON DELETE CASCADE",
  ];

  for (const s of statements) {
    try {
      await c.query(s);
      console.log('OK:', s);
    } catch (e) {
      const msg = String(e.message || e);
      if (msg.includes('Duplicate column name') || msg.includes('Duplicate key name') || msg.includes('Duplicate foreign key constraint name')) {
        console.log('SKIP:', s);
      } else {
        console.log('ERR:', s);
        console.log(msg);
      }
    }
  }

  const [cols] = await c.query(
    "SELECT TABLE_NAME,COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='sql7823235' AND COLUMN_NAME IN ('userId','dossierId') ORDER BY TABLE_NAME,COLUMN_NAME"
  );
  console.log('REL_COLS=' + cols.length);
  console.log(cols.map((x) => `${x.TABLE_NAME}.${x.COLUMN_NAME}`).join(','));
  await c.end();
}

run().catch((e) => {
  console.error('FATAL', e.message || e);
  process.exit(1);
});
