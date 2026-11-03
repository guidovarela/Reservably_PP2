import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function RegisterPage() {
  const { signUp } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handle(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await signUp(email, password, nombre, apellido)
    setLoading(false)
    if (error) { toast(error, 'error'); return }
    toast('¡Cuenta creada! Ya podés ingresar.', 'success')
    navigate('/login')
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">Crear cuenta</h1>
      <p className="text-gray-500 mb-8">Empezá a reservar en segundos</p>
      <form onSubmit={handle} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input id="nombre" label="Nombre" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <Input id="apellido" label="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} />
        </div>
        <Input id="email" label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input id="password" label="Contraseña" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" disabled={loading} className="w-full">{loading ? 'Creando...' : 'Crear cuenta'}</Button>
      </form>
      <p className="mt-6 text-sm text-center text-gray-500">
        ¿Ya tenés cuenta? <Link to="/login" className="text-brand-500 font-medium">Ingresar</Link>
      </p>
    </div>
  )
}