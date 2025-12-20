# Refactored Application Architecture

## Overview

The monolithic `App.tsx` (originally 1056 lines) has been successfully refactored to resolve performance bottlenecks and improve maintainability. The application now follows a modular, scalable architecture with proper separation of concerns.

## Key Improvements

### 1. Component Segregation

- **Layout Components**: Separated into `src/components/layout/` directory
  - `AppLayout.tsx` - Main application layout
  - `Sidebar.tsx` - Navigation sidebar
  - `MobileHeader.tsx` - Mobile header component
  - `BottomNav.tsx` - Bottom navigation for mobile
- **Shared Components**: Located in `src/components/shared/`
  - `AthleteModal.tsx` - Athlete management modal
  - `ConfirmDialog.tsx` - Confirmation dialog wrapper
  - `ExportModal.tsx` - Export configuration modal
  - `ToastContainer.tsx` - Toast notification system
- **UI Components**: Existing components in `components/UI.tsx`

### 2. State Optimization

- **Custom Hooks**: Created in `src/hooks/` directory
  - `useAppData.ts` - Handles all data fetching and management
  - `useTheme.ts` - Manages theme state and application
  - `useUIState.ts` - Centralizes UI state management
- **Context Providers**: Implemented in `src/contexts/`
  - `AppContext.tsx` - Main application context combining all states
  - `ThemeContext.tsx` - Theme management context
  - `UIContext.tsx` - UI state management context
- **Memoization**: Applied `React.memo()` to prevent unnecessary re-renders
- **useCallback/useMemo**: Used extensively for performance optimization

### 3. Code Splitting & Lazy Loading

- **Lazy Loading**: Implemented `React.lazy` and `Suspense` for all major views
- **Dynamic Imports**: Views are loaded on-demand reducing initial bundle size
- **Skeleton Loaders**: Added for smooth loading experiences
- **Lazy Utilities**: Created in `src/utils/lazyLoad.tsx` with reusable lazy loading functions

### 4. Context Management

- **Global State**: Properly managed through Context API
- **State Separation**: Different contexts for different concerns
- **Performance**: Memoized context values to prevent unnecessary re-renders
- **Scalability**: Easy to extend with additional contexts as needed

## File Structure

```
src/
├── components/
│   ├── layout/           # Layout components
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MobileHeader.tsx
│   │   └── BottomNav.tsx
│   └── shared/           # Shared UI components
│       ├── AthleteModal.tsx
│       ├── ConfirmDialog.tsx
│       ├── ExportModal.tsx
│       └── ToastContainer.tsx
├── contexts/             # React Context providers
│   ├── AppContext.tsx
│   ├── ThemeContext.tsx
│   └── UIContext.tsx
├── hooks/                # Custom React hooks
│   ├── useAppData.ts
│   ├── useTheme.ts
│   └── useUIState.ts
├── utils/                # Utility functions
│   └── lazyLoad.tsx
├── AppContent.tsx        # Main application content
└── App.tsx              # Root application component
```

## Performance Benefits

1. **Reduced Bundle Size**: Initial load reduced through code splitting
2. **Improved Rendering**: Memoization prevents unnecessary re-renders
3. **Better Memory Usage**: Lazy loading reduces initial memory footprint
4. **Faster Development**: Smaller, focused components are easier to develop and test
5. **Enhanced Maintainability**: Clear separation of concerns makes code easier to maintain

## Architecture Patterns Used

- **Compound Components**: For related UI elements
- **Render Props**: For sharing UI logic
- **Higher-Order Components**: For cross-cutting concerns
- **Context Pattern**: For global state management
- **Custom Hooks**: For reusable logic
- **Lazy Loading**: For performance optimization

## Key Features Maintained

- RTL (Right-to-Left) support for Persian language
- Theme management (dark/light mode, color schemes)
- Responsive design for mobile and desktop
- Toast notifications and confirmation dialogs
- Export functionality for plans and reports
- Athlete management system
- Workout and nutrition planning

## Testing Considerations

- Each component is now independently testable
- Hooks can be tested in isolation
- Context providers can be mocked for testing
- Lazy loaded components can be tested with Suspense boundaries

## Future Extensibility

- New views can be easily added with lazy loading
- Additional contexts can be integrated seamlessly
- New hooks can be created following the established patterns
- Component library can be extended systematically
