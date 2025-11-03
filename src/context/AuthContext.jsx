import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [showModal, setShowModal] = useState(false);

  const openAuthModal = () => setShowModal(true);
  const closeAuthModal = () => setShowModal(false);

  return (
    <AuthContext.Provider value={{ showModal, openAuthModal, closeAuthModal }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}