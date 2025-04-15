import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { formatDistanceToNow } from 'date-fns';

interface DocumentCardProps {
  id: string;
  title: string;
  preview?: string;
  updatedAt: number;
  collaborators?: Array<{
    id: string;
    color: string;
  }>;
  linkTo?: string;
  className?: string;
  onDelete?: (id: string) => void;
}

export function DocumentCard({
  id,
  title,
  preview = '',
  updatedAt,
  collaborators = [],
  linkTo,
  className = '',
  onDelete,
}: DocumentCardProps) {
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
          <p className="text-sm text-center mb-4">Delete "{title || 'Untitled Document'}"?</p>
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
        <CardTitle className="text-lg pr-6">{title || 'Untitled Document'}</CardTitle>
        <CardDescription>Edited {formattedDate}</CardDescription>
      </CardHeader>
      <CardContent>
        {preview && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {preview}
          </p>
        )}
        {collaborators.length > 0 && (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex -space-x-2">
              {collaborators.map((user, index) => (
                <div
                  key={user.id || index}
                  className="size-6 rounded-full border-2 border-background"
                  style={{ backgroundColor: user.color }}
                  title={user.id}
                />
              ))}
            </div>
            <span>{collaborators.length} {collaborators.length === 1 ? 'collaborator' : 'collaborators'}</span>
          </div>
        )}
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

export default DocumentCard;
