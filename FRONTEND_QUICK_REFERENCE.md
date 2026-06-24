# Frontend Quick Reference Guide

## Files at a Glance

### Authentication & Access
- **auth.jsx** - Token management, login/logout
- **contexts/AuthContext.jsx** - User state provider
- **pages/Login.jsx** - Login form

### Core Pages
- **pages/Projects.jsx** - Project listing
- **pages/Project.jsx** - Single project details
- **pages/Analysis.jsx** - Analysis view

### Dashboards
- **pages/AdminDashboard.jsx** - System overview (admin only)
- **pages/QualDashboard.jsx** - Qualitative research hub
- **pages/QuantDashboard.jsx** - Quantitative analysis hub
- **pages/ClientDashboard.jsx** - Client insights view
- **pages/UserManagement.jsx** - User admin panel

### Analysis Tools (Phase 3)
- **pages/OpenEndsCoding.jsx** - Open-ended response coding with AI
- **pages/ConceptTesting.jsx** - Product concept evaluation

### Media Management (Phase 3)
- **pages/ClipsManager.jsx** - Create/manage video clips
- **pages/ReelsManager.jsx** - Compile clips into reels

### Routing
- **App.jsx** - All route definitions
- **components/Layout.jsx** - Main layout wrapper

### Utilities
- **api.js** - API client configuration
- **main.jsx** - React app entry point

---

## Quick Navigation

### Dashboard URLs
```
Admin:              /admin/dashboard, /admin/users
Qualitative:        /qual/dashboard
Quantitative:       /quant/dashboard
Client:             /client/dashboard
Team Lead:          /team/dashboard
```

### Analysis Tools
```
Open Ends Coding:   /open-ends
Concept Testing:    /concepts
```

### Missing Routes (Need to add to App.jsx)
```
Clips Manager:      /projects/:id/clips
Reels Manager:      /projects/:id/reels
```

---

## Component Nesting

```
App
├── Private (role guard)
│   ├── Layout
│   │   ├── Projects
│   │   ├── Project
│   │   └── Analysis
│   ├── QualDashboard
│   ├── QuantDashboard
│   ├── AdminDashboard
│   ├── UserManagement
│   ├── OpenEndsCoding
│   ├── ConceptTesting
│   ├── ClientDashboard
│   ├── ClipsManager (not routed)
│   └── ReelsManager (not routed)
└── Login
```

---

## Key Features by Page

### OpenEndsCoding (100K responses)
- Codebook sidebar with add/edit/delete
- Virtualized response table
- Multi-select for bulk coding
- AI auto-coding button with progress
- Charts: Code distribution, Market distribution
- Filters: Search, market, code

### ConceptTesting (12 concepts)
- Concept card grid with scores
- Single concept detailed view:
  - 5 metric cards
  - Attribute radar chart
  - Sentiment pie chart
  - Demographics bar chart
  - Score progression area chart
- Comparison mode (up to 3 concepts)
- Market filter

### ClipsManager
- Create clips from transcripts
- Time range selection
- Tags and metadata
- Grid view of clips
- Actions: Play, Download, Share, Edit, Delete
- Edit modal
- Share modal with URL copy

### ReelsManager
- Comprehensive reel creation form (purpose, resolution, aspect ratio, transitions, etc.)
- Reel card grid
- Clips management modal
  - Drag-reorder with up/down buttons
  - Add available clips
  - Remove clips
  - Compile reel
- Share functionality
- Settings modal

---

## Data Scale

| Page | Records | Technique |
|------|---------|-----------|
| QualDashboard | 10,000 transcripts | React Window virtualization |
| QuantDashboard | 50,000 surveys | React Window virtualization |
| OpenEndsCoding | 100,000 responses | React Window virtualization |
| ClientDashboard | 2.4M responses | Virtualized table |
| ConceptTesting | 12 concepts | Regular grid |
| ClipsManager | n/a | Grid layout |
| ReelsManager | n/a | Grid layout |

---

## Stat Cards Pattern

All dashboards use a StatCard component:
```jsx
<StatCard
  icon={IconComponent}
  title="Display Name"
  value="123"
  subtitle="additional info"
  change={+12} // optional, shows percentage change
  color="blue|green|purple|orange"
/>
```

---

## Chart Types Used

### Trends
- LineChart (multi-line for comparison)
- AreaChart (stacked area)
- AreaChart with Brush (time range selector)

### Distribution
- PieChart / Pie (regular & donut)
- BarChart (vertical bars)
- RadarChart (multi-axis)

### Comparison
- BarChart (grouped)
- ScatterChart (scatter plots)

### Advanced
- ComposedChart
- Sankey (flow diagram)
- Treemap (hierarchical)

---

## Authentication Roles

```
super_admin     - Full system access
org_admin       - Organization management
admin           - Limited admin access
team_lead       - Team management
researcher      - Qualitative research
analyst         - Quantitative analysis
client          - Read-only insights view
viewer          - Limited read-only
```

---

## State Management Pattern

Currently uses:
- **React Context** for auth state
- **useState** for component-level state
- **useMemo** for derived state
- **useCallback** for event handlers

NOTE: Consider upgrading to Redux or Zustand for Phase 4+

---

## Performance Features

1. **Virtualization**
   - react-window for large lists
   - react-virtualized-auto-sizer for dynamic sizing
   - 40-80px item heights depending on content

2. **Memoization**
   - useMemo for filtered data
   - useCallback for event listeners
   - Component re-render optimization

3. **Lazy Loading**
   - React Intersection Observer imported but underutilized
   - Could benefit from lazy component loading

---

## API Integration Points

All pages currently use mock data. Real integration needed:

```javascript
// Current pattern (mock)
const mockData = Array.from({ length: 10000 }, (_, i) => ({...}));

// Should be replaced with
const { data, loading, error } = useQuery('key', () => 
  api.get('/endpoint')
);
```

---

## Common Issues & Solutions

### Adding New Page
1. Create `pages/NewPage.jsx`
2. Add route to `App.jsx`
3. Add role check if needed
4. Import necessary icons/charts

### Adding New Route
1. Import component in `App.jsx`
2. Add `<Route>` with path
3. Wrap in `<Private>` with `allowedRoles`
4. Test access by role

### Adding to Clips/Reels
1. Update routing in `App.jsx`
2. Add navigation buttons in parent component
3. Pass `projectId` via URL params

---

## Dependencies Quick Reference

```json
{
  "react": "UI framework",
  "react-router-dom": "Routing",
  "recharts": "Charts & graphs",
  "react-window": "Virtual scrolling",
  "lucide-react": "Icons",
  "@tanstack/react-query": "Data fetching",
  "axios-cache-adapter": "HTTP + caching"
}
```

---

## Testing Checklist

- [ ] Login works for each role
- [ ] Dashboards load correct data
- [ ] Virtualized lists scroll smoothly
- [ ] Charts render without errors
- [ ] Filters and search work
- [ ] Export buttons trigger download
- [ ] Modals open/close properly
- [ ] Share links copy to clipboard
- [ ] Mobile responsive design
- [ ] API errors handled gracefully

---

## Phase 4 Prep Tasks

1. Extract stat cards → `components/StatCard.jsx`
2. Extract charts → `components/Charts/`
3. Create `hooks/useDashboardData.js`
4. Setup `services/api.js` with error handling
5. Add TypeScript for type safety
6. Setup testing framework (Jest + React Testing Library)
7. Create shared `AnalysisContext` for cross-page state

---

## File Size Reference

```
QualDashboard.jsx       ~12.5 KB
QuantDashboard.jsx      ~14.8 KB
ClientDashboard.jsx     ~21.6 KB
OpenEndsCoding.jsx      ~20.9 KB
ReelsManager.jsx        ~28.9 KB (largest)
ConceptTesting.jsx      ~17.4 KB
ClipsManager.jsx        ~17.2 KB
AdminDashboard.jsx      ~12.6 KB
```

Total: ~150 KB of component code

---

## Next Steps for Development

1. **Immediate**: Route clips/reels in App.jsx
2. **Short-term**: Connect real API endpoints
3. **Medium-term**: Refactor shared components
4. **Long-term**: Build Phase 4-5 features
