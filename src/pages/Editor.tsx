import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDocument, useHandle, useLocalAwareness, useRemoteAwareness } from '@automerge/automerge-repo-react-hooks';
import { AutomergeUrl } from '@automerge/automerge-repo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { NoteDoc } from '../repo';
import repo, { getUserColor } from '../repo';
import MarkdownEditor from '../components/editor/MarkdownEditor';
import { 
  getUserId, 
  createDocument, 
  getDocument, 
  updateDocument, 
  deleteDocument,
  getAllFolders
} from '../lib/documentService';

export default function Editor() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get user ID
  const userId = getUserId();
  
  useEffect(() => {
    async function handleDocument() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Handle new document creation
        if (docId === 'new') {
          const newDocUrl = await createDocument('Untitled Document');
          navigate(`/editor/${encodeURIComponent(newDocUrl)}`, { replace: true });
          return;
        }
        
        // Handle existing document
        if (docId) {
          try {
            // Try to decode the URL if it's a URL
            const decodedUrl = decodeURIComponent(docId);
            
            // Check if document exists
            const handle = getDocument(decodedUrl);
            if (!handle) {
              throw new Error("Document not found");
            }
            
            setDocUrl(decodedUrl);
            localStorage.setItem('last-document', decodedUrl);
          } catch (e) {
            console.error("Invalid document URL", e);
            setError("The document you're looking for couldn't be found.");
            setTimeout(() => navigate('/'), 3000);
          }
        } else {
          // If no docId provided, try to load the last document
          const lastDoc = localStorage.getItem('last-document');
          if (lastDoc) {
            navigate(`/editor/${encodeURIComponent(lastDoc)}`);
          } else {
            navigate('/');
          }
        }
      } catch (error) {
        console.error("Error handling document:", error);
        setError("An error occurred while loading the document.");
      } finally {
        setIsLoading(false);
      }
    }
    
    handleDocument();
  }, [docId, navigate]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading editor...</p>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="container max-w-7xl mx-auto py-6 px-4">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link to="/">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Return early if no document URL available
  if (!docUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Document not found</p>
      </div>
    );
  }

  return <CollaborativeEditor docUrl={docUrl} userId={userId} />;
}

// The actual editor component
function CollaborativeEditor({ docUrl, userId }: { docUrl: string; userId: string }) {
  const navigate = useNavigate();
  const [document, changeDoc] = useDocument<NoteDoc>(docUrl as AutomergeUrl);
  const handle = useHandle<NoteDoc>(docUrl as AutomergeUrl);
  
  // State for folders and UI controls
  const [folders, setFolders] = useState<any[]>([]);
  const [showFolderSelect, setShowFolderSelect] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Load folders
  useEffect(() => {
    async function loadFolders() {
      const allFolders = await getAllFolders();
      setFolders(allFolders);
      
      // Set selected folder if document has a folderId
      if (document?.folderId) {
        setSelectedFolderId(document.folderId);
      }
    }
    
    if (document) {
      loadFolders();
    }
  }, [document]);
  
  // Track cursor position and selection
  const [, setLocalCursorInfo] = useLocalAwareness({
    handle: handle!, 
    userId,
    initialState: { cursor: null, selection: null },
    heartbeatTime: 1000
  });
  
  // Get cursor info from other users
  const [remoteStates, heartbeats] = useRemoteAwareness({
    handle: handle!,
    localUserId: userId,
    offlineTimeout: 5000
  });

  // Update document title (in title bar)
  useEffect(() => {
    if (document?.title) {
      window.document.title = `${document.title} - MarkFlow`;
    } else {
      window.document.title = "MarkFlow";
    }
  }, [document?.title]);

  // Don't render anything if the document isn't available
  if (!document || !handle) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">Loading document...</p>
        </CardContent>
      </Card>
    );
  }

  // Handle text changes
  const handleTextChange = (text: string) => {
    changeDoc((doc) => {
      doc.text = text;
      doc.updatedAt = Date.now();
    });
  };

  // Handle title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    changeDoc((doc) => {
      doc.title = e.target.value;
      doc.updatedAt = Date.now();
    });
  };

  // Handle folder assignment
  const handleFolderChange = (folderId: string | undefined) => {
    changeDoc((doc) => {
      if (folderId) {
        doc.folderId = folderId;
      } else {
        delete doc.folderId;
      }
      doc.updatedAt = Date.now();
    });
    
    setSelectedFolderId(folderId);
    setShowFolderSelect(false);
  };

  // Handle cursor position changes
  const handleCursorChange = (position: { 
    cursor: number; 
    selection: [number, number] | null 
  }) => {
    setLocalCursorInfo(position);
  };

  // Get active collaborator count
  const remoteCollaborators = Object.keys(remoteStates).filter(id => id !== userId && heartbeats[id]);
  const activeCount = remoteCollaborators.length + 1; // +1 for current user

  // Export document as markdown
  const exportMarkdown = () => {
    const element = window.document.createElement("a");
    const file = new Blob([document.text || ''], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `${document.title || 'document'}.md`;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
  };

  // Share document
  const shareDocument = () => {
    // Create a sharing URL that we can copy to clipboard
    const shareUrl = window.location.origin + `/editor/${encodeURIComponent(docUrl)}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Document link copied to clipboard!');
  };
  
  // Get folder name
  const getFolderName = () => {
    if (!selectedFolderId) return 'None';
    const folder = folders.find(f => f.id === selectedFolderId);
    return folder ? folder.doc.name : 'Unknown Folder';
  };
  
  // Handle document deletion
  const handleDeleteDocument = async () => {
    try {
      setIsDeleting(true);
      const success = await deleteDocument(docUrl);
      
      if (success) {
        // Remove the document from last-document storage if it's the current one
        const lastDoc = localStorage.getItem('last-document');
        if (lastDoc === docUrl) {
          localStorage.removeItem('last-document');
        }
        
        // Navigate back to dashboard
        navigate('/');
      } else {
        throw new Error("Failed to delete document");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("There was a problem deleting this document. Please try again.");
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1 w-full max-w-md">
          <input
            type="text"
            value={document.title || 'Untitled Document'}
            onChange={handleTitleChange}
            className="text-3xl font-bold tracking-tight bg-transparent border-none outline-none focus:ring-0 px-0 w-full"
            placeholder="Untitled Document"
          />
          <div className="flex items-center text-sm text-muted-foreground">
            <button 
              onClick={() => setShowFolderSelect(!showFolderSelect)} 
              className="flex items-center hover:underline"
            >
              Folder: {getFolderName()}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
            
            {showFolderSelect && (
              <div className="absolute mt-6 z-10 bg-card border rounded-md shadow-md p-2 max-h-48 overflow-y-auto">
                <div className="space-y-1 min-w-48">
                  <button 
                    className="w-full text-left px-2 py-1 hover:bg-muted rounded-sm"
                    onClick={() => handleFolderChange(undefined)}
                  >
                    None (Root)
                  </button>
                  {folders.map(folder => (
                    <button 
                      key={folder.id}
                      className="w-full text-left px-2 py-1 hover:bg-muted rounded-sm"
                      onClick={() => handleFolderChange(folder.id)}
                    >
                      {folder.doc.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline-block">
            {activeCount} {activeCount === 1 ? 'user' : 'users'} active
          </span>
          <div className="flex -space-x-2 ml-2">
            {Object.entries(remoteStates)
              .filter(([peerId]) => peerId !== userId && heartbeats[peerId])
              .map(([peerId]) => (
                <div 
                  key={peerId}
                  className="size-6 rounded-full border-2 border-background flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: getUserColor(peerId) }}
                  title={peerId}
                />
              ))}
            <div 
              className="size-6 rounded-full border-2 border-background flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: getUserColor(userId) }}
              title="You"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/files')}>
            Files
          </Button>
          <Button variant="outline" size="sm" onClick={exportMarkdown}>
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={shareDocument}>
            Share
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-destructive hover:bg-destructive/10" 
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <MarkdownEditor 
          initialValue={document.text || ''} 
          onChange={handleTextChange}
          onCursorChange={handleCursorChange}
          placeholder="Start writing..."
          collaborators={remoteStates}
          userId={userId}
          getUserColor={getUserColor}
        />
      </div>
      
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-xl">Delete Document</CardTitle>
              <CardDescription>
                Are you sure you want to delete "{document.title || 'Untitled Document'}"? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteDocument}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
