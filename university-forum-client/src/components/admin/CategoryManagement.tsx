import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories } from '../../api/categories';
import { createCategory, updateCategory, deleteCategory } from '../../api/admin';
import { Category } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../utils/permissions';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import ConfirmationDialog from '../ui/ConfirmationDialog';
import CategoryEditModal from './CategoryEditModal';

interface CategoryFormData {
    name: string;
    description: string;
    parent_category_id?: number | null;
}

interface CategoryItemProps {
    category: Category;
    level: number;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
    allCategories: Category[];
}

const CategoryItem: React.FC<CategoryItemProps> = ({ 
    category, 
    level, 
    onEdit, 
    onDelete,
    allCategories 
}) => {
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
    const parentCategory = allCategories.find(c => c.id === category.parent_category_id);
    
    return (
        <div 
            className="relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 mb-4"
            style={{ marginLeft: `${level * 1.5}rem` }}
        >
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <div className="flex-grow">
                        <h4 className="text-xl font-semibold text-blue-900">{category.name}</h4>
                        <p className="mt-2 text-gray-600">{category.description}</p>
                        {parentCategory && (
                            <p className="mt-2 text-sm text-blue-600">
                                Parent: {parentCategory.name}
                            </p>
                        )}
                        {category.moderators && category.moderators.length > 0 && (
                            <div className="mt-2 flex items-center text-gray-500">
                                <span className="text-sm">
                                    {category.moderators.length} Moderator{category.moderators.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex space-x-3 ml-4">
                        <button
                            onClick={() => onEdit(category)}
                            className="px-3 py-1 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete(category)}
                            className="px-3 py-1 text-orange-400 hover:text-orange-600 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            {hasSubcategories && (
                <div className="ml-6 border-l-2 border-blue-100 pb-4">
                    {category.subcategories.map(subcategory => (
                        <CategoryItem
                            key={subcategory.id}
                            category={subcategory}
                            level={level + 1}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            allCategories={allCategories}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const CategoryManagement: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<CategoryFormData>({
        name: '',
        description: '',
        parent_category_id: null
    });

    const getAvailableParentCategories = (categories: Category[]) => {
        return categories.filter(cat => {
            // Only show categories that:
            // 1. Are top-level categories (no parent)
            // 2. Are not the current category being edited
            // 3. Are not subcategories themselves
            return !cat.is_subcategory && 
                    (!editingCategory || cat.id !== editingCategory.id);
        });
    };

    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        category: Category | null;
    }>({ isOpen: false, category: null });

    const [error, setError] = useState<string | null>(null);

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
        select: (data) => {
            return [...data].sort((a, b) => {
                // Use created_at for consistent ordering
                // This ensures editing won't change position
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
        }
    });

    // Get all categories in a flat array (including subcategories)
    const getAllCategories = (cats: Category[]): Category[] => {
        return cats.reduce((acc: Category[], cat) => {
            acc.push(cat);
            if (cat.subcategories && cat.subcategories.length > 0) {
                acc.push(...getAllCategories(cat.subcategories));
            }
            return acc;
        }, []);
    };

    const allCategories = getAllCategories(categories);

    const createMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            resetForm();
            setError(null);
            window.history.replaceState(null, '', '/admin/categories');
        },
        onError: (error: any) => {
            setError(error.response?.data?.errors?.join(', ') || 'Failed to create category');
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: { id: number; category: CategoryFormData }) => 
            updateCategory(data.id, data.category),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setEditingCategory(null);
            resetForm();
            setError(null);
            window.history.replaceState(null, '', '/admin/categories');
        },
        onError: (error: any) => {
            setError(error.response?.data?.errors?.join(', ') || 'Failed to update category');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setError(null);
            setDeleteDialog({ isOpen: false, category: null });
        },
        onError: (error: any) => {
            setError(error.response?.data?.errors?.join(', ') || 'Failed to delete category');
        }
    });


    if (!isAdmin(user)) {
        return <ErrorMessage message="Unauthorized access" />;
    }

    if (isLoading) return <LoadingSpinner />;

    const resetForm = () => {
        setFormData({ name: '', description: '', parent_category_id: null });
        setEditingCategory(null);
        setError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
    
        // This form is now ONLY for creating new categories
        const submitData = {
            ...formData,
            parent_category_id: formData.parent_category_id || null
        };
    
        createMutation.mutate(submitData);
    };

    const handleDeleteClick = (category: Category) => {
        setDeleteDialog({ isOpen: true, category });
    };

    const handleDeleteConfirm = async () => {
        const category = deleteDialog.category;
        if (!category) return;
        try {
            await deleteMutation.mutateAsync(category.id);
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const handleUpdateCategory = async (data: {
        name: string;
        description: string;
        parent_category_id: number | null;
    }) => {
        if (!editingCategory) return;
        
        try {
            await updateMutation.mutateAsync({
                id: editingCategory.id,
                category: data
            });
            setEditingCategory(null);
        } catch (error) {
            console.error('Failed to update category:', error);
        }
    };
    

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-orange-50">
            <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-blue-900 mb-8">Category Management</h2>

                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Category Form */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h3 className="text-xl font-semibold text-blue-900 mb-6">
                        {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">None (Top Level)</option>
                                {categories && getAvailableParentCategories(categories).map((cat) => (
                                    <option 
                                        key={cat.id} 
                                        value={cat.id}
                                        disabled={editingCategory?.id === cat.id}
                                    >
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-sm text-gray-500">
                                Only top-level categories can be selected as parents. Categories can only be nested one level deep.
                            </p>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                        transition-colors duration-200 disabled:opacity-50"
                                disabled={createMutation.isPending}
                            >
                                {createMutation.isPending ? 'Creating...' : 'Create Category'}
                            </button>
                        </div>
                    </form>
                    {editingCategory && (
                        <CategoryEditModal
                            isOpen={true}
                            onClose={() => setEditingCategory(null)}
                            onSubmit={handleUpdateCategory}
                            category={editingCategory}
                            categories={categories || []}
                            isSubmitting={updateMutation.isPending}
                        />
                    )}
                </div>

                {/* Categories List */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-blue-900 mb-6">Categories</h3>
                    <div className="space-y-4">
                        {categories
                            .filter(category => !category.parent_category_id)
                            .map((category) => (
                                <CategoryItem
                                    key={category.id}
                                    category={category}
                                    level={0}
                                    onEdit={setEditingCategory}
                                    onDelete={handleDeleteClick}
                                    allCategories={allCategories}
                                />
                            ))}
                    </div>
                </div>

                <ConfirmationDialog 
                    isOpen={deleteDialog.isOpen}
                    onClose={() => setDeleteDialog({ isOpen: false, category: null })}
                    onConfirm={handleDeleteConfirm}
                    title={`Delete ${deleteDialog.category?.name || 'Category'}`}
                    description={
                        <>
                            {deleteDialog.category?.subcategories && 
                            deleteDialog.category.subcategories.length > 0 && (
                                <p className="mb-2 text-yellow-600">
                                    ⚠️ This category has subcategories that will become top-level categories.
                                </p>
                            )}
                            {deleteDialog.category?.moderators && 
                            deleteDialog.category.moderators.length > 0 && (
                                <p className="mb-2 text-yellow-600">
                                    ⚠️ This will remove all moderator assignments for this category.
                                </p>
                            )}
                            <p>This action cannot be undone.</p>
                        </>
                    }
                    confirmText="Delete Category"
                    variant="destructive"
                />
            </div>
        </div>
    );
};

export default CategoryManagement;