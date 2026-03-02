// backend/scripts/seed-passwords.js
// Run: node scripts/seed-passwords.js
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function seedPasswords() {
  const users = [
    { username: 'admin',   password: 'admin123' },
    { username: 'manager', password: 'manager123' },
    { username: 'staff1',  password: 'staff123' },
  ];

  console.log('Seeding passwords...');

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    const result = await pool.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE username = $2 RETURNING id, username',
      [hash, u.username]
    );
    if (result.rows.length > 0) {
      console.log(`✅ Updated password for: ${u.username}`);
    } else {
      console.log(`⚠️  User not found: ${u.username}`);
    }
  }

  console.log('\nDone! Users and passwords:');
  console.log('  admin   → admin123');
  console.log('  manager → manager123');
  console.log('  staff1  → staff123');

  await pool.end();
}

seedPasswords().catch(err => {
  console.error('Error:', err.message);
  pool.end();
  process.exit(1);
});
