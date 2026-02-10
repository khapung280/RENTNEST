import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Debug logging
console.log('🚀 main.jsx loaded')
console.log('Root element:', document.getElementById('root'))

// Verify root element exists
const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('❌ Root element not found!')
  document.body.innerHTML = '<div style="padding: 20px; text-align: center; font-family: Arial;"><h1 style="color: red;">Error: Root element not found</h1><p>Make sure index.html has a div with id="root"</p></div>'
} else {
  console.log('✅ Root element found, rendering app...')
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    )
    console.log('✅ App rendered successfully')
  } catch (error) {
    console.error('❌ Error rendering app:', error)
    rootElement.innerHTML = `<div style="padding: 20px; text-align: center; font-family: Arial;"><h1 style="color: red;">Error Rendering App</h1><p style="color: #666;">${error.message}</p><pre style="text-align: left; background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto;">${error.stack}</pre></div>`
  }
}
