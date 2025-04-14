import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
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
}

export function DocumentCard({
  id,
  title,
  preview = '',
  updatedAt,
  collaborators = [],
  linkTo,
  className = '',
}: DocumentCardProps) {
  const formattedDate = formatDistanceToNow(updatedAt, { addSuffix: true });
  const Component = linkTo ? Link : Card;
  const props = linkTo ? { to: linkTo, className: `block ${className}` } : { className };

  const cardContent = (
    <Card className="h-full hover:bg-muted/50 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title || 'Untitled Document'}</CardTitle>
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
