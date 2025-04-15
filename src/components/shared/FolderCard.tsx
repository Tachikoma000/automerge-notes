import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { formatDistanceToNow } from 'date-fns';

interface FolderCardProps {
  id: string;
  name: string;
  documentCount: number;
  updatedAt: number;
  linkTo?: string;
  className?: string;
  onDelete?: (id: string) => void;
}

export function FolderCard({
  id,
  name,
  documentCount,
  updatedAt,
  linkTo,
  className = '',
  onDelete,
}: FolderCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const formattedDate = formatDistanceToNow(updatedAt, { addSuffix: true });
  
  // Handle delete action
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onDelete) {
      setIsDeleting(true);
      await onDelete(id);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  // Toggle delete confirmation
  const toggleDeleteConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(!showDeleteConfirm);
  };
  
  const cardContent = (
    <Card className="h-full hover:bg-muted/50 transition-colors relative">
      {/* Add three-dot menu icon in the top right */}
      {onDelete && (
        <button 
          className="absolute top-2 right-2 z-10 p-1 rounded-full hover:bg-muted"
          onClick={toggleDeleteConfirm}
          title="Options"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      )}
      
      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-card z-20 flex flex-col justify-center items-center p-4 border rounded-md shadow-md">
          <p className="text-sm text-center mb-4">
            Delete "{name || 'Untitled Folder'}"?
            {documentCount > 0 && (
              <span className="block mt-2 text-xs text-muted-foreground">
                Documents inside will be moved to the root level.
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleDeleteConfirm}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 pr-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
          </svg>
          {name || 'Untitled Folder'}
        </CardTitle>
        <CardDescription>{documentCount} {documentCount === 1 ? 'document' : 'documents'}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground">
          Last updated: {formattedDate}
        </div>
      </CardContent>
    </Card>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className={`block ${className}`}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

export default FolderCard;
