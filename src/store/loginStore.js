import { create } from "zustand";
import { persist } from "zustand/middleware"

export const useLogin = create(persist((set) => ({
    user: null,
    token: null,
    login: (token, user) => set({
        user,
        token,

    }),
    updateUser: (newUser) => set((state) => ({ 
        user: { ...state.user, ...newUser } 
    })),
    logout: () => set({ user: null, token: null }),

}), {
    name: "login",
}))