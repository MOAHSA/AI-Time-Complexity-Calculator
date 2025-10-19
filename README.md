# AI Code Complexity & Optimization Tool

An intelligent, AI-powered code editor designed to analyze code complexity, provide performance optimizations, and facilitate a deep understanding of algorithms. This tool leverages Google's Gemini AI to offer real-time insights for Python, Java, and C++ code.

## Key Features

- **🤖 AI-Powered Analysis:** Instantly determine the Big O time complexity of your code. Click on any line number to get a detailed breakdown of its execution count and contribution to the overall complexity.
- **💡 Smart Optimization:** Receive intelligent, actionable suggestions to improve your code's performance and efficiency, complete with detailed explanations and code examples.
- **💬 Interactive AI Chat:** Discuss the optimization results directly with the AI. Ask follow-up questions, clarify concepts, and explore alternative solutions within the context of your code.
- **📚 Curated Learning Resources:** Each optimization comes with AI-sourced links to high-quality articles, videos, and documentation to help you learn the underlying computer science principles.
- **🌐 Multi-Language Support:** Analyze code in Python, Java, and C++, with automatic language detection to streamline your workflow.
- **🎨 Customizable Experience:** Tailor the editor to your liking with multiple themes (Modern, Neon, Light, Ocean), adjustable font sizes, and various professional monospaced fonts.
- **📖 Optimization History:** All your optimization sessions, including the full chat conversations, are automatically saved. Revisit past results and discussions at any time from the history sidebar.

## User Guide (How to Use)

1.  **Write Code:** Write or paste your code into the editor. You can select a specific language in the settings, or leave it on "Auto" for automatic detection.
2.  **Analyze Complexity:** Click the **Analyze** button in the status bar. The overall Big O notation will appear at the bottom.
3.  **View Line Details:** After the analysis is complete, **click on any line number** in the gutter to see a tooltip with its specific execution count and analysis.
4.  **Get Optimizations:** Click the **Optimize** button. A modal will appear with the AI's suggestions, learning resources, and a chat window.
5.  **Discuss with AI:** Use the chat input in the optimization modal to ask follow-up questions about the suggested changes or related concepts.
6.  **Review History:** Click the **History** (clock) icon in the status bar to open the sidebar and browse your past optimization sessions.
7.  **Customize Settings:** Click the **Settings** (gear) icon to change the application theme, editor font, font size, and line height.

## Local Development & Installation

This project is built with modern web technologies and is designed to run in an environment that supports ES modules and `importmap` natively, without requiring a complex build setup.

### Prerequisites

-   A modern web browser (e.g., Chrome, Firefox, Edge).
-   A local web server to serve the project files. The [Live Server extension for VS Code](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) is a great option, or you can use a simple command-line server like `python3 -m http.server`.
-   A Google Gemini API key.

### Setup Instructions

1.  **Get the Code:** Clone the repository or download the source files to your local machine.
2.  **Set API Key:** The application is hard-coded to look for the Gemini API key in `process.env.API_KEY`. In a production environment or one with a build system, this would be injected. For local development, you must ensure this variable is available to the application when it runs. *The specific method for this will depend on the environment you are serving the project from.*
3.  **Serve the Files:** Start a local web server in the root directory of the project. For example, if you have Python 3 installed, you can run:
    ```bash
    python3 -m http.server
    ```
4.  **Open in Browser:** Open your web browser and navigate to the local server's address (e.g., `http://localhost:8000`).

## Project Structure

The project is organized into a clear and maintainable structure.

```
.
├── index.html              # Main HTML entry point, CSS, and importmap for dependencies
├── index.tsx               # Main React entry point, mounts the App component
├── metadata.json           # Application metadata
├── README.md               # This file
├── types.ts                # TypeScript type definitions for the entire application
│
└── components/             # Directory for all React UI components
│   ├── App.tsx             # Root component, manages all application state and logic
│   ├── CodeEditor.tsx      # The core text editor, built with CodeMirror
│   ├── HelpTour.tsx        # The welcome/help modal
│   ├── HistorySidebar.tsx  # Sidebar for viewing past optimizations
│   ├── OptimizationModal.tsx # Modal for optimization results and AI chat
│   ├── SettingsModal.tsx   # Modal for editor and theme settings
│   └── StatusBar.tsx       # The bottom bar with controls and status info
│
└── services/               # Directory for external services
    └── geminiService.ts    # Handles all API calls to the Google Gemini AI
```

## Technologies Used

-   **Frontend:** React, TypeScript
-   **AI:** Google Gemini API (`@google/genai`)
-   **Code Editor:** CodeMirror 6
-   **Styling:** TailwindCSS (via CDN), CSS variables for theming
-   **Markdown Rendering:** `react-markdown`
-   **Syntax Highlighting:** `react-syntax-highlighter` (for markdown code blocks)
```