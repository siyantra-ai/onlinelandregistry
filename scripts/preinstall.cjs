const { rmSync } = require("node:fs");
const { resolve } = require("node:path");

const workspaceRoot = resolve(__dirname, "..");

for (const lockfile of ["package-lock.json", "yarn.lock"]) {
  rmSync(resolve(workspaceRoot, lockfile), { force: true });
}

if (!process.env.npm_config_user_agent?.startsWith("pnpm/")) {
  console.error("Use pnpm instead");
  process.exitCode = 1;
}