import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { formatDistanceToNow } from 'date-fns';

interface FolderCardProps {
  id: string;
  name: string;
  documentCount: number;
  updatedAt: number;
  linkTo?: string;
  className?: string;
}

export function FolderCard({
  id,
  name,
  documentCount,
  updatedAt,
  linkTo,
  className = '',
}: FolderCardProps) {
  const formattedDate = formatDistanceToNow(updatedAt, { addSuffix: true });
  
  const cardContent = (
    <Card className="h-full hover:bg-muted/50 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
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
