import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'
import { authService } from '@/services/auth'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      toast.success('Si cet email existe, un lien de reinitialisation a ete envoye')
    } catch {
      toast.error('Erreur lors de la demande')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head><title>Mot de passe oublie - Carte Grise Express</title></Head>
      <div className="container-custom py-12 max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Mot de passe oublie</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" loading={loading} className="w-full">Envoyer le lien</Button>
          </form>
          <p className="text-center mt-4 text-gray-600">
            <Link href="/login" className="text-blue-600 hover:underline">Retour a la connexion</Link>
          </p>
        </div>
      </div>
    </>
  )
}