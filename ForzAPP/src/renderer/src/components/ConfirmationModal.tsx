import React from 'react'
import { X, AlertTriangle, Check } from 'lucide-react'
import { Language, translations } from '../translations'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  language: Language
  confirmText?: string
  cancelText?: string
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  language,
  confirmText,
  cancelText
}): React.JSX.Element | null => {
  const t = translations[language]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-brand-dark-border bg-brand-dark-card p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-brand-dark-hover hover:text-white transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-extrabold text-white tracking-tight mb-2">{title}</h2>
            <p className="text-sm text-slate-350 leading-relaxed pr-6">{message}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-brand-dark-border">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-brand-dark-border bg-brand-dark-hover/50 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-brand-dark-hover hover:text-white transition-all cursor-pointer"
          >
            {cancelText || t['CarModal.cancel']}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-primary-hover to-brand-primary px-5 py-2 text-xs font-bold text-white shadow-md shadow-brand-primary/20 hover:from-brand-primary hover:to-brand-primary-light transition-all cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>{confirmText || t['CarCard.save']}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
