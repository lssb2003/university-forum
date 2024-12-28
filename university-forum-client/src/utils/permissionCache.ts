import { User } from '../types';

interface PermissionCache {
    [key: string]: boolean;
}

class PermissionCacheManager {
    private static instance: PermissionCacheManager;
    private cache: Map<number, PermissionCache> = new Map();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    private constructor() {}

    static getInstance(): PermissionCacheManager {
        if (!PermissionCacheManager.instance) {
        PermissionCacheManager.instance = new PermissionCacheManager();
        }
        return PermissionCacheManager.instance;
    }

    private generateKey(action: string, resourceId: number): string {
        return `${action}_${resourceId}`;
    }

    getPermission(userId: number, action: string, resourceId: number): boolean | null {
        const userCache = this.cache.get(userId);
        if (!userCache) return null;
        
        const key = this.generateKey(action, resourceId);
        return userCache[key] ?? null;
    }

    setPermission(userId: number, action: string, resourceId: number, hasPermission: boolean): void {
        let userCache = this.cache.get(userId);
        if (!userCache) {
        userCache = {};
        this.cache.set(userId, userCache);
        }
        
        const key = this.generateKey(action, resourceId);
        userCache[key] = hasPermission;

        // Set expiry
        setTimeout(() => {
        this.invalidatePermission(userId, action, resourceId);
        }, this.CACHE_DURATION);
    }

    invalidatePermission(userId: number, action: string, resourceId: number): void {
        const userCache = this.cache.get(userId);
        if (userCache) {
        const key = this.generateKey(action, resourceId);
        delete userCache[key];
        }
    }

    invalidateUserCache(userId: number): void {
        this.cache.delete(userId);
    }

    clearCache(): void {
        this.cache.clear();
    }
}

const permissionCache = PermissionCacheManager.getInstance();
export default permissionCache;
