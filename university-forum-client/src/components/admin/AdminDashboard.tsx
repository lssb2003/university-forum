import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../api/admin';
import { getCategories } from '../../api/categories';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../utils/permissions';
import { User, Category } from '../../types';
import ErrorMessage from '../ui/ErrorMessage';
import LoadingSpinner from '../ui/LoadingSpinner';

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    
    const { 
        data: users = [], 
        isLoading: usersLoading 
    } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: getUsers
    });

    const { 
        data: categories = [], 
        isLoading: categoriesLoading 
    } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: getCategories
    });

    if (!isAdmin(user)) {
        return <ErrorMessage message="Unauthorized access" />;
    }

    if (usersLoading || categoriesLoading) return <LoadingSpinner />;

    const userStats = {
        total: users.length,
        moderators: users.filter(u => u.role === 'moderator').length,
        regular: users.filter(u => u.role === 'user').length
    };

    const categoryCount = categories.length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-orange-50">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-blue-900 mb-4">Admin Dashboard</h1>
                    <p className="text-gray-600">Manage your forum's users, categories, and settings</p>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {/* Total Users Card */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105">
                        <div className="p-6 bg-blue-700 text-white">
                            <h3 className="text-lg font-semibold">Total Users</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-4xl font-bold text-orange-500">{userStats.total}</p>
                            <p className="text-gray-600 mt-2">Active accounts</p>
                        </div>
                    </div>

                    {/* Moderators Card */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105">
                        <div className="p-6 bg-blue-600 text-white">
                            <h3 className="text-lg font-semibold">Moderators</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-4xl font-bold text-orange-500">{userStats.moderators}</p>
                            <p className="text-gray-600 mt-2">Active moderators</p>
                        </div>
                    </div>

                    {/* Categories Card */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105">
                        <div className="p-6 bg-blue-500 text-white">
                            <h3 className="text-lg font-semibold">Categories</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-4xl font-bold text-orange-500">{categoryCount}</p>
                            <p className="text-gray-600 mt-2">Active categories</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Link 
                        to="/admin/users" 
                        className="group relative bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-500 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
                        <div className="relative">
                            <h2 className="text-2xl font-semibold text-blue-900 group-hover:text-white transition-colors duration-300">User Management</h2>
                            <p className="mt-2 text-gray-600 group-hover:text-blue-100 transition-colors duration-300">
                                Manage user accounts, roles, and moderator assignments
                            </p>
                            <div className="mt-4 flex items-center text-blue-600 group-hover:text-white transition-colors duration-300">
                                <span>Manage Users</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </Link>

                    <Link 
                        to="/admin/categories" 
                        className="group relative bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-300 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
                        <div className="relative">
                            <h2 className="text-2xl font-semibold text-blue-900 group-hover:text-white transition-colors duration-300">Category Management</h2>
                            <p className="mt-2 text-gray-600 group-hover:text-orange-100 transition-colors duration-300">
                                Create and manage forum categories and subcategories
                            </p>
                            <div className="mt-4 flex items-center text-orange-500 group-hover:text-white transition-colors duration-300">
                                <span>Manage Categories</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;