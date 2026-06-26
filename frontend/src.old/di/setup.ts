/**
 * DI Container Setup - SOLID: Dependency Inversion
 * Configure all dependencies for the application
 */

import { container, ServiceTokens, Lifecycle } from './Container';

// Re-export ServiceTokens for other modules
export { ServiceTokens };

// Repositories
import { AuthRepository, LocalAuthStorage } from '../models/repositories/AuthRepository';
import { ProjectRepository } from '../models/repositories/ProjectRepository';
import { AnalysisRepository } from '../models/repositories/AnalysisRepository';
import { ChatRepository } from '../models/repositories/ChatRepository';
import {
  SettingsRepository,
  SystemSettingsRepository,
  APIKeyRepository,
  BillingRepository
} from '../models/repositories/SettingsRepository';
import {
  AdminAnalyticsRepository,
  UserActivityRepository,
  UserManagementRepository
} from '../models/repositories/AdminRepository';

// Controllers
import { AuthController } from '../controllers/AuthController';
import { ProjectController } from '../controllers/ProjectController';
import { AnalysisController } from '../controllers/AnalysisController';
import { ChatController } from '../controllers/ChatController';
import { SettingsController } from '../controllers/SettingsController';
import { AdminController } from '../controllers/AdminController';
import { BillingController } from '../controllers/BillingController';

// Utils
import { EventEmitter } from '../utils/EventEmitter';

/**
 * Setup dependency injection container
 * SOLID: Open/Closed - Add new services without modifying existing code
 */
export function setupDependencyInjection(): void {
  // Register Storage
  container.registerSingleton(
    ServiceTokens.AUTH_STORAGE,
    () => new LocalAuthStorage()
  );

  // Register Repositories
  container.registerSingleton(
    ServiceTokens.AUTH_REPOSITORY,
    () => {
      const storage = container.resolveSync(ServiceTokens.AUTH_STORAGE);
      return new AuthRepository(storage);
    }
  );

  container.registerSingleton(
    ServiceTokens.PROJECT_REPOSITORY,
    () => new ProjectRepository()
  );

  container.registerSingleton(
    ServiceTokens.ANALYSIS_REPOSITORY,
    () => new AnalysisRepository()
  );

  container.registerSingleton(
    ServiceTokens.CHAT_REPOSITORY,
    () => new ChatRepository()
  );

  container.registerSingleton(
    ServiceTokens.SETTINGS_REPOSITORY,
    () => new SettingsRepository()
  );

  container.registerSingleton(
    ServiceTokens.SYSTEM_SETTINGS_REPOSITORY,
    () => new SystemSettingsRepository()
  );

  container.registerSingleton(
    ServiceTokens.API_KEY_REPOSITORY,
    () => new APIKeyRepository()
  );

  container.registerSingleton(
    ServiceTokens.BILLING_REPOSITORY,
    () => new BillingRepository()
  );

  container.registerSingleton(
    ServiceTokens.ADMIN_ANALYTICS_REPOSITORY,
    () => new AdminAnalyticsRepository()
  );

  container.registerSingleton(
    ServiceTokens.USER_ACTIVITY_REPOSITORY,
    () => new UserActivityRepository()
  );

  container.registerSingleton(
    ServiceTokens.USER_MANAGEMENT_REPOSITORY,
    () => new UserManagementRepository()
  );

  // Register Controllers
  container.registerSingleton(
    ServiceTokens.AUTH_CONTROLLER,
    () => {
      const authService = container.resolveSync(ServiceTokens.AUTH_REPOSITORY);
      return new AuthController(authService);
    }
  );

  container.registerSingleton(
    ServiceTokens.PROJECT_CONTROLLER,
    () => {
      const projectRepository = container.resolveSync(ServiceTokens.PROJECT_REPOSITORY);
      return new ProjectController(projectRepository);
    }
  );

  container.registerSingleton(
    ServiceTokens.ANALYSIS_CONTROLLER,
    () => {
      const analysisRepository = container.resolveSync(ServiceTokens.ANALYSIS_REPOSITORY);
      return new AnalysisController(analysisRepository);
    }
  );

  container.registerSingleton(
    ServiceTokens.CHAT_CONTROLLER,
    () => {
      const chatRepository = container.resolveSync(ServiceTokens.CHAT_REPOSITORY);
      return new ChatController(chatRepository);
    }
  );

  container.registerSingleton(
    ServiceTokens.SETTINGS_CONTROLLER,
    () => {
      const settingsRepository = container.resolveSync(ServiceTokens.SETTINGS_REPOSITORY);
      const apiKeyRepository = container.resolveSync(ServiceTokens.API_KEY_REPOSITORY);
      return new SettingsController(settingsRepository, apiKeyRepository);
    }
  );

  container.registerSingleton(
    ServiceTokens.ADMIN_CONTROLLER,
    () => {
      const analyticsRepository = container.resolveSync(ServiceTokens.ADMIN_ANALYTICS_REPOSITORY);
      const userActivityRepository = container.resolveSync(ServiceTokens.USER_ACTIVITY_REPOSITORY);
      const userManagementRepository = container.resolveSync(ServiceTokens.USER_MANAGEMENT_REPOSITORY);
      const systemSettingsRepository = container.resolveSync(ServiceTokens.SYSTEM_SETTINGS_REPOSITORY);
      return new AdminController(
        analyticsRepository,
        userActivityRepository,
        userManagementRepository,
        systemSettingsRepository
      );
    }
  );

  container.registerSingleton(
    ServiceTokens.BILLING_CONTROLLER,
    () => {
      const billingRepository = container.resolveSync(ServiceTokens.BILLING_REPOSITORY);
      return new BillingController(billingRepository);
    }
  );

  // Register Event Bus
  container.registerSingleton(
    ServiceTokens.EVENT_BUS,
    () => new EventEmitter()
  );

  // Register Logger
  container.registerSingleton(
    ServiceTokens.LOGGER,
    () => ({
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug
    })
  );
}

/**
 * Get service from container - Type-safe helper
 */
export function getService<T>(token: symbol): T {
  return container.resolveSync<T>(token);
}

/**
 * Get service async from container - Type-safe helper
 */
export async function getServiceAsync<T>(token: symbol): Promise<T> {
  return container.resolve<T>(token);
}

/**
 * Initialize the application
 */
export function initializeApp(): void {
  setupDependencyInjection();

  // Initialize auth on app start
  const authController = getService<AuthController>(ServiceTokens.AUTH_CONTROLLER);
  // Auth controller automatically initializes in constructor
}

/**
 * Export commonly used services for convenience
 */
export const Services = {
  get auth() {
    return getService<AuthController>(ServiceTokens.AUTH_CONTROLLER);
  },

  get projects() {
    return getService<ProjectController>(ServiceTokens.PROJECT_CONTROLLER);
  },

  get analysis() {
    return getService<AnalysisController>(ServiceTokens.ANALYSIS_CONTROLLER);
  },

  get chat() {
    return getService<ChatController>(ServiceTokens.CHAT_CONTROLLER);
  },

  get settings() {
    return getService<SettingsController>(ServiceTokens.SETTINGS_CONTROLLER);
  },

  get admin() {
    return getService<AdminController>(ServiceTokens.ADMIN_CONTROLLER);
  },

  get billing() {
    return getService<BillingController>(ServiceTokens.BILLING_CONTROLLER);
  },

  get eventBus() {
    return getService<EventEmitter>(ServiceTokens.EVENT_BUS);
  },

  get logger() {
    return getService<any>(ServiceTokens.LOGGER);
  }
} as const;