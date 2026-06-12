const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log('Building `@workspace/land-registry`...');
  execSync('pnpm --filter @workspace/land-registry run build', { stdio: 'inherit' });

  console.log('Copying subproject public output to repository root public folder...');
  fs.rmSync('public', { recursive: true, force: true });
  fs.cpSync('artifacts/land-registry/public', 'public', { recursive: true });
  console.log('All builds and copy operations completed successfully!');
} catch (error) {
  console.error('Root build-vercel script failed:', error);
  process.exit(1);
}
