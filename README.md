# Automerge Collaborative Notes

A real-time collaborative note-taking application built with React, TypeScript, and Automerge. This modern, minimalist application allows multiple users to collaborate on documents simultaneously with cursor presence awareness.

## Features

- **Real-time Collaboration**: Multiple users can edit the same document simultaneously
- **Cursor Presence**: See where other users are editing with real-time cursor positions
- **Dark Mode**: Toggle between light and dark themes
- **Document Sharing**: Easy document URL sharing and joining
- **Modern UI**: Clean, minimalist interface based on shadcn UI principles

## Technologies Used

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Automerge for CRDT-based real-time collaboration
- shadcn UI design principles

## Getting Started

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## How to Use

1. When you first open the app, a new collaborative document is created
2. Share the document URL with collaborators
3. Alternatively, you can join an existing document by pasting its URL
4. All changes are automatically saved and synced in real-time
5. Toggle between dark and light mode with the button in the header

## Deployment

This project is optimized for deployment on Vercel.

## License

MIT
