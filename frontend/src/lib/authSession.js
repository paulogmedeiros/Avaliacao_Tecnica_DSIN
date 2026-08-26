export function decodeSession(token) {
  try {
    const payload = JSON.parse(BufferFromBase64Url(token.split('.')[1]))
    if (!payload.sub || !payload.username || !['CLIENT', 'ADMIN'].includes(payload.role)) return null
    return { id: payload.sub, name: payload.username, role: payload.role }
  } catch { return null }
}

function BufferFromBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(normalized)
  return decodeURIComponent([...binary].map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''))
}
