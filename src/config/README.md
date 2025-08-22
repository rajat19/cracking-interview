# Category Configuration System

This directory contains the category-level feature configuration system that controls how different content types (DSA, System Design, Behavioral, OOD) are displayed and behave in the application.

## Files

- **`categoryConfig.json`** - The main configuration file that defines features for each category
- **`categoryConfig.ts`** - TypeScript interfaces and utility functions for working with the configuration

## Configuration Structure

Each category can have the following configuration:

```json
{
  "category-name": {
    "name": "Display Name",
    "features": {
      "solutionTabs": true/false,      // Show solution tabs at bottom
      "mdxRenderer": true/false,       // Use MDX renderer vs markdown
    },
    "contentType": "markdown" | "mdx",
    "difficulty": {
      "enabled": true/false,           // Show difficulty badges
      "levels": ["easy", "medium", "hard"]
    }
  }
}
```

## Usage

### In Components

```tsx
import config from '@/config';

// Check if a feature is enabled
if (config.shouldShowSolutionTabs(category)) {
  // Show solution tabs
}

// Use in conditional rendering
{config.shouldUseMDXRenderer(category) ? (
  <SimpleMDXRenderer content={content} />
) : (
  <MarkdownContent content={content} />
)}
```

### Available Helper Functions

- `shouldShowSolutionTabs(categoryId)` - Whether to show solution tabs
- `shouldUseMDXRenderer(categoryId)` - Whether to use MDX renderer
- `shouldShowDifficulty(categoryId)` - Whether to show difficulty badges

## Current Configuration

- **DSA**: Solution tabs ✓, Platform links ✓, Difficulty ✓, Markdown content
- **System Design**: MDX renderer ✓, No solution tabs, No difficulty
- **Behavioral**: Basic markdown, Examples ✓, No platform links
- **OOD**: Basic markdown, Difficulty ✓, Examples ✓

## Adding New Features

1. Add the feature flag to the `CategoryFeatures` interface in `categoryConfig.ts`
2. Update the JSON configuration for each category
3. Add a helper function to `categoryFeatureHelpers`
4. Use the helper in your components

## Benefits

- **Centralized Control**: All category features controlled from one place
- **Type Safety**: TypeScript interfaces ensure correct usage
- **Easy Maintenance**: No hardcoded category logic scattered throughout components
- **Extensible**: Easy to add new categories or features
- **Consistent**: Ensures consistent behavior across all components
