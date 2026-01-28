/**
 * Migration script to add question approval fields
 * Run this script to update existing database with new columns
 * 
 * Usage: node migrate-question-approval.js
 */

import Database from './src/models/db/Database.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../instance/db.sqlite');

console.log('Starting migration to add question approval fields...');

if (!fs.existsSync(dbPath)) {
  console.error('Database file not found at:', dbPath);
  console.error('Please run the application first to create the database.');
  process.exit(1);
}

const database = new Database();

// Check if columns exist
function checkColumnExists(tableName, columnName) {
  return new Promise((resolve, reject) => {
    database.db.all(`PRAGMA table_info(${tableName})`, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const exists = rows.some((row) => row.name === columnName);
        resolve(exists);
      }
    });
  });
}

// Add columns if they don't exist
async function migrateQuestions() {
  try {
    // Check and add status column
    const hasStatus = await checkColumnExists('questions', 'status');
    if (!hasStatus) {
      await new Promise((resolve, reject) => {
        database.db.run(
          `ALTER TABLE questions ADD COLUMN status TEXT DEFAULT 'APPROVED'`,
          [],
          (err) => {
            if (err) reject(err);
            else {
              console.log('✓ Added status column');
              resolve();
            }
          }
        );
      });
    } else {
      console.log('✓ status column already exists');
    }

    // Check and add is_approved column
    const hasIsApproved = await checkColumnExists('questions', 'is_approved');
    if (!hasIsApproved) {
      await new Promise((resolve, reject) => {
        database.db.run(
          `ALTER TABLE questions ADD COLUMN is_approved BOOLEAN DEFAULT 1`,
          [],
          (err) => {
            if (err) reject(err);
            else {
              console.log('✓ Added is_approved column');
              resolve();
            }
          }
        );
      });
    } else {
      console.log('✓ is_approved column already exists');
    }

    // Check and add is_active column
    const hasIsActive = await checkColumnExists('questions', 'is_active');
    if (!hasIsActive) {
      await new Promise((resolve, reject) => {
        database.db.run(
          `ALTER TABLE questions ADD COLUMN is_active BOOLEAN DEFAULT 1`,
          [],
          (err) => {
            if (err) reject(err);
            else {
              console.log('✓ Added is_active column');
              resolve();
            }
          }
        );
      });
    } else {
      console.log('✓ is_active column already exists');
    }

    // Check and add source column
    const hasSource = await checkColumnExists('questions', 'source');
    if (!hasSource) {
      await new Promise((resolve, reject) => {
        database.db.run(
          `ALTER TABLE questions ADD COLUMN source TEXT DEFAULT 'MANUAL'`,
          [],
          (err) => {
            if (err) reject(err);
            else {
              console.log('✓ Added source column');
              resolve();
            }
          }
        );
      });
    } else {
      console.log('✓ source column already exists');
    }

    // Check and add created_at column
    const hasCreatedAt = await checkColumnExists('questions', 'created_at');
    if (!hasCreatedAt) {
      await new Promise((resolve, reject) => {
        database.db.run(
          `ALTER TABLE questions ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP`,
          [],
          (err) => {
            if (err) reject(err);
            else {
              console.log('✓ Added created_at column');
              resolve();
            }
          }
        );
      });
    } else {
      console.log('✓ created_at column already exists');
    }

    // Check and add created_by column
    const hasCreatedBy = await checkColumnExists('questions', 'created_by');
    if (!hasCreatedBy) {
      await new Promise((resolve, reject) => {
        database.db.run(
          `ALTER TABLE questions ADD COLUMN created_by TEXT`,
          [],
          (err) => {
            if (err) reject(err);
            else {
              console.log('✓ Added created_by column');
              resolve();
            }
          }
        );
      });
    } else {
      console.log('✓ created_by column already exists');
    }

    // Check and add approved_at column
    const hasApprovedAt = await checkColumnExists('questions', 'approved_at');
    if (!hasApprovedAt) {
      await new Promise((resolve, reject) => {
        database.db.run(
          `ALTER TABLE questions ADD COLUMN approved_at TEXT`,
          [],
          (err) => {
            if (err) reject(err);
            else {
              console.log('✓ Added approved_at column');
              resolve();
            }
          }
        );
      });
    } else {
      console.log('✓ approved_at column already exists');
    }

    // Check and add approved_by column
    const hasApprovedBy = await checkColumnExists('questions', 'approved_by');
    if (!hasApprovedBy) {
      await new Promise((resolve, reject) => {
        database.db.run(
          `ALTER TABLE questions ADD COLUMN approved_by TEXT`,
          [],
          (err) => {
            if (err) reject(err);
            else {
              console.log('✓ Added approved_by column');
              resolve();
            }
          }
        );
      });
    } else {
      console.log('✓ approved_by column already exists');
    }

    console.log('\n✓ Migration completed successfully!');
    console.log('\nAll existing questions have been marked as APPROVED and ACTIVE by default.');
    console.log('New AI-generated questions will require admin approval.');

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  }
}

migrateQuestions();
