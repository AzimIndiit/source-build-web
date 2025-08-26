# Filter Button Components

This directory contains reusable filter button components that follow the project's design system and can be used throughout the application.

## Components

### FilterButton

A single, customizable filter button component with built-in styling and accessibility features.

#### Props

- `onClick?: () => void` - Click handler function
- `className?: string` - Additional CSS classes
- `size?: 'sm' | 'md' | 'lg'` - Button size (default: 'md')
- `variant?: 'default' | 'ghost' | 'outline'` - Button variant (default: 'ghost')
- `disabled?: boolean` - Whether the button is disabled (default: false)
- `children?: React.ReactNode` - Custom icon or content (defaults to FilterIcon)

#### Usage

```tsx
import { FilterButton } from '@/components/ui';

// Basic usage
<FilterButton onClick={() => console.log('Filter clicked')} />

// With custom size
<FilterButton size="lg" onClick={handleFilter} />

// With custom icon
<FilterButton onClick={handleSearch}>
  <SearchIcon className="w-4 h-4" />
</FilterButton>

// Disabled state
<FilterButton disabled onClick={handleFilter} />
```

### FilterButtonGroup

A container component that groups multiple filter buttons together with consistent styling and active state management.

#### Props

- `filters: Array<FilterOption>` - Array of filter options
- `className?: string` - Additional CSS classes
- `size?: 'sm' | 'md' | 'lg'` - Button size for all buttons (default: 'md')
- `variant?: 'default' | 'ghost' | 'outline'` - Button variant (default: 'ghost')

#### FilterOption Interface

```tsx
interface FilterOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}
```

#### Usage

```tsx
import { FilterButtonGroup } from '@/components/ui';

const filterOptions = [
  {
    id: 'search',
    label: 'Search',
    icon: <SearchIcon className="w-4 h-4" />,
    onClick: () => handleSearch(),
    active: isSearchActive,
  },
  {
    id: 'sort',
    label: 'Sort',
    icon: <SortIcon className="w-4 h-4" />,
    onClick: () => handleSort(),
    active: isSortActive,
  },
];

<FilterButtonGroup filters={filterOptions} />;
```

## Design Features

- **Responsive sizing**: Three size variants (sm, md, lg) with appropriate icon scaling
- **Accessibility**: Proper ARIA labels and keyboard navigation support
- **Hover effects**: Smooth transitions and hover states
- **Active states**: Visual feedback for active filters
- **Customizable**: Accepts custom icons and styling
- **Consistent**: Follows the project's design system and color scheme

## Styling

The components use Tailwind CSS classes and follow the project's design tokens:

- Primary colors for active states
- Consistent spacing and sizing
- Smooth transitions and animations
- Responsive design patterns

## Examples

See `FilterButtonDemo.tsx` for comprehensive usage examples and different configurations.

## Best Practices

1. **Use consistent sizing** within the same interface
2. **Provide meaningful labels** for accessibility
3. **Handle active states** to show current filter selections
4. **Use appropriate icons** that clearly represent the filter action
5. **Group related filters** using FilterButtonGroup for better UX
6. **Implement proper state management** for filter selections
