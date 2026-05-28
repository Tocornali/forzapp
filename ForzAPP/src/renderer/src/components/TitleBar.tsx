import React, { useState, useEffect } from 'react'
import { Minus, Square, Copy, X, Flame } from 'lucide-react'

export const TitleBar: React.FC = (): React.JSX.Element => {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.on('window-maximized-state', (_, state: boolean) => {
        setIsMaximized(state)
      })
    }
  }, [])

  const handleMinimize = (): void => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.send('window-minimize')
    }
  }

  const handleMaximize = (): void => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.send('window-maximize')
    }
  }

  const handleClose = (): void => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.send('window-close')
    }
  }

  return (
    <div
      className="flex h-10 w-full select-none items-center justify-between border-b border-brand-dark-border bg-brand-dark-deep px-4 text-slate-400"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left section: App Icon & Name */}
      <div className="flex items-center gap-2">
        <Flame className="h-4 w-4 text-brand-primary animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-200">
          Forza<span className="text-brand-primary">Check</span>
        </span>
      </div>

      {/* Right section: Control Buttons */}
      <div
        className="flex h-full items-center"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Minimize Button */}
        <button
          onClick={handleMinimize}
          className="flex h-full w-11 cursor-pointer items-center justify-center hover:bg-brand-dark-hover hover:text-white transition-colors"
          title="Minimizar"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        {/* Maximize / Restore Button */}
        <button
          onClick={handleMaximize}
          className="flex h-full w-11 cursor-pointer items-center justify-center hover:bg-brand-dark-hover hover:text-white transition-colors"
          title={isMaximized ? 'Restaurar' : 'Maximizar'}
        >
          {isMaximized ? (
            <Copy className="h-3 w-3 -scale-y-100 rotate-90" />
          ) : (
            <Square className="h-3 w-3" />
          )}
        </button>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="flex h-full w-11 cursor-pointer items-center justify-center hover:bg-red-650 hover:bg-red-600 hover:text-white transition-colors"
          title="Cerrar"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
