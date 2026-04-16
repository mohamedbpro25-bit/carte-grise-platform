import React, { memo, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { authService } from '@/services/auth'

function Header() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')

  const refreshAuthState = useCallback(() => {
    const isAuthenticated = authService.isAuthenticated()
    setIsLoggedIn(isAuthenticated)
    const user = authService.getCurrentUser()
    if (user && isAuthenticated) {
      setUserName(user.firstName)
      setUserRole(String(user.role || '').toLowerCase())
    } else {
      setUserName('')
      setUserRole('')
    }
  }, [])

  useEffect(() => {
    refreshAuthState()

    const onAuthChanged = () => refreshAuthState()
    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key === 'token' || event.key === 'user') {
        refreshAuthState()
      }
    }

    window.addEventListener(authService.AUTH_CHANGED_EVENT, onAuthChanged)
    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener(authService.AUTH_CHANGED_EVENT, onAuthChanged)
      window.removeEventListener('storage', onStorage)
    }
  }, [refreshAuthState])

  const handleLogout = () => {
    authService.logout()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/50 bg-gradient-to-r from-white via-blue-50/30 to-white/90 backdrop-blur-2xl shadow-sm">
      <nav className="container-custom flex flex-wrap items-center justify-between gap-4 py-4">
        <Link href="/" className="text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-blue-700 to-red-600 bg-clip-text text-transparent hover:from-blue-700 hover:via-slate-900 hover:to-red-700 transition-all">
          CertiCarte
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700">
          {userRole !== 'admin' && (
            <>
              <Link href="/simulateur" className="rounded-full px-4 py-2 hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200">Simulateur</Link>
              <Link href="/modalites" className="rounded-full px-4 py-2 hover:bg-slate-100 transition-colors duration-200">Modalités</Link>
              <Link href="/documents-papiers" className="rounded-full px-4 py-2 hover:bg-slate-100 transition-colors duration-200">Documents</Link>
              <Link href="/suivi" className="rounded-full px-4 py-2 hover:bg-slate-100 transition-colors duration-200">Suivi</Link>
              <Link href="/#avis" className="rounded-full px-4 py-2 hover:bg-red-100 hover:text-red-700 transition-colors duration-200">Avis</Link>
            </>
          )}

          {isLoggedIn ? (
            <div className="ml-2 flex items-center gap-3">
              {userRole === 'admin' ? (
                <Link href="/admin.html" className="rounded-full bg-gradient-to-r from-slate-900 to-slate-700 px-5 py-2 text-white font-medium hover:from-slate-800 hover:to-slate-600 shadow-md hover:shadow-lg transition-all">Panel admin</Link>
              ) : (
                <Link href="/dashboard" className="rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2 text-white font-medium hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all">Mon compte</Link>
              )}
              <span className="px-3 text-sm font-medium text-slate-600">Bonjour {userName}</span>
              <button onClick={handleLogout} className="rounded-full border-2 border-slate-300 px-5 py-2 text-slate-700 font-medium hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all">Déconnexion</button>
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link href="/login" className="rounded-full border-2 border-blue-600 px-5 py-2 text-blue-600 font-medium hover:bg-blue-50 transition-all">Connexion</Link>
              <Link href="/register" className="rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-6 py-2 font-semibold text-white shadow-lg hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600 shadow-blue-500/30 hover:shadow-lg transition-all">Inscription</Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}

export default memo(Header)