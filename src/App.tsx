import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { TourProvider } from '@/contexts/TourContext'
import { ToastProvider } from '@/components/ui/Toast'
import { AppRouter } from '@/router'

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <TourProvider>
            <AppRouter />
          </TourProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}