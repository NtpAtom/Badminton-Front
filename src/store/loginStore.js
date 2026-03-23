import { create } from "zustand";

import { persist } from "zustand/middleware"

export const useLogin = create(persist((set) => ({
    user: null,
    token: null,
    login: (token, user) => set({
        user,
        token,

    }),
    logout: () => set({ user: null, token: null }),

}), {
    name: "login",
    storage: localStorage
}))