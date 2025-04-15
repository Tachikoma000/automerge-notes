# Arcane Studio

![Arcane Studio Banner](https://placehold.co/1200x300/4F46E5/FFFFFF?text=Arcane+Studio)

## 📝 Overview

Arcane Studio is a powerful, modern markdown editor with real-time collaboration and AI-powered writing assistance. It combines the simplicity of markdown with advanced features like real-time collaboration, AI-powered writing suggestions, and seamless document organization.

- **Collaborative Editing**: Edit documents with multiple users in real-time
- **AI-Powered Writing**: Get intelligent writing suggestions and autocompletions
- **Markdown Support**: Full markdown syntax support with live preview
- **Document Organization**: Create folders and organize your documents
- **Cross-Platform**: Works on any modern web browser

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-blue)](https://tailwindcss.com/)

---

## 🌟 Key Features

### Collaborative Editing

- **Real-time Collaboration**: Multiple users can edit the same document simultaneously
- **Cursor Presence**: See other users' cursors and selections in real-time
- **Conflict-free Editing**: Built on [Automerge CRDT](https://automerge.org/) for conflict-free collaborative editing
- **Document Sharing**: Share documents with collaborators via a simple link

### AI-Powered Writing Assistant

- **AI Suggestions**: Get intelligent writing suggestions as you type
- **Text Completions**: Generate completions for your writing with the click of a button
- **Grammar & Style Check**: Receive grammar, spelling, and style improvement suggestions
- **Document Context**: AI assistant understands your entire document for better assistance
- **Reference Integration**: Easily reference other documents in your workspace

### Rich Markdown Editor

- **Live Preview**: See your formatted markdown in real-time
- **Syntax Highlighting**: Clear syntax highlighting for improved readability
- **Toolbar Shortcuts**: Quick access to common markdown formatting options
- **Keyboard Shortcuts**: Efficient keyboard shortcuts for power users
- **Customizable UI**: Light and dark mode support

### Document Management

- **Folder Organization**: Create folders to organize your documents
- **Document Search**: Quickly find documents across your workspace
- **Document History**: View and restore previous versions of your documents
- **Custom Metadata**: Add custom metadata to documents for better organization
- **Export Options**: Export your documents in Markdown format

---

## 🔧 Architecture & Technology

Arcane Studio is built with a modern tech stack:

### Frontend

- **React**: For the UI components and application logic
- **TypeScript**: For type-safe code and better developer experience
- **Tailwind CSS**: For styling and responsive design
- **shadcn/ui**: For accessible and customizable UI components
- **Vite**: For fast development and optimized builds

### Data Layer

- **Automerge**: CRDT-based data structure for real-time collaboration
- **Automerge-Repo**: For document storage and synchronization
- **IndexedDB**: For client-side storage of documents and settings

### AI Integration

- **Claude AI**: Integration with Anthropic's Claude API for AI features
- **Vector Store**: Custom vector database for document indexing and semantic search
- **Text Analysis**: NLP-based text analysis for grammar and style suggestions

### Collaboration

- **WebRTC**: For peer-to-peer communication
- **Presence Protocol**: For real-time cursor and selection tracking
- **Offline Support**: Continue working offline with automatic sync when reconnected

---

## 📦 Installation

### Prerequisites

- Node.js (v16.0.0 or higher)
- npm (v7.0.0 or higher) or yarn
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/arcane-studio.git
   cd arcane-studio
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file to add any required API keys (such as Claude API key)

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Access the application at `http://localhost:5174`

### Production Build

To create a production build:

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory.

---

## 🚀 Usage Guide

### Creating Your First Document

1. Navigate to the dashboard
2. Click the "New Document" button in the top-right corner
3. Enter a title for your document
4. Start writing in the markdown editor

### Using Markdown

Arcane Studio supports standard markdown syntax:

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*
~~Strikethrough~~

- Bullet points
- Like this

1. Numbered lists
2. Like this

[Links](https://example.com)
![Images](image.jpg)

```code blocks```
```

The editor toolbar provides quick access to common formatting options.

### Using the AI Assistant

#### Text Completions

1. Place your cursor where you want a completion
2. Click the AI Completion button in the toolbar (keyboard icon)
3. Review the suggestion in the popup
4. Press Tab or click "Apply" to accept the suggestion

#### Document Assistant

1. Click the AI Assistant button in the toolbar to open the AI panel
2. Type your question or instruction in the chat input
3. The AI will respond based on the context of your document
4. Use the suggestion buttons for common requests like "Summarize" or "Improve"

#### Writing Suggestions

1. Enable the Suggestions feature from the AI toolbar button
2. As you write, the system will analyze your text and provide suggestions
3. Click on suggestions to apply them to your document

### Organizing Documents

1. Create folders from the dashboard by clicking "New Folder"
2. Assign documents to folders through the document dropdown menu
3. Navigate between folders from the Files page
4. Search for documents using the search bar

### Real-time Collaboration

1. Share your document by clicking the "Share" button
2. Copy the link and send it to your collaborators
3. See their cursors and selections in real-time as they edit
4. Changes are automatically synchronized between all participants

---

## ⚙️ Configuration

### User Settings

Access the Settings page to configure:

- **Theme**: Choose between light, dark, or system theme
- **Font Settings**: Adjust font size and family
- **Editor Preferences**: Configure auto-save, spell check, and focus mode
- **User Profile**: Set your display name and email

### AI Settings

Configure AI behavior in the AI Settings panel:

- **API Key**: Provide your Claude API key
- **Model Selection**: Choose between different Claude models
- **Temperature**: Adjust the creativity level (0.0 - 1.0)
- **Features**: Enable/disable specific AI features:
  - Grammar checking
  - Style suggestions
  - Text completions
  - Writing assistance

### Document Indexing

Configure how documents are indexed for AI context:

- **Enable indexing**: Toggle document indexing
- **Indexing frequency**: Set when documents should be indexed:
  - Manual only
  - When documents are saved
  - Hourly
  - Daily
- **Manual indexing**: Force re-index your documents

---

## 🧠 AI Capabilities in Detail

### How Text Completion Works

The text completion feature analyzes the context before your cursor position to generate relevant continuations. It uses Claude's language capabilities to understand the tone, style, and subject matter of your writing.

Text completion works in two ways:
- Manually triggered by clicking the completion button
- Automatically triggered by typing "+++" (configurable)

### Writing Suggestions

The writing suggestions feature analyzes your text for:

1. **Grammar Issues**: Identifies grammatical errors and offers corrections
2. **Style Improvements**: Suggests better word choices and sentence structures
3. **Clarity Enhancements**: Identifies unclear or complex sentences
4. **Readability Scoring**: Provides readability metrics for your document

### Document Assistant

The document assistant provides contextual help based on your entire document and conversation history. It can:

- **Summarize content**: Create concise summaries of your document
- **Answer questions**: Respond to questions about your document
- **Generate content**: Create new sections based on your instructions
- **Rewrite passages**: Improve specific sections of your document
- **Research assistance**: Provide information related to your document topic

### Document Indexing

The application creates semantic vector embeddings of your documents to:

- Provide more relevant AI responses
- Enable cross-document references
- Support semantic search across your workspace
- Generate more contextually appropriate suggestions

---

## 📂 Document Management

### Document Storage

Documents are stored using a combination of:

- **Automerge Documents**: For collaborative editing and version history
- **IndexedDB**: For client-side persistence
- **Local Storage**: For user preferences and recent document tracking

### Data Security

- All documents are stored locally in your browser
- API keys (like Claude API) are stored securely and never sent to our servers
- Document contents are only shared with AI services when features are actively used
- No document data is collected or stored on external servers

### Offline Support

- Continue editing documents when offline
- Changes are automatically synchronized when you reconnect
- Document history is preserved even during offline editing

---

## 🛠️ Advanced Usage

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Bold | Ctrl/Cmd + B |
| Italic | Ctrl/Cmd + I |
| Save | Ctrl/Cmd + S |
| Open AI Assistant | Ctrl/Cmd + Shift + A |
| Apply AI Suggestion | Tab |
| New Document | Ctrl/Cmd + N |
| Toggle Preview | Ctrl/Cmd + P |

### Custom Workflow Integration

Arcane Studio can be integrated with other tools via:

- **Markdown export**: Export documents for use in other markdown-supporting tools
- **Sharing links**: Collaborate seamlessly with team members
- **Document-as-API**: Use document content programmatically via JavaScript API

### Performance Optimization

For large documents or slow connections:

- Disable real-time AI suggestions to improve performance
- Use manual indexing instead of automatic
- Split very large documents into multiple smaller ones
- Use the checkpoint feature to create save points

---

## 🤝 Contributing

We welcome contributions to Arcane Studio! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) file for details on how to contribute.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests for your changes
5. Run the test suite
6. Submit a pull request

### Code Style

We use ESLint and Prettier to maintain code quality. Please ensure your code follows our style guidelines by running:

```bash
npm run lint
# and
npm run format
```

### Building and Testing

Run the test suite with:

```bash
npm test
```

---

## 📄 License

Arcane Studio is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Automerge](https://automerge.org/) for the CRDT library
- [Anthropic](https://www.anthropic.com/) for Claude AI capabilities
- [React](https://reactjs.org/) and the React community
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [shadcn/ui](https://ui.shadcn.com/) for the accessible component system
- All open source contributors and libraries used in this project

---

## 📞 Support and Contact

For support requests, please open an issue on our [GitHub repository](https://github.com/yourusername/arcane-studio/issues).

For other inquiries, please contact us at support@arcanestudio.com.
