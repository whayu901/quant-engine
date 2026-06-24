# Component Architecture: Separated Logic & Styles

## Overview

All components in the Qual Engine frontend now follow a strict separation of concerns pattern where:
- **Logic** is separated into `.logic.ts` files
- **Styles** are separated into `.styles.ts` files
- **Components** (`.tsx`) only contain the view layer

This architecture ensures better maintainability, testability, and reusability.

## File Structure Pattern

For each component, we now have three separate files:

```
ComponentName/
├── ComponentName.tsx        # View layer (JSX only)
├── ComponentName.logic.ts   # Business logic & state management
└── ComponentName.styles.ts  # Style definitions & classes
```

## Architecture Benefits

### 1. **Separation of Concerns**
- **View**: Pure presentation logic
- **Logic**: State management, handlers, and business rules
- **Styles**: All styling definitions in one place

### 2. **Better Testability**
- Logic can be tested independently without rendering
- Style utilities can be unit tested
- Component integration tests focus on interaction

### 3. **Improved Reusability**
- Styles can be shared across components
- Logic hooks can be reused in different views
- Components become more composable

### 4. **Enhanced Developer Experience**
- Easier to find and modify specific aspects
- Reduced file size and cognitive load
- Clear boundaries between concerns

## Implementation Examples

### 1. Logic File (`.logic.ts`)

```typescript
// ProjectList.logic.ts
import { useState } from 'react';
import { useProjects, useDeleteProject } from '../hooks/useProjects';

export function useProjectListLogic() {
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  const { data: projects, isLoading, error } = useProjects(filters);
  const deleteProject = useDeleteProject();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  return {
    // State
    projects,
    isLoading,
    error,
    // Actions
    handleSearch,
    setSearchTerm,
  };
}
```

### 2. Styles File (`.styles.ts`)

```typescript
// ProjectList.styles.ts
export const styles = {
  container: 'max-w-7xl mx-auto px-4 py-8',

  header: {
    wrapper: 'mb-8',
    title: 'text-3xl font-bold text-gray-900',
    subtitle: 'mt-2 text-sm text-gray-600',
  },

  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
};

// Helper functions for conditional styling
export const getButtonStyle = (isActive: boolean): string => {
  return `px-4 py-2 rounded-lg ${
    isActive ? 'bg-blue-600 text-white' : 'bg-gray-100'
  }`;
};
```

### 3. Component File (`.tsx`)

```typescript
// ProjectList.tsx
import React from 'react';
import { useProjectListLogic } from './ProjectList.logic';
import { styles, getButtonStyle } from './ProjectList.styles';

export function ProjectList() {
  const {
    projects,
    isLoading,
    handleSearch,
    setSearchTerm,
  } = useProjectListLogic();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className={styles.container}>
      <div className={styles.header.wrapper}>
        <h1 className={styles.header.title}>Projects</h1>
      </div>

      <div className={styles.grid}>
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
```

## Style Organization Patterns

### 1. **Nested Object Structure**
Group related styles together in nested objects:

```typescript
export const styles = {
  modal: {
    overlay: 'fixed inset-0 z-50',
    backdrop: 'bg-black bg-opacity-50',
    dialog: 'bg-white rounded-lg shadow-xl',
  },
  form: {
    field: {
      label: 'text-sm font-medium text-gray-700',
      input: 'w-full px-3 py-2 border rounded-lg',
      error: 'mt-1 text-sm text-red-600',
    },
  },
};
```

### 2. **Style Helper Functions**
Create functions for conditional or dynamic styling:

```typescript
export const getInputStyle = (hasError: boolean): string => {
  const base = 'w-full px-3 py-2 border rounded-lg';
  const variant = hasError ? 'border-red-300' : 'border-gray-300';
  return `${base} ${variant}`;
};
```

### 3. **Constant Definitions**
Define style constants for reusable values:

```typescript
const colorStyles = {
  primary: 'bg-blue-600 text-white',
  secondary: 'bg-gray-600 text-white',
  danger: 'bg-red-600 text-white',
};
```

## Logic Organization Patterns

### 1. **Custom Hooks**
Always prefix logic functions with `use`:

```typescript
export function useComponentLogic() {
  // State management
  // Event handlers
  // Business logic
  return { /* exposed values */ };
}
```

### 2. **Pure Functions**
Extract pure utility functions:

```typescript
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString();
};

export const validateForm = (data: FormData): FormErrors => {
  const errors: FormErrors = {};
  // Validation logic
  return errors;
};
```

### 3. **State Management**
Keep complex state logic in the logic file:

```typescript
export function useModalLogic(onClose: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    // Submit logic
    onClose();
  };

  return { isSubmitting, errors, handleSubmit };
}
```

## Migration Guide

To migrate existing components to this pattern:

1. **Extract Logic**
   - Move all `useState`, `useEffect`, and handlers to `.logic.ts`
   - Create a custom hook that returns needed values

2. **Extract Styles**
   - Move all className strings to `.styles.ts`
   - Group related styles in objects
   - Create helper functions for conditional styles

3. **Simplify Component**
   - Import logic hook and styles
   - Focus only on JSX structure
   - Keep component under 150 lines

## Best Practices

1. **Logic Files**
   - One main hook per logic file
   - Export helper functions separately
   - Keep hooks pure and testable

2. **Style Files**
   - Use nested objects for organization
   - Create helper functions for variants
   - Export individual style objects for reuse

3. **Component Files**
   - Minimal logic (only view-related)
   - Clear JSX structure
   - Descriptive prop names

## Testing Strategy

### Logic Testing
```typescript
// ProjectList.logic.test.ts
describe('useProjectListLogic', () => {
  it('should filter projects on search', () => {
    const { result } = renderHook(() => useProjectListLogic());
    act(() => {
      result.current.handleSearch({ preventDefault: jest.fn() });
    });
    expect(result.current.filters.search).toBe('test');
  });
});
```

### Style Testing
```typescript
// ProjectList.styles.test.ts
describe('ProjectList styles', () => {
  it('should return active button style', () => {
    const style = getButtonStyle(true);
    expect(style).toContain('bg-blue-600');
  });
});
```

### Component Testing
```typescript
// ProjectList.test.tsx
describe('ProjectList', () => {
  it('should render projects', () => {
    render(<ProjectList />);
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });
});
```

## File Naming Convention

- **Component**: `PascalCase.tsx`
- **Logic**: `PascalCase.logic.ts`
- **Styles**: `PascalCase.styles.ts`
- **Tests**: `PascalCase.test.ts(x)`

## Conclusion

This separated architecture provides:
- ✅ Clear separation of concerns
- ✅ Better testability
- ✅ Improved maintainability
- ✅ Enhanced reusability
- ✅ Consistent patterns across the codebase

All new components should follow this pattern, and existing components should be migrated gradually.