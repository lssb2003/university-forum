import { Category } from "../../types";
import { useState } from "react";

interface CategoryEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; description: string; parent_category_id: number | null }) => void;
    category: Category;
    categories: Category[];
    isSubmitting: boolean;
}

const CategoryEditModal: React.FC<CategoryEditModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    category,
    categories,
    isSubmitting
}) => {
    const [formData, setFormData] = useState({
        name: category.name,
        description: category.description,
        parent_category_id: category.parent_category_id
    });

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const getAvailableParentCategories = () => {
        return categories.filter(cat => {
            return !cat.is_subcategory && 
                   cat.id !== category.id;
        });
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
            onClick={handleOverlayClick}
        >
            <div className="bg-white rounded-xl p-6 max-w-lg w-full m-4 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-blue-900">
                        Edit Category: {category.name}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                                     focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                                     focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Parent Category
                        </label>
                        <select
                            value={formData.parent_category_id || ''}
                            onChange={(e) => setFormData({
                                ...formData,
                                parent_category_id: e.target.value ? Number(e.target.value) : null
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                                     focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">None (Top Level)</option>
                            {getAvailableParentCategories().map((cat) => (
                                <option 
                                    key={cat.id} 
                                    value={cat.id}
                                >
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-sm text-gray-500">
                            Only top-level categories can be selected as parents. Categories can only be nested one level deep.
                        </p>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSubmit(formData)}
                            disabled={isSubmitting || !formData.name || !formData.description}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                     transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryEditModal;