import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '../../api/auth';
import ErrorMessage from '../ui/ErrorMessage';

interface ResetPasswordFormData {
    current_password: string;
    new_password: string;
    password_confirmation: string;
}

const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordFormData>();

    const resetPasswordMutation = useMutation({
        mutationFn: resetPassword,
        onSuccess: () => {
            alert('Password has been successfully reset.');
            navigate('/');
        },
    });

    const onSubmit = (data: ResetPasswordFormData) => {
        resetPasswordMutation.mutate(data);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-orange-50">
            <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-blue-900">Reset Password</h2>
                    <p className="mt-2 text-gray-600">Update your account password</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    {resetPasswordMutation.error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                            Failed to reset password. Please try again.
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Current Password
                            </label>
                            <input
                                type="password"
                                {...register('current_password', { required: 'Current password is required' })}
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2
                                            shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.current_password && (
                                <p className="mt-2 text-sm text-red-600">{errors.current_password.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <input
                                type="password"
                                {...register('new_password', {
                                    required: 'New password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters'
                                    }
                                })}
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2
                                            shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.new_password && (
                                <p className="mt-2 text-sm text-red-600">{errors.new_password.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                {...register('password_confirmation', {
                                    required: 'Please confirm your password',
                                    validate: (val: string) => {
                                        if (watch('new_password') !== val) {
                                            return "Passwords do not match";
                                        }
                                    }
                                })}
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2
                                            shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.password_confirmation && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.password_confirmation.message}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-4 pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg 
                                            hover:bg-gray-50 transition-colors duration-200 flex items-center"
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
                            <button
                                type="submit"
                                disabled={resetPasswordMutation.isPending}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                            disabled:opacity-50 transition-colors duration-200 flex items-center"
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
                                {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;