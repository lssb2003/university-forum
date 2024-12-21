import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Profile: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-orange-50">
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-blue-900">Profile Information</h2>
                    <p className="mt-2 text-gray-600">View and manage your account details</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="border-b border-gray-200">
                        <div className="p-6">
                            {/* User Role Badge */}
                            <div className="flex justify-center mb-6">
                                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
                                    ${user.role === 'admin' 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : user.role === 'moderator'
                                        ? 'bg-orange-100 text-orange-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </span>
                            </div>

                            {/* Profile Details */}
                            <dl className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                    <dt className="text-sm font-medium text-gray-500 mb-1 sm:mb-0">
                                        Email Address
                                    </dt>
                                    <dd className="text-sm text-gray-900">
                                        {user.email}
                                    </dd>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                    <dt className="text-sm font-medium text-gray-500 mb-1 sm:mb-0">
                                        Member Since
                                    </dt>
                                    <dd className="text-sm text-gray-900">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </dd>
                                </div>

                                {user.role === 'moderator' && user.moderated_categories && (
                                    <div className="flex flex-col sm:flex-row sm:justify-between">
                                        <dt className="text-sm font-medium text-gray-500 mb-1 sm:mb-0">
                                            Moderated Categories
                                        </dt>
                                        <dd className="text-sm text-gray-900">
                                            {user.moderated_categories.length} Categories
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>

                    {/* Actions Section */}
                    <div className="bg-gray-50 px-6 py-4">
                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                            <button
                                onClick={() => navigate('/reset-password')}
                                className="inline-flex justify-center items-center px-6 py-2 
                                            bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                            transition-colors duration-200"
                            >
                                <svg 
                                    className="w-4 h-4 mr-2" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                    />
                                </svg>
                                Reset Password
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="inline-flex justify-center items-center px-6 py-2 
                                            border border-gray-300 text-gray-700 rounded-lg 
                                            hover:bg-gray-50 transition-colors duration-200"
                            >
                                <svg 
                                    className="w-4 h-4 mr-2" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
                                    />
                                </svg>
                                Back to Forum
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;