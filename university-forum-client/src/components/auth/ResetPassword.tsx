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
        <div className="max-w-md mx-auto mt-8">
            <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
            {resetPasswordMutation.error && (
                <ErrorMessage message="Failed to reset password" />
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                        Current Password
                    </label>
                    <input
                        type="password"
                        {...register('current_password', { required: 'Current password is required' })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                    {errors.current_password && (
                        <p className="mt-1 text-sm text-red-600">{errors.current_password.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
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
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                    {errors.new_password && (
                        <p className="mt-1 text-sm text-red-600">{errors.new_password.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
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
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                    {errors.password_confirmation && (
                        <p className="mt-1 text-sm text-red-600">{errors.password_confirmation.message}</p>
                    )}
                </div>

                <div className="flex justify-between">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="text-sm text-gray-600 hover:text-gray-800"
                    >
                        Back to Forum
                    </button>
                    <button
                        type="submit"
                        disabled={resetPasswordMutation.isPending}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500 disabled:opacity-50"
                    >
                        {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ResetPassword;