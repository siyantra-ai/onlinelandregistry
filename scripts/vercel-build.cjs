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
    console.log('Detected api-server project. Building both frontend and backend for unified deployment...');
    
    // 1. Build the land-registry frontend website
    console.log('Building land-registry frontend...');
    execSync('pnpm --filter @workspace/land-registry run build', { stdio: 'inherit', cwd: repoRoot });
    
    // 2. Build the api-server backend
    console.log('Building api-server backend...');
    execSync('pnpm --filter @workspace/api-server run build', { stdio: 'inherit', cwd: repoRoot });
    
    console.log('Setting up public directory for Vercel deployment...');
    const destPublic = 'public';
    const srcDist = 'dist';
    const srcFrontend = path.join(repoRoot, 'artifacts/land-registry/public');
    
    // Clear the destination public directory
    fs.rmSync(destPublic, { recursive: true, force: true });
    
    // Copy compiled frontend static assets to public/
    console.log('Copying frontend static assets to public...');
    fs.cpSync(srcFrontend, destPublic, { recursive: true });
    
    // Copy compiled backend serverless files to public/
    console.log('Copying backend serverless assets to public...');
    fs.cpSync(srcDist, destPublic, { recursive: true });
    
    // Rename app.mjs to index.mjs to serve as the serverless function entrypoint
    fs.renameSync(path.join(destPublic, 'app.mjs'), path.join(destPublic, 'index.mjs'));
    if (fs.existsSync(path.join(destPublic, 'app.mjs.map'))) {
      fs.renameSync(path.join(destPublic, 'app.mjs.map'), path.join(destPublic, 'index.mjs.map'));
    }
    
    console.log('Unified api-server and frontend build completed!');
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
