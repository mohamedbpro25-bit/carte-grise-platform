import React, { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'
import { authService } from '@/services/auth'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const router = useRouter()
  const token = typeof router.query.token === 'string' ? router.query.token : ''
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      toast.error('Token manquant')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    setLoading(true)
    try {
      await authService.resetPassword(token, newPassword)
      toast.success('Mot de passe mis a jour')
      router.push('/login')
    } catch {
      toast.error('Lien invalide ou expire')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head><title>Reinitialiser mot de passe - Carte Grise Express</title></Head>
      <div className="container-custom py-12 max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Nouveau mot de passe</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nouveau mot de passe"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              label="Confirmer le mot de passe"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button type="submit" loading={loading} className="w-full">Mettre a jour</Button>
          </form>
          <p className="text-center mt-4 text-gray-600">
            <Link href="/login" className="text-blue-600 hover:underline">Retour a la connexion</Link>
          </p>
        </div>
      </div>
    </>
  )
}