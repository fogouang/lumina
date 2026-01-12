import { create } from "zustand";
import { persist } from "zustand/middleware";
import { app__modules__auth__schemas__UserResponse as UserResponse } from "@/lib/api";

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  setAuth: (user: UserResponse) => void;  
  setUser: (user: UserResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      setAuth: (user) => {  //cookies gérés automatiquement
        set({
          user,
          isAuthenticated: true,
        });
      },
      
      setUser: (user) => {
        set({ user });
      },
      
      logout: () => {
        // Cookies supprimés par le backend via /logout
        set({
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);