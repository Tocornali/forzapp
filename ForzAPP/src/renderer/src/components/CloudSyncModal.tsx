import React, { useState } from 'react'
import {
  Cloud,
  X,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  UploadCloud,
  DownloadCloud,
  History,
  ShieldCheck,
  Sparkles,
  Copy,
  Check
} from 'lucide-react'
import {
  getSavedSyncCode,
  getLastCloudSync,
  generateUniqueSyncCode
} from '../services/cloudSyncService'
import { Language } from '../translations'

interface CloudSyncModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (code: string) => Promise<{ success: boolean; message?: string; error?: string }>
  onImport: (code: string) => Promise<{ success: boolean; message?: string; error?: string }>
  onRestoreBackup?: () => Promise<{ success: boolean; message?: string }>
  hasSafetyBackup?: boolean
  language: Language
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  onExport,
  onImport,
  onRestoreBackup,
  hasSafetyBackup,
  language
}) => {
  const [syncCode, setSyncCode] = useState(() => getSavedSyncCode())
  const [copied, setCopied] = useState(false)
  const [loadingAction, setLoadingAction] = useState<'export' | 'import' | 'restore' | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )
  const lastSync = getLastCloudSync()

  if (!isOpen) return null

  const handleGenerateCode = (): void => {
    const newCode = generateUniqueSyncCode()
    setSyncCode(newCode)
    setFeedback(null)
  }

  const handleCopy = async (): Promise<void> => {
    if (!syncCode.trim()) return
    try {
      await navigator.clipboard.writeText(syncCode.trim())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('Failed copying to clipboard', e)
    }
  }

  const handleExport = async (): Promise<void> => {
    if (!syncCode.trim()) {
      setFeedback({
        type: 'error',
        message: language === 'es' ? 'Ingresá un código válido' : 'Please enter a valid code'
      })
      return
    }

    setLoadingAction('export')
    setFeedback(null)

    const result = await onExport(syncCode.trim())
    setLoadingAction(null)

    if (result.success) {
      setFeedback({
        type: 'success',
        message:
          result.message ||
          (language === 'es'
            ? '¡Copia de seguridad subida a la nube!'
            : 'Backup uploaded to cloud!')
      })
    } else {
      setFeedback({
        type: 'error',
        message: result.error || (language === 'es' ? 'Error al subir datos' : 'Upload error')
      })
    }
  }

  const handleImport = async (): Promise<void> => {
    if (!syncCode.trim()) {
      setFeedback({
        type: 'error',
        message: language === 'es' ? 'Ingresá un código válido' : 'Please enter a valid code'
      })
      return
    }

    setLoadingAction('import')
    setFeedback(null)

    const result = await onImport(syncCode.trim())
    setLoadingAction(null)

    if (result.success) {
      setFeedback({
        type: 'success',
        message:
          result.message ||
          (language === 'es'
            ? '¡Datos recuperados con éxito en este dispositivo!'
            : 'Data restored successfully!')
      })
    } else {
      setFeedback({
        type: 'error',
        message: result.error || (language === 'es' ? 'Error al recuperar datos' : 'Download error')
      })
    }
  }

  const handleRestore = async (): Promise<void> => {
    if (!onRestoreBackup) return
    setLoadingAction('restore')
    setFeedback(null)
    const result = await onRestoreBackup()
    setLoadingAction(null)
    if (result.success) {
      setFeedback({
        type: 'success',
        message:
          result.message ||
          (language === 'es' ? '¡Copia anterior restaurada!' : 'Previous backup restored!')
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 transition-opacity" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-3xl border border-brand-dark-border bg-brand-dark-card p-6 shadow-2xl animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-dark-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">
                {language === 'es' ? 'Copia de Seguridad & Nube' : 'Cloud Backup & Sync'}
              </h2>
              <p className="text-[11px] font-medium text-slate-400">
                {language === 'es'
                  ? 'Exportá y recuperá tus datos entre PC y Celular'
                  : 'Export & restore your data across PC and Mobile'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-brand-dark-hover hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4">
          {/* Sync Code Input with Generator & Copy */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-brand-primary" />
                <span>{language === 'es' ? 'Tu Código de Bóveda / Backup' : 'Your Vault / Backup Code'}</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateCode}
                className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                title={language === 'es' ? 'Generar código único aleatorio' : 'Generate unique random code'}
              >
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>{language === 'es' ? 'Generar nuevo' : 'Generate new'}</span>
              </button>
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                value={syncCode}
                onChange={(e) => setSyncCode(e.target.value)}
                placeholder={language === 'es' ? 'ej: turbo-apex-4892' : 'e.g. turbo-apex-4892'}
                className="w-full rounded-xl border border-brand-dark-border bg-brand-dark-input px-3.5 py-2.5 pr-20 text-sm font-semibold text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
              {syncCode && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="absolute right-2 flex items-center gap-1 rounded-lg border border-brand-dark-border bg-brand-dark-card/90 px-2 py-1 text-[11px] font-bold text-slate-300 hover:text-white hover:border-slate-500 transition-all cursor-pointer active:scale-95"
                  title={language === 'es' ? 'Copiar al portapapeles' : 'Copy to clipboard'}
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">
                        {language === 'es' ? 'Copiado' : 'Copied'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 text-slate-400" />
                      <span>{language === 'es' ? 'Copiar' : 'Copy'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Last sync timestamp */}
          {lastSync && (
            <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
              <span>{language === 'es' ? 'Último respaldo en la nube:' : 'Last cloud backup:'}</span>
              <span className="font-semibold text-cyan-300">
                {new Date(lastSync).toLocaleString()}
              </span>
            </div>
          )}

          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Export Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-brand-dark-border bg-brand-dark-deep/60 p-4">
              <div>
                <div className="flex items-center gap-2 font-bold text-white mb-1.5">
                  <UploadCloud className="h-4 w-4 text-brand-primary" />
                  <span className="text-xs">
                    {language === 'es' ? 'Subir Copia (Exportar)' : 'Upload Backup (Export)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                  {language === 'es'
                    ? 'Guarda tus autos, favoritos y tuneos actuales como la copia oficial en la nube.'
                    : 'Saves your current owned cars, garage, and tunes as the master copy in the cloud.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleExport}
                disabled={loadingAction !== null}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary-hover to-brand-primary py-2.5 text-xs font-bold text-white shadow-md shadow-brand-primary/20 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className={`h-3.5 w-3.5 ${loadingAction === 'export' ? 'animate-bounce' : ''}`} />
                <span>
                  {loadingAction === 'export'
                    ? language === 'es'
                      ? 'Subiendo...'
                      : 'Uploading...'
                    : language === 'es'
                      ? 'Subir a la Nube'
                      : 'Upload to Cloud'}
                </span>
              </button>
            </div>

            {/* Import Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-brand-dark-border bg-brand-dark-deep/60 p-4">
              <div>
                <div className="flex items-center gap-2 font-bold text-white mb-1.5">
                  <DownloadCloud className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs">
                    {language === 'es' ? 'Recuperar (Importar)' : 'Restore (Import)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                  {language === 'es'
                    ? 'Descarga la copia oficial de la nube y la aplica en este dispositivo.'
                    : 'Downloads the master cloud copy and applies it to this device.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleImport}
                disabled={loadingAction !== null}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                <DownloadCloud className={`h-3.5 w-3.5 ${loadingAction === 'import' ? 'animate-bounce' : ''}`} />
                <span>
                  {loadingAction === 'import'
                    ? language === 'es'
                      ? 'Descargando...'
                      : 'Downloading...'
                    : language === 'es'
                      ? 'Descargar de la Nube'
                      : 'Download from Cloud'}
                </span>
              </button>
            </div>
          </div>

          {/* Safety Backup Revert (if available) */}
          {hasSafetyBackup && (
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-2.5 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-medium text-[11px]">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>
                  {language === 'es'
                    ? 'Copia de seguridad local previa guardada'
                    : 'Previous safety backup saved'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRestore}
                disabled={loadingAction !== null}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 hover:text-white underline cursor-pointer disabled:opacity-50"
              >
                <History className="h-3 w-3" />
                <span>{language === 'es' ? 'Deshacer cambio' : 'Revert to previous'}</span>
              </button>
            </div>
          )}

          {/* Status Feedback */}
          {feedback && (
            <div
              className={`flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
                feedback.type === 'success'
                  ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border border-rose-500/30 bg-rose-500/10 text-rose-400'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
