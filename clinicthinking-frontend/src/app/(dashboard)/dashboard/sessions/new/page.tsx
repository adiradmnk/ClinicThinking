'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { ChevronLeft, Sparkles, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

type Case = {
  id: string
  case_id: string
  title: string
  difficulty: string
  station_duration_minutes: number
  system_code: string
  system_name: string
}

type SCTItem = {
  id: string
  item_id: string
  scenario_addition: string
  hypothesis_tested: string
  rationale: string
}

type CaseDetail = Case & { sct_items: SCTItem[] }

const DIFFICULTIES = [
  { value: 'basic',        label: 'Dasar',    desc: 'Kasus fundamental, cocok untuk pemula' },
  { value: 'intermediate', label: 'Menengah', desc: 'Presentasi klinis yang lebih kompleks' },
  { value: 'advanced',     label: 'Lanjut',   desc: 'Kasus dengan ambiguitas tinggi' },
] as const

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-none bg-[#2c9ca0]/8', className)} />
}

export default function NewSessionPage() {
  const router = useRouter()

  const [systems, setSystems]     = useState<{ code: string; name: string }[]>([])
  const [system, setSystem]       = useState('')
  const [difficulty, setDifficulty] = useState<string>('')
  const [loading, setLoading]     = useState(true)
  const [starting, setStarting]   = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }

    api.get<Case[]>('/api/cases?limit=100').then(res => {
      if (res.success && res.data.length > 0) {
        const unique = Array.from(
          new Map(res.data.map(c => [c.system_code, c.system_name])).entries()
        ).map(([code, name]) => ({ code, name }))
        setSystems(unique)
      }
      setLoading(false)
    })
  }, [router])

  const canStart = system !== '' && difficulty !== ''

  async function handleStart() {
    if (!canStart) return
    setError('')
    setStarting(true)

    //fetch matching case (fallback to seed)
    const params = new URLSearchParams({ system, difficulty, limit: '100' })
    const res = await api.get<Case[]>(`/api/cases?${params}`)

    if (!res.success || res.data.length === 0) {
      setError('Belum ada kasus untuk kombinasi ini. Coba sistem atau tingkat kesulitan lain.')
      setStarting(false)
      return
    }

    //choose random case
    const pool = res.data
    const picked = pool[Math.floor(Math.random() * pool.length)]

    //fetch full case detail to get sct items
    const detailRes = await api.get<CaseDetail>(`/api/cases/${picked.id}`)
    const sctItems = detailRes.success ? (detailRes.data.sct_items ?? []) : []

    const sessionRes = await api.post<{ id: string }>('/api/sessions', { case_id: picked.id })
    if (!sessionRes.success) {
      setError('Gagal memulai sesi. Coba lagi.')
      setStarting(false)
      return
    }

    sessionStorage.setItem('active_case', JSON.stringify({
      id: picked.id,
      title: picked.title,
      duration: picked.station_duration_minutes,
      sct_items: sctItems,
    }))

    router.push(`/session/${sessionRes.data.id}`)
  }

  return (
    <div className="p-6 md:p-8 max-w-xl mx-auto">
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#2c9ca0] mb-8 transition-colors"
      >
        <ChevronLeft size={15} /> Dashboard
      </button>

      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Sesi Baru</p>
        <h2 className="text-2xl font-serif font-bold text-gray-900">Konfigurasi Sesi</h2>
        <p className="text-sm text-gray-500 mt-1">
          Tentukan parameter kasus yang ingin kamu latih.
        </p>
      </div>

      <div className="space-y-5">

        {/* Sistem organ */}
        <div className="bento-glass-card rounded-none p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Sistem Organ</p>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-3/4" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {systems.map(s => (
                <button
                  key={s.code}
                  onClick={() => setSystem(system === s.code ? '' : s.code)}
                  className={cn(
                    'px-3 py-2 rounded-none text-sm font-medium transition-all border',
                    system === s.code
                      ? 'bg-[#2c9ca0] text-white border-[#2c9ca0] shadow-sm'
                      : 'bg-white/50 text-gray-700 border-white/60 hover:bg-white/80 hover:text-[#2c9ca0]'
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tingkat kesulitan */}
        <div className="bento-glass-card rounded-none p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Tingkat Kesulitan</p>
          <div className="space-y-2">
            {DIFFICULTIES.map(d => (
              <button
                key={d.value}
                onClick={() => setDifficulty(difficulty === d.value ? '' : d.value)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 rounded-none text-left transition-all border',
                  difficulty === d.value
                    ? 'bg-[#2c9ca0] text-white border-[#2c9ca0] shadow-sm'
                    : 'bg-white/50 border-white/60 text-gray-700 hover:bg-white/80 hover:text-[#2c9ca0]'
                )}
              >
                <span className="text-sm font-medium">{d.label}</span>
                <span className={cn(
                  'text-xs',
                  difficulty === d.value ? 'text-white/70' : 'text-gray-400'
                )}>
                  {d.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Brief to AI */}
        <div className="bento-glass-card rounded-none p-5 opacity-60">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400">Brief ke AI</p>
            <span className="flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-[#2c9ca0]/8 px-2 py-0.5 rounded-none">
              <Lock size={9} /> Segera hadir
            </span>
          </div>
          <textarea
            disabled
            placeholder="Contoh: fokus pada pasien lansia dengan komorbiditas, tekanan darah tidak stabil..."
            className="w-full h-24 bg-white/40 rounded-none p-3 text-sm text-gray-400 placeholder:text-[#2c9ca0]/25 outline-none resize-none cursor-not-allowed"
          />
          <p className="text-xs text-gray-300 mt-2 flex items-center gap-1">
            <Sparkles size={10} />
            Briefing akan memandu AI dalam membuat kasus yang lebih spesifik.
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-rose-500 bg-rose-50 px-4 py-3 rounded-none">{error}</p>
        )}

        {/* CTA */}
        <button
          onClick={handleStart}
          disabled={!canStart || starting}
          className={cn(
            'w-full py-3.5 rounded-none font-serif font-semibold text-base transition-all',
            canStart && !starting
              ? 'bg-[#2c9ca0] text-white hover:bg-[#217578] hover:scale-[1.01] shadow-sm'
              : 'bg-[#2c9ca0]/20 text-gray-400 cursor-not-allowed'
          )}
        >
          {starting ? 'Menyiapkan sesi...' : 'Mulai Sesi'}
        </button>

        {!canStart && (
          <p className="text-xs text-center text-gray-300">
            Pilih sistem organ dan tingkat kesulitan untuk melanjutkan.
          </p>
        )}
      </div>
    </div>
  )
}
