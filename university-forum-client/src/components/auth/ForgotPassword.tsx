// components/auth/ForgotPassword.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { forgotPassword } from '../../api/auth';

interface ForgotPasswordFormData {
    email: string;
}

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const forgotPasswordMutation = useMutation({
        mutationFn: forgotPassword,
        onSuccess: () => {
            setSuccessMessage('Password reset instructions have been sent to your email.');
            setErrorMessage(null);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        },
        onError: () => {
            setErrorMessage('Failed to process password reset request. Please try again.');
            setSuccessMessage(null);
        }
    });

    const onSubmit = (data: ForgotPasswordFormData) => {
        forgotPasswordMutation.mutate(data.email);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-blue-900">Reset Password</h2>
                    <p className="mt-2 text-gray-600">Enter your email to reset your password</p>
                </div>

                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
                        {successMessage}
                    </div>
                )}

                {errorMessage && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address'
                                }
                            })}
                            type="email"
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2
                                        shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                        />
                        {errors.email && (
                            <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="flex flex-col space-y-4">
                        <button
                            type="submit"
                            disabled={forgotPasswordMutation.isPending}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                        disabled:opacity-50 transition-colors duration-200"
                        >
                            {forgotPasswordMutation.isPending ? 'Sending...' : 'Reset Password'}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg 
                                        hover:bg-gray-50 transition-colors duration-200"
                        >
                            Back to Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;