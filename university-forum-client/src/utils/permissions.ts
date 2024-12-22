// utils/permissions.ts
import { User } from '../types';
import permissionCache from './permissionCache';

export const ROLE_HIERARCHY = {
    admin: 3,
    moderator: 2,
    user: 1,
    guest: 0
};

export const hasPermission = (user: User | null, requiredRole: 'user' | 'moderator' | 'admin'): boolean => {
    if (!user) return false;
    return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[requiredRole];
};

export const canModifyPost = (user: User | null, authorId: number, categoryId?: number): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.banned_at) return false; // Add this line
    if (user.id === authorId) return true;
    return canModifyThread(user, authorId, categoryId); // Use same logic as threads
};


export const canModifyThread = (user: User | null, authorId: number, categoryId?: number): boolean => {
    if (!user) return false;
    if (user.banned_at) return false;
    if (user.role === 'admin') return true;
    if (user.id === authorId) return true;
    return canModerateCategory(user, categoryId);
};

export const canDeleteContent = (user: User | null, authorId: number, categoryId: number): boolean => {
    if (!user) return false;
    if (user.banned_at) return false;
    if (user.role === 'admin') return true;
    if (user.id === authorId) return true;
    if (user.role === 'moderator' && user.moderated_categories?.includes(categoryId)) return true;
    return false;
};

export const canLockThread = (user: User | null, categoryId: number): boolean => {
    console.log('Lock Permission Check:', {
        userRole: user?.role,
        categoryId,
        moderatedCategories: user?.moderated_categories,
        isAdmin: user?.role === 'admin',
        isModerator: user?.role === 'moderator'
    });

    if (!user) return false;
    if (user.banned_at) return false;
    if (user.role === 'admin') return true;
    
    // Convert categoryId to number to ensure correct comparison
    const categoryIdNum = Number(categoryId);
    return user.role === 'moderator' && 
            Array.isArray(user.moderated_categories) && 
            user.moderated_categories.map(Number).includes(categoryIdNum);
};




export const isModerator = (user: User | null, categoryId?: number): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (!categoryId) return user.role === 'moderator';
    if (user.role === 'moderator') {
        return user.moderated_categories?.includes(categoryId) || false;
    }
    return false;
};

export const isAdmin = (user: User | null): boolean => {
    return user?.role === 'admin' || false;
};

export const canModerateCategory = (user: User | null, categoryId: number | undefined): boolean => {
    if (!user || !categoryId) return false;
    if (user.banned_at) return false;
    if (user.role === 'admin') return true;

    const cachedPermission = permissionCache.getPermission(
        user.id, 
        'moderate', 
        categoryId
    );

    if (cachedPermission !== null) {
        return cachedPermission;
    }

    const hasPermission = user.role === 'moderator' && 
                            Array.isArray(user.moderated_categories) && 
                            user.moderated_categories.includes(categoryId);

    permissionCache.setPermission(user.id, 'moderate', categoryId, hasPermission);
    return hasPermission;
};



export const canReplyToPost = (user: User | null, threadLocked: boolean, postDepth: number): boolean => {
    if (!user || threadLocked) return false;
    return postDepth < 3; // Max depth check
};

export const canMoveThread = (user: User | null, categoryId: number): boolean => {
    // Same logic as canLockThread
    return canLockThread(user, categoryId);
};