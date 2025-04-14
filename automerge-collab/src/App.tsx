import { useState, useEffect, useRef } from 'react'
import './App.css'
import { useDocument, useLocalAwareness, useRemoteAwareness, useHandle } from '@automerge/automerge-repo-react-hooks'
import { AutomergeUrl } from '@automerge/automerge-repo'
import repo, { NoteDoc } from './repo'

function App() {
  // State to store the document URL for sharing
  const [docUrl, setDocUrl] = useState<string | null>(null)
  // State to hold a URL input for joining existing documents
  const [urlInput, setUrlInput] = useState('')

  // Either create a new document or use the URL from localStorage
  useEffect(() => {
    const savedUrl = localStorage.getItem('automerge-doc-url')
    if (savedUrl) {
      setDocUrl(savedUrl)
    } else {
      // Create a new document and store its URL
      const handle = repo.create<NoteDoc>()
      handle.change(doc => {
        doc.text = ''
      })
      const newUrl = handle.url
      localStorage.setItem('automerge-doc-url', newUrl)
      setDocUrl(newUrl)
    }
  }, [])

  // Join an existing document when URL is submitted
  const handleJoinDoc = (e: React.FormEvent) => {
    e.preventDefault()
    if (urlInput) {
      localStorage.setItem('automerge-doc-url', urlInput)
      setDocUrl(urlInput)
      setUrlInput('')
    }
  }

  // Create a new document
  const handleNewDoc = () => {
    const handle = repo.create<NoteDoc>()
    handle.change(doc => {
      doc.text = ''
    })
    const newUrl = handle.url
    localStorage.setItem('automerge-doc-url', newUrl)
    setDocUrl(newUrl)
  }

  return (
    <div className="container">
      <h1>Automerge Collaborative Notes</h1>
      
      {docUrl ? (
        <CollaborativeNote docUrl={docUrl} />
      ) : (
        <p>Loading document...</p>
      )}

      <div className="controls">
        <div className="current-doc">
          <h3>Current Document URL:</h3>
          {docUrl && (
            <div className="doc-url">
              <code>{docUrl}</code>
              <button onClick={() => navigator.clipboard.writeText(docUrl)}>
                Copy URL
              </button>
            </div>
          )}
        </div>

        <div className="join-doc">
          <h3>Join Existing Document</h3>
          <form onSubmit={handleJoinDoc}>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste document URL"
            />
            <button type="submit">Join</button>
          </form>
        </div>

        <button className="new-doc" onClick={handleNewDoc}>
          Create New Document
        </button>
      </div>
    </div>
  )
}

// The collaborative note component that uses Automerge
function CollaborativeNote({ docUrl }: { docUrl: string }) {
  // Get document handle for awareness
  const handle = useHandle<NoteDoc>(docUrl as AutomergeUrl)
  // Get document data and change function
  const [document, changeDoc] = useDocument<NoteDoc>(docUrl as AutomergeUrl)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Generate a random user ID for this session
  const [userId] = useState(() => `user-${Math.floor(Math.random() * 10000)}`)
  
  // Track cursor position and selection using the handle (not the document)
  const [localCursorInfo, setLocalCursorInfo] = useLocalAwareness({
    handle: handle!, // Use the handle with non-null assertion since we check it below
    userId,
    initialState: { cursor: null, selection: null },
    heartbeatTime: 1000
  })
  
  // Get cursor information from other users using the handle
  const [remoteStates, heartbeats] = useRemoteAwareness({
    handle: handle!, // Use the handle with non-null assertion since we check it below
    localUserId: userId,
    offlineTimeout: 5000
  })
  
  // Update cursor position when text changes or selection changes
  const updateCursorPosition = () => {
    if (textareaRef.current && handle) {
      const { selectionStart, selectionEnd } = textareaRef.current
      setLocalCursorInfo({
        cursor: selectionStart,
        selection: selectionStart !== selectionEnd ? [selectionStart, selectionEnd] : null,
      })
    }
  }

  // Don't render anything if either the document or the handle isn't available
  if (!document || !handle) {
    return <div>Loading document...</div>
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    changeDoc((doc) => {
      doc.text = e.target.value
    })
    // Update cursor position when text changes
    updateCursorPosition()
  }
  
  // CSS colors for different users
  const userColors = [
    '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33F0',
    '#33FFF0', '#F0FF33', '#FF9933', '#33FF99', '#9933FF'
  ]
  
  // Get color for a specific user based on their ID
  const getUserColor = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return userColors[hash % userColors.length]
  }
  
  // Render cursor indicators
  const renderCursors = () => {
    if (!textareaRef.current || !document?.text) return null
    
    // Get textarea dimensions and text info
    const textarea = textareaRef.current
    const text = document.text || ''
    
    // Calculate line heights and positions
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20
    const paddingTop = parseInt(getComputedStyle(textarea).paddingTop) || 0
    const paddingLeft = parseInt(getComputedStyle(textarea).paddingLeft) || 0
    
    return Object.entries(remoteStates).map(([peerId, state]) => {
      if (peerId === userId || !state.cursor) return null
      
      // Find the line number and character position
      const textBeforeCursor = text.substring(0, state.cursor)
      const lines = textBeforeCursor.split('\n')
      const lineNumber = lines.length - 1
      const charPosition = lines[lineNumber].length
      
      // Calculate cursor position
      const cursorTop = lineNumber * lineHeight + paddingTop
      const cursorLeft = charPosition * 8 + paddingLeft // Approximate character width
      
      return (
        <div 
          key={peerId}
          className="remote-cursor"
          style={{
            position: 'absolute',
            top: `${cursorTop}px`,
            left: `${cursorLeft}px`,
            width: '2px',
            height: `${lineHeight}px`,
            backgroundColor: getUserColor(peerId),
          }}
        >
          <div className="cursor-label" style={{ backgroundColor: getUserColor(peerId) }}>
            {peerId}
          </div>
        </div>
      )
    })
  }

  return (
    <div className="note-editor">
      <div className="editor-container" style={{ position: 'relative' }}>
        <textarea
          ref={textareaRef}
          value={document.text || ''}
          onChange={handleTextChange}
          onSelect={updateCursorPosition}
          onClick={updateCursorPosition}
          onKeyUp={updateCursorPosition}
          placeholder="Type your collaborative note here..."
        />
        {renderCursors()}
      </div>
      <div className="collaborators">
        <h4>Collaborators:</h4>
        <ul>
          <li style={{ color: getUserColor(userId) }}>You ({userId})</li>
          {Object.entries(remoteStates)
            .filter(([peerId]) => peerId !== userId)
            .map(([peerId]) => (
              <li key={peerId} style={{ color: getUserColor(peerId) }}>
                {peerId} {heartbeats[peerId] ? '(online)' : '(offline)'}
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}

export default App
