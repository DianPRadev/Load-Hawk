import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface AuthModalState {
  isOpen: boolean;
  defaultMode: "login" | "signup";
  openAuthModal: (mode?: "login" | "signup") => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalState | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultMode, setDefaultMode] = useState<"login" | "signup">("login");

  const openAuthModal = useCallback((mode: "login" | "signup" = "login") => {
    setDefaultMode(mode);
    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <AuthModalContext.Provider value={{ isOpen, defaultMode, openAuthModal, closeAuthModal }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
