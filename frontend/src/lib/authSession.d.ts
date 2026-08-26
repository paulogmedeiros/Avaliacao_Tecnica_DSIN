export type AuthUser = { id: string; name: string; role: 'CLIENT' | 'ADMIN' }
export function decodeSession(token: string): AuthUser | null
