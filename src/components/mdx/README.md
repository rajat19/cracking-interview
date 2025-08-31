# Using Mdx Components

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
