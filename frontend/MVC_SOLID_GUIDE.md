# MVC with SOLID Principles - Implementation Guide

## Architecture Overview

This frontend implements **MVC (Model-View-Controller)** pattern with **SOLID principles** throughout.

## Directory Structure

```
src/
├── models/               # M in MVC - Business logic & data
│   ├── entities/        # Domain objects (User, Project, Transcript)
│   └── repositories/    # Data access layer (API calls)
│
├── controllers/         # C in MVC - Business logic orchestration
│   ├── AuthController   # Authentication logic
│   ├── ProjectController# Project management logic
│   └── TranscriptController # Transcript processing logic
│
├── views/              # V in MVC - Presentation layer
│   ├── components/     # Pure presentation components
│   ├── containers/     # Smart components (connect to controllers)
│   └── pages/         # Page layouts
│
├── interfaces/         # Abstractions for SOLID
├── di/                # Dependency Injection container
└── hooks/             # React adapters for controllers
```

## SOLID Principles Applied

### 1. **Single Responsibility Principle (SRP)**
Each class/component has ONE reason to change:

- **Models**: Only handle data structure
- **Repositories**: Only handle data access
- **Controllers**: Only handle business logic
- **Views**: Only handle presentation
- **Containers**: Only handle View-Controller connection

Example:
```typescript
// User.ts - Only responsible for user data structure
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    // ...
  ) {}
}

// AuthRepository.ts - Only responsible for auth API calls
export class AuthRepository {
  async login(credentials: ILoginCredentials) { /* ... */ }
}

// AuthController.ts - Only responsible for auth business logic
export class AuthController {
  async login(credentials: ILoginCredentials) { /* ... */ }
}

// LoginView.tsx - Only responsible for login UI
export const LoginView: React.FC<LoginViewProps> = (props) => { /* ... */ }
```

### 2. **Open/Closed Principle (OCP)**
Classes are open for extension but closed for modification:

```typescript
// Can add new repositories without modifying existing code
container.registerSingleton(
  ServiceTokens.NEW_REPOSITORY,
  () => new NewRepository()
);

// Can extend controllers through inheritance
class ExtendedAuthController extends AuthController {
  // Add new features without modifying base class
}
```

### 3. **Liskov Substitution Principle (LSP)**
Subtypes must be substitutable for base types:

```typescript
// Any IAuthService implementation can be used
interface IAuthService {
  login(credentials: ILoginCredentials): Promise<IAuthTokens>;
}

class AuthRepository implements IAuthService { /* ... */ }
class MockAuthService implements IAuthService { /* ... */ }

// Both can be used interchangeably
const controller = new AuthController(authService); // Works with any IAuthService
```

### 4. **Interface Segregation Principle (ISP)**
Clients depend only on interfaces they use:

```typescript
// Segregated interfaces
interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
}

interface IPaginatedRepository<T> extends IRepository<T> {
  findPaginated(options: IQueryOptions): Promise<IPaginatedResult<T>>;
}

// Components only use what they need
interface LoginViewProps {
  email: string;
  onEmailChange: (email: string) => void;
  // Only login-specific props, not entire auth state
}
```

### 5. **Dependency Inversion Principle (DIP)**
Depend on abstractions, not concretions:

```typescript
// Controller depends on interface, not implementation
export class AuthController {
  constructor(private authService: IAuthService) {} // Interface, not concrete class
}

// Dependency injection provides concrete implementation
container.registerSingleton(
  ServiceTokens.AUTH_CONTROLLER,
  () => {
    const authService = container.resolveSync(ServiceTokens.AUTH_REPOSITORY);
    return new AuthController(authService);
  }
);
```

## MVC Flow

```
User Action → View → Container → Controller → Repository → API
                ↑                      ↓
                ←── State Update ←─────┘
```

1. **User interacts** with View (pure presentation)
2. **Container** handles the event, calls Controller
3. **Controller** executes business logic, calls Repository
4. **Repository** makes API call, returns data
5. **Controller** updates state, notifies subscribers
6. **Container** receives update, passes to View
7. **View** re-renders with new data

## Usage Example

```typescript
// 1. Initialize DI container (App.tsx)
initializeApp();

// 2. Use controller in component
const LoginContainer: React.FC = () => {
  const authController = Services.auth;
  const [authState, setAuthState] = useState(authController.getState());

  useEffect(() => {
    const unsubscribe = authController.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await authController.login({ email, password });
  };

  return (
    <LoginView
      email={email}
      isLoading={authState.isLoading}
      error={authState.error}
      onSubmit={handleSubmit}
      // ...
    />
  );
};
```

## Benefits of This Architecture

1. **Testability**: Each layer can be tested independently
2. **Maintainability**: Clear separation of concerns
3. **Scalability**: Easy to add new features without breaking existing code
4. **Flexibility**: Can swap implementations (e.g., different auth providers)
5. **Type Safety**: Full TypeScript support with interfaces
6. **Reusability**: Business logic separated from UI

## Testing Strategy

```typescript
// Test Model
describe('User Entity', () => {
  it('should create user with correct properties', () => {
    const user = new User('1', 'test@example.com', 'Test User');
    expect(user.email).toBe('test@example.com');
  });
});

// Test Repository (with mocked API)
describe('AuthRepository', () => {
  it('should login successfully', async () => {
    const mockApi = jest.fn().mockResolvedValue({ access_token: 'token' });
    const repo = new AuthRepository(mockApi);
    const result = await repo.login({ email: 'test@example.com', password: 'password' });
    expect(result.accessToken).toBe('token');
  });
});

// Test Controller (with mocked repository)
describe('AuthController', () => {
  it('should update state on login', async () => {
    const mockRepo = { login: jest.fn().mockResolvedValue({ accessToken: 'token' }) };
    const controller = new AuthController(mockRepo);
    await controller.login({ email: 'test@example.com', password: 'password' });
    expect(controller.getState().isAuthenticated).toBe(true);
  });
});

// Test View (with props)
describe('LoginView', () => {
  it('should render login form', () => {
    const { getByLabelText } = render(
      <LoginView
        email=""
        onEmailChange={jest.fn()}
        // ...
      />
    );
    expect(getByLabelText('Email address')).toBeInTheDocument();
  });
});
```

## Migration from Existing Code

To migrate existing React components to MVC/SOLID:

1. **Extract data fetching** → Move to Repository
2. **Extract business logic** → Move to Controller
3. **Extract state management** → Move to Controller
4. **Keep only presentation** → Pure View component
5. **Create Container** → Connect View to Controller
6. **Register in DI** → Add to container setup

## Important Notes for Frontend Team

1. **Always use interfaces** for dependencies
2. **Never import concrete classes** directly in controllers
3. **Keep Views pure** - no API calls, no business logic
4. **Use Container components** to connect Views to Controllers
5. **Register all services** in DI container
6. **Follow naming conventions**:
   - Entities: `User`, `Project`
   - Repositories: `AuthRepository`, `ProjectRepository`
   - Controllers: `AuthController`, `ProjectController`
   - Views: `LoginView`, `ProjectListView`
   - Containers: `LoginContainer`, `ProjectListContainer`
   - Interfaces: `IAuthService`, `IRepository`

This architecture ensures **clean, maintainable, and scalable** code that follows industry best practices.