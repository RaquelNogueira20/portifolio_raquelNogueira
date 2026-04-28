import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  onSnapshot,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  query as firestoreQuery,
  orderBy
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { toast } from 'sonner';

interface SearchHistoryItem {
  query: string;
  type: 'username' | 'email' | 'phone';
  timestamp: number;
}

export interface MonitoredList {
  id: string;
  name: string;
  createdAt: number;
  contactCount: number;
}

export interface MonitoredContact {
  id: string;
  query: string;
  type: 'username' | 'email' | 'phone';
  lastChecked: number;
  status: 'active' | 'updated' | 'archived';
  lastUpdateDetails?: string;
}

interface UserPreferences {
  lastSearches: SearchHistoryItem[];
  favoriteFilters: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  preferences: UserPreferences | null;
  lists: MonitoredList[];
  login: () => Promise<void>;
  logout: () => Promise<void>;
  saveSearch: (query: string, type: 'username' | 'email' | 'phone') => Promise<void>;
  createList: (name: string) => Promise<string>;
  deleteList: (listId: string) => Promise<void>;
  addContactToList: (listId: string, contactQuery: string, type: 'username' | 'email' | 'phone') => Promise<void>;
  getContactsInList: (listId: string) => Promise<MonitoredContact[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [lists, setLists] = useState<MonitoredList[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Listen to user preferences in Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        // Initialize user doc if it doesn't exist
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          const initialPrefs: UserPreferences = {
            lastSearches: [],
            favoriteFilters: []
          };
          await setDoc(userDocRef, initialPrefs);
        }

        // Real-time listener for preferences
        const unsubPrefs = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setPreferences(doc.data() as UserPreferences);
          }
        }, (error) => {
          console.error("Firestore Error:", error);
        });

        // Real-time listener for lists
        const listsRef = collection(db, 'users', currentUser.uid, 'lists');
        const q = firestoreQuery(listsRef, orderBy('createdAt', 'desc'));
        const unsubLists = onSnapshot(q, (snapshot) => {
          const listsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as MonitoredList[];
          setLists(listsData);
        });

        return () => {
          unsubPrefs();
          unsubLists();
        };
      } else {
        setPreferences(null);
        setLists([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Login realizado com sucesso!");
    } catch (error: any) {
      console.error("Login Error:", error);
      toast.error("Erro ao fazer login com Google.");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success("Logout realizado.");
    } catch (error: any) {
      console.error("Logout Error:", error);
      toast.error("Erro ao fazer logout.");
    }
  };

  const saveSearch = async (query: string, type: 'username' | 'email' | 'phone') => {
    if (!user) return;

    const newItem: SearchHistoryItem = {
      query,
      type,
      timestamp: Date.now()
    };

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const currentPrefs = preferences || { lastSearches: [], favoriteFilters: [] };
      
      const updatedSearches = [
        newItem,
        ...currentPrefs.lastSearches.filter(s => !(s.query === query && s.type === type))
      ].slice(0, 10);

      await updateDoc(userDocRef, {
        lastSearches: updatedSearches
      });
    } catch (error) {
      console.error("Save Search Error:", error);
    }
  };

  const createList = async (name: string) => {
    if (!user) throw new Error("User not authenticated");
    const listsRef = collection(db, 'users', user.uid, 'lists');
    const docRef = await addDoc(listsRef, {
      name,
      createdAt: Date.now(),
      contactCount: 0
    });
    toast.success(`Lista "${name}" criada!`);
    return docRef.id;
  };

  const deleteList = async (listId: string) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'lists', listId);
    await deleteDoc(docRef);
    toast.success("Lista removida.");
  };

  const addContactToList = async (listId: string, contactQuery: string, type: 'username' | 'email' | 'phone') => {
    if (!user) return;
    const contactsRef = collection(db, 'users', user.uid, 'lists', listId, 'contacts');
    
    // Check if already exists
    // (Simplification: just add it)
    await addDoc(contactsRef, {
      query: contactQuery,
      type,
      lastChecked: Date.now(),
      status: 'active'
    });

    // Update count
    const listRef = doc(db, 'users', user.uid, 'lists', listId);
    const listDoc = await getDoc(listRef);
    if (listDoc.exists()) {
      await updateDoc(listRef, {
        contactCount: (listDoc.data().contactCount || 0) + 1
      });
    }

    toast.success(`"${contactQuery}" adicionado à lista.`);
  };

  const getContactsInList = async (listId: string) => {
    if (!user) return [];
    const contactsRef = collection(db, 'users', user.uid, 'lists', listId, 'contacts');
    const q = firestoreQuery(contactsRef, orderBy('lastChecked', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MonitoredContact[];
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      preferences, 
      lists, 
      login, 
      logout, 
      saveSearch,
      createList,
      deleteList,
      addContactToList,
      getContactsInList
    }}>
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
