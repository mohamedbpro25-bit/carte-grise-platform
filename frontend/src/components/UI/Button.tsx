import React, { ReactNode } from 'react'
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' | 'outline' | 'danger'; size?: 'sm' | 'md' | 'lg'; loading?: boolean; children: React.ReactNode }
export default function Button({ variant = 'primary', size = 'md', loading = false, children, className = '', disabled, ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:via-blue-600 hover:to-cyan-500 hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg shadow-slate-900/20 hover:from-slate-800 hover:to-slate-900 hover:shadow-xl',
    outline: 'border-2 border-blue-500 text-blue-600 font-semibold hover:bg-blue-50 hover:border-blue-600 hover:text-blue-700 shadow-sm hover:shadow-md',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30 hover:from-red-700 hover:to-red-800 hover:shadow-xl'
  }
  const sizes = { sm: 'px-5 py-2 text-sm', md: 'px-6 py-3 text-base', lg: 'px-8 py-4 text-lg' }
  return (
    <button className={`${variants[variant]} ${sizes[size]} rounded-full font-semibold transition duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed ${className}`} disabled={disabled || loading} {...props}>
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Chargement...</span>
        </div>
      ) : children}
    </button>
  )
}