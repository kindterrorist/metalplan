const Database = require("better-sqlite3");
const MigrationRunner = require("../electron/migrations/migration-runner");

// Simple test runner
const runTest = async (name, testFn) => {
  try {
    await testFn();
    console.log(`✓ ${name}`);
    return true;
  } catch (error) {
    console.error(`✗ ${name}: ${error.message}`);
    return false;
  }
};

const tests = [
  {
    name: "should create migration table",
    fn: async () => {
      const testDb = new Database(":memory:");
      const migrationRunner = new MigrationRunner(testDb);
      const result = testDb
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'"
        )
        .get();
      if (!result) throw new Error("Migration table not created");
      testDb.close();
    },
  },
  {
    name: "should execute pending migrations",
    fn: async () => {
      const testDb = new Database(":memory:");
      const migrationRunner = new MigrationRunner(testDb);
      const initialVersion = await migrationRunner.getCurrentVersion();
      if (initialVersion !== 0) throw new Error("Initial version should be 0");

      await migrationRunner.runAllPending();
      const finalVersion = await migrationRunner.getCurrentVersion();
      if (finalVersion <= 0)
        throw new Error("Migrations should increase version");

      testDb.close();
    },
  },
  {
    name: "should handle migration rollback",
    fn: async () => {
      const testDb = new Database(":memory:");
      const migrationRunner = new MigrationRunner(testDb);

      await migrationRunner.runAllPending();
      const versionBefore = await migrationRunner.getCurrentVersion();

      if (versionBefore > 0) {
        await migrationRunner.rollbackLast();
        const versionAfter = await migrationRunner.getCurrentVersion();
        if (versionAfter !== versionBefore - 1) {
          throw new Error(
            `Version mismatch: expected ${
              versionBefore - 1
            }, got ${versionAfter}`
          );
        }
      }

      testDb.close();
    },
  },
  {
    name: "should validate data constraints",
    fn: async () => {
      const testDb = new Database(":memory:");
      const migrationRunner = new MigrationRunner(testDb);
      await migrationRunner.runAllPending();

      // Try to insert invalid data (empty fullName should fail due to constraint)
      try {
        testDb
          .prepare(
            "INSERT INTO athletes (id, fullName, age, height, gender, joinDate) VALUES (?, ?, ?, ?, ?, ?)"
          )
          .run("test-id", "", 25, 180, "Male", "2024-01-01");
        throw new Error("Should have failed with empty fullName");
      } catch (error) {
        // This is expected - the constraint should prevent the insertion
        if (
          error.message.includes("CHECK constraint failed") ||
          error.message.includes("NOT NULL")
        ) {
          // Success - constraint worked
        } else {
          throw error; // Re-throw if it's a different error
        }
      }

      testDb.close();
    },
  },
  {
    name: "should migrate existing data without corruption",
    fn: async () => {
      // Create old schema data
      const testDb = new Database(":memory:");
      testDb.exec(`
        CREATE TABLE athletes (
          id TEXT PRIMARY KEY,
          fullName TEXT NOT NULL,
          phone TEXT,
          age INTEGER,
          height INTEGER,
          gender TEXT,
          joinDate TEXT,
          measurements TEXT,
          currentGoal TEXT,
          status TEXT DEFAULT 'active'
        );
      `);

      // Insert test data
      testDb
        .prepare(
          "INSERT INTO athletes (id, fullName, age, height, gender, joinDate, measurements) VALUES (?, ?, ?, ?, ?, ?, ?)"
        )
        .run(
          "test-1",
          "John Doe",
          25,
          180,
          "Male",
          "2024-01-01",
          JSON.stringify([{ date: "2024-01-01", weight: 70 }])
        );

      // Run migrations
      const migrationRunner = new MigrationRunner(testDb);
      await migrationRunner.runAllPending();

      // Verify data integrity
      const athlete = testDb
        .prepare("SELECT * FROM athletes WHERE id = ?")
        .get("test-1");
      if (!athlete) throw new Error("Athlete not found after migration");
      if (athlete.fullName !== "John Doe")
        throw new Error("Full name changed during migration");
      if (athlete.age !== 25) throw new Error("Age changed during migration");

      testDb.close();
    },
  },
];

const runTests = async () => {
  console.log("Running migration tests...\n");

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    const result = await runTest(test.name, test.fn);
    if (result) passed++;
  }

  console.log(`\n${passed}/${total} tests passed`);

  if (passed === total) {
    console.log("All migration tests passed! ✓");
  } else {
    console.log("Some tests failed! ✗");
    process.exit(1);
  }
};

runTests();
