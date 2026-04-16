import React from 'react'
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string }
export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>}
      <input className={`w-full px-5 py-3 border-2 rounded-xl bg-white/95 text-slate-900 placeholder:text-slate-400 shadow-sm transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white outline-none font-medium ${error ? 'border-red-400' : 'border-slate-300'} ${className}`} {...props} />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}