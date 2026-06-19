module.exports = {
  up: (db) => {
    // Create food_library table
    db.exec(`
      CREATE TABLE IF NOT EXISTS food_library (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        amount TEXT NOT NULL,
        calories REAL NOT NULL,
        protein REAL NOT NULL,
        carbs REAL NOT NULL,
        fat REAL NOT NULL,
        serving_size TEXT,
        brand TEXT,
        tags TEXT,
        notes TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    // Create index for faster searches
    db.exec(
      `CREATE INDEX IF NOT EXISTS idx_food_library_name ON food_library(name)`
    );
    db.exec(
      `CREATE INDEX IF NOT EXISTS idx_food_library_category ON food_library(category)`
    );
  },
  down: (db) => {
    db.exec(`DROP TABLE IF EXISTS food_library`);
    db.exec(`DROP INDEX IF EXISTS idx_food_library_name`);
    db.exec(`DROP INDEX IF EXISTS idx_food_library_category`);
  },
};
