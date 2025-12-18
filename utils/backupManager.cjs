const { app } = require("electron");
const fs = require("fs");
const path = require("path");

class BackupManager {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.backupConfig = this.loadConfig();
    this.backupInterval = null;
  }

  loadConfig() {
    const configPath = path.join(app.getPath("userData"), "backup-config.json");
    const defaultConfig = {
      enabled: true,
      intervalHours: 24,
      maxBackups: 7,
      backupPath: path.join(app.getPath("documents"), "MetalPlans Backups"),
    };

    try {
      if (fs.existsSync(configPath)) {
        const savedConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
        return { ...defaultConfig, ...savedConfig };
      }
    } catch (error) {
      console.error("Error loading backup config:", error);
    }

    this.saveConfig(defaultConfig);
    return defaultConfig;
  }

  saveConfig(config) {
    const configPath = path.join(app.getPath("userData"), "backup-config.json");
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    this.backupConfig = config;
  }

  updateConfig(config) {
    this.saveConfig({ ...this.backupConfig, ...config });
    this.restartBackupScheduler();
  }

  getConfig() {
    return this.backupConfig;
  }

  startBackupScheduler() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }

    if (this.backupConfig.enabled) {
      const intervalMs = this.backupConfig.intervalHours * 60 * 1000;
      this.backupInterval = setInterval(() => {
        this.createBackup().catch((error) => {
          console.error("Scheduled backup failed:", error);
        });
      }, intervalMs);

      // Create initial backup
      setTimeout(() => {
        this.createBackup().catch((error) => {
          console.error("Initial backup failed:", error);
        });
      }, 5000);
    }
  }

  stopBackupScheduler() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
  }

  restartBackupScheduler() {
    this.stopBackupScheduler();
    this.startBackupScheduler();
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = `metalplans-backup-${timestamp}.db`;
    const backupPath = path.join(this.backupConfig.backupPath, backupFileName);

    // Ensure backup directory exists
    if (!fs.existsSync(this.backupConfig.backupPath)) {
      fs.mkdirSync(this.backupConfig.backupPath, { recursive: true });
    }

    // Copy the database file
    await fs.promises.copyFile(this.dbPath, backupPath);

    // Clean up old backups
    await this.cleanupOldBackups();

    console.log(`Backup created: ${backupPath}`);
    return backupPath;
  }

  async restoreFromBackup(backupPath) {
    // Verify backup file exists and is valid
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file does not exist: ${backupPath}`);
    }

    // Check if it's a valid SQLite file
    const buffer = await fs.promises.readFile(backupPath);
    if (!this.isValidSQLiteFile(buffer)) {
      throw new Error("Invalid backup file format");
    }

    // Close current database connection
    // Note: In a real implementation, you'd need to coordinate with the main database connection

    // Copy backup to current database location
    await fs.promises.copyFile(backupPath, this.dbPath);

    console.log(`Database restored from: ${backupPath}`);
  }

  async cleanupOldBackups() {
    try {
      const files = await fs.promises.readdir(this.backupConfig.backupPath);
      const backupFiles = files
        .filter(
          (file) =>
            file.startsWith("metalplans-backup-") && file.endsWith(".db")
        )
        .map((file) => ({
          name: file,
          path: path.join(this.backupConfig.backupPath, file),
          time: fs
            .statSync(path.join(this.backupConfig.backupPath, file))
            .mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time); // Sort by newest first

      // Keep only the most recent backups
      const filesToDelete = backupFiles.slice(this.backupConfig.maxBackups);
      for (const file of filesToDelete) {
        await fs.promises.unlink(file.path);
        console.log(`Deleted old backup: ${file.name}`);
      }
    } catch (error) {
      console.error("Error cleaning up old backups:", error);
    }
  }

  isValidSQLiteFile(buffer) {
    if (buffer.length < 16) return false;
    const header = buffer.slice(0, 16).toString("utf8");
    return header.startsWith("SQLite format 3");
  }

  async getBackupHistory() {
    try {
      const files = await fs.promises.readdir(this.backupConfig.backupPath);
      const backupFiles = files
        .filter(
          (file) =>
            file.startsWith("metalplans-backup-") && file.endsWith(".db")
        )
        .map((file) => {
          const filePath = path.join(this.backupConfig.backupPath, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            path: filePath,
            size: stats.size,
            date: stats.mtime,
          };
        })
        .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by newest first

      return backupFiles;
    } catch (error) {
      console.error("Error getting backup history:", error);
      return [];
    }
  }

  async verifyBackup(backupPath) {
    try {
      if (!fs.existsSync(backupPath)) {
        return false;
      }

      const buffer = await fs.promises.readFile(backupPath);
      if (!this.isValidSQLiteFile(buffer)) {
        return false;
      }

      // Additional verification: try to open and query the database
      return new Promise((resolve) => {
        const { Database } = require("better-sqlite3");
        const db = new Database(backupPath, (err) => {
          if (err) {
            resolve(false);
            return;
          }

          db.get(
            'SELECT name FROM sqlite_master WHERE type="table" LIMIT 1',
            (err, row) => {
              db.close();
              resolve(!err && row !== undefined);
            }
          );
        });
      });
    } catch (error) {
      console.error("Error verifying backup:", error);
      return false;
    }
  }
}

module.exports = { BackupManager };
