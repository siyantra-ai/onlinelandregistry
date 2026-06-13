#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Usage: node scripts/compress-image.js <inputPath> [outputPath]
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node scripts/compress-image.js <inputPath> [outputPath]');
  process.exit(1);
}

const input = path.resolve(process.cwd(), args[0]);
const output = args[1]
  ? path.resolve(process.cwd(), args[1])
  : path.resolve(process.cwd(), 'public', 'assets', 'compressed-image.png');

async function run() {
  if (!fs.existsSync(input)) {
    console.error('Input file not found:', input);
    process.exit(2);
  }

  // Ensure output dir exists
  fs.mkdirSync(path.dirname(output), { recursive: true });

  try {
    await sharp(input)
      .resize({ width: 1600, withoutEnlargement: true })
      .png({ quality: 80, compressionLevel: 9, adaptiveFiltering: true })
      .toFile(output);

    console.log('Compressed image written to', output);
  } catch (err) {
    console.error('Error compressing image:', err);
    process.exit(3);
  }
}

run();
