import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/styles/globals.css'
import App from './App.tsx'

// Bootstrap the React tree at the browser entry point; feature wiring stays in App.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
