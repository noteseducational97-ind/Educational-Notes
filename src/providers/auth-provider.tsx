
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { syncGuestWatchlist } from '@/lib/firebase/resources';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isEditor: boolean;
}

export const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isAdmin: false, isEditor: false });

const GUEST_WATCHLIST_KEY = 'guest-watchlist';
const ADMIN_EMAIL = 'noteseducational97@gmail.com';
const EDITOR_EMAIL = 'shreecoachingclasses@gmail.com';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        setIsAdmin(user.email === ADMIN_EMAIL);
        setIsEditor(user.email === EDITOR_EMAIL);

        // Check for and sync guest watchlist
        const guestWatchlistJSON = localStorage.getItem(GUEST_WATCHLIST_KEY);
        if (guestWatchlistJSON) {
          const guestResourceIds = JSON.parse(guestWatchlistJSON);
          if (Array.isArray(guestResourceIds) && guestResourceIds.length > 0) {
            try {
              await syncGuestWatchlist(user.uid, guestResourceIds);
              localStorage.removeItem(GUEST_WATCHLIST_KEY); // Clear after syncing
              toast({
                title: 'Watchlist Synced',
                description: 'Your saved items have been synced to your account.',
              });
              // Optionally, trigger a re-fetch or state update on watchlist pages
              window.dispatchEvent(new Event('watchlistUpdated'));
            } catch (error) {
              console.error("Failed to sync guest watchlist", error);
              toast({
                variant: 'destructive',
                title: 'Sync Failed',
                description: 'Could not sync all of your saved items. Please try again.',
              });
            }
          }
        }

      } else {
        setIsAdmin(false);
        setIsEditor(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  return <AuthContext.Provider value={{ user, loading, isAdmin, isEditor }}>{children}</AuthContext.Provider>;
};
