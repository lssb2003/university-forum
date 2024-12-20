// src/components/ui/ErrorMessage.tsx
import React from 'react';

interface ErrorMessageProps {
    message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
    <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
        <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{message}</div>
        </div>
        </div>
    </div>
);

export default ErrorMessage;