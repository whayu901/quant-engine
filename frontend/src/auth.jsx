import { createContext, useContext, useEffect, useState } from 'react'
import { api } from './api'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    (async () => {
      if (localStorage.getItem('qe_token')) {
        try { setUser(await api.me()) } catch { localStorage.removeItem('qe_token') }
      }
      setReady(true)
    })()
  }, [])

  async function login(email, password) {
    const { access_token } = await api.login(email, password)
    localStorage.setItem('qe_token', access_token)
    setUser(await api.me())
  }
  async function register(email, password, org) {
    const { access_token } = await api.register(email, password, org)
    localStorage.setItem('qe_token', access_token)
    setUser(await api.me())
  }
  function logout() { localStorage.removeItem('qe_token'); setUser(null) }

  return <Ctx.Provider value={{ user, ready, login, register, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
