/**
 * Repository Interface - SOLID: Interface Segregation Principle
 * Defines contracts for data access layer
 */

export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}

export interface IPaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IQueryOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface IPaginatedRepository<T> extends IRepository<T> {
  findPaginated(options: IQueryOptions): Promise<IPaginatedResult<T>>;
}

export interface ICacheableRepository<T> extends IRepository<T> {
  invalidateCache(): void;
  setCacheTTL(seconds: number): void;
}