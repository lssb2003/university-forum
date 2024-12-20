// components/auth/RegisterForm.tsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useRegister } from '../../hooks/useAuth';
import { RegisterCredentials } from '../../types';

const RegisterForm: React.FC = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterCredentials>();
    const navigate = useNavigate();
    const registerMutation = useRegister();
    const [showSuccess, setShowSuccess] = React.useState(false);

    const onSubmit = async (data: RegisterCredentials) => {
        try {
            await registerMutation.mutateAsync(data);
            setShowSuccess(true);
            // Don't auto-login, just show success message
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (error) {
            console.error('Registration failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-blue-900">Create Account</h2>
                    <p className="mt-2 text-gray-600">Join our community</p>
                </div>
                
                {showSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
                        Registration successful! You can now log in.
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            {...register('email', { 
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address'
                                }
                            })}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2
                                        shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.email && (
                            <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            {...register('password', { 
                                required: 'Password is required',
                                minLength: {
                                    value: 6,
                                    message: 'Password must be at least 6 characters'
                                }
                            })}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2
                                        shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.password && (
                            <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            {...register('password_confirmation', { 
                                required: 'Please confirm your password',
                                validate: (val: string) => {
                                    if (watch('password') !== val) {
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

                    <div className="flex flex-col space-y-4">
                        <button
                            type="submit"
                            disabled={registerMutation.isPending}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                     disabled:opacity-50 transition-colors duration-200"
                        >
                            {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg 
                                     hover:bg-gray-50 transition-colors duration-200"
                        >
                            Back to Forum
                        </button>
                    </div>

                    <div className="text-center mt-4">
                        <span className="text-gray-600">Already have an account? </span>
                        <Link
                            to="/login"
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            Sign in here
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default RegisterForm;
