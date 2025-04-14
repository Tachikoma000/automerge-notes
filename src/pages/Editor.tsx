import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocument, useHandle, useLocalAwareness, useRemoteAwareness } from '@automerge/automerge-repo-react-hooks';
import { AutomergeUrl } from '@automerge/automerge-repo';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { NoteDoc } from '../repo';
import repo, { getUserColor } from '../repo';
import MarkdownEditor from '../components/editor/MarkdownEditor';

export default function Editor() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const [docUrl, setDocUrl] = useState<string | null>(null);
  
  // Generate a random user ID for this session if not already set
  const [userId] = useState(() => 
    localStorage.getItem('userId') || `user-${Math.floor(Math.random() * 10000)}`
  );
  
  useEffect(() => {
    // Store userId in localStorage
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', userId);
    }
    
    // Handle new document creation or load existing document
    if (docId === 'new') {
      const handle = repo.create<NoteDoc>();
      
      // Initialize with empty document
      handle.change(doc => {
        doc.text = '';
        doc.title = 'Untitled Document';
        doc.createdAt = Date.now();
        doc.updatedAt = Date.now();
        doc.comments = [];
      });
      
      // Store and navigate to the new document
      const newUrl = handle.url;
      localStorage.setItem('last-document', newUrl);
      navigate(`/editor/${encodeURIComponent(newUrl)}`, { replace: true });
    } else if (docId) {
      try {
        // Try to decode the URL if it's a URL
        const decodedUrl = decodeURIComponent(docId);
        setDocUrl(decodedUrl);
        localStorage.setItem('last-document', decodedUrl);
      } catch (e) {
        console.error("Invalid document URL", e);
        navigate('/');
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
  }, [docId, navigate, userId]);

  // Return early if no document URL available
  if (!docUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading editor...</p>
      </div>
    );
  }

  return <CollaborativeEditor docUrl={docUrl} userId={userId} />;
}

// The actual editor component
function CollaborativeEditor({ docUrl, userId }: { docUrl: string; userId: string }) {
  const [document, changeDoc] = useDocument<NoteDoc>(docUrl as AutomergeUrl);
  const handle = useHandle<NoteDoc>(docUrl as AutomergeUrl);
  
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

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <input
          type="text"
          value={document.title || 'Untitled Document'}
          onChange={handleTitleChange}
          className="text-3xl font-bold tracking-tight bg-transparent border-none outline-none focus:ring-0 px-0 w-full max-w-md"
          placeholder="Untitled Document"
        />
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
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
          <Button variant="outline" size="sm" onClick={exportMarkdown}>
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={shareDocument}>
            Share
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
    </div>
  );
}
