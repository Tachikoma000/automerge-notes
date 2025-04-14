import { Repo } from '@automerge/automerge-repo'
import { IndexedDBStorageAdapter } from '@automerge/automerge-repo-storage-indexeddb'
import { BrowserWebSocketClientAdapter } from '@automerge/automerge-repo-network-websocket'

// Define document types
export interface NoteDoc {
  text: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  folderId?: string;
  comments: Comment[];
}

export interface FolderDoc {
  name: string;
  parentId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserMetaDoc {
  name: string;
  color: string;
  preferences: UserPreferences;
  lastActive: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
  position: number; // Position in the document
  resolved: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  fontFamily: string;
  editorMode: 'normal' | 'focus';
  autoSave: boolean;
  spellCheck: boolean;
}

// Create a repository for Automerge documents
const repo = new Repo({
  storage: new IndexedDBStorageAdapter('automerge-notes'),
  network: [
    new BrowserWebSocketClientAdapter('wss://sync.automerge.org')
  ],
})

// Function to create a user color from user ID
export function getUserColor(userId: string): string {
  const colors = [
    '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33F0',
    '#33FFF0', '#F0FF33', '#FF9933', '#33FF99', '#9933FF'
  ];
  
  // Generate a hash from the userId
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Use the hash to pick a color
  return colors[hash % colors.length];
}

export default repo;
