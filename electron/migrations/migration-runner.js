const fs = require("fs");
const path = require("path");

class MigrationRunner {
  constructor(db) {
    this.db = db;
    this.migrationsDir = path.join(__dirname); // migrations are in the same directory
    this.ensureMigrationTable();
  }

  ensureMigrationTable() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER UNIQUE NOT NULL,
        name TEXT NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async getCurrentVersion() {
    const result = this.db
      .prepare("SELECT MAX(version) as max_version FROM migrations")
      .get();
    return result.max_version || 0;
  }

  async getAvailableMigrations() {
    const files = fs.readdirSync(this.migrationsDir);
    const migrationFiles = files
      .filter((file) => file.match(/^\d{3}-.*\.js$/))
      .map((file) => {
        const match = file.match(/^(\d{3})-(.*)\.js$/);
        return {
          version: parseInt(match[1]),
          name: match[2],
          file: file,
        };
      })
      .sort((a, b) => a.version - b.version);

    return migrationFiles;
  }

  async getPendingMigrations() {
    const currentVersion = await this.getCurrentVersion();
    const allMigrations = await this.getAvailableMigrations();
    return allMigrations.filter((m) => m.version > currentVersion);
  }

  async runMigration(migration) {
    const migrationPath = path.join(this.migrationsDir, migration.file);
    const migrationModule = require(migrationPath);

    console.log(`Running migration: ${migration.name} (v${migration.version})`);

    try {
      // Begin transaction
      const transaction = this.db.transaction(() => {
        migrationModule.up(this.db);
      });

      transaction();

      // Record migration execution
      this.db
        .prepare("INSERT INTO migrations (version, name) VALUES (?, ?)")
        .run(migration.version, migration.name);

      console.log(`Migration ${migration.name} completed successfully`);
    } catch (error) {
      console.error(`Migration ${migration.name} failed:`, error);
      throw error;
    }
  }

  async runAllPending() {
    const pendingMigrations = await this.getPendingMigrations();

    if (pendingMigrations.length === 0) {
      console.log("No pending migrations");
      return;
    }

    console.log(`Found ${pendingMigrations.length} pending migrations`);

    for (const migration of pendingMigrations) {
      await this.runMigration(migration);
    }

    console.log("All migrations completed");
  }

  async rollbackLast() {
    const lastMigration = this.db
      .prepare(
        `
      SELECT * FROM migrations 
      ORDER BY version DESC 
      LIMIT 1
    `
      )
      .get();

    if (!lastMigration) {
      console.log("No migrations to rollback");
      return;
    }

    const migrationPath = path.join(
      this.migrationsDir,
      `${lastMigration.version.toString().padStart(3, "0")}-${
        lastMigration.name
      }.js`
    );
    const migrationModule = require(migrationPath);

    console.log(`Rolling back migration: ${lastMigration.name}`);

    try {
      const transaction = this.db.transaction(() => {
        migrationModule.down(this.db);
      });

      transaction();

      this.db
        .prepare("DELETE FROM migrations WHERE version = ?")
        .run(lastMigration.version);

      console.log(`Rollback completed for ${lastMigration.name}`);
    } catch (error) {
      console.error(`Rollback failed for ${lastMigration.name}:`, error);
      throw error;
    }
  }
}

module.exports = MigrationRunner;
