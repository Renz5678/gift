import { supabase } from '@/lib/supabase';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    userEmail: string | null;
    username: string | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);

    const fetchUsername = async (email: string) => {
        const { data, error } = await supabase
            .from('users')
            .select('username')
            .eq('email', email)
            .single();

        if (!error && data) {
            setUsername(data.username);
        }
    };

    useEffect(() => {
        // Check active session on mount
        checkAuthStatus();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setIsAuthenticated(!!session);
            setUserEmail(session?.user?.email ?? null);
            if (session?.user?.email) {
                await fetchUsername(session.user.email);
            } else {
                setUsername(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const checkAuthStatus = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session);
            setUserEmail(session?.user?.email ?? null);
            if (session?.user?.email) {
                await fetchUsername(session.user.email);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { success: false, error: error.message };
            }

            setIsAuthenticated(true);
            setUserEmail(data.user?.email ?? null);
            if (data.user?.email) {
                await fetchUsername(data.user.email);
            }
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'An unexpected error occurred' };
        }
    };

    const signup = async (email: string, password: string, username: string): Promise<{ success: boolean; error?: string }> => {
        try {
            // First, check if username is already taken
            const { data: existingUser } = await supabase
                .from('users')
                .select('username')
                .eq('username', username)
                .single();

            if (existingUser) {
                return { success: false, error: 'Username already taken' };
            }

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                return { success: false, error: error.message };
            }

            // Insert username into users table
            if (data.user) {
                const { error: insertError } = await supabase
                    .from('users')
                    .insert([{ email, username }]);

                if (insertError) {
                    console.error('Error inserting username:', insertError);
                    return { success: false, error: 'Failed to save username' };
                }
            }

            // Check if email confirmation is required
            if (data.user && !data.session) {
                return {
                    success: true,
                    error: 'Please check your email to confirm your account'
                };
            }

            setIsAuthenticated(!!data.session);
            setUserEmail(data.user?.email ?? null);
            setUsername(username);
            return { success: true };
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, error: 'An unexpected error occurred' };
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
            setIsAuthenticated(false);
            setUserEmail(null);
            setUsername(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, userEmail, username, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
