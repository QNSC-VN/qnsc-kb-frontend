import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './auth/AuthProvider'
import DialogProvider from './components/ui/DialogProvider'
import { LanguageProvider } from './i18n/LanguageProvider'
import { ThemeProvider } from './theme/ThemeProvider'

function App() {
  return (
    <ThemeProvider><BrowserRouter>
      <LanguageProvider><AuthProvider><DialogProvider><AppRoutes /></DialogProvider></AuthProvider></LanguageProvider>
    </BrowserRouter></ThemeProvider>
  )
}

export default App
