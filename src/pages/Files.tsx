import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import DocumentCard from '../components/shared/DocumentCard';
import FolderCard from '../components/shared/FolderCard';
import { getUserColor } from '../repo';

// Reuse the same mock data from Dashboard
const MOCK_DOCUMENTS = [
  {
    id: 'doc1',
    title: 'Project Roadmap',
    preview: 'Our Q2 product roadmap with key milestones and deliverables...',
    updatedAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    collaborators: [
      { id: 'user-1234', color: getUserColor('user-1234') },
      { id: 'user-5678', color: getUserColor('user-5678') }
    ]
  },
  {
    id: 'doc2',
    title: 'Meeting Notes',
    preview: 'Notes from our weekly team sync covering project updates...',
    updatedAt: Date.now() - 24 * 60 * 60 * 1000, // Yesterday
    collaborators: [
      { id: 'user-1234', color: getUserColor('user-1234') }
    ]
  },
  {
    id: 'doc3',
    title: 'Research Summary',
    preview: 'Summary of user research findings from recent interviews...',
    updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    collaborators: [
      { id: 'user-1234', color: getUserColor('user-1234') },
      { id: 'user-9012', color: getUserColor('user-9012') },
      { id: 'user-3456', color: getUserColor('user-3456') }
    ]
  },
  {
    id: 'doc4',
    title: 'Product Requirements',
    preview: 'Detailed requirements for the upcoming feature release...',
    updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
    collaborators: [
      { id: 'user-1234', color: getUserColor('user-1234') }
    ]
  },
  {
    id: 'doc5',
    title: 'Marketing Strategy',
    preview: 'Comprehensive marketing strategy for Q3 product launch...',
    updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    collaborators: [
      { id: 'user-5678', color: getUserColor('user-5678') },
      { id: 'user-9012', color: getUserColor('user-9012') }
    ]
  },
  {
    id: 'doc6',
    title: 'Design Specs',
    preview: 'UI/UX design specifications for the new feature set...',
    updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
    collaborators: [
      { id: 'user-3456', color: getUserColor('user-3456') }
    ]
  }
];

const MOCK_FOLDERS = [
  {
    id: 'folder1',
    name: 'Work Documents',
    documentCount: 5,
    updatedAt: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4 days ago
  },
  {
    id: 'folder2',
    name: 'Personal Projects',
    documentCount: 3,
    updatedAt: Date.now() - 6 * 24 * 60 * 60 * 1000, // 6 days ago
  },
  {
    id: 'folder3',
    name: 'Archived',
    documentCount: 12,
    updatedAt: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
  },
  {
    id: 'folder4',
    name: 'Templates',
    documentCount: 8,
    updatedAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
  }
];

export default function Files() {
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const currentFolder = searchParams.get('folder');
  
  // Filter documents based on search query
  const filteredDocuments = MOCK_DOCUMENTS.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  onClick={() => window.location.href = "/files"}
                >
                  All Files
                </button>
                <button className="w-full flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-muted">
                  Recent
                </button>
                <button className="w-full flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-muted">
                  Shared with me
                </button>
                <button className="w-full flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-muted">
                  Favorites
                </button>
                <button className="w-full flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-muted">
                  Trash
                </button>

                <div className="pt-2 mt-2 border-t">
                  <p className="px-2 pb-1.5 text-sm font-medium">My Folders</p>
                  {MOCK_FOLDERS.map(folder => (
                    <button 
                      key={folder.id}
                      className={`w-full flex items-center px-2 py-1.5 text-sm rounded-md ${currentFolder === folder.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
                      onClick={() => window.location.href = `/files?folder=${folder.id}`}
                    >
                      {folder.name}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Button variant="outline" className="w-full justify-start">
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
          {!currentFolder && !searchQuery && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Folders</h2>
              <div className={viewType === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                : "space-y-2"
              }>
                {MOCK_FOLDERS.map(folder => (
                  <FolderCard 
                    key={folder.id}
                    id={folder.id}
                    name={folder.name}
                    documentCount={folder.documentCount}
                    updatedAt={folder.updatedAt}
                    linkTo={`/files?folder=${folder.id}`}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Files */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {currentFolder 
                ? `Files in ${MOCK_FOLDERS.find(f => f.id === currentFolder)?.name || 'Folder'}`
                : searchQuery 
                  ? `Search Results: "${searchQuery}"`
                  : "All Files"
              }
            </h2>
            
            {filteredDocuments.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-40">
                  <p className="text-muted-foreground">No documents found</p>
                </CardContent>
              </Card>
            ) : (
              <div className={viewType === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                : "space-y-2"
              }>
                {filteredDocuments.map(doc => (
                  <DocumentCard 
                    key={doc.id}
                    id={doc.id}
                    title={doc.title}
                    preview={doc.preview}
                    updatedAt={doc.updatedAt}
                    collaborators={doc.collaborators}
                    linkTo={`/editor/sample-${doc.id}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
