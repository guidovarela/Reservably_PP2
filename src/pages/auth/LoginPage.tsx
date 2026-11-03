import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const { signIn } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handle(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) { toast(error, 'error'); return }
    toast('¡Bienvenido!', 'success')
    navigate(from, { replace: true })
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">Ingresar</h1>
      <p className="text-gray-500 mb-8">Accedé a tu panel de reservas</p>
      <form onSubmit={handle} className="space-y-4">
        <Input id="email" label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input id="password" label="Contraseña" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" disabled={loading} className="w-full">{loading ? 'Ingresando...' : 'Ingresar'}</Button>
      </form>
      <p className="mt-6 text-sm text-center text-gray-500">
        ¿No tenés cuenta? <Link to="/register" className="text-brand-500 font-medium">Crear una</Link>
      </p>
    </div>
  )
}