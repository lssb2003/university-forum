import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useLogin } from '../../hooks/useAuth';
import { LoginCredentials } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>();
    const navigate = useNavigate();
    const login = useLogin();
    const { login: authLogin } = useAuth();
    const [loginError, setLoginError] = useState<string | null>(null);

    const onSubmit = async (data: LoginCredentials) => {
        try {
            setLoginError(null);
            const response = await login.mutateAsync(data);
            authLogin(response.token, response.user);
            navigate('/', { replace: true });
        } catch (error) {
            setLoginError('Invalid email or password');
            console.error('Login failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-blue-900">Welcome Back</h2>
                    <p className="mt-2 text-gray-600">Sign in to your account</p>
                </div>
                
                {loginError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                        {loginError}
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
                            placeholder="Enter your email"
                        />
                        {errors.email && (
                            <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            {...register('password', { required: 'Password is required' })}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2
                                        shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                        />
                        {errors.password && (
                            <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            Forgot your password?
                        </Link>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <button
                            type="submit"
                            disabled={login.isPending}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                        disabled:opacity-50 transition-colors duration-200"
                        >
                            {login.isPending ? 'Signing in...' : 'Sign In'}
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
                        <span className="text-gray-600">Don't have an account? </span>
                        <Link
                            to="/register"
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            Register here
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;