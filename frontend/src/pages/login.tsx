import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'
import { authService } from '@/services/auth'
import toast from 'react-hot-toast'
export default function Login() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await authService.login(formData)
      toast.success('Connexion reussie')
      const role = String(result?.user?.role || '').toLowerCase()
      if (role === 'admin') {
        router.push('/admin.html')
        return
      }

      const redirect = router.query.redirect as string || '/'
      router.push(redirect)
    } catch (error: any) { toast.error(error.response?.data?.message || 'Erreur de connexion') }
    finally { setLoading(false) }
  }
  return (
    <>
      <Head><title>Connexion - Carte Grise Express</title></Head>
      <div className="container-custom py-12 max-w-md">
        <div className="rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-white via-blue-50/40 to-white shadow-xl p-8">
          <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-transparent mb-2">Connexion sécurisée</h1>
          <p className="text-center text-slate-600 font-medium mb-8">Accédez à votre compte CarteGrise France</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="📧 Email" type="email" required placeholder="votre@email.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <Input label="🔐 Mot de passe" type="password" required placeholder="Minimum 6 caractères" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            <Button type="submit" loading={loading} variant="primary" className="w-full" size="md">Connexion</Button>
          </form>
          <div className="mt-6 border-t-2 border-slate-100 pt-6 space-y-3 text-center">
            <p className="text-slate-700">Pas encore de compte ? <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition">S'inscrire</Link></p>
            <p className="text-sm text-slate-600"><Link href="/forgot-password" className="text-blue-600 hover:text-blue-700 hover:underline transition font-medium">❓ Mot de passe oublié ?</Link></p>
            <p className="text-sm text-slate-600"><Link href="/resend-verification" className="text-blue-600 hover:text-blue-700 hover:underline transition font-medium">📨 Renvoyer l'email de vérification</Link></p>
          </div>
        </div>
      </div>
    </>
  )
}