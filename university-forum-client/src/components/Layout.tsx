import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SearchBar from './search/SearchBar';

const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Define paths where search should be shown
    const shouldShowSearch = (): boolean => {
        const searchEnabledPaths = [
            '/', // Home/categories page
            '/categories',
            '/threads',
            '/search'
        ];

        // Check if current path starts with any of the enabled paths
        return searchEnabledPaths.some(path => 
            location.pathname === path || 
            location.pathname.startsWith(`${path}/`)
        );
    };

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo/Home Link */}
                        <Link to="/" className="text-xl font-bold text-blue-900">
                            Forum
                        </Link>

                        {/* Search Bar - Only show on specific pages */}
                        {shouldShowSearch() && (
                            <div className="flex-1 max-w-2xl mx-4">
                                <SearchBar />
                            </div>
                        )}

                        {/* Navigation Links */}
                        <nav className="flex items-center space-x-4">
                            {user ? (
                                <>
                                    {user.role === 'admin' && (
                                        <Link
                                            to="/admin"
                                            className="text-gray-600 hover:text-gray-900"
                                        >
                                            Admin
                                        </Link>
                                    )}
                                    <Link
                                        to="/profile"
                                        className="text-gray-600 hover:text-gray-900"
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-600 hover:text-gray-900"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="text-gray-600 hover:text-gray-900"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="text-gray-600 hover:text-gray-900"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <Outlet />
            </main>

            <footer className="bg-white border-t">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-gray-500">
                        © 2024 Forum. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;