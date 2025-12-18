exports.up = function (db) {
  db.exec(`
    -- Additional indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_athletes_age ON athletes(age);
    CREATE INDEX IF NOT EXISTS idx_athletes_gender ON athletes(gender);
    CREATE INDEX IF NOT EXISTS idx_plans_created_at ON plans(created_at);
    CREATE INDEX IF NOT EXISTS idx_nutrition_created_at ON nutrition_plans(created_at);
    
    -- Index for measurements (since it's stored as JSON, we can't index individual fields)
    -- But we can create a covering index for common queries
    CREATE INDEX IF NOT EXISTS idx_athletes_status_join_date ON athletes(status, joinDate);
  `);
};

exports.down = function (db) {
  db.exec(`
    DROP INDEX IF EXISTS idx_athletes_age;
    DROP INDEX IF EXISTS idx_athletes_gender;
    DROP INDEX IF EXISTS idx_plans_created_at;
    DROP INDEX IF EXISTS idx_nutrition_created_at;
    DROP INDEX IF EXISTS idx_athletes_status_join_date;
  `);
};
