#!/usr/bin/env node

/**
 * Download all Higgsfield assets to local folders for better performance
 */

import { existsSync, mkdirSync, createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const streamPipeline = promisify(pipeline);

// Asset URLs from generation
const assets = {
  hero: {
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_3EKdnOY1pE0wyJdTmSj8l64dxIY/hf_20260626_044619_3ac1c676-0354-4936-b54c-349594452066.png',
    path: 'hero/hero-background.png'
  },
  features: [
    {
      url: 'https://d8j0ntlcm91z4.cloudfront.net/user_3EKdnOY1pE0wyJdTmSj8l64dxIY/hf_20260626_044837_d7de208e-a2c8-4ec0-9007-178bc564226c.png',
      path: 'features/ai-transcription.png'
    },
    {
      url: 'https://d8j0ntlcm91z4.cloudfront.net/user_3EKdnOY1pE0wyJdTmSj8l64dxIY/hf_20260626_045100_64043a66-c56f-4dbb-b423-1b8fdf93a90e.png',
      path: 'features/multi-language.png'
    },
    {
      url: 'https://d8j0ntlcm91z4.cloudfront.net/user_3EKdnOY1pE0wyJdTmSj8l64dxIY/hf_20260626_045338_9f7919f9-f0af-48ae-8723-43ccb891c2fc.png',
      path: 'features/real-time.png'
    },
    {
      url: 'https://d8j0ntlcm91z4.cloudfront.net/user_3EKdnOY1pE0wyJdTmSj8l64dxIY/hf_20260626_045627_5f8454e4-8272-4d1c-a135-05e84604fbae.png',
      path: 'features/smart-analytics.png'
    }
  ],
  testimonials: [
    {
      url: 'https://d8j0ntlcm91z4.cloudfront.net/user_3EKdnOY1pE0wyJdTmSj8l64dxIY/hf_20260626_045929_ed1ac398-29c1-41e1-bb01-1a65572d3e71.png',
      path: 'testimonials/avatar-1.png'
    },
    {
      url: 'https://d8j0ntlcm91z4.cloudfront.net/user_3EKdnOY1pE0wyJdTmSj8l64dxIY/hf_20260626_050012_47df2e49-8820-4489-8657-9680b3255f72.png',
      path: 'testimonials/avatar-2.png'
    },
    {
      url: 'https://d8j0ntlcm91z4.cloudfront.net/user_3EKdnOY1pE0wyJdTmSj8l64dxIY/hf_20260626_050044_800a5911-6ac4-4c53-9ed1-7d906298b818.png',
      path: 'testimonials/avatar-3.png'
    },
    {
      url: 'https://d8j0ntlcm91z4.cloudfront.net/user_3EKdnOY1pE0wyJdTmSj8l64dxIY/hf_20260626_050119_6eff0f42-c7b7-4005-85b2-71198e880e43.png',
      path: 'testimonials/avatar-4.png'
    },
    {
      url: 'https://d8j0ntlcm91z4.cloudfront.net/user_3EKdnOY1pE0wyJdTmSj8l64dxIY/hf_20260626_050151_e5f25ae3-337d-4e6d-9022-c9de476ef91e.png',
      path: 'testimonials/avatar-5.png'
    },
    {
      url: 'https://d8j0ntlcm91z4.cloudfront.net/user_3EKdnOY1pE0wyJdTmSj8l64dxIY/hf_20260626_050223_d3025bec-3286-458c-bac8-bce7fd7b5433.png',
      path: 'testimonials/avatar-6.png'
    }
  ]
};

async function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const fileStream = createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve(filepath);
      });

      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  console.log('📥 Downloading Higgsfield assets to local folders...\n');

  const baseDir = path.join(__dirname, '../public/assets/higgsfield');

  // Create base directory
  mkdirSync(baseDir, { recursive: true });

  // Create subdirectories
  mkdirSync(path.join(baseDir, 'hero'), { recursive: true });
  mkdirSync(path.join(baseDir, 'features'), { recursive: true });
  mkdirSync(path.join(baseDir, 'testimonials'), { recursive: true });

  const allAssets = [
    assets.hero,
    ...assets.features,
    ...assets.testimonials
  ];

  let downloaded = 0;
  const total = allAssets.length;

  for (const asset of allAssets) {
    const localPath = path.join(baseDir, asset.path);

    // Skip if already exists
    if (existsSync(localPath)) {
      console.log(`✓ Already exists: ${asset.path}`);
      downloaded++;
      continue;
    }

    try {
      console.log(`📥 Downloading: ${asset.path}...`);
      await downloadFile(asset.url, localPath);
      downloaded++;
      console.log(`✅ Downloaded: ${asset.path} (${downloaded}/${total})`);
    } catch (error) {
      console.error(`❌ Failed to download ${asset.path}: ${error.message}`);
    }
  }

  console.log(`\n✨ Downloaded ${downloaded}/${total} assets successfully!`);
  console.log(`📁 Assets saved to: ${baseDir}`);
}

main().catch(console.error);