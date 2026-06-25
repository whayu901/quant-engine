# Frontend Architecture - MVC with SOLID Principles

## Architecture Pattern: MVC (Model-View-Controller)

### Directory Structure
```
/src
├── models/           # Business logic and data
│   ├── entities/    # Domain entities
│   ├── repositories/# Data access layer
│   └── services/    # Business services
├── controllers/     # Application logic
│   ├── auth/       # Authentication controllers
│   ├── projects/   # Project controllers
│   └── transcripts/# Transcript controllers
├── views/          # Presentation layer (pure components)
│   ├── components/ # Reusable view components
│   ├── layouts/   # Layout components
│   └── pages/     # Page views
├── interfaces/     # TypeScript interfaces (contracts)
├── di/            # Dependency Injection
└── utils/         # Utilities

```

## SOLID Principles Implementation

### 1. Single Responsibility Principle (SRP)
- Each class has one reason to change
- Models handle data only
- Controllers handle business logic only
- Views handle presentation only

### 2. Open/Closed Principle (OCP)
- Use interfaces for all services
- Extend through inheritance, not modification
- Strategy pattern for different implementations

### 3. Liskov Substitution Principle (LSP)
- All implementations can be substituted
- Use abstract classes and interfaces properly

### 4. Interface Segregation Principle (ISP)
- Small, focused interfaces
- Clients depend only on methods they use

### 5. Dependency Inversion Principle (DIP)
- Depend on abstractions (interfaces)
- Inject dependencies
- Use IoC container

## MVC Flow

```
User Action → View → Controller → Model → Repository → API
                ↑                    ↓
                ←─────── Update ←────┘
```

## Key Design Patterns Used

1. **Repository Pattern** - Data access abstraction
2. **Service Pattern** - Business logic encapsulation
3. **Observer Pattern** - State management
4. **Strategy Pattern** - Interchangeable algorithms
5. **Dependency Injection** - IoC container
6. **Factory Pattern** - Object creation
7. **Decorator Pattern** - Extending functionality

## Implementation Rules

1. **Models** - Pure data classes, no UI logic
2. **Views** - No business logic, only presentation
3. **Controllers** - Orchestrate between Model and View
4. **Interfaces** - Define contracts for all services
5. **No direct API calls from Views**
6. **All dependencies injected, not instantiated**
7. **Strict type safety with TypeScript**