import { Analytics } from '@vercel/analytics/react'
import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/bricolage-grotesque'
import './index.css'
import App from './App.jsx'

// Console prenotazioni: caricata a parte, così non pesa sul sito. L'URL è servito da index.html via vercel.json
// oxlint-disable-next-line react/only-export-components -- file d'ingresso, il fast refresh qui non serve
const Bookings = lazy(() => import('./pages/Bookings.jsx'))
const isBookings = window.location.pathname.replace(/\/$/, '') === '/bookings'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isBookings ? (
      <Suspense>
        <Bookings />
      </Suspense>
    ) : (
      <>
        <App />
        <Analytics />
      </>
    )}
  </StrictMode>,
)
