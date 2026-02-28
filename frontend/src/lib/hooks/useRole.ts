import { useAuth } from '@/lib/context/AuthContext';

export function useRole() {
    const { user } = useAuth();

    return {
        isAdmin: user?.role === 'ADMIN',
        isManager: user?.role === 'MANAGER',
        isStaff: user?.role === 'STAFF',
        canEdit: user?.role === 'ADMIN' || user?.role === 'MANAGER',
    };
}