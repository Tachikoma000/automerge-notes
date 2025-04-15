import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import DocumentCard from '../components/shared/DocumentCard';
import FolderCard from '../components/shared/FolderCard';
import { getUserColor } from '../repo';
import { 
  getUserId, 
  isFirstTimeUser, 
  setUpDemoContent, 
  getRecentDocuments, 
  getTopLevelFolders,
  createFolder,
  createDocument,
  deleteDocument,
  deleteFolder
} from '../lib/documentService';

export default function Dashboard() {
  // State for documents and folders
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newDocumentName, setNewDocumentName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [creatingDocument, setCreatingDocument] = useState(false);

  // Get user ID
  const userId = getUserId();

  // Load data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      
      // Check if this is the first time the user is using the app
      const firstTimeUser = await isFirstTimeUser();
      setIsFirstTime(firstTimeUser);
      
      if (firstTimeUser) {
        // We'll show an empty state UI
        setIsLoading(false);
        return;
      }
      
      // Fetch recent documents
      const docs = await getRecentDocuments(4);
      setRecentDocuments(docs);
      
      // Fetch top-level folders
      const folders = await getTopLevelFolders();
      setFolders(folders);
      
      setIsLoading(false);
    }
    
    loadData();
  }, []);
  
  // Handle setting up demo content for first-time users
  const handleSetupDemoContent = async () => {
    setIsLoading(true);
    await setUpDemoContent();
    
    // Reload data after setting up demo content
    const docs = await getRecentDocuments(4);
    setRecentDocuments(docs);
    
    const folders = await getTopLevelFolders();
    setFolders(folders);
    
    setIsFirstTime(false);
    setIsLoading(false);
  };
  
  // Handle new folder creation
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    setIsLoading(true);
    await createFolder(newFolderName);
    
    // Refresh folders
    const updatedFolders = await getTopLevelFolders();
    setFolders(updatedFolders);
    
    setNewFolderName('');
    setCreatingFolder(false);
    setIsLoading(false);
  };
  
  // Handle new document creation
  const handleCreateDocument = async () => {
    if (!newDocumentName.trim()) return;
    
    setIsLoading(true);
    const docUrl = await createDocument(newDocumentName);
    
    // Refresh documents
    const updatedDocs = await getRecentDocuments(4);
    setRecentDocuments(updatedDocs);
    
    setNewDocumentName('');
    setCreatingDocument(false);
    setIsLoading(false);
    
    // Navigate to the editor for the new document
    window.location.href = `/editor/${encodeURIComponent(docUrl)}`;
  };
  
  // Handle document deletion
  const handleDeleteDocument = async (docId: string) => {
    try {
      setIsLoading(true);
      await deleteDocument(docId);
      
      // Refresh documents
      const updatedDocs = await getRecentDocuments(4);
      setRecentDocuments(updatedDocs);
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle folder deletion
  const handleDeleteFolder = async (folderId: string) => {
    try {
      setIsLoading(true);
      await deleteFolder(folderId);
      
      // Refresh folders
      const updatedFolders = await getTopLevelFolders();
      setFolders(updatedFolders);
      
      // Refresh documents as some may have been moved from the folder
      const updatedDocs = await getRecentDocuments(4);
      setRecentDocuments(updatedDocs);
    } catch (error) {
      console.error("Error deleting folder:", error);
      alert("Failed to delete folder. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // First-time user empty state
  if (isFirstTime) {
    return (
      <div className="container max-w-7xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to MarkFlow</h1>
        </div>
        
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle className="text-2xl">Get Started with MarkFlow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-muted-foreground">
              It looks like this is your first time using MarkFlow. You can create your own documents and folders or set up some demo content to get started.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={() => setCreatingDocument(true)} className="w-full sm:w-auto">
                Create Your First Document
              </Button>
              <Button onClick={handleSetupDemoContent} variant="outline" className="w-full sm:w-auto">
                Set Up Demo Content
              </Button>
            </div>
            
            {creatingDocument && (
              <div className="mt-4 p-4 border rounded-md">
                <h3 className="text-lg font-medium mb-2">Create a New Document</h3>
                <div className="flex gap-2">
                  <Input
                    value={newDocumentName}
                    onChange={(e) => setNewDocumentName(e.target.value)}
                    placeholder="Document Title"
                    className="flex-1"
                  />
                  <Button onClick={handleCreateDocument}>Create</Button>
                  <Button variant="ghost" onClick={() => setCreatingDocument(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <div className="grid gap-6">
          <Card>
            <CardContent className="p-8 flex items-center justify-center">
              <p className="text-muted-foreground">Loading your documents...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCreatingFolder(true)}>
            New Folder
          </Button>
          <Button asChild>
            <Link to="/editor/new">New Document</Link>
          </Button>
        </div>
      </div>

      {/* New folder creation form */}
      {creatingFolder && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">Create a New Folder</h3>
            <div className="flex gap-2">
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder Name"
                className="flex-1"
              />
              <Button onClick={handleCreateFolder}>Create</Button>
              <Button variant="ghost" onClick={() => setCreatingFolder(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Documents</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/files">View all</Link>
            </Button>
          </div>
          
          {recentDocuments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">You don't have any documents yet.</p>
                <Button asChild>
                  <Link to="/editor/new">Create Your First Document</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {recentDocuments.map((item) => {
                const doc = item.doc;
                // Get a preview from the doc text (first ~100 characters)
                const preview = doc.text ? doc.text.slice(0, 100) + (doc.text.length > 100 ? '...' : '') : '';
                
                return (
                  <DocumentCard 
                    key={item.id}
                    id={item.id}
                    title={doc.title}
                    preview={preview}
                    updatedAt={doc.updatedAt}
                    collaborators={[{ id: userId, color: getUserColor(userId) }]}
                    linkTo={`/editor/${encodeURIComponent(item.id)}`}
                    onDelete={handleDeleteDocument}
                  />
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Folders</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/files">View all</Link>
            </Button>
          </div>
          
          {folders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">You don't have any folders yet.</p>
                <Button onClick={() => setCreatingFolder(true)}>Create Your First Folder</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {folders.map((item) => {
                const folder = item.doc;
                return (
                  <FolderCard 
                    key={item.id}
                    id={item.id}
                    name={folder.name}
                    documentCount={0} // We'll implement counting later
                    updatedAt={folder.updatedAt}
                    linkTo={`/files?folder=${encodeURIComponent(item.id)}`}
                    onDelete={handleDeleteFolder}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* Removing the activity section for now as we'll implement it later */}
      </div>
    </div>
  );
}
