import { createContext, useContext, useEffect, useState } from "react";
import { auth, provider } from "../services/firebase";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed:", currentUser?.email || "No user");
      setUser(currentUser);
      setLoading(false);
    });

    // Handle redirect result when user comes back from redirect flow
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log("Redirect result successful:", result.user.email);
          setUser(result.user);
        }
      } catch (error) {
        console.error("Redirect result error:", error);
      }
    };

    handleRedirectResult();
    return () => unsubscribe();
  }, []);

  // Email + Password login
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Email + Password register
  const register = (email, password) => {
    return createUserWithEmailAndPassword(auth, password);
  };

  // Google login with better error handling
  const loginWithGoogle = async () => {
    try {
      console.log("Starting Google login with popup...");
      
      // Configure provider with additional settings
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      console.log("Google login successful:", result.user.email);
      return result;
      
    } catch (error) {
      const code = error?.code;
      console.error("Google login popup failed:", code, error.message);

      // Handle specific popup errors with redirect fallback
      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/network-request-failed'
      ) {
        console.log("Popup failed, attempting redirect...");
        try {
          // Use redirect as fallback
          await signInWithRedirect(auth, provider);
          return null; // Redirect will handle the result
        } catch (redirectError) {
          console.error("Redirect also failed:", redirectError);
          throw redirectError;
        }
      }

      // Re-throw other errors
      throw error;
    }
  };

  // Logout
  const logout = () => {
    return signOut(auth);
  };

  const value = {
    user,
    login,
    register,
    loginWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
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