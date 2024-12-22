// types/index.ts

// User related interfaces
export interface User {
    id: number;
    email: string;
    role: 'user' | 'moderator' | 'admin';
    created_at: string;
    moderated_categories?: number[]; // Categories this user moderates
    banned_at: string | null;
    ban_reason: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials extends LoginCredentials {
    password_confirmation: string;
}


export interface AuthResponse {
    token: string;
    user: User;
}

// Password management interfaces
export interface ResetPasswordData {
    current_password: string;
    new_password: string;
    password_confirmation: string;
}

export interface ForgotPasswordData {
    email: string;
}

// Forum structure interfaces
export interface Category {
    id: number;
    name: string;
    description: string;
    parent_category_id: number | null;
    is_subcategory: boolean;
    nesting_level: number;
    subcategories: Category[];
    moderators?: ModeratorAssignment[];
    edited_at: string | null;
    created_at: string;    // Added this line
    updated_at: string;    // Added this line for completeness
}


export interface Thread {
    id: number;
    title: string;
    content: string;
    category_id: number;
    author_id: number;
    author: User;
    created_at: string;
    posts_count: number;
    is_locked: boolean;
    can_moderate: boolean;  // Add this line
    edited_at: string | null;
}

export interface Post {
    id: number;
    content: string;
    thread_id: number;
    author_id: number;
    author: User;
    created_at: string;
    deleted_at: string | null;
    parent_id: number | null;
    depth: number;
    visible_content: string;
    replies: Post[];
    can_moderate: boolean;
    edited_at: string | null;
}


// Moderator related interfaces
export interface ModeratorAssignment {
    id: number;
    user_id: number; // Add this
    category_id: number;
    created_at: string;
    user: User; // Add this to match backend response
}
export interface ModeratorCreationData {
    user_id: number;      // Just the ID when creating/managing moderators
    category_id: number;
}