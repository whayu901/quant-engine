# OpenEndsCoding Quick Reference Guide

## File Purposes at a Glance

| File | Purpose | Key Exports |
|------|---------|-------------|
| `OpenEndsCoding.tsx` | Main UI component | default export |
| `OpenEndsCoding.logic.ts` | Logic exports | `useOpenEndsCoding`, Types |
| `OpenEndsCoding.styles.ts` | Style definitions | `styles`, helper functions |
| `index.ts` | Module entry point | All public exports |
| `components/ResponseRow.tsx` | Virtual list item | ResponseRow component |
| `components/CodebookPanel.tsx` | Code sidebar | CodebookPanel component |
| `hooks/useOpenEndsCoding.ts` | Business logic | useOpenEndsCoding hook |
| `services/mock.service.ts` | Data generation | Mock functions |
| `types/index.ts` | TypeScript types | All interfaces |

## Importing Patterns

### Import the whole component:
```typescript
import { OpenEndsCoding } from '@/pages/open-ends-coding';
// or
import OpenEndsCoding from '@/pages/open-ends-coding/OpenEndsCoding';
```

### Import just the logic hook:
```typescript
import { useOpenEndsCoding } from '@/pages/open-ends-coding';
```

### Import individual components:
```typescript
import ResponseRow from '@/pages/open-ends-coding/components/ResponseRow';
import CodebookPanel from '@/pages/open-ends-coding/components/CodebookPanel';
```

### Import types:
```typescript
import type { Response, Code, AIProgress } from '@/pages/open-ends-coding';
```

### Import services:
```typescript
import { generateMockResponses } from '@/pages/open-ends-coding/services/mock.service';
```

## Component Usage

### Using the full page component:
```typescript
<OpenEndsCoding />
```

### Using the logic hook in another component:
```typescript
function MyComponent() {
  const {
    responses,
    filteredResponses,
    filters,
    updateFilter,
    toggleResponseSelection
  } = useOpenEndsCoding();

  return (
    <div>
      {/* Your custom UI using the hook */}
    </div>
  );
}
```

### Using ResponseRow independently:
```typescript
<List itemData={data}>
  {ResponseRow}
</List>
```

### Using CodebookPanel independently:
```typescript
<CodebookPanel
  codes={codes}
  onAddCode={handleAdd}
  onDeleteCode={handleDelete}
  onEditCode={handleEdit}
/>
```

## Hook Return Values

The `useOpenEndsCoding()` hook returns:

### Data:
- `responses` - All 100,000 mock responses
- `codes` - Available codes
- `filteredResponses` - Responses after applying filters
- `selectedResponses` - Set of selected response IDs
- `aiProgress` - Current AI coding progress or null
- `loading` - Loading state

### Computed:
- `codeDistribution` - Top 10 codes by count
- `marketDistribution` - Code count per market
- `codedPercentage` - Percentage of responses with codes

### Filters:
- `filters` - Current filter state (searchTerm, filterMarket, filterCode)
- `updateFilter(key, value)` - Update a filter

### Handlers:
- `toggleResponseSelection(id)` - Toggle response selection
- `handleAICoding()` - Start AI coding simulation
- `handleBulkCode(label)` - Apply code to selected responses
- `handleAddCode(code)` - Add new code
- `handleEditCode(id, updates)` - Edit existing code
- `handleDeleteCode(id)` - Delete code

## Styling

All styles are defined in `OpenEndsCoding.styles.ts` and accessed via the `parseStyle()` helper:

```typescript
import { styles, parseStyle } from './OpenEndsCoding.styles';

// In component:
<div style={parseStyle(styles.container)}>
  {/* content */}
</div>

// Or inline styles:
<div style={{ color: 'rgb(55, 65, 81)', fontSize: '0.875rem' }}>
  {/* content */}
</div>
```

## Type Definitions

### Response
```typescript
interface Response {
  id: string;
  respondent_id: string;
  text: string;
  market: string;
  date: string;
  codes: CodeLabel[];
}
```

### Code
```typescript
interface Code {
  id: number;
  label: string;
  description: string;
  count: number;
}
```

### FilterState
```typescript
interface FilterState {
  searchTerm: string;
  filterMarket: string;
  filterCode: string;
}
```

## Common Tasks

### Search for responses:
```typescript
const { filters, updateFilter } = useOpenEndsCoding();
updateFilter('searchTerm', 'quality');
```

### Filter by market:
```typescript
updateFilter('filterMarket', 'Indonesia');
```

### Select multiple responses:
```typescript
const { selectedResponses, toggleResponseSelection } = useOpenEndsCoding();
toggleResponseSelection('resp_0');
toggleResponseSelection('resp_1');
```

### Add a new code:
```typescript
const { handleAddCode } = useOpenEndsCoding();
handleAddCode({
  label: 'New Code',
  description: 'Code description',
  count: 0
});
```

### Run AI coding:
```typescript
const { handleAICoding } = useOpenEndsCoding();
handleAICoding();
```

## Performance Notes

- Virtual scrolling handles 100,000 items efficiently
- Use memoized `filteredResponses` instead of filtering client-side
- Set-based selection tracking is O(1) for membership checks
- Chart data is recomputed only when filteredResponses changes

## Testing

### Test the hook:
```typescript
import { renderHook, act } from '@testing-library/react';
import { useOpenEndsCoding } from './hooks/useOpenEndsCoding';

test('should add code', () => {
  const { result } = renderHook(() => useOpenEndsCoding());

  act(() => {
    result.current.handleAddCode({
      label: 'Test',
      description: '',
      count: 0
    });
  });

  expect(result.current.codes).toHaveLength(9);
});
```

### Test a component:
```typescript
import { render } from '@testing-library/react';
import ResponseRow from './components/ResponseRow';

test('renders response text', () => {
  const { getByText } = render(<ResponseRow /* props */ />);
  expect(getByText(/response text/i)).toBeInTheDocument();
});
```

### Mock the service:
```typescript
jest.mock('./services/mock.service', () => ({
  generateMockResponses: jest.fn(() => [
    { id: '1', text: 'test', ... }
  ])
}));
```

## Troubleshooting

### Hook not updating?
- Check that you're calling `updateFilter()` or other state setters
- Verify data is being initialized in `useEffect`

### Components not rendering?
- Check imports are correct
- Verify props are being passed
- Check browser console for errors

### Performance issues?
- Virtual scrolling may need itemSize adjustment
- Check for unnecessary re-renders with React DevTools
- Profile with Chrome DevTools Performance tab

## Future Enhancements

- Replace mock service with API calls
- Add React Query for server state
- Implement pagination
- Add export functionality
- Debounce search input
- Bulk edit interface

---

For detailed architecture and design patterns, see `REFACTORING_NOTES.md`
