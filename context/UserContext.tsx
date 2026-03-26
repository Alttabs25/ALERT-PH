import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';

const UserContext = createContext<any>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // REAL-TIME LISTENER: Any change in DB reflects instantly in the app
        const unsubscribeDoc = onSnapshot(doc(db, "users", user.uid), (doc) => {
          if (doc.exists()) {
            setUserData(doc.data());
          }
          setAuthLoading(false);
        });
        return () => unsubscribeDoc();
      } else {
        setUserData(null);
        setAuthLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  return (
    <UserContext.Provider value={{ userData, authLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);