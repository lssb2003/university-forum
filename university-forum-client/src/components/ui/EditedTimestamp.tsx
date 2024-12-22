// src/components/ui/EditedTimestamp.tsx
import React from 'react';

interface EditedTimestampProps {
  editedAt: string | null;
  className?: string;
}

const EditedTimestamp: React.FC<EditedTimestampProps> = ({ editedAt, className = '' }) => {
  if (!editedAt) return null;

  return (
    <div className={`text-xs text-gray-500 italic ${className}`}>
      edited {new Date(editedAt).toLocaleString()}
    </div>
  );
};

export default EditedTimestamp;