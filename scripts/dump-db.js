import Database from "better-sqlite3";
import fs from "fs";

const db = new Database("data.db");
const out = fs.createWriteStream("seed.sql");

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();

out.write("-- EmDash Automated Seed\n");
out.write("PRAGMA foreign_keys=OFF;\n");

for (const table of tables) {
  const schema = db.prepare(`SELECT sql FROM sqlite_master WHERE name='${table.name}'`).get();
  out.write(`\n-- Table: ${table.name}\nDROP TABLE IF EXISTS ${table.name};\n${schema.sql};\n`);
  
  const rows = db.prepare(`SELECT * FROM ${table.name}`).all();
  for (const row of rows) {
    const keys = Object.keys(row);
    const values = Object.values(row).map(v => {
      if (v === null) return "NULL";
      if (typeof v === "string") return `'${v.replace(/'/g, "''")}'`;
      if (v instanceof Buffer) return `x'${v.toString("hex")}'`;
      return v;
    });
    out.write(`INSERT INTO ${table.name} (${keys.join(", ")}) VALUES (${values.join(", ")});\n`);
  }
}

out.write("\nPRAGMA foreign_keys=ON;\n");
out.end();
console.log("SQL dump completed: seed.sql");
