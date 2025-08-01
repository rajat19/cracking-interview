# DSA Questions Import Script

This script imports DSA questions from Jekyll markdown files into your Supabase database.

## Setup

1. Get your Supabase service role key from [here](https://supabase.com/dashboard/project/nzjcbqwffrnpgebuntvh/settings/api)

2. Set the environment variable:
   ```bash
   export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"
   ```

3. Create the content directory and add your markdown files:
   ```
   src/content/
   ├── alien-dictionary.md
   ├── two-sum.md
   └── ...
   ```

## Usage

From the scripts directory, run:

```bash
cd scripts
npm run import-dsa
```

## Markdown Format

The script expects Jekyll-style markdown with frontmatter:

```yaml
---
title: Problem Title
difficulty: easy|medium|hard
tc: O(n)
sc: O(1)
topics: [array, hash-table]
leetcode: problem-slug
leetid: 123
hackerrank: problem-name
gfg: problem-name
---

Problem description and content here...

## Examples
**Example 1:**
```
Input: [1,2,3]
Output: [1,2,3]
```
```

## Field Mapping

| Frontmatter Field | Database Column |
|-------------------|-----------------|
| `title` | `title` (required) |
| `difficulty` | `difficulty` (required) |
| `tc` | `time_complexity` |
| `sc` | `space_complexity` |
| `topics` | `related_topics` |
| `leetcode` | `leetcode_identifier` |
| `leetid` | `leetcode_identifier` |
| `hackerrank` | `hackerrank_identifier` |
| `gfg` | `gfg_identifier` |
| Content | `content` (required) |
| Examples | `examples` (auto-extracted) |

## Features

- ✅ Parses Jekyll frontmatter
- ✅ Extracts examples from markdown content
- ✅ Checks for duplicate questions
- ✅ Validates required fields
- ✅ Detailed progress logging
- ✅ Error handling and summary report