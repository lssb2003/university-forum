import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLogout } from '../hooks/useAuth';
import SearchBar from './search/SearchBar';

const Layout: React.FC = () => {
    const { user, clearAuth } = useAuth();
    const logout = useLogout();
    const navigate = useNavigate();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout.mutateAsync();
            clearAuth();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const toggleProfileMenu = () => {
        setIsProfileMenuOpen(!isProfileMenuOpen);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="text-xl font-bold text-gray-800">
                                NUS Forum
                            </Link>
                        </div>
                        
                        {/* Search Bar */}
                        <div className="flex-1 flex justify-center px-4 lg:px-6">
                            <div className="w-full max-w-lg my-2">
                                <SearchBar 
                                    className="w-full py-2" 
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={toggleProfileMenu}
                                        className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
                                    >
                                        <span>{user.email}</span>
                                        <svg
                                            className={`h-5 w-5 transform ${isProfileMenuOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>

                                    {isProfileMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                            <div className="py-1">
                                                <Link
                                                    to="/profile"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                >
                                                    Profile
                                                </Link>
                                                {user?.role === 'admin' && (
                                                    <Link
                                                        to="/admin"
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        onClick={() => setIsProfileMenuOpen(false)}
                                                    >
                                                        Admin Dashboard
                                                    </Link>
                                                )}
                                                <Link
                                                    to="/reset-password"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                >
                                                    Reset Password
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setIsProfileMenuOpen(false);
                                                        handleLogout();
                                                    }}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    disabled={logout.isPending}
                                                >
                                                    {logout.isPending ? 'Logging out...' : 'Logout'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-x-4">
                                    <Link
                                        to="/login"
                                        className="text-sm text-gray-700 hover:text-gray-900"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;