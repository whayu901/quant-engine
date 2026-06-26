/**
 * Services Export - MVC/SOLID
 * Provides access to all controllers and services
 */

import { container, ServiceTokens } from './Container';
import type { IAuthController } from '../controllers/AuthController';
import type { IProjectController } from '../controllers/ProjectController';
import type { ITranscriptController } from '../controllers/TranscriptController';
import type { IAnalysisController } from '../controllers/AnalysisController';
import type { IChatController } from '../controllers/ChatController';
import type { IReportController } from '../controllers/ReportController';
import type { IUserController } from '../controllers/UserController';
import type { IAdminController } from '../controllers/AdminController';

/**
 * Services facade for accessing all application controllers
 */
export const Services = {
  get auth(): IAuthController {
    return container.resolveSync(ServiceTokens.AUTH_CONTROLLER);
  },

  get projects(): IProjectController {
    return container.resolveSync(ServiceTokens.PROJECT_CONTROLLER);
  },

  get transcripts(): ITranscriptController {
    return container.resolveSync(ServiceTokens.TRANSCRIPT_CONTROLLER);
  },

  get analysis(): IAnalysisController {
    return container.resolveSync(ServiceTokens.ANALYSIS_CONTROLLER);
  },

  get chat(): IChatController {
    return container.resolveSync(ServiceTokens.CHAT_CONTROLLER);
  },

  get reports(): IReportController {
    return container.resolveSync(ServiceTokens.REPORT_CONTROLLER);
  },

  get user(): IUserController {
    return container.resolveSync(ServiceTokens.USER_CONTROLLER);
  },

  get admin(): IAdminController {
    return container.resolveSync(ServiceTokens.ADMIN_CONTROLLER);
  }
};

// Mock implementations for MVP
// These would be replaced with actual controller implementations

class MockProjectController implements IProjectController {
  async loadProjects(): Promise<any[]> {
    return [
      { id: '1', name: 'Coffee Sachet Research 2026', description: 'FGD across cities' },
      { id: '2', name: 'Instant Noodle Study', description: 'Consumer behavior analysis' }
    ];
  }

  async getProject(id: string): Promise<any> {
    return { id, name: 'Sample Project', description: 'Sample description' };
  }

  async createProject(data: any): Promise<any> {
    return { id: Date.now().toString(), ...data };
  }

  async runAnalysis(id: string): Promise<void> {
    console.log(`Running analysis for project ${id}`);
  }

  getState(): any {
    return { projects: [], isLoading: false };
  }

  subscribe(callback: (state: any) => void): () => void {
    return () => {};
  }
}

class MockTranscriptController implements ITranscriptController {
  async getProjectTranscripts(projectId: string): Promise<any[]> {
    return [];
  }

  async uploadTranscript(projectId: string, file: File): Promise<any> {
    return { id: Date.now().toString(), fileName: file.name, status: 'processing' };
  }

  async deleteTranscript(id: string): Promise<void> {
    console.log(`Deleted transcript ${id}`);
  }
}

class MockAnalysisController implements IAnalysisController {
  async getProjectAnalyses(projectId: string): Promise<any[]> {
    return [];
  }

  async createAnalysis(projectId: string, data: any): Promise<any> {
    return { id: Date.now().toString(), ...data };
  }

  async getAnalysisInsights(analysisId: string): Promise<any[]> {
    return [];
  }

  async extractThemes(analysisId: string): Promise<void> {
    console.log(`Extracting themes for analysis ${analysisId}`);
  }

  async analyzeSegment(analysisId: string, segment: string): Promise<any> {
    return { id: Date.now().toString(), content: `Analysis of: ${segment}` };
  }
}

class MockChatController implements IChatController {
  async getProjectContext(projectId: string): Promise<string> {
    return 'Project context loaded';
  }

  async sendMessage(data: any): Promise<any> {
    return {
      content: `This is a mock response to: ${data.message}. In production, this would connect to the AI backend.`
    };
  }
}

class MockReportController implements IReportController {
  async getReports(): Promise<any[]> {
    return [];
  }

  async generateReport(data: any): Promise<any> {
    return {
      id: Date.now().toString(),
      name: `Report ${new Date().toISOString()}`,
      format: data.format,
      downloadUrl: '/reports/sample.pdf'
    };
  }

  async deleteReport(id: string): Promise<void> {
    console.log(`Deleted report ${id}`);
  }

  async getDownloadUrl(id: string): Promise<string> {
    return `/reports/${id}.pdf`;
  }
}

// Register mock implementations for MVP
if (!container.has(ServiceTokens.PROJECT_CONTROLLER)) {
  container.registerSingleton(ServiceTokens.PROJECT_CONTROLLER, () => new MockProjectController());
}

if (!container.has(ServiceTokens.TRANSCRIPT_CONTROLLER)) {
  container.registerSingleton(ServiceTokens.TRANSCRIPT_CONTROLLER, () => new MockTranscriptController());
}

if (!container.has(ServiceTokens.ANALYSIS_CONTROLLER)) {
  container.registerSingleton(ServiceTokens.ANALYSIS_CONTROLLER, () => new MockAnalysisController());
}

if (!container.has(ServiceTokens.CHAT_CONTROLLER)) {
  container.registerSingleton(ServiceTokens.CHAT_CONTROLLER, () => new MockChatController());
}

if (!container.has(ServiceTokens.REPORT_CONTROLLER)) {
  container.registerSingleton(ServiceTokens.REPORT_CONTROLLER, () => new MockReportController());
}

// Export types for use in components
export interface IProjectController {
  loadProjects(): Promise<any[]>;
  getProject(id: string): Promise<any>;
  createProject(data: any): Promise<any>;
  runAnalysis(id: string): Promise<void>;
  getState(): any;
  subscribe(callback: (state: any) => void): () => void;
}

export interface ITranscriptController {
  getProjectTranscripts(projectId: string): Promise<any[]>;
  uploadTranscript(projectId: string, file: File): Promise<any>;
  deleteTranscript(id: string): Promise<void>;
}

export interface IAnalysisController {
  getProjectAnalyses(projectId: string): Promise<any[]>;
  createAnalysis(projectId: string, data: any): Promise<any>;
  getAnalysisInsights(analysisId: string): Promise<any[]>;
  extractThemes(analysisId: string): Promise<void>;
  analyzeSegment(analysisId: string, segment: string): Promise<any>;
}

export interface IChatController {
  getProjectContext(projectId: string): Promise<string>;
  sendMessage(data: any): Promise<any>;
}

export interface IReportController {
  getReports(): Promise<any[]>;
  generateReport(data: any): Promise<any>;
  deleteReport(id: string): Promise<void>;
  getDownloadUrl(id: string): Promise<string>;
}