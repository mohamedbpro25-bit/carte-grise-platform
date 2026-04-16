import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'
import { authService } from '@/services/auth'
import toast from 'react-hot-toast'
export default function Register() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '', address: '' })
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) { toast.error('Les mots de passe ne correspondent pas'); return }
    setLoading(true)
    try {
      const { confirmPassword, ...data } = formData
      const response = await authService.register(data)
      toast.success(response?.message || 'Inscription reussie')
      router.push(response?.user ? '/dashboard' : '/login')
    } catch (error) { toast.error((error as any)?.response?.data?.message || 'Erreur d\'inscription') }
    finally { setLoading(false) }
  }
  return (
    <>
      <Head><title>Inscription - CertiCarte</title></Head>
      <div className="container-custom py-12 max-w-md">
        <div className="rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-white via-blue-50/40 to-white shadow-xl p-8">
          <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-transparent mb-2">Votre compte CertiCarte</h1>
          <p className="text-center text-slate-600 font-medium mb-8">Inscrivez-vous en 2 minutes pour gérer vos démarches</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Prénom" required placeholder="Jean" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
              <Input label="Nom" required placeholder="Dupont" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
            </div>
            <Input label="📧 Email" type="email" required placeholder="votre@email.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <Input label="☎️ Téléphone" type="tel" required placeholder="+33 6 00 00 00 00" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            <Input label="🏠 Adresse" required placeholder="12 rue de Paris, 75001 Paris" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
            <Input label="🔐 Mot de passe" type="password" required placeholder="Minimum 6 caractères" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            <Input label="Confirmer le mot de passe" type="password" required placeholder="Répétez votre mot de passe" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
            <Button type="submit" loading={loading} variant="primary" className="w-full" size="md">Créer mon compte</Button>
          </form>
          <div className="mt-6 border-t-2 border-slate-100 pt-6 text-center">
            <p className="text-slate-700">Vous avez déjà un compte ? <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition">Se connecter</Link></p>
          </div>
        </div>
      </div>
    </>
  )
}