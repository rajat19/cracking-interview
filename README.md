# Cracking Interview Next

A comprehensive interview preparation platform built with Next.js 15, designed to help you master technical interviews with practice questions for Data Structures & Algorithms (DSA), System Design, Object-Oriented Design (OOD), and Behavioral interviews.

## 🚀 Features

- **149+ DSA Questions**: Carefully curated coding problems with multiple language solutions
- **System Design**: Complete system design questions with architectural diagrams and code examples
- **Object-Oriented Design**: OOD problems with UML diagrams and implementation patterns
- **Behavioral Questions**: Interview scenarios with structured answer frameworks
- **Multi-Language Support**: Solutions in Java, Python, C++, JavaScript, TypeScript, Go, C#, and more
- **Smart Code Loading**: Dynamic loading based on available languages per problem
- **Progress Tracking**: Firebase-powered user progress and bookmarking system
- **Responsive Navigation**: Sticky navigation that adapts to mobile screens
- **Dark/Light Mode**: System-aware theme switching with manual override
- **Advanced Filtering**: Filter by difficulty, topics, and companies
- **MDX-Powered Content**: Rich markdown with embedded React components

## 🛠️ Technologies Used

- **Framework**: Next.js 15 with App Router and Turbopack
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Content**: MDX with custom components for code tabs and images
- **Authentication**: Firebase Auth with Google Sign-In
- **Database**: Firebase Firestore for progress tracking
- **State Management**: React Context API
- **API Routes**: Next.js API routes for dynamic content serving

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes for content serving
│   ├── dsa/               # DSA category pages
│   ├── system-design/     # System Design pages
│   ├── ood/               # Object-Oriented Design pages
│   ├── behavioral/        # Behavioral interview pages
│   └── auth/              # Authentication pages
├── components/            # Reusable UI components
│   ├── filters/           # Filter components
│   ├── layout/            # Layout components
│   ├── mdx/               # MDX-specific components
│   └── ui/                # shadcn/ui components
├── content/               # Content organized by category
│   ├── dsa/              # DSA problems and solutions
│   ├── system-design/    # System design content
│   ├── ood/              # OOD problems
│   └── behavioral/       # Behavioral questions
├── lib/                   # Utility functions and loaders
├── hooks/                 # Custom React hooks
├── contexts/              # React context providers
├── config/                # Configuration files
├── data/                  # Pre-built indexes
└── types/                 # TypeScript type definitions
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm package manager (recommended)

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd cracking-interview-next
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

4. Open your browser and navigate to `http://localhost:3000`

## 📖 Usage

### For Students

1. **Browse Categories**: Navigate between DSA, System Design, OOD, and Behavioral sections
2. **Practice Problems**: Click on any question to view detailed problem statements
3. **View Solutions**: Access multi-language code solutions with syntax highlighting
4. **Track Progress**: Sign in to mark questions as completed and bookmark favorites
5. **Filter Content**: Use advanced filters to find questions by difficulty, topics, or companies
6. **Mobile-Friendly**: Use the responsive interface on any device

### For Contributors

1. **Add Content**: Create new MDX files in the appropriate content directory
2. **Language Support**: Add solution files using the naming convention `solution.{ext}`
3. **Frontmatter**: Use the frontmatter format to specify available languages:
   ```yaml
   ---
   title: Problem Title
   langs: [java, py, cpp]
   difficulty: medium
   tags: [array, string]
   companies: [google, microsoft]
   ---
   ```

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore
3. Add your configuration to `src/integrations/firebase/client.ts`

### Category Configuration

The application uses `src/config/categoryConfig.json` to control features per category:

```json
{
  "dsa": {
    "features": {
      "solutionTabs": true, // Enable solution loading
      "mdxRenderer": true, // Enable MDX rendering
      "index": true // Use pre-built indexes
    },
    "difficulty": {
      "enabled": true,
      "levels": ["easy", "medium", "hard"]
    }
  }
}
```

## 🎯 Key Features Explained

### Smart Code Loading

The platform intelligently loads only the code solutions that exist for each problem:

- Reads the `langs` field from MDX frontmatter
- Only fetches files for specified languages
- Eliminates 404 errors and improves performance

### Responsive Navigation

- Sticky navigation on all screen sizes
- Mobile-optimized layout with abbreviated labels
- Collapsible user menu on mobile devices

### Content Management

- **MDX Integration**: Rich content with embedded React components
- **Dynamic Loading**: API routes serve content files dynamically
- **Caching**: In-memory caching for optimal performance
- **Type Safety**: Full TypeScript support throughout

## 🧪 Development

### Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format all files with Prettier
- `pnpm format:check` - Check if files are properly formatted
- `pnpm format:staged` - Format staged files (useful for git hooks)

### Adding New Content

1. Create an MDX file in the appropriate content directory
2. Add solution files in the corresponding code directory
3. Update the frontmatter with correct metadata
4. The system will automatically detect and load the new content

### Code Formatting

This project uses Prettier for consistent code formatting:

- **Automatic formatting**: VS Code is configured to format on save
- **Tailwind CSS sorting**: Classes are automatically sorted for consistency
- **Pre-commit hooks**: Consider adding lint-staged for automatic formatting
- **Configuration**: See `.prettierrc` for formatting rules

Before committing, run:

```bash
pnpm format        # Format all files
pnpm format:check  # Verify formatting
```

## 📝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Rajat Srivastava**

- GitHub: [@rajatsrivastava](https://github.com/rajatsrivastava)
- Twitter: [@rajatsrivastava](https://twitter.com/rajatsrivastava)

## 🙏 Acknowledgments

- Questions and problems curated from various competitive programming platforms
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/)

## 🔄 Migration Notes

This project was migrated from a Vite-based React application to Next.js 15 with:

- App Router for improved routing and layouts
- Server-side rendering capabilities
- Enhanced performance with Turbopack
- Better SEO and meta tag management
- Improved content loading with API routes
