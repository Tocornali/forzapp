import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { liveUpdateService } from './services/liveUpdateService'

// Notify native updater that app loaded successfully (prevents auto-rollback)
liveUpdateService.notifyAppReady()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
