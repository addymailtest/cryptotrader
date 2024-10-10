import React, { createContext, useContext, useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, updateDoc, enableIndexedDbPersistence } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBlDLkZE-53S13hU7ZV9amzHJeKCkt2iOs",
  authDomain: "addy-test-project-8d20f.firebaseapp.com",
  projectId: "addy-test-project-8d20f",
  storageBucket: "addy-test-project-8d20f.appspot.com",
  messagingSenderId: "297925151029",
  appId: "1:297925151029:web:28ffe77cd349098ab4e47c",
  measurementId: "G-LC68BWQZBH"
};

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.')
  } else if (err.code == 'unimplemented') {
    console.warn('The current browser does not support all of the features required to enable persistence')
  }
});

interface TradeHistory {
  coinId: string;
  action: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: number;
}

interface UserData {
  email: string;
  balance: number;
  portfolio: Record<string, number>;
  tradeHistory: TradeHistory[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  userData: UserData | null;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        fetchUserData(user.uid);
      } else {
        setUserData(null);
      }
    });

    return unsubscribe;
  }, []);

  const fetchUserData = async (uid: string) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      setUserData(userDoc.data() as UserData);
    }
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      balance: 10000, // Starting balance
      portfolio: {},
      tradeHistory: []
    });
  };

  const logout = () => signOut(auth);

  const updateUserData = async (data: Partial<UserData>) => {
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), data);
      setUserData((prevData) => prevData ? { ...prevData, ...data } : null);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    userData,
    updateUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};