# Component Documentation

## UserAvatar

### When to use?

When you need to display a user's profile picture from Firebase authentication (Google sign-in) with automatic fallback to a user icon.

Currently used in:

- Navigation bar (desktop and mobile)
- Profile page

### How to use

```tsx
import { UserAvatar } from '@/components/UserAvatar';

// Basic usage
<UserAvatar user={user} />

// Custom size (default is 16)
<UserAvatar user={user} size={24} />

// Additional className
<UserAvatar user={user} size={20} className="border-2 border-primary" />
```

### Props

- `user`: Firebase User object (or null)
- `size`: Number (optional, default: 16) - Size in pixels for both width and height
- `className`: String (optional, default: '') - Additional CSS classes

The component automatically:

- Displays the user's Google profile picture if available
- Falls back to a User icon if no photo exists or if image loading fails
- Applies rounded-full styling for circular avatars
- Handles CORS and ORB (Opaque Response Blocking) issues with proper `crossOrigin` and `referrerPolicy` attributes
- Uses error boundary to gracefully handle failed image loads

## MdxCodeTabs

### When to use?

When you wan to load code for in multiple languages for a solution

### How to use?

The file names being searched is `solution`.
For the supported languages, a solution file should exist with the extension for language
i.e. solution.cpp, solution.py etc.

The file is searched in the `path` field passed as prop to the component

```mdx
<MdxCodeTabs
  langs={[<LIST_OF_LANGUAGES>]}
  path="<PATH_TO_FOLDER_WITH_SOLUTIONS>"
/>
```

Examples:

```mdx
<MdxCodeTabs langs={['java', 'py']} path="dsa/solutions/basic-calculator" />
```

```mdx
<MdxCodeTabs langs={['java', 'py', 'c']} path="system-design/code/library-management/accounts" />
```

## MdxImage

### When to use?

When you want to load images inside `.mdx` components

### How to use

```mdx
<MdxImage src="<PATH_TO_IMAGE_IN_PUBLIC_DIR>" alt="<ALT_IF_IMAGE_NOT_LOADED>" />
```

Example:

```mdx
<MdxImage
  src="design/library-management/activity-renew.svg"
  alt="Activity Diagram for Library Management System"
/>
```
