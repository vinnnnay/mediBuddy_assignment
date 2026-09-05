import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import App from './App'
import { theme } from './theme'
import '@mantine/core/styles.css'
import './index.css'

const container = document.getElementById('root')

if (!container) {
  throw new Error('Root element #root was not found')
}

createRoot(container).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>,
)
