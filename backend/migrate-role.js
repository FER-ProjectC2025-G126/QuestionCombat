import sqlite3import from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const sqlite3 = sqlite3import.verbose();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const db = new sqlite3.Database(path.join(__dirname, './src/models/db/db.sqlite'), (err) => {
  if (err) {
    console.error('Could not connect to database:', err);
    process.exit(1);
  }
});

console.log('Adding role column to users table...');

db.run(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'USER'`, (err) => {
  if (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('Column role already exists');
    } else {
      console.error('Error adding role column:', err);
    }
  } else {
    console.log('Successfully added role column');
  }

  // Verify the changes
  db.all('PRAGMA table_info(users)', (err, rows) => {
    if (err) {
      console.error('Error getting table info:', err);
    } else {
      console.log('\nUpdated users table structure:');
      console.log(JSON.stringify(rows, null, 2));
    }
    db.close();
  });
});
