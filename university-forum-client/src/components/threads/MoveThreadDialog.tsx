import React, { useState } from 'react';
import { Category } from '../../types';

interface MoveThreadDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onMove: (categoryId: number) => Promise<void>;
    categories: Category[];
    currentCategoryId: number;
    userModeratedCategories?: number[];
}

const MoveThreadDialog: React.FC<MoveThreadDialogProps> = ({
    isOpen,
    onClose,
    onMove,
    categories,
    currentCategoryId,
    userModeratedCategories
}) => {
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    

    const handleMove = async () => {
        if (!selectedCategoryId) return;
        
        setError(null);
        setIsSubmitting(true);
        
        try {
            await onMove(selectedCategoryId);
            onClose();
        } catch (err) {
            setError('Failed to move thread. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderCategoryOption = (category: Category, level: number = 0) => {
        const indent = level * 1.5;
        const isDisabled = category.id === currentCategoryId;
        
        // Updated permission check logic
        const hasPermission = () => {
            // If userModeratedCategories is undefined, user is admin
            if (userModeratedCategories === undefined) return true;
            
            // Empty array means not an admin and no moderated categories
            if (userModeratedCategories.length === 0) return false;
            
            // Check direct category permission
            if (userModeratedCategories.includes(category.id)) return true;
            
            // Check parent category permission
            if (category.parent_category_id && 
                userModeratedCategories.includes(category.parent_category_id)) {
                return true;
            }
            
            return false;
        };
        
        const canMoveTo = hasPermission();

        return (
            <React.Fragment key={category.id}>
                <option 
                    value={category.id}
                    disabled={isDisabled || !canMoveTo}
                    style={{ marginLeft: `${indent}rem` }}
                >
                    {level > 0 ? '└─ ' : ''}{category.name}
                    {isDisabled ? ' (Current)' : !canMoveTo ? ' (No permission)' : ''}
                </option>
                {category.subcategories?.map(sub => renderCategoryOption(sub, level + 1))}
            </React.Fragment>
        );
    };


    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full m-4">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-blue-900">
                        Move Thread
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Destination Category
                    </label>
                    <select
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 
                                 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        value={selectedCategoryId || ''}
                        onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                    >
                        <option value="">Choose category...</option>
                        {categories
                            .filter(cat => !cat.parent_category_id)
                            .map(category => renderCategoryOption(category))}
                    </select>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleMove}
                        disabled={!selectedCategoryId || isSubmitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Moving...' : 'Move Thread'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MoveThreadDialog;