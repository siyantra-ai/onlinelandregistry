const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. Find the repository root directory
let repoRoot = process.cwd();
while (repoRoot !== path.dirname(repoRoot) && !fs.existsSync(path.join(repoRoot, 'pnpm-workspace.yaml'))) {
  repoRoot = path.dirname(repoRoot);
}

const currentDir = path.basename(process.cwd());
console.log(`Vercel build triggered. Current directory: ${process.cwd()} (repo root: ${repoRoot})`);

try {
  if (currentDir === 'api-server') {
    console.log('Detected api-server project. Building api-server...');
    execSync('pnpm --filter @workspace/api-server run build', { stdio: 'inherit', cwd: repoRoot });
    console.log('api-server build completed!');
  } else {
    // Default to building the land-registry frontend
    console.log('Building land-registry...');
    execSync('pnpm --filter @workspace/land-registry run build', { stdio: 'inherit', cwd: repoRoot });

    console.log('Copying subproject public output to repository root public folder...');
    const destPublic = path.join(repoRoot, 'public');
    const srcPublic = path.join(repoRoot, 'artifacts/land-registry/public');
    
    fs.rmSync(destPublic, { recursive: true, force: true });
    fs.cpSync(srcPublic, destPublic, { recursive: true });
    console.log('All frontend builds and copy operations completed successfully!');
  }
} catch (error) {
  console.error('Vercel build script failed:', error);
  process.exit(1);
}
