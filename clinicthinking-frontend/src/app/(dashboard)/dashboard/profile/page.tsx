'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Mail, Building2, GraduationCap, Calendar, CheckCircle2, Brain, BarChart2, Pencil, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { INSTITUTIONS } from '@/lib/institutions'

type Profile = {
  id: string
  name: string
  email: string
  institution: string | null
  cohort_year: number | null
  created_at: string
}

type Summary = {
  total_sessions: number
  submitted_sessions: number
  bias_detections: number
  top_bias_type: string | null
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-none bg-[#2c9ca0]/8', className)} />
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-[#2c9ca0]/8 last:border-0">
      <div className="w-8 h-8 rounded-none bg-[#2c9ca0]/8 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-gray-600" />
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bento-glass-card hover-gradient-border rounded-none p-5 transition-all">
      <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      <p className="text-3xl font-bold font-serif text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [editing, setEditing]         = useState(false)
  const [saving, setSaving]           = useState(false)
  const [saveError, setSaveError]     = useState('')
  const [saveOk, setSaveOk]           = useState(false)
  const [form, setForm]               = useState({ name: '', institution: '', cohort_year: '' })
  const [customInstitution, setCustomInstitution] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('token')) router.push('/auth/login')
  }, [router])

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get<Profile>('/api/students/me')
      if (!res.success) throw new Error('unauthorized')
      return res.data
    },
    retry: false,
  })

  const { data: summary } = useQuery({
    queryKey: ['summary'],
    queryFn: async () => {
      const res = await api.get<Summary>('/api/students/me/summary')
      return res.success ? res.data : null
    },
  })

  useEffect(() => {
    if (isError) router.push('/auth/login')
  }, [isError, router])

  function openEdit() {
    if (!profile) return
    const isCustom = !!profile.institution && !INSTITUTIONS.includes(profile.institution)
    setForm({
      name:        profile.name,
      institution: profile.institution ?? '',
      cohort_year: profile.cohort_year ? String(profile.cohort_year) : '',
    })
    setCustomInstitution(isCustom)
    setSaveError('')
    setSaveOk(false)
    setEditing(true)
  }

  async function handleSave() {
    if (!profile) return
    setSaveError('')
    setSaving(true)

    const payload: Record<string, string | number> = {}
    if (form.name.trim() && form.name.trim() !== profile.name)
      payload.name = form.name.trim()
    if (form.institution.trim() !== (profile.institution ?? ''))
      payload.institution = form.institution.trim()
    if (form.cohort_year) {
      const yr = parseInt(form.cohort_year)
      if (!isNaN(yr)) payload.cohort_year = yr
    }

    const res = await api.put<Profile>('/api/students/me', payload)
    setSaving(false)
    if (!res.success) {
      setSaveError((res as { error?: { message: string } }).error?.message ?? 'Gagal menyimpan.')
      return
    }
    queryClient.setQueryData<Profile>(['profile'], res.data)
    setEditing(false)
    setSaveOk(true)
    setTimeout(() => setSaveOk(false), 3000)
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  if (isLoading) return (
    <div className="p-8 max-w-2xl mx-auto space-y-4">
      <Skeleton className="h-24 w-24 mx-auto" />
      <Skeleton className="h-6 w-48 mx-auto" />
      <Skeleton className="h-48 w-full" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    </div>
  )

  if (!profile) return null

  const initials = profile.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const completionRate = summary && summary.total_sessions > 0
    ? Math.round((summary.submitted_sessions / summary.total_sessions) * 100)
    : 0

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Akun</p>
          <h2 className="text-3xl font-serif font-bold text-gray-900">Profil Saya</h2>
        </div>
        {!editing && (
          <button
            onClick={openEdit}
            className="flex items-center gap-1.5 text-sm text-[#2c9ca0] border border-[#2c9ca0]/30 px-3 py-1.5 hover:bg-[#2c9ca0]/5 transition-colors mt-1"
          >
            <Pencil size={13} /> Edit
          </button>
        )}
      </div>

      {/* Save success */}
      {saveOk && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-4 py-3 mb-4">
          <CheckCircle2 size={14} /> Profil berhasil diperbarui.
        </div>
      )}

      {/* Avatar + name */}
      <div className="bento-glass-card rounded-none p-6 mb-4 flex items-center gap-5">
        <div className="w-16 h-16 rounded-none bg-[#2c9ca0] flex items-center justify-center shrink-0">
          <span className="text-2xl font-serif font-bold text-white">{initials}</span>
        </div>
        <div>
          <h3 className="font-serif font-bold text-xl text-gray-900 leading-tight">{profile.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">Mahasiswa Kedokteran</p>
        </div>
      </div>

      {/* View mode */}
      {!editing && (
        <div className="bento-glass-card rounded-none px-5 mb-6">
          <InfoRow icon={Mail}          label="Email"     value={profile.email} />
          <InfoRow icon={Building2}     label="Institusi" value={profile.institution ?? '-'} />
          <InfoRow icon={GraduationCap} label="Angkatan"  value={profile.cohort_year ? String(profile.cohort_year) : '-'} />
          <InfoRow icon={Calendar}      label="Bergabung" value={formatDate(profile.created_at)} />
        </div>
      )}

      {/* Edit mode */}
      {editing && (
        <div className="bento-glass-card rounded-none px-5 py-4 mb-6 space-y-4">
          <Field
            label="Nama"
            value={form.name}
            onChange={v => setForm(f => ({ ...f, name: v }))}
          />
          <Field
            label="Email"
            value={profile.email}
            disabled
            hint="Email tidak dapat diubah"
          />
          <div>
            <label className="text-xs text-gray-400 block mb-1">Institusi</label>
            <select
              value={customInstitution ? '__other__' : form.institution}
              onChange={e => {
                if (e.target.value === '__other__') {
                  setCustomInstitution(true)
                  setForm(f => ({ ...f, institution: '' }))
                } else {
                  setCustomInstitution(false)
                  setForm(f => ({ ...f, institution: e.target.value }))
                }
              }}
              className="w-full text-sm px-3 py-2.5 border border-gray-200 outline-none transition-colors bg-white/60 text-gray-800 focus:border-[#2c9ca0]/50 appearance-none"
            >
              <option value="">-- Pilih institusi --</option>
              {INSTITUTIONS.map(inst => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
              <option value="__other__">Lainnya</option>
            </select>
            {customInstitution && (
              <input
                type="text"
                value={form.institution}
                onChange={e => setForm(f => ({ ...f, institution: e.target.value }))}
                placeholder="Nama institusi"
                className="w-full text-sm px-3 py-2.5 border border-gray-200 border-t-0 outline-none transition-colors bg-white/60 text-gray-800 focus:border-[#2c9ca0]/50"
              />
            )}
          </div>
          <Field
            label="Angkatan"
            value={form.cohort_year}
            onChange={v => setForm(f => ({ ...f, cohort_year: v }))}
            placeholder="cth. 2022"
            inputMode="numeric"
          />

          {saveError && (
            <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2">{saveError}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-[#2c9ca0] hover:bg-[#217578] text-white text-sm font-medium py-2.5 transition-colors disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              onClick={() => setEditing(false)}
              disabled={saving}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5 border border-gray-200 transition-colors"
            >
              <X size={14} /> Batal
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      {summary && (
        <>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3 px-1">Statistik</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard
              label="Total Sesi"
              value={summary.total_sessions}
              sub={`${summary.submitted_sessions} selesai`}
            />
            <StatCard
              label="Tingkat Selesai"
              value={`${completionRate}%`}
              sub="dari sesi yang dimulai"
            />
          </div>

          <div className="bento-glass-card rounded-none p-5">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">Bias Klinis</p>
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-2 text-sm text-gray-700">
                <Brain size={14} className="text-gray-400" />
                Total terdeteksi
              </span>
              <span className="font-serif font-bold text-gray-900 text-lg">{summary.bias_detections}</span>
            </div>
            {summary.top_bias_type && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2c9ca0]/8">
                <span className="flex items-center gap-2 text-sm text-gray-700">
                  <BarChart2 size={14} className="text-gray-400" />
                  Bias paling sering
                </span>
                <span className="text-sm font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-none capitalize">
                  {summary.top_bias_type.replace(/_/g, ' ')}
                </span>
              </div>
            )}
            {!summary.top_bias_type && (
              <div className="flex items-center gap-2 text-xs text-emerald-600 mt-3 pt-3 border-t border-[#2c9ca0]/8">
                <CheckCircle2 size={13} /> Belum ada bias yang terdeteksi.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function Field({
  label, value, onChange, disabled, hint, placeholder, inputMode,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  disabled?: boolean
  hint?: string
  placeholder?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
}) {
  return (
    <div>
      <label className="text-xs text-gray-400 block mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        inputMode={inputMode}
        className={cn(
          'w-full text-sm px-3 py-2.5 border outline-none transition-colors bg-white/60',
          disabled
            ? 'text-gray-400 border-gray-100 cursor-not-allowed bg-gray-50/40'
            : 'text-gray-800 border-gray-200 focus:border-[#2c9ca0]/50'
        )}
      />
      {hint && <p className="text-xs text-gray-300 mt-1">{hint}</p>}
    </div>
  )
}
