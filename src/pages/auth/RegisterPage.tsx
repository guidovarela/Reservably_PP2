import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface FormState {
  nombre: string
  apellido: string
  email: string
  telefono: string
  fecha_nacimiento: string
  password: string
  confirmPassword: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const INITIAL_FORM: FormState = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  fecha_nacimiento: '',
  password: '',
  confirmPassword: '',
}

function getTodayLocalDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function validateForm(form: FormState, today: string): FormErrors {
  const errors: FormErrors = {}
  if (!form.nombre.trim()) errors.nombre = 'El nombre es obligatorio.'

  const email = form.email.trim()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Ingresá un email válido.'
  }

  const tel = form.telefono.trim()
  if (tel) {
    const digits = tel.replace(/\D/g, '')
    if (!/^[+\d\s()-]{6,20}$/.test(tel) || digits.length < 6) {
      errors.telefono = 'Ingresá un teléfono válido (mínimo 6 dígitos).'
    }
  }

  if (form.fecha_nacimiento && form.fecha_nacimiento > today) {
    errors.fecha_nacimiento = 'La fecha de nacimiento no puede ser futura.'
  }

  if (form.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres.'
  }

  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Las contraseñas no coinciden.'
  }

  return errors
}

export default function RegisterPage() {
  const { signUp, session, profile, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const today = getTodayLocalDate()

  if (!authLoading && !submitting && session && profile) {
    const panel =
      profile.rol === 'dueno' || profile.rol === 'admin'
        ? '/dueno'
        : profile.rol === 'staff'
          ? '/staff'
          : '/cliente'
    return <Navigate to={panel} replace />
  }

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  async function handle(e: FormEvent) {
    e.preventDefault()
    const validationErrors = validateForm(form, today)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)
    const { error, requiresEmailConfirmation } = await signUp({
      nombre: form.nombre,
      apellido: form.apellido,
      email: form.email,
      telefono: form.telefono,
      fecha_nacimiento: form.fecha_nacimiento,
      preferencias: null,
      foto_url: null,
      password: form.password,
    })
    setSubmitting(false)

    if (error) {
      toast(error, 'error')
      return
    }

    if (requiresEmailConfirmation) {
      toast('¡Cuenta creada! Revisá tu correo para confirmar tu cuenta.', 'info')
      navigate('/login', { replace: true })
      return
    }

    toast('¡Cuenta creada! Ya podés reservar tu turno.', 'success')
    navigate('/cliente', { replace: true })
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">Crear cuenta</h1>
      <p className="text-gray-500 mb-8">Registrate como cliente para reservar en segundos</p>
      <form onSubmit={handle} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="nombre"
            label="Nombre *"
            autoComplete="given-name"
            required
            placeholder="Ej: Juan"
            value={form.nombre}
            error={errors.nombre}
            onChange={(e) => updateField('nombre', e.target.value)}
          />
          <Input
            id="apellido"
            label="Apellido"
            autoComplete="family-name"
            placeholder="Ej: Pérez"
            value={form.apellido}
            error={errors.apellido}
            onChange={(e) => updateField('apellido', e.target.value)}
          />
        </div>
        <Input
          id="email"
          label="Email *"
          type="email"
          autoComplete="email"
          required
          placeholder="tu@email.com"
          value={form.email}
          error={errors.email}
          onChange={(e) => updateField('email', e.target.value)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="telefono"
            label="Teléfono"
            type="tel"
            autoComplete="tel"
            placeholder="Ej: 11 5544-3322"
            value={form.telefono}
            error={errors.telefono}
            onChange={(e) => updateField('telefono', e.target.value)}
          />
          <Input
            id="fecha_nacimiento"
            label="Fecha de nacimiento"
            type="date"
            max={today}
            value={form.fecha_nacimiento}
            error={errors.fecha_nacimiento}
            onChange={(e) => updateField('fecha_nacimiento', e.target.value)}
          />
        </div>
        <Input
          id="password"
          label="Contraseña *"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="Mínimo 6 caracteres"
          value={form.password}
          error={errors.password}
          onChange={(e) => updateField('password', e.target.value)}
        />
        <Input
          id="confirmPassword"
          label="Confirmar contraseña *"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="Repetí tu contraseña"
          value={form.confirmPassword}
          error={errors.confirmPassword}
          onChange={(e) => updateField('confirmPassword', e.target.value)}
        />
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Creando...' : 'Crear cuenta'}
        </Button>
      </form>
      <p className="mt-6 text-sm text-center text-gray-500">
        ¿Ya tenés cuenta? <Link to="/login" className="text-brand-500 font-medium">Ingresar</Link>
      </p>
    </div>
  )
}