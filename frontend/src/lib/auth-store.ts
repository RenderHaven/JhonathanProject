import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  email: string | null;
  setAuth: (token: string, email: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      setAuth: (token, email) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("admin_token", token);
        }
        set({ token, email });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("admin_token");
        }
        set({ token: null, email: null });
      },
    }),
    { name: "jch-admin-auth" },
  ),
);
