import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../../api/categories';
import { Link } from 'react-router-dom';
import { Category } from '../../types';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';

const CategoryList: React.FC = () => {
    const { data: categories, isLoading, error } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories
    });

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message="Failed to load categories" />;

    const renderCategory = (category: Category) => (
        <div key={category.id} className="mb-6">
            <div className="bg-white shadow-md rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div className="border-l-4 border-blue-600">
                    <div className="p-6">
                        <Link 
                            to={`/categories/${category.id}`} 
                            className="text-xl font-semibold text-blue-900 hover:text-blue-700 transition-colors duration-200"
                        >
                            {category.name}
                        </Link>
                        <p className="mt-3 text-gray-600">{category.description}</p>
                        
                        {category.subcategories && category.subcategories.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Subcategories</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {category.subcategories.map((sub) => (
                                        <Link 
                                            key={sub.id}
                                            to={`/categories/${sub.id}`}
                                            className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200
                                                     text-blue-700 text-sm flex items-center group"
                                        >
                                            <svg 
                                                className="w-4 h-4 mr-2 text-blue-500 group-hover:text-blue-600" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                            {sub.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {category.moderators && category.moderators.length > 0 && (
                            <div className="mt-4 flex items-center text-sm text-gray-500">
                                <svg 
                                    className="w-4 h-4 mr-1" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                {category.moderators.length} Moderator{category.moderators.length !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-orange-50">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-blue-900">Discussion Categories</h2>
                    <p className="mt-2 text-gray-600">Browse all categories and their subcategories</p>
                </div>
                <div className="space-y-6">
                    {categories?.map(renderCategory)}
                </div>
            </div>
        </div>
    );
};

export default CategoryList;