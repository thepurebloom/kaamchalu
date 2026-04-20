import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB file path
const dbPath = path.resolve(__dirname, "../../jobs.db");

// Initialize database and export a ready promise
export const dbReady = new Promise((resolve, reject) => {
  const dbInstance = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error("❌ SQLite Error:", err.message);
      reject(err);
    } else {
      console.log("📂 SQLite connected at:", dbPath);
      
      const sql = `
        CREATE TABLE IF NOT EXISTS jobs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          description TEXT,
          skill TEXT,
          location TEXT,
          budget INTEGER,
          urgency TEXT,
          confidence REAL,
          is_fake TEXT,
          matched_workers TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;
      dbInstance.run(sql, (err) => {
        if (err) {
          console.error("❌ Table creation error:", err.message);
          reject(err);
        } else {
          // Attempt to add new column if table existed but was old schema (fail silently if it already exists)
          dbInstance.run("ALTER TABLE jobs ADD COLUMN confidence REAL", () => {
             console.log("✅ Jobs table ready and schema updated");
             resolve(dbInstance);
          });
        }
      });
    }
  });
});

// Internal helper to get DB instance after it's ready
async function getDb() {
  return await dbReady;
}

/**
 * Saves a job request into the database.
 */
export async function saveJob(jobData) {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const { description, skill, location, budget, urgency, confidence, is_fake, matched_workers } = jobData;
    const sql = `
      INSERT INTO jobs (description, skill, location, budget, urgency, confidence, is_fake, matched_workers)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Serialize matched_workers to JSON string
    const workersJson = JSON.stringify(matched_workers || []);

    db.run(sql, [description, skill, location, budget, urgency, confidence || 0.5, is_fake, workersJson], function(err) {
      if (err) {
        console.error("❌ Error saving job:", err.message);
        reject(err);
      } else {
        console.log("💾 Job saved to database history with ID:", this.lastID);
        resolve({ success: true, id: this.lastID });
      }
    });
  });
}

/**
 * Returns job history ordered by latest, with optional skill filtering.
 */
export async function getJobs(skill = null) {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM jobs";
    let params = [];

    if (skill && skill !== "all") {
      sql += " WHERE skill = ?";
      params.push(skill);
    }

    sql += " ORDER BY created_at DESC";

    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error("❌ Fetch history error:", err.message);
        reject(err);
      } else {
        // Safe JSON parsing helper
        const safeParseMatchedWorkers = (jsonStr) => {
          try {
            return JSON.parse(jsonStr || "[]");
          } catch (e) {
            console.error("⚠️ Failed to parse matched_workers JSON:", e.message);
            return [];
          }
        };

        // Parse matched_workers JSON string back to objects safely
        const results = rows.map(row => ({
          ...row,
          matched_workers: safeParseMatchedWorkers(row.matched_workers)
        }));
        resolve(results);
      }
    });
  });
}

/**
 * Deletes a job by ID.
 */
export async function deleteJob(id) {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM jobs WHERE id = ?";
    db.run(sql, [id], function(err) {
      if (err) {
        console.error("❌ Delete job error:", err.message);
        reject(err);
      } else if (this.changes === 0) {
        console.warn(`⚠️ No job found with ID ${id} to delete`);
        resolve({ success: false, message: "No such record found" });
      } else {
        console.log(`🗑 Removed job ID ${id} from history`);
        resolve({ success: true });
      }
    });
  });
}

/**
 * Updates the fake status of a job.
 */
export async function updateJobFakeStatus(id, isFake) {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const sql = "UPDATE jobs SET is_fake = ? WHERE id = ?";
    db.run(sql, [isFake ? 'fake' : 'real', id], function(err) {
      if (err) {
        console.error("❌ Update job error:", err.message);
        reject(err);
      } else if (this.changes === 0) {
        resolve({ success: false, message: "No such record found" });
      } else {
        resolve({ success: true });
      }
    });
  });
}

// No direct export of 'db' to prevent race conditions. Always use dbReady or exported functions.
export default { saveJob, getJobs, deleteJob, updateJobFakeStatus, dbReady };