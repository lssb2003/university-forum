import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, updateUserRole, assignModerator, banUser, unbanUser } from '../../api/admin';
import { getCategories } from '../../api/categories';
import { User, Category } from '../../types';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';

interface BanDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    userName: string;
}

interface ModeratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
    userName: string;
    onConfirm: (categoryIds: number[]) => void;
}

const ModeratorModal: React.FC<ModeratorModalProps> = ({
    isOpen,
    onClose,
    userId,
    userName,
    onConfirm,
}) => {
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    
    const { data: categories, isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories
    });

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
            onClick={handleOverlayClick}
        >
            <div className="bg-white rounded-xl p-6 max-w-md w-full m-4 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-blue-900">
                        Assign Categories for {userName}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>
                
                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <>
                        <div className="max-h-60 overflow-y-auto mb-6 scrollbar-thin scrollbar-thumb-blue-200">
                            <div className="space-y-2">
                                {categories?.map(category => (
                                    <label 
                                        key={category.id} 
                                        className="flex items-center p-3 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(category.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedCategories([...selectedCategories, category.id]);
                                                } else {
                                                    setSelectedCategories(
                                                        selectedCategories.filter(id => id !== category.id)
                                                    );
                                                }
                                            }}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-3 text-gray-700">{category.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => onConfirm(selectedCategories)}
                                disabled={selectedCategories.length === 0}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm Assignment
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const BanDialog: React.FC<BanDialogProps> = ({ isOpen, onClose, onConfirm, userName }) => {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full m-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Ban User: {userName}
                </h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ban Reason
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                        rows={3}
                        placeholder="Enter reason for ban..."
                    />
                </div>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (reason.trim()) {
                                onConfirm(reason);
                                onClose();
                            }
                        }}
                        disabled={!reason.trim()}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                                 disabled:opacity-50"
                    >
                        Ban User
                    </button>
                </div>
            </div>
        </div>
    );
};

const UserManagement: React.FC = () => {
    const queryClient = useQueryClient();
    const [moderatorModalUserId, setModeratorModalUserId] = useState<number | null>(null);
    const [modalError, setModalError] = useState<string | null>(null);
    const [banDialogUser, setBanDialogUser] = useState<User | null>(null);

    const { data: users, isLoading, error } = useQuery({
        queryKey: ['users'],
        queryFn: getUsers
    });

    const banMutation = useMutation({
        mutationFn: ({ userId, reason }: { userId: number; reason: string }) =>
            banUser(userId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    const unbanMutation = useMutation({
        mutationFn: unbanUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    const updateRoleMutation = useMutation({
        mutationFn: (data: { userId: number; role: string }) => 
            updateUserRole(data.userId, data.role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    const assignModeratorMutation = useMutation({
        mutationFn: (data: { userId: number; categoryId: number }) =>
            assignModerator(data.userId, data.categoryId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    const handleRoleChange = async (userId: number, newRole: string, currentUser: User) => {
        if (newRole === 'moderator') {
            setModeratorModalUserId(userId);
            setModalError(null);
        } else if (window.confirm(`Are you sure you want to change this user's role to ${newRole}? ${currentUser.role === 'moderator' ? 'This will remove all their moderator assignments.' : ''}`)) {
            try {
                await updateRoleMutation.mutateAsync({ userId, role: newRole });
                queryClient.invalidateQueries({ queryKey: ['users'] });
            } catch (error) {
                console.error('Failed to update role:', error);
            }
        }
    };

    const handleModeratorAssignment = async (categoryIds: number[]) => {
        if (moderatorModalUserId) {
            try {
                setModalError(null);
                const user = users?.find(u => u.id === moderatorModalUserId);

                if (user?.role === 'moderator') {
                    await updateRoleMutation.mutateAsync({ 
                        userId: moderatorModalUserId, 
                        role: 'user' 
                    });
                    
                    await updateRoleMutation.mutateAsync({ 
                        userId: moderatorModalUserId, 
                        role: 'moderator' 
                    });
                } else {
                    await updateRoleMutation.mutateAsync({ 
                        userId: moderatorModalUserId, 
                        role: 'moderator' 
                    });
                }
                
                for (const categoryId of categoryIds) {
                    await assignModeratorMutation.mutateAsync({
                        userId: moderatorModalUserId,
                        categoryId
                    });
                }
                
                queryClient.invalidateQueries({ queryKey: ['users'] });
                setModeratorModalUserId(null);
            } catch (error) {
                console.error('Failed to assign moderator:', error);
                setModalError('Failed to assign moderator role. Please try again.');
            }
        }
    };

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message="Failed to load users" />;

    const getModeratorModalUser = () => {
        if (!moderatorModalUserId) return null;
        return users?.find(user => user.id === moderatorModalUserId);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-orange-50">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-blue-900 mb-8">User Management</h2>
                
                {modalError && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {modalError}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-blue-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Current Role
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Role Actions
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Member Since
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Account Status
                                </th>
                            </tr>
                        </thead>

                            <tbody className="divide-y divide-gray-200">
                                {users?.map((user: User) => (
                                    <tr key={user.id} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-gray-900">{user.email}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm
                                                ${user.role === 'admin' 
                                                    ? 'bg-blue-100 text-blue-800' 
                                                    : user.role === 'moderator'
                                                    ? 'bg-orange-100 text-orange-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value=""
                                                onChange={(e) => handleRoleChange(user.id, e.target.value, user)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm
                                                            focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">Change role to...</option>
                                                <option value="user">User</option>
                                                <option value="moderator">Moderator</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {user.banned_at ? (
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to unban this user?')) {
                                                            unbanMutation.mutate(user.id);
                                                        }
                                                    }}
                                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 
                                                            transition-colors duration-200"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Unban User
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setBanDialogUser(user)}
                                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 
                                                            transition-colors duration-200"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    Ban User
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {moderatorModalUserId && (
                    <ModeratorModal
                        isOpen={true}
                        onClose={() => setModeratorModalUserId(null)}
                        userId={moderatorModalUserId}
                        userName={getModeratorModalUser()?.email || ''}
                        onConfirm={handleModeratorAssignment}
                    />
                )}
            </div>
            <BanDialog
                isOpen={!!banDialogUser}
                onClose={() => setBanDialogUser(null)}
                onConfirm={(reason) => {
                    if (banDialogUser) {
                        banMutation.mutate({
                            userId: banDialogUser.id,
                            reason
                        });
                    }
                }}
                userName={banDialogUser?.email || ''}
            />
        </div>
    );
};

export default UserManagement;