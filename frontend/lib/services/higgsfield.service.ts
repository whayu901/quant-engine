/**
 * Higgsfield AI Service
 * Integrates with Higgsfield CLI for generating images, videos, and other assets
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface HiggsfieldGenerateOptions {
  prompt: string;
  model?: string;
  imagePath?: string;
  videoPath?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  style?: string;
}

export interface HiggsfieldJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  mediaUrl?: string;
  error?: string;
}

class HiggsfieldService {
  /**
   * Check if Higgsfield CLI is authenticated
   */
  async checkAuth(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('higgsfield account status');
      return stdout.includes('credits');
    } catch {
      return false;
    }
  }

  /**
   * Get account status and credits
   */
  async getAccountStatus(): Promise<{ email: string; plan: string; credits: number } | null> {
    try {
      const { stdout } = await execAsync('higgsfield account status');
      const match = stdout.match(/(.+@.+) — (.+ plan), ([\d.]+) credits/);
      if (match) {
        return {
          email: match[1],
          plan: match[2],
          credits: parseFloat(match[3])
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * List available models
   */
  async listModels(type: 'image' | 'video' = 'image'): Promise<string[]> {
    try {
      const { stdout } = await execAsync(`higgsfield model list --${type} --json`);
      const models = JSON.parse(stdout);
      return models.map((m: any) => m.id);
    } catch {
      return [];
    }
  }

  /**
   * Generate an image using Higgsfield
   */
  async generateImage(options: HiggsfieldGenerateOptions): Promise<HiggsfieldJob> {
    try {
      // Build command
      let command = `higgsfield generate create`;

      // Add model (default to GPT Image 2 for images)
      const model = options.model || 'gpt_image_2';
      command += ` ${model}`;

      // Add prompt
      command += ` --prompt "${options.prompt.replace(/"/g, '\\"')}"`;

      // Add optional parameters
      if (options.imagePath) {
        command += ` --image ${options.imagePath}`;
      }
      if (options.width && options.height) {
        command += ` --width ${options.width} --height ${options.height}`;
      } else if (options.aspectRatio) {
        command += ` --aspect-ratio ${options.aspectRatio}`;
      }
      if (options.style) {
        command += ` --style "${options.style}"`;
      }

      // Add JSON output
      command += ' --json';

      // Execute command
      const { stdout } = await execAsync(command);
      const result = JSON.parse(stdout);

      // Start polling for completion
      return await this.waitForJob(result.id);
    } catch (error: any) {
      return {
        id: '',
        status: 'failed',
        error: error.message
      };
    }
  }

  /**
   * Generate a video using Higgsfield
   */
  async generateVideo(options: HiggsfieldGenerateOptions): Promise<HiggsfieldJob> {
    try {
      // Build command
      let command = `higgsfield generate create`;

      // Add model (default to Seedance 2.0 for videos)
      const model = options.model || 'seedance_2';
      command += ` ${model}`;

      // Add prompt
      command += ` --prompt "${options.prompt.replace(/"/g, '\\"')}"`;

      // Add optional parameters
      if (options.imagePath) {
        command += ` --image ${options.imagePath}`;
      }
      if (options.videoPath) {
        command += ` --video ${options.videoPath}`;
      }

      // Add JSON output
      command += ' --json';

      // Execute command
      const { stdout } = await execAsync(command);
      const result = JSON.parse(stdout);

      // Start polling for completion
      return await this.waitForJob(result.id);
    } catch (error: any) {
      return {
        id: '',
        status: 'failed',
        error: error.message
      };
    }
  }

  /**
   * Generate marketing assets (ads, product shots, etc.)
   */
  async generateMarketingAsset(
    type: 'ad' | 'product' | 'avatar',
    prompt: string,
    productUrl?: string
  ): Promise<HiggsfieldJob> {
    try {
      let command = `higgsfield marketing-studio create`;

      // Add type-specific parameters
      if (type === 'product' && productUrl) {
        command += ` --product-url "${productUrl}"`;
      }

      command += ` --prompt "${prompt.replace(/"/g, '\\"')}"`;
      command += ' --json';

      const { stdout } = await execAsync(command);
      const result = JSON.parse(stdout);

      return await this.waitForJob(result.id);
    } catch (error: any) {
      return {
        id: '',
        status: 'failed',
        error: error.message
      };
    }
  }

  /**
   * Wait for a job to complete
   */
  private async waitForJob(jobId: string): Promise<HiggsfieldJob> {
    try {
      const { stdout } = await execAsync(`higgsfield generate wait ${jobId} --json`);
      const result = JSON.parse(stdout);

      return {
        id: jobId,
        status: 'completed',
        mediaUrl: result.media_url || result.url
      };
    } catch (error: any) {
      return {
        id: jobId,
        status: 'failed',
        error: error.message
      };
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<HiggsfieldJob> {
    try {
      const { stdout } = await execAsync(`higgsfield generate list --json`);
      const jobs = JSON.parse(stdout);
      const job = jobs.find((j: any) => j.id === jobId);

      if (!job) {
        return {
          id: jobId,
          status: 'failed',
          error: 'Job not found'
        };
      }

      return {
        id: jobId,
        status: job.status === 'completed' ? 'completed' : 'running',
        mediaUrl: job.media_url || job.url
      };
    } catch (error: any) {
      return {
        id: jobId,
        status: 'failed',
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const higgsfieldService = new HiggsfieldService();

// Export default assets for landing page
export const defaultAssets = {
  hero: {
    prompt: 'Futuristic AI-powered transcription dashboard interface with glowing neural networks, purple and blue gradients, modern tech aesthetic, floating holographic elements, 4K, ultra detailed',
    model: 'gpt_image_2',
    aspectRatio: '16:9'
  },
  features: [
    {
      title: 'AI Transcription',
      prompt: 'Minimalist icon of sound waves transforming into text with AI neural network, gradient purple to blue, modern flat design',
      model: 'gpt_image_2',
      aspectRatio: '1:1'
    },
    {
      title: 'Multi-Language',
      prompt: 'Globe with multiple language symbols floating around it, holographic style, tech aesthetic, purple and cyan colors',
      model: 'gpt_image_2',
      aspectRatio: '1:1'
    },
    {
      title: 'Real-Time Processing',
      prompt: 'Lightning bolt with data streams, representing speed and real-time processing, neon glow effect, tech style',
      model: 'gpt_image_2',
      aspectRatio: '1:1'
    },
    {
      title: 'Smart Analytics',
      prompt: 'Analytics dashboard with AI brain integration, charts and graphs, futuristic design, purple gradient',
      model: 'gpt_image_2',
      aspectRatio: '1:1'
    }
  ],
  testimonials: {
    prompt: 'Professional headshot avatar for tech company testimonial, friendly smile, business casual, diverse representation',
    model: 'nano_banana_2',
    count: 6
  },
  marketing: {
    productDemo: {
      prompt: 'Screen recording of AI transcription software in action, modern UI, smooth animations, professional presentation',
      model: 'seedance_2'
    },
    socialAd: {
      prompt: 'Social media ad for AI transcription service, eye-catching, modern, call-to-action, Instagram format',
      model: 'marketing_studio'
    }
  }
};