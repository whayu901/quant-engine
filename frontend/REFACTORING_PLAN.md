# Frontend Refactoring Plan: SOLID + MVVM + React Query

## Executive Summary
Complete architectural overhaul of the Qual Engine frontend to implement SOLID principles, MVVM pattern, and React Query for state management.

## Current State Issues (Critical)
- **100+ SOLID violations** across all components
- **Duplicate AuthContext** implementations with different token keys
- **React Query installed but unused** (95+ useState calls that should use React Query)
- **30+ component duplications** (StatCard, LoadingSpinner, ErrorMessage)
- **0% test coverage** with no testing infrastructure
- **Mixed styling approaches** (TailwindCSS + styled-jsx)
- **300-600+ line components** violating Single Responsibility

## Target Architecture: MVVM Pattern

### Why MVVM over MVC for React
- **View**: React components (purely presentational)
- **ViewModel**: Custom hooks managing state and business logic
- **Model**: Services, API clients, and data models
- Better separation of concerns than MVC for React's component model

## New Folder Structure

```
frontend/
├── src/
│   ├── core/                    # Core functionality
│   │   ├── api/                 # API client with dependency injection
│   │   ├── auth/                # Authentication (single source of truth)
│   │   ├── config/              # App configuration
│   │   └── types/               # TypeScript interfaces
│   │
│   ├── shared/                  # Shared across features
│   │   ├── components/          # Reusable UI components
│   │   ├── hooks/               # Shared custom hooks
│   │   ├── layouts/             # Layout components
│   │   ├── utils/               # Utility functions
│   │   └── styles/              # Global styles
│   │
│   ├── features/                # Feature modules (MVVM)
│   │   ├── projects/
│   │   │   ├── components/      # View layer
│   │   │   ├── hooks/           # ViewModel layer
│   │   │   ├── services/        # Model layer
│   │   │   └── types.ts         # Feature-specific types
│   │   ├── analysis/
│   │   ├── clips/
│   │   ├── reels/
│   │   └── admin/
│   │
│   ├── app/                     # Application root
│   │   ├── App.tsx
│   │   ├── AppProvider.tsx      # All providers
│   │   └── Router.tsx           # Route configuration
│   │
│   └── tests/                   # Test infrastructure
│       ├── setup.ts
│       ├── utils/
│       └── mocks/
```

## Implementation Phases

### Phase 1: Foundation (Week 1)
1. **Day 1-2: Core Infrastructure**
   - Set up new folder structure
   - Configure React Query provider
   - Create dependency injection container
   - Set up API client with interceptors

2. **Day 3-4: Shared Components**
   - Extract and consolidate duplicate components
   - Create component library with Storybook
   - Implement design system tokens

3. **Day 5: Authentication Refactor**
   - Merge duplicate AuthContext implementations
   - Create single auth service with React Query
   - Implement proper token management

### Phase 2: Feature Migration (Week 2-3)
1. **Projects Feature (Proof of Concept)**
   - Smallest, simplest feature
   - Full MVVM implementation
   - 80% test coverage target

2. **Analysis Feature**
   - Complex state management
   - Virtual scrolling optimization
   - WebSocket integration

3. **Clips & Reels Features**
   - Media handling
   - Performance optimization
   - Lazy loading

4. **Admin Feature**
   - Role-based components
   - Complex forms
   - Data tables

### Phase 3: Testing & Optimization (Week 4)
1. **Testing Infrastructure**
   - Jest + React Testing Library setup
   - MSW for API mocking
   - E2E with Playwright

2. **Performance Optimization**
   - Code splitting
   - Bundle size reduction
   - React.memo optimization

### Phase 4: Documentation & Training (Week 5)
1. **Documentation**
   - Component documentation
   - Architecture decisions
   - Migration guide

2. **Team Training**
   - MVVM pattern training
   - React Query best practices
   - Testing strategies

## React Query Integration Strategy

### Query Keys Structure
```typescript
const queryKeys = {
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.projects.lists(), { filters }] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
  },
  // ... other features
};
```

### Custom Hooks Pattern
```typescript
// ViewModel layer (hooks/useProjects.ts)
export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: queryKeys.projects.list(filters),
    queryFn: () => projectService.getProjects(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.lists()
      });
    },
  });
}
```

## SOLID Implementation Examples

### Single Responsibility
```typescript
// BEFORE: Component doing everything
function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    // Fetching logic
  }, []);

  const handleCreate = () => {
    // Creation logic
  };

  const handleFilter = () => {
    // Filter logic
  };

  // 300+ lines of mixed concerns
}

// AFTER: Separated concerns
// View (Component)
function ProjectList() {
  const { projects, isLoading } = useProjects();
  return <ProjectListView projects={projects} loading={isLoading} />;
}

// ViewModel (Hook)
function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: projectService.getAll,
  });
}

// Model (Service)
class ProjectService {
  async getAll(): Promise<Project[]> {
    return apiClient.get('/api/v1/projects');
  }
}
```

### Open/Closed Principle
```typescript
// Extensible component system
interface ComponentProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ComponentProps>(
  ({ variant = 'primary', size = 'md', ...props }, ref) => {
    return <button ref={ref} className={cn(variants[variant], sizes[size])} {...props} />;
  }
);
```

### Dependency Inversion
```typescript
// API client with dependency injection
interface ApiClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: unknown): Promise<T>;
}

class HttpApiClient implements ApiClient {
  constructor(private config: ApiConfig) {}
  // Implementation
}

// Inject dependencies
const apiClient = new HttpApiClient({ baseURL: import.meta.env.VITE_API_URL });
const projectService = new ProjectService(apiClient);
```

## Migration Checklist

### Week 1
- [ ] Create new folder structure
- [ ] Set up React Query provider
- [ ] Configure API client
- [ ] Extract shared components
- [ ] Refactor AuthContext

### Week 2-3
- [ ] Migrate Projects feature
- [ ] Migrate Analysis feature
- [ ] Migrate Clips feature
- [ ] Migrate Reels feature
- [ ] Migrate Admin feature

### Week 4
- [ ] Set up testing infrastructure
- [ ] Write unit tests (target: 80%)
- [ ] Write integration tests
- [ ] Performance optimization

### Week 5
- [ ] Complete documentation
- [ ] Conduct code review
- [ ] Team training
- [ ] Production deployment

## Success Metrics
- **Test Coverage**: From 0% to 70%
- **Bundle Size**: Reduce by 30%
- **Code Duplication**: Eliminate 30+ duplicates
- **Component Size**: Max 150 lines
- **Performance**: 50% faster initial load
- **Type Safety**: 100% TypeScript coverage

## Risk Mitigation
1. **Gradual Migration**: Feature by feature, not big bang
2. **Backward Compatibility**: Keep old code during transition
3. **Testing First**: Write tests before refactoring
4. **Team Alignment**: Regular sync meetings
5. **Rollback Plan**: Git branches for each phase

## Immediate Next Steps
1. Create new folder structure
2. Set up React Query provider
3. Extract StatCard component (most duplicated)
4. Refactor AuthContext to single implementation
5. Migrate Projects feature as proof of concept

This plan ensures a systematic, low-risk migration to a maintainable, testable, and performant frontend architecture.