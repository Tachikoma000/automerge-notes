import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import DocumentCard from '../components/shared/DocumentCard';
import FolderCard from '../components/shared/FolderCard';
import { getUserColor } from '../repo';
import { 
  getUserId, 
  getAllDocuments, 
  getAllFolders,
  getDocumentsInFolder,
  createFolder,
  deleteDocument,
  deleteFolder
} from '../lib/documentService';

export default function Files() {
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentFolder = searchParams.get('folder');
  
  // State for data
  const [documents, setDocuments] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  
  // Get user ID
  const userId = getUserId();
  
  // Load data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      
      try {
        // Load all folders for sidebar
        const allFolders = await getAllFolders();
        setFolders(allFolders);
        
        // Load documents based on folder filter
        const docs = await getDocumentsInFolder(currentFolder || undefined);
        setDocuments(docs);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [currentFolder]);
  
  // Handle search
  useEffect(() => {
    async function searchDocuments() {
      if (!searchQuery) return;
      
      setIsLoading(true);
      
      try {
        // Get all documents
        const allDocs = await getAllDocuments();
        
        // Filter based on search query
        const filtered = allDocs.filter(item => {
          if (!item.doc) return false;
          const doc = item.doc;
          return (
            doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (doc.text && doc.text.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        });
        
        setDocuments(filtered);
      } catch (error) {
        console.error('Error searching documents:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (searchQuery) {
      searchDocuments();
    } else if (!currentFolder) {
      // If search is cleared and no folder is selected, load all documents
      getAllDocuments().then(docs => setDocuments(docs));
    }
  }, [searchQuery]);
  
  // Handle new folder creation
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    setIsLoading(true);
    try {
      const parentId = currentFolder || undefined;
      await createFolder(newFolderName, parentId);
      
      // Refresh folders
      const updatedFolders = await getAllFolders();
      setFolders(updatedFolders);
      
      setNewFolderName('');
      setCreatingFolder(false);
    } catch (error) {
      console.error('Error creating folder:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle document deletion
  const handleDeleteDocument = async (docId: string) => {
    try {
      setIsLoading(true);
      await deleteDocument(docId);
      
      // Refresh documents
      if (currentFolder) {
        const docs = await getDocumentsInFolder(currentFolder);
        setDocuments(docs);
      } else if (searchQuery) {
        // Re-run the search
        const allDocs = await getAllDocuments();
        const filtered = allDocs.filter(item => {
          if (!item.doc) return false;
          const doc = item.doc;
          return (
            doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (doc.text && doc.text.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        });
        setDocuments(filtered);
      } else {
        const docs = await getAllDocuments();
        setDocuments(docs);
      }
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
      const updatedFolders = await getAllFolders();
      setFolders(updatedFolders);
      
      // If we deleted the current folder, navigate back to all files
      if (currentFolder === folderId) {
        navigate('/files');
      }
      
      // Refresh documents in case some were moved to root
      if (!currentFolder) {
        const docs = await getAllDocuments();
        setDocuments(docs);
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      alert("Failed to delete folder. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter documents for display
  const filteredDocuments = documents;
  
  // Get folder document counts
  const folderDocumentCounts = new Map<string, number>();
  
  // Navigate to a folder
  const navigateToFolder = (folderId: string) => {
    navigate(`/files${folderId ? `?folder=${encodeURIComponent(folderId)}` : ''}`);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Files</h1>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <Card className="w-full">
            <CardContent className="p-8 flex items-center justify-center">
              <p className="text-muted-foreground">Loading files...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  // Find current folder name
  const currentFolderName = currentFolder 
    ? folders.find(f => f.id === currentFolder)?.doc?.name || 'Folder'
    : null;

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Files</h1>
        
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Button 
            variant={viewType === 'grid' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setViewType('grid')}
          >
            Grid
          </Button>
          <Button 
            variant={viewType === 'list' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setViewType('list')}
          >
            List
          </Button>
          
          <Button asChild>
            <Link to="/editor/new">New Document</Link>
          </Button>
        </div>
      </div>

      {/* Folder creation form */}
      {creatingFolder && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">
              Create a New {currentFolder ? 'Subfolder' : 'Folder'}
            </h3>
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

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar with folders */}
        <div className="w-full lg:w-64 space-y-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Folders</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="space-y-1">
                <button 
                  className={`w-full flex items-center px-2 py-1.5 text-sm rounded-md ${!currentFolder ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
                  onClick={() => navigateToFolder('')}
                >
                  All Files
                </button>
                <button 
                  className="w-full flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-muted"
                  onClick={() => {/* Implement recent files view */}}
                >
                  Recent
                </button>
                
                {folders.length > 0 && (
                  <div className="pt-2 mt-2 border-t">
                    <p className="px-2 pb-1.5 text-sm font-medium">My Folders</p>
                    {folders
                      .filter(folder => !folder.doc.parentId) // Only top-level folders
                      .map(folder => (
                        <button 
                          key={folder.id}
                          className={`w-full flex items-center px-2 py-1.5 text-sm rounded-md ${currentFolder === folder.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
                          onClick={() => navigateToFolder(folder.id)}
                        >
                          {folder.doc.name}
                        </button>
                      ))
                    }
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setCreatingFolder(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            New Folder
          </Button>
        </div>
        
        {/* Main content area */}
        <div className="flex-1">
          {/* Only show folders section if not filtering */}
          {!currentFolder && !searchQuery && folders.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Folders</h2>
              <div className={viewType === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                : "space-y-2"
              }>
                {folders
                  .filter(folder => !folder.doc.parentId) // Only top-level folders
                  .map(folder => (
                    <FolderCard 
                      key={folder.id}
                      id={folder.id}
                      name={folder.doc.name}
                      documentCount={folderDocumentCounts.get(folder.id) || 0}
                      updatedAt={folder.doc.updatedAt}
                      linkTo={`/files?folder=${encodeURIComponent(folder.id)}`}
                      onDelete={handleDeleteFolder}
                    />
                  ))
                }
              </div>
            </div>
          )}
          
          {/* Current folder's subfolders */}
          {currentFolder && !searchQuery && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Subfolders in {currentFolderName || 'Folder'}
                </h2>
              </div>
              
              {folders.filter(folder => folder.doc.parentId === currentFolder).length > 0 ? (
                <div className={viewType === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                  : "space-y-2"
                }>
                  {folders
                    .filter(folder => folder.doc.parentId === currentFolder)
                    .map(folder => (
                      <FolderCard 
                        key={folder.id}
                        id={folder.id}
                        name={folder.doc.name}
                        documentCount={folderDocumentCounts.get(folder.id) || 0}
                        updatedAt={folder.doc.updatedAt}
                        linkTo={`/files?folder=${encodeURIComponent(folder.id)}`}
                        onDelete={handleDeleteFolder}
                      />
                    ))
                  }
                </div>
              ) : (
                <Card className="mb-6">
                  <CardContent className="p-4 text-center">
                    <p className="text-muted-foreground mb-2">No subfolders found</p>
                    <Button size="sm" onClick={() => setCreatingFolder(true)}>Create Subfolder</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          {/* Files */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {currentFolder 
                ? `Files in ${currentFolderName || 'Folder'}`
                : searchQuery 
                  ? `Search Results: "${searchQuery}"`
                  : "All Files"
              }
            </h2>
            
            {filteredDocuments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-40 gap-4">
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? "No documents match your search" 
                      : "No documents found in this location"
                    }
                  </p>
                  {!searchQuery && (
                    <Button asChild size="sm">
                      <Link to="/editor/new">Create a Document</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className={viewType === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                : "space-y-2"
              }>
                {filteredDocuments
                  .filter(item => item.doc !== null && item.doc !== undefined)
                  .map(item => {
                    const doc = item.doc!;
                    // Get a preview from the doc text (first ~100 characters)
                    const preview = doc.text ? doc.text.slice(0, 100) + (doc.text.length > 100 ? '...' : '') : '';
                    
                    return (
                      <DocumentCard 
                        key={item.id}
                        id={item.id}
                        title={doc.title || 'Untitled Document'}
                        preview={preview}
                        updatedAt={doc.updatedAt || Date.now()}
                        collaborators={[{ id: userId, color: getUserColor(userId) }]}
                        linkTo={`/editor/${encodeURIComponent(item.id)}`}
                        onDelete={handleDeleteDocument}
                      />
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
