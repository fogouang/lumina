import { create } from "zustand";
import { persist } from "zustand/middleware";
import { app__modules__auth__schemas__UserResponse as UserResponse } from "@/lib/api";

interface AuthState {
  user: UserResponse | null;
  setAuth: (user: UserResponse) => void;  
  setUser: (user: UserResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      
      setAuth: (user) => {
        set({ user });
      },
      
      setUser: (user) => {
        set({ user });
      },
      
      logout: () => {
        set({ user: null });
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