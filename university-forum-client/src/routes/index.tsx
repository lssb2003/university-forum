import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import ForgotPassword from '../components/auth/ForgotPassword';
import ResetPassword from '../components/auth/ResetPassword';
import Profile from '../components/auth/Profile';
import CategoryList from '../components/categories/CategoryList';
import ThreadList from '../components/threads/ThreadList';
import CreateThread from '../components/threads/CreateThread';
import ThreadView from '../components/threads/ThreadView';
import EditThread from '../components/threads/EditThread';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminDashboard from '../components/admin/AdminDashboard';
import UserManagement from '../components/admin/UserManagement';
import CategoryManagement from '../components/admin/CategoryManagement';
import SearchResults from '../components/search/SearchResults';

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<CategoryList />} />
                <Route path="login" element={<LoginForm />} />
                <Route path="register" element={<RegisterForm />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="search" element={<SearchResults />} />
                
                {/* Protected Routes */}
                <Route path="reset-password" element={
                    <ProtectedRoute>
                        <ResetPassword />
                    </ProtectedRoute>
                } />
                <Route path="profile" element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />
                
                {/* Category and Thread Routes */}
                <Route path="categories/:categoryId" element={<ThreadList />} />
                <Route path="categories/:categoryId/new-thread" element={
                    <ProtectedRoute>
                        <CreateThread />
                    </ProtectedRoute>
                } />
                <Route path="threads/:threadId" element={<ThreadView />} />
                <Route path="threads/:threadId/edit" element={
                    <ProtectedRoute>
                        <EditThread />
                    </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="admin" element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                    </ProtectedRoute>
                } />
                <Route path="admin/users" element={
                    <ProtectedRoute requiredRole="admin">
                        <UserManagement />
                    </ProtectedRoute>
                } />
                <Route path="admin/categories" element={
                    <ProtectedRoute requiredRole="admin">
                        <CategoryManagement />
                    </ProtectedRoute>
                } />
                
                <Route path="*" element={<div>Page Not Found</div>} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;