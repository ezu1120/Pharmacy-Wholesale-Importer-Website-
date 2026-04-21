import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import useAuthStore from '../store/authStore'

const schema = z.object({
  fullName:        z.string().min(2, 'Full name required'),
  email:           z.string().email('Valid email required'),
  password:        z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export default function Register() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || null
  const { setAuth } = useAuthStore()
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: (data) => api.post('/auth/register', { fullName: data.fullName, email: data.email, password: data.password }).then(r => r.data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken)
      navigate(redirect || '/portal')
    },
  })

  const fields = [
    { name: 'fullName',        label: 'Full Name',        type: 'text',     placeholder: 'Dr. Jane Smith' },
    { name: 'email',           label: 'Email Address',    type: 'email',    placeholder: 'you@company.com' },
    { name: 'password',        label: 'Password',         type: 'password', placeholder: '••••••••', hint: 'Minimum 8 characters' },
    { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 signature-gradient rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>medication</span>
            </div>
            <span className="font-bold text-xl text-gray-900">PharmaLink Pro</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500">Join PharmaLink to manage your RFQs and track orders</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-5">
            {fields.map(f => (
              <div key={f.name}>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">{f.label}</label>
                <input {...register(f.name)} type={f.type} placeholder={f.placeholder} className="input-field" />
                {f.hint && !errors[f.name] && <p className="text-xs text-gray-400 mt-1">{f.hint}</p>}
                {errors[f.name] && <p className="text-xs text-red-500 mt-1">{errors[f.name].message}</p>}
              </div>
            ))}

            {mutation.isError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                Registration failed. This email may already be in use.
              </div>
            )}

            <button type="submit" disabled={mutation.isPending} className="w-full btn-primary justify-center py-2.5 text-sm disabled:opacity-60">
              {mutation.isPending ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
