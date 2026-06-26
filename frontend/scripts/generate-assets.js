#!/usr/bin/env node

/**
 * Script to generate AI assets using Higgsfield CLI
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, '../public/assets/ai-generated');
mkdirSync(assetsDir, { recursive: true });

// Asset definitions
const assets = {
  features: [
    {
      name: 'ai-transcription',
      prompt: 'Minimalist 3D icon of sound waves transforming into text with AI neural network, gradient purple to blue, glass morphism style, floating particles, modern flat design with depth',
      model: 'gpt_image_2',
      aspectRatio: '1:1',
      resolution: '2k'
    },
    {
      name: 'multi-language',
      prompt: 'Minimalist 3D globe with multiple language symbols floating around it, holographic glass effect, tech aesthetic, purple and cyan gradient colors, subtle glow',
      model: 'gpt_image_2',
      aspectRatio: '1:1',
      resolution: '2k'
    },
    {
      name: 'real-time',
      prompt: 'Minimalist 3D lightning bolt with data streams, representing speed and real-time processing, neon glow effect, glass morphism, purple gradient, tech style',
      model: 'gpt_image_2',
      aspectRatio: '1:1',
      resolution: '2k'
    },
    {
      name: 'smart-analytics',
      prompt: 'Minimalist 3D analytics dashboard with AI brain integration, charts and graphs, futuristic glass design, purple gradient with blue accents, floating elements',
      model: 'gpt_image_2',
      aspectRatio: '1:1',
      resolution: '2k'
    }
  ],
  testimonialAvatars: [
    {
      name: 'avatar-1',
      prompt: 'Professional headshot of tech startup CEO, male, 35 years old, friendly smile, business casual, clean background, photorealistic',
      model: 'nano_banana_2',
      aspectRatio: '1:1',
      resolution: '2k'
    },
    {
      name: 'avatar-2',
      prompt: 'Professional headshot of software engineer, female, 28 years old, confident expression, tech company setting, photorealistic',
      model: 'nano_banana_2',
      aspectRatio: '1:1',
      resolution: '2k'
    },
    {
      name: 'avatar-3',
      prompt: 'Professional headshot of product manager, male, 40 years old, approachable smile, modern office background, photorealistic',
      model: 'nano_banana_2',
      aspectRatio: '1:1',
      resolution: '2k'
    },
    {
      name: 'avatar-4',
      prompt: 'Professional headshot of UX designer, female, 32 years old, creative professional, warm expression, photorealistic',
      model: 'nano_banana_2',
      aspectRatio: '1:1',
      resolution: '2k'
    },
    {
      name: 'avatar-5',
      prompt: 'Professional headshot of data scientist, male, 38 years old, thoughtful expression, tech professional, photorealistic',
      model: 'nano_banana_2',
      aspectRatio: '1:1',
      resolution: '2k'
    },
    {
      name: 'avatar-6',
      prompt: 'Professional headshot of marketing director, female, 45 years old, confident leader, business professional, photorealistic',
      model: 'nano_banana_2',
      aspectRatio: '1:1',
      resolution: '2k'
    }
  ],
  hero: {
    name: 'hero-background',
    prompt: 'Ultra futuristic AI-powered transcription dashboard interface, floating holographic panels, purple and blue gradient neural networks, glass morphism UI elements, particles and light effects, cinematic lighting, 8K ultra detailed, wide angle view',
    model: 'gpt_image_2',
    aspectRatio: '16:9',
    resolution: '4k'
  }
};

// Function to generate a single asset
async function generateAsset(asset, category) {
  console.log(`\n🎨 Generating ${category}/${asset.name}...`);

  try {
    // Build Higgsfield command
    let command = `higgsfield generate create ${asset.model} --prompt "${asset.prompt.replace(/"/g, '\\"')}"`;

    // Add aspect ratio and resolution
    if (asset.aspectRatio) {
      command += ` --aspect_ratio ${asset.aspectRatio}`;
    }
    if (asset.resolution) {
      command += ` --resolution ${asset.resolution}`;
    }

    command += ' --json';

    console.log(`📝 Command: ${command}`);

    // Execute command
    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.error(`⚠️  Warning: ${stderr}`);
    }

    const result = JSON.parse(stdout);
    // The result is an array with the job ID as the first element
    const jobId = Array.isArray(result) ? result[0] : result.id;
    console.log(`✅ Job created: ${jobId}`);

    // Wait for completion
    console.log(`⏳ Waiting for job to complete...`);
    const waitCommand = `higgsfield generate wait ${jobId} --json`;
    const { stdout: waitStdout } = await execAsync(waitCommand, { timeout: 300000 }); // 5 min timeout

    const completedJob = JSON.parse(waitStdout);

    if (completedJob.result_url || completedJob.media_url || completedJob.url) {
      const mediaUrl = completedJob.result_url || completedJob.media_url || completedJob.url;
      console.log(`✨ Asset generated: ${mediaUrl}`);

      // Save URL to manifest
      return {
        name: asset.name,
        category,
        url: mediaUrl,
        prompt: asset.prompt,
        model: asset.model,
        aspectRatio: asset.aspectRatio,
        resolution: asset.resolution
      };
    } else {
      throw new Error('No media URL in response');
    }
  } catch (error) {
    console.error(`❌ Failed to generate ${asset.name}: ${error.message}`);
    return null;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting Higgsfield asset generation...\n');

  // Check authentication
  try {
    const { stdout } = await execAsync('higgsfield account status');
    console.log('✅ Higgsfield authenticated:', stdout.trim());
  } catch (error) {
    console.error('❌ Not authenticated with Higgsfield. Please run: higgsfield auth login');
    process.exit(1);
  }

  const manifest = {
    generated: new Date().toISOString(),
    assets: []
  };

  // Generate hero image
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🖼️  HERO IMAGE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const heroAsset = await generateAsset(assets.hero, 'hero');
  if (heroAsset) manifest.assets.push(heroAsset);

  // Generate feature icons
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎯 FEATURE ICONS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  for (const feature of assets.features) {
    const asset = await generateAsset(feature, 'features');
    if (asset) manifest.assets.push(asset);

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Generate testimonial avatars
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 TESTIMONIAL AVATARS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  for (const avatar of assets.testimonialAvatars) {
    const asset = await generateAsset(avatar, 'testimonials');
    if (asset) manifest.assets.push(asset);

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Save manifest
  const manifestPath = path.join(assetsDir, 'manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ GENERATION COMPLETE!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📁 Manifest saved to: ${manifestPath}`);
  console.log(`📊 Total assets generated: ${manifest.assets.length}`);

  // Display summary
  console.log('\n📋 Asset Summary:');
  manifest.assets.forEach(asset => {
    console.log(`  • ${asset.category}/${asset.name}: ${asset.url}`);
  });
}

// Run the script
main().catch(console.error);