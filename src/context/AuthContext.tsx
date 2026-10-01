import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, signInWithPopup, signOut, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfileData } from '../types/interview';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userProfile: UserProfileData | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  updateUserPreferences: (prefs: Partial<UserProfileData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadOrCreateUserProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadOrCreateUserProfile = async (currentUser: User) => {
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile({
          userId: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || data.displayName || 'Candidate',
          targetRole: data.targetRole || 'Full Stack Engineer',
          targetDomain: data.targetDomain || 'tech',
          seniority: data.seniority || 'Mid-Level',
          totalInterviews: data.totalInterviews ?? 0,
          averageScore: data.averageScore ?? 0,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
        });
      } else {
        // Create initial user profile
        const initialProfile = {
          userId: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || 'Candidate',
          targetRole: 'Full Stack Engineer',
          targetDomain: 'tech',
          seniority: 'Mid-Level',
          totalInterviews: 0,
          averageScore: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userDocRef, initialProfile);
        setUserProfile({
          userId: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || 'Candidate',
          targetRole: 'Full Stack Engineer',
          targetDomain: 'tech',
          seniority: 'Mid-Level',
          totalInterviews: 0,
          averageScore: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Error loading user profile:', err);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign-In failed', error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign-out failed', error);
    }
  };

  const updateUserPreferences = async (prefs: Partial<UserProfileData>) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...prefs,
        updatedAt: serverTimestamp(),
      });
      setUserProfile((prev) => (prev ? { ...prev, ...prefs } : null));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userProfile,
        signInWithGoogle,
        signOutUser,
        updateUserPreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
