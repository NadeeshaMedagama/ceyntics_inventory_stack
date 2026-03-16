import { create } from 'zustand';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'staff';
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    login: (user, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
    },
    initialize: () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (token && user) {
            set({ user: JSON.parse(user), token, isAuthenticated: true });
        }
    },
}));
