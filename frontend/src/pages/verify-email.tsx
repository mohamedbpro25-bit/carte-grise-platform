import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { authService } from '@/services/auth'

export default function VerifyEmailPage() {
  const router = useRouter()
  const [message, setMessage] = useState('Verification en cours...')

  useEffect(() => {
    const run = async () => {
      const token = typeof router.query.token === 'string' ? router.query.token : ''
      if (!token) {
        setMessage('Token de verification manquant')
        return
      }

      try {
        await authService.verifyEmail(token)
        setMessage('Email verifie avec succes. Vous pouvez maintenant vous connecter.')
      } catch {
        setMessage('Lien de verification invalide ou expire.')
      }
    }
    if (router.isReady) run()
  }, [router])

  return (
    <>
      <Head><title>Verification email - CertiCarte</title></Head>
      <div className="container-custom py-12 max-w-xl">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Verification email</h1>
          <p className="text-gray-700 mb-6">{message}</p>
          <Link href="/login" className="text-blue-600 hover:underline">Aller a la connexion</Link>
        </div>
      </div>
    </>
  )
}