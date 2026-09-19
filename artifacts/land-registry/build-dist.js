import { execSync } from 'child_process';
import fs from 'fs';

try {
  console.log('Running Vite build...');
  execSync('vite build --config vite.config.ts', { stdio: 'inherit' });

  console.log('Renaming dist/public to public...');
  fs.rmSync('public', { recursive: true, force: true });
  fs.renameSync('dist/public', 'public');
  console.log('Vite build and directory rename completed successfully!');
} catch (error) {
  console.error('Subproject build failed:', error);
  process.exit(1);
}
