import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { decodeSession, type AuthUser } from '../lib/authSession.js'

type AuthStore = { accessToken: string | null; user: AuthUser | null; setToken: (token: string) => boolean; logout: () => void }
export const useAuthStore = create<AuthStore>()(persist((set) => ({
  accessToken: null, user: null,
  setToken: (accessToken) => { const user = decodeSession(accessToken); if (!user) return false; set({ accessToken, user }); return true },
  logout: () => set({ accessToken: null, user: null }),
}), { name: 'leila-auth-v1', partialize: ({ accessToken, user }) => ({ accessToken, user }) }))
