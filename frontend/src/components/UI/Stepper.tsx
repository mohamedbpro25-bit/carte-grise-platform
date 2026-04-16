import React from 'react'
import { CheckIcon } from '@heroicons/react/24/solid'
interface StepperProps { steps: string[]; currentStep: number }
export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center gap-3 min-w-max mt-5">
        {steps.map((step, index) => {
          const isCompleted = index + 1 < currentStep
          const isCurrent = index + 1 === currentStep
          return (
            <div key={index} className="flex items-center gap-2.5">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow transition-all transform ${isCompleted ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white scale-100' : isCurrent ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white scale-105 ring-2 ring-blue-200' : 'bg-slate-200 text-slate-600 scale-100'}`}>
                  {isCompleted ? <CheckIcon className="w-4 h-4" /> : <span>{index + 1}</span>}
                </div>
                <span className="mt-1.5 text-[10px] text-center uppercase tracking-wide font-bold max-w-[72px]" style={{color: isCurrent ? '#0066cc' : isCompleted ? '#059669' : '#64748b'}}>{step}</span>
              </div>
              {index < steps.length - 1 && <div className={`h-1 flex-1 rounded-full transition-all ${index + 1 < currentStep ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-slate-300'}`} style={{minWidth: '34px'}} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}