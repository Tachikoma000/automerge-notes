import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import DocumentCard from '../components/shared/DocumentCard';
import FolderCard from '../components/shared/FolderCard';
import { getUserColor } from '../repo';

// Sample data (in a real app, this would be fetched from Automerge)
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
  }
];

const MOCK_ACTIVITY = [
  {
    id: 'activity1',
    userId: 'user-1234',
    userColor: getUserColor('user-1234'),
    action: 'edited',
    documentId: 'doc1',
    documentTitle: 'Project Roadmap',
    timestamp: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
  },
  {
    id: 'activity2',
    userId: 'user-5678',
    userColor: getUserColor('user-5678'),
    action: 'commented on',
    documentId: 'doc2',
    documentTitle: 'Meeting Notes',
    timestamp: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
  },
  {
    id: 'activity3',
    userId: 'user-9012',
    userColor: getUserColor('user-9012'),
    action: 'shared',
    documentId: 'doc3',
    documentTitle: 'Research Summary',
    timestamp: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
  }
];

export default function Dashboard() {
  // Get user ID
  const [userId] = useState(() => 
    localStorage.getItem('userId') || `user-${Math.floor(Math.random() * 10000)}`
  );

  // Save userId to localStorage if not already set
  useEffect(() => {
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', userId);
    }
  }, [userId]);

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button asChild>
          <Link to="/editor/new">New Document</Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Documents</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/files">View all</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {MOCK_DOCUMENTS.map(doc => (
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
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Folders</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/files">View all</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {MOCK_ACTIVITY.map(activity => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div 
                      className="size-8 rounded-full flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: activity.userColor }}
                    ></div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{activity.userId}</span> {activity.action}{' '}
                        <Link to={`/editor/sample-${activity.documentId}`} className="font-medium hover:underline">
                          {activity.documentTitle}
                        </Link>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
