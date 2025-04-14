import { Repo } from '@automerge/automerge-repo'
import { IndexedDBStorageAdapter } from '@automerge/automerge-repo-storage-indexeddb'
import { BrowserWebSocketClientAdapter } from '@automerge/automerge-repo-network-websocket'

// Define the document type
export interface NoteDoc {
  text?: string
}

// Create a repository for Automerge documents
const repo = new Repo({
  storage: new IndexedDBStorageAdapter('automerge-notes'),
  network: [
    new BrowserWebSocketClientAdapter('wss://sync.automerge.org')
  ],
})

export default repo
