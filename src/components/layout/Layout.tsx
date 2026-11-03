import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { TourOverlay } from '@/components/tour/TourOverlay'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />
      <main className="flex-1"><Outlet /></main>
      <Footer />
      <TourOverlay />
    </div>
  )
}