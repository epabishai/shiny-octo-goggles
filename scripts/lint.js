const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.join(__dirname, "..");
const files = ["server.js"];

for (const directory of ["src", "public", "test", "scripts"]) {
  for (const file of fs.readdirSync(path.join(root, directory), { recursive: true })) {
    if (file.endsWith(".js")) {
      files.push(path.join(directory, file));
    }
  }
}

for (const file of files.sort()) {
  const result = spawnSync(process.execPath, ["--check", path.join(root, file)], {
    stdio: "inherit",
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

console.log(`Syntax checked ${files.length} JavaScript files.`);
