import { useState, useEffect, useRef } from 'react'
import { useDocument, useLocalAwareness, useRemoteAwareness, useHandle } from '@automerge/automerge-repo-react-hooks'
import { AutomergeUrl } from '@automerge/automerge-repo'
import repo, { NoteDoc } from './repo'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Textarea } from './components/ui/textarea'

function App() {
  // State to store the document URL for sharing
  const [docUrl, setDocUrl] = useState<string | null>(null)
  // State to hold a URL input for joining existing documents
  const [urlInput, setUrlInput] = useState('')
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Check for user preference in localStorage or system preference
    const savedTheme = localStorage.getItem('theme')
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Set the theme class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  // Toggle theme function
  const toggleTheme = () => {
    setDarkMode(!darkMode)
  }

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

  // Copy URL to clipboard with visual feedback
  const [copied, setCopied] = useState(false)
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Automerge Notes</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <SunIcon className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <MoonIcon className="h-[1.2rem] w-[1.2rem]" />
            )}
          </Button>
        </header>
        
        {docUrl ? (
          <CollaborativeNote docUrl={docUrl} />
        ) : (
          <Card className="w-full">
            <CardContent className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Loading document...</p>
            </CardContent>
          </Card>
        )}

        <div className="mt-8">
          <Card className="w-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Document Controls</CardTitle>
              <CardDescription>Share, join or create a new document</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Current Document URL</h3>
                {docUrl && (
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                    <code className="text-xs flex-1 break-all font-mono opacity-80">{docUrl}</code>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => copyToClipboard(docUrl)}
                      className="transition-all"
                    >
                      {copied ? (
                        <span className="flex items-center gap-1">
                          <CheckIcon className="h-3.5 w-3.5" />
                          Copied
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <CopyIcon className="h-3.5 w-3.5" />
                          Copy URL
                        </span>
                      )}
                    </Button>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Join Existing Document</h3>
                <form onSubmit={handleJoinDoc} className="flex gap-2">
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Paste document URL"
                    className="flex-1"
                  />
                  <Button type="submit" variant="default">Join</Button>
                </form>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button onClick={handleNewDoc} variant="outline" className="w-full">
                Create New Document
              </Button>
            </CardFooter>
          </Card>
        </div>
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
  
  // Track cursor position and selection using the handle
  const [, setLocalCursorInfo] = useLocalAwareness({
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
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">Loading document...</p>
        </CardContent>
      </Card>
    )
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
      // Adjusted character width (from 8px to more accurate measurement)
      // Adding an offset to correct the position (the cursor appears to be off by about 3 characters)
      const charWidth = 8
      const cursorLeft = (charPosition * charWidth) + paddingLeft + (3 * charWidth) // Adjusted for better accuracy
      
      return (
        <div 
          key={peerId}
          className="absolute pointer-events-none z-10"
          style={{
            top: `${cursorTop}px`,
            left: `${cursorLeft}px`,
            width: '2px',
            height: `${lineHeight}px`,
            backgroundColor: getUserColor(peerId),
          }}
        >
          <div 
            className="absolute top-[-20px] left-0 text-white text-xs whitespace-nowrap px-1.5 py-0.5 rounded shadow-sm" 
            style={{ backgroundColor: getUserColor(peerId) }}
          >
            {peerId}
          </div>
        </div>
      )
    })
  }

  // Get active collaborator count
  const remoteCollaborators = Object.keys(remoteStates).filter(id => id !== userId && heartbeats[id])
  const activeCount = remoteCollaborators.length + 1 // +1 for current user

  return (
    <Card className="w-full border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            Collaborative Editor
            <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
              {activeCount} {activeCount === 1 ? 'user' : 'users'} active
            </span>
          </CardTitle>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          Your changes are automatically saved and synced in real-time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={document.text || ''}
            onChange={handleTextChange}
            onSelect={updateCursorPosition}
            onClick={updateCursorPosition}
            onKeyUp={updateCursorPosition}
            placeholder="Type your collaborative note here..."
            className="min-h-[300px] font-mono text-sm resize-none focus-visible:ring-1 focus-visible:ring-primary bg-muted/50 text-foreground"
          />
          {renderCursors()}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start pt-2 border-t">
        <h3 className="text-sm font-medium mb-2 text-muted-foreground">Collaborators</h3>
        <div className="w-full space-y-1.5">
          <div className="flex items-center">
            <div 
              className="h-2.5 w-2.5 rounded-full mr-2 ring-1 ring-background" 
              style={{ backgroundColor: getUserColor(userId) }}
            ></div>
            <span className="text-sm">You ({userId})</span>
          </div>
          {Object.entries(remoteStates)
            .filter(([peerId]) => peerId !== userId)
            .map(([peerId]) => (
              <div key={peerId} className="flex items-center">
                <div 
                  className="h-2.5 w-2.5 rounded-full mr-2 ring-1 ring-background" 
                  style={{ backgroundColor: getUserColor(peerId) }}
                ></div>
                <span className="text-sm">
                  {peerId} <span className="text-xs font-medium ml-1 px-1.5 py-0.5 rounded-full bg-muted">
                    {heartbeats[peerId] ? 
                      <span className="text-green-500">online</span> : 
                      <span className="text-muted-foreground">offline</span>}
                  </span>
                </span>
              </div>
            ))}
        </div>
      </CardFooter>
    </Card>
  )
}

// Icon components
function SunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
}

function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

function CopyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default App
