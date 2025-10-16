# Using Mdx Components

## HTML Elements

### Subscript and Superscript

MDX files support standard HTML tags for subscript and superscript notation.

#### Subscript (`<sub>`)

Use `<sub>` tags for subscript notation (e.g., chemical formulas, mathematical notation):

```mdx
H<sub>2</sub>O is water

Array indices: arr<sub>i</sub> or arr<sub>0</sub>
```

#### Superscript (`<sup>`)

Use `<sup>` tags for superscript notation (e.g., exponents, footnotes):

```mdx
Time complexity: O(n<sup>2</sup>)

E = mc<sup>2</sup>

2<sup>10</sup> = 1024
```

#### Combined Usage

You can combine both in the same expression:

```mdx
The formula is: x<sub>1</sub><sup>2</sup> + x<sub>2</sub><sup>2</sup>

Big-O notation: O(log<sub>2</sub>n<sup>2</sup>)
```

#### Inside Inline Code (Backticks)

You can also use `<sub>` and `<sup>` tags within inline code blocks (backticks):

```mdx
- Constraint: `0 <= start <= end <= 10<sup>5</sup>`
- Chemical formula: `H<sub>2</sub>O`
- Time complexity: `O(n<sup>2</sup>)` where `n<sup>2</sup>` is the square of n
- Array notation: `arr<sub>i</sub>` or `matrix<sub>i,j</sub>`
```

This will properly render subscripts and superscripts even within inline code formatting.

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
