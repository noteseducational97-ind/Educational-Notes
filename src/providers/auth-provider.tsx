
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { syncGuestWatchlist } from '@/lib/firebase/resources';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isAdmin: false });

const GUEST_WATCHLIST_KEY = 'guest-watchlist';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Check for admin status from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().isAdmin === true) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }

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
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  return <AuthContext.Provider value={{ user, loading, isAdmin }}>{children}</AuthContext.Provider>;
};
