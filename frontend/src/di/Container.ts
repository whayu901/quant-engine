/**
 * Dependency Injection Container - SOLID: Dependency Inversion Principle
 * IoC container for managing dependencies and their lifecycles
 */

type Factory<T> = () => T;
type AsyncFactory<T> = () => Promise<T>;

export enum Lifecycle {
  SINGLETON = 'singleton',
  TRANSIENT = 'transient',
  SCOPED = 'scoped'
}

interface ServiceDescriptor<T> {
  factory: Factory<T> | AsyncFactory<T>;
  lifecycle: Lifecycle;
  instance?: T;
}

/**
 * Simple IoC Container Implementation
 * SOLID: Open/Closed - Extended through registration, not modification
 */
export class Container {
  private services: Map<string | symbol, ServiceDescriptor<any>> = new Map();
  private scopedInstances: Map<string | symbol, any> = new Map();

  /**
   * Register a service with the container
   */
  register<T>(
    token: string | symbol,
    factory: Factory<T> | AsyncFactory<T>,
    lifecycle: Lifecycle = Lifecycle.SINGLETON
  ): void {
    this.services.set(token, {
      factory,
      lifecycle
    });
  }

  /**
   * Register a singleton service
   */
  registerSingleton<T>(
    token: string | symbol,
    factory: Factory<T> | AsyncFactory<T>
  ): void {
    this.register(token, factory, Lifecycle.SINGLETON);
  }

  /**
   * Register a transient service
   */
  registerTransient<T>(
    token: string | symbol,
    factory: Factory<T> | AsyncFactory<T>
  ): void {
    this.register(token, factory, Lifecycle.TRANSIENT);
  }

  /**
   * Register a scoped service
   */
  registerScoped<T>(
    token: string | symbol,
    factory: Factory<T> | AsyncFactory<T>
  ): void {
    this.register(token, factory, Lifecycle.SCOPED);
  }

  /**
   * Register a constant value
   */
  registerConstant<T>(token: string | symbol, value: T): void {
    this.services.set(token, {
      factory: () => value,
      lifecycle: Lifecycle.SINGLETON,
      instance: value
    });
  }

  /**
   * Resolve a service from the container
   */
  async resolve<T>(token: string | symbol): Promise<T> {
    const descriptor = this.services.get(token);

    if (!descriptor) {
      throw new Error(`Service '${String(token)}' is not registered`);
    }

    switch (descriptor.lifecycle) {
      case Lifecycle.SINGLETON:
        if (!descriptor.instance) {
          descriptor.instance = await this.createInstance(descriptor.factory);
        }
        return descriptor.instance;

      case Lifecycle.TRANSIENT:
        return await this.createInstance(descriptor.factory);

      case Lifecycle.SCOPED:
        if (!this.scopedInstances.has(token)) {
          const instance = await this.createInstance(descriptor.factory);
          this.scopedInstances.set(token, instance);
        }
        return this.scopedInstances.get(token);

      default:
        throw new Error(`Unknown lifecycle: ${descriptor.lifecycle}`);
    }
  }

  /**
   * Resolve a service synchronously (only for sync factories)
   */
  resolveSync<T>(token: string | symbol): T {
    const descriptor = this.services.get(token);

    if (!descriptor) {
      throw new Error(`Service '${String(token)}' is not registered`);
    }

    switch (descriptor.lifecycle) {
      case Lifecycle.SINGLETON:
        if (!descriptor.instance) {
          descriptor.instance = (descriptor.factory as Factory<T>)();
        }
        return descriptor.instance;

      case Lifecycle.TRANSIENT:
        return (descriptor.factory as Factory<T>)();

      case Lifecycle.SCOPED:
        if (!this.scopedInstances.has(token)) {
          const instance = (descriptor.factory as Factory<T>)();
          this.scopedInstances.set(token, instance);
        }
        return this.scopedInstances.get(token);

      default:
        throw new Error(`Unknown lifecycle: ${descriptor.lifecycle}`);
    }
  }

  /**
   * Check if a service is registered
   */
  has(token: string | symbol): boolean {
    return this.services.has(token);
  }

  /**
   * Create a new scope
   */
  createScope(): Container {
    const scope = new Container();
    scope.services = new Map(this.services);
    return scope;
  }

  /**
   * Clear scoped instances
   */
  clearScope(): void {
    this.scopedInstances.clear();
  }

  /**
   * Clear all registrations
   */
  clear(): void {
    this.services.clear();
    this.scopedInstances.clear();
  }

  private async createInstance<T>(
    factory: Factory<T> | AsyncFactory<T>
  ): Promise<T> {
    const result = factory();
    return result instanceof Promise ? await result : result;
  }
}

/**
 * Service Tokens for type-safe dependency injection
 */
export const ServiceTokens = {
  // Repositories
  AUTH_REPOSITORY: Symbol('AuthRepository'),
  PROJECT_REPOSITORY: Symbol('ProjectRepository'),
  TRANSCRIPT_REPOSITORY: Symbol('TranscriptRepository'),
  ANALYSIS_REPOSITORY: Symbol('AnalysisRepository'),
  CHAT_REPOSITORY: Symbol('ChatRepository'),
  THEME_REPOSITORY: Symbol('ThemeRepository'),
  REPORT_REPOSITORY: Symbol('ReportRepository'),
  SETTINGS_REPOSITORY: Symbol('SettingsRepository'),
  SYSTEM_SETTINGS_REPOSITORY: Symbol('SystemSettingsRepository'),
  API_KEY_REPOSITORY: Symbol('APIKeyRepository'),
  BILLING_REPOSITORY: Symbol('BillingRepository'),
  ADMIN_ANALYTICS_REPOSITORY: Symbol('AdminAnalyticsRepository'),
  USER_ACTIVITY_REPOSITORY: Symbol('UserActivityRepository'),
  USER_MANAGEMENT_REPOSITORY: Symbol('UserManagementRepository'),

  // Controllers
  AUTH_CONTROLLER: Symbol('AuthController'),
  PROJECT_CONTROLLER: Symbol('ProjectController'),
  TRANSCRIPT_CONTROLLER: Symbol('TranscriptController'),
  ANALYSIS_CONTROLLER: Symbol('AnalysisController'),
  CHAT_CONTROLLER: Symbol('ChatController'),
  THEME_CONTROLLER: Symbol('ThemeController'),
  REPORT_CONTROLLER: Symbol('ReportController'),
  SETTINGS_CONTROLLER: Symbol('SettingsController'),
  ADMIN_CONTROLLER: Symbol('AdminController'),
  BILLING_CONTROLLER: Symbol('BillingController'),

  // Services
  AUTH_SERVICE: Symbol('AuthService'),
  AUTH_STORAGE: Symbol('AuthStorage'),
  API_CLIENT: Symbol('ApiClient'),
  WEBSOCKET_SERVICE: Symbol('WebSocketService'),

  // Utilities
  EVENT_BUS: Symbol('EventBus'),
  LOGGER: Symbol('Logger'),
  CACHE: Symbol('Cache')
} as const;

/**
 * Global container instance
 */
export const container = new Container();

/**
 * Decorator for dependency injection
 */
export function Inject(token: string | symbol) {
  return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
    // Store metadata for constructor injection
    const existingTokens = Reflect.getMetadata('design:paramtypes', target) || [];
    existingTokens[parameterIndex] = token;
    Reflect.defineMetadata('design:paramtypes', existingTokens, target);
  };
}

/**
 * Decorator for marking a class as injectable
 */
export function Injectable() {
  return function (target: any) {
    // Mark class as injectable
    Reflect.defineMetadata('injectable', true, target);
  };
}