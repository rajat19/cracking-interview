# Cracking Interview

A comprehensive interview preparation platform designed to help you master technical interviews with practice questions for Data Structures & Algorithms (DSA), System Design, and Behavioral interviews.

## 🚀 Features

- **DSA Questions**: 149+ carefully curated coding problems with multiple language solutions
- **Progress Tracking**: Track your progress across different topics and difficulty levels
- **Multiple Solutions**: View solutions in Java, Python, C++, and other popular languages
- **Bookmarking**: Save questions for later review
- **Dark/Light Mode**: Toggle between themes for comfortable studying
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Technologies Used

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore (for progress tracking)
- **Deployment**: GitHub Pages

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Main application pages
├── content/            # Markdown files for questions
├── lib/                # Utility functions and helpers
├── hooks/              # Custom React hooks
├── contexts/           # React context providers
└── types/              # TypeScript type definitions
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm package manager

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd cracking-interview
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Start the development server:
```bash
npm run dev
# or
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📖 Usage

1. **Browse Questions**: Navigate through different categories (DSA, System Design, Behavioral)
2. **Practice**: Click on any question to view the problem statement and solutions
3. **Track Progress**: Mark questions as completed to track your learning journey
4. **Bookmark**: Save important questions for quick access later
5. **Switch Themes**: Use the theme toggle for your preferred viewing experience

## 🔧 Configuration

The application uses Firebase for authentication and progress tracking. To set up:

1. Create a Firebase project and add your configuration to `src/integrations/firebase/client.ts`

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
- UI components from shadcn/ui
- Icons from Lucide React