
"use client";
import type { AuthenticatedUser, UserRole } from '@/lib/types';
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { createClient } from '@/lib/supabaseClient'; 
import type { AuthError, User as SupabaseAuthUser, SignUpWithPasswordCredentials } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types'; 

interface AuthContextType {
  user: AuthenticatedUser | null;
  login: (credentials: Pick<SignUpWithPasswordCredentials, 'email' | 'password'>) => Promise<{ success: boolean; error?: AuthError | null | Error }>;
  logout: () => Promise<{ error: AuthError | null }>;
  signUp: (credentials: SignUpWithPasswordCredentials & { name: string; role: UserRole }) => Promise<{ success: boolean; error?: AuthError | null | Error; message?: string }>;
  isLoading: boolean; 
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const supabase = createClient();
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); 

  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseAuthUser): Promise<AuthenticatedUser | null> => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, name, email, role')
      .eq('id', supabaseUser.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error.message);
      // If profile not found, it might be a fresh signup where the trigger hasn't run yet
      // or an actual issue. For now, we'll return null and rely on subsequent checks or user actions.
      return null;
    }
    if (!profile) {
        console.warn("No profile found for user:", supabaseUser.id);
        return null;
    }
    return {
      id: profile.id,
      name: profile.name || supabaseUser.email?.split('@')[0] || 'User', 
      email: profile.email || supabaseUser.email!, 
      role: profile.role as UserRole, 
    };
  }, [supabase]);

  useEffect(() => {
    setIsLoading(true); 
    const getSessionAndProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const appUser = await fetchUserProfile(session.user);
          setUser(appUser);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("Error in getSession or fetchUserProfile on initial load:", e);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoading(true); 
      if (session?.user) {
        if (user?.id !== session.user.id || !user) {
          const appUser = await fetchUserProfile(session.user);
          setUser(appUser);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false); 
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, fetchUserProfile, user]); // Added 'user' to dependency array to re-evaluate if it changes externally.

  const login = async (credentials: Pick<SignUpWithPasswordCredentials, 'email' | 'password'>) => {
    setIsLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword(credentials);
    // User state will be set by onAuthStateChange
    if (signInError) {
      setIsLoading(false);
      return { success: false, error: signInError };
    }
    // setIsLoading(false) will be handled by onAuthStateChange
    return { success: !signInError, error: signInError };
  };

  const signUp = async (credentials: SignUpWithPasswordCredentials & { name: string; role: UserRole }) => {
    setIsLoading(true);
    const { name, role, ...authCredentials } = credentials;
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      ...authCredentials,
      options: {
        data: { 
          name: name, 
          app_role: role, // This metadata is used by your handle_new_user trigger
        },
      },
    });

    if (signUpError) {
      setIsLoading(false);
      return { success: false, error: signUpError, message: signUpError.message };
    }

    if (!signUpData.user) {
      setIsLoading(false);
      return { success: false, error: new Error("User registration failed, no user data returned."), message: "User registration failed." };
    }

    // At this point, Supabase Auth user is created. The handle_new_user trigger
    // should have created an entry in public.profiles.
    // Now, create the corresponding vendor or delivery_partner record.

    let roleEntityError: Error | null = null;
    let roleEntityMessage: string = "User account created. Role profile pending.";

    if (role === 'vendor') {
      const { error: vendorError } = await supabase
        .from('vendors')
        .insert({ 
          user_id: signUpData.user.id, 
          name: name, 
          email: authCredentials.email 
        });
      if (vendorError) {
        console.error("Error creating vendor record:", vendorError);
        roleEntityError = vendorError;
        roleEntityMessage = `User account created, but failed to create vendor profile: ${vendorError.message}. Please contact support or try completing your profile later.`;
      } else {
        roleEntityMessage = "Vendor account and profile successfully created.";
      }
    } else if (role === 'delivery_partner') {
      const { error: partnerError } = await supabase
        .from('delivery_partners')
        .insert({ 
          user_id: signUpData.user.id, 
          name: name, 
          email: authCredentials.email 
        });
      if (partnerError) {
        console.error("Error creating delivery partner record:", partnerError);
        roleEntityError = partnerError;
        roleEntityMessage = `User account created, but failed to create delivery partner profile: ${partnerError.message}. Please contact support or try completing your profile later.`;
      } else {
        roleEntityMessage = "Delivery partner account and profile successfully created.";
      }
    } else {
         roleEntityMessage = "User account successfully created."; // For customer or other roles
    }

    setIsLoading(false);
    return { 
        success: !signUpError && !roleEntityError, 
        error: signUpError || roleEntityError,
        message: roleEntityMessage
    };
  };

  const logout = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const contextValue = React.useMemo(() => ({
    user, login, signUp, logout, isLoading
  }), [user, isLoading, fetchUserProfile]); // login, signUp, logout are stable

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};