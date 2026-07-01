'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Clock, ChevronRight, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

type Case = {
  id: string
  case_id: string
  title: string
  difficulty: 'basic' | 'intermediate' | 'advanced'
  station_duration_minutes: number
  system_code: string
  system_name: string
}

type Meta = { total: number; page: number; limit: number }

const DIFFICULTIES = ['basic', 'intermediate', 'advanced'] as const

const difficultyLabel: Record<string, string> = {
  basic: 'Dasar',
  intermediate: 'Menengah',
  advanced: 'Lanjut',
}

const difficultyColor: Record<string, string> = {
  basic: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-rose-100 text-rose-700',
}

export default function CasesPage() {
  const router = useRouter()
  const [cases, setCases] = useState<Case[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [systemFilter, setSystemFilter] = useState('')
  const [diffFilter, setDiffFilter] = useState('')
  const [systems, setSystems] = useState<{ code: string; name: string }[]>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }
    fetchCases()
  }, [systemFilter, diffFilter])

  async function fetchCases() {
    setLoading(true)
    const params = new URLSearchParams({ limit: '100' })
    if (systemFilter) params.set('system', systemFilter)
    if (diffFilter) params.set('difficulty', diffFilter)

    const res = await api.get<Case[]>(`/api/cases?${params}`)
    if (!res.success) { setLoading(false); return }

    setCases(res.data)
    if (res.meta) setMeta(res.meta)
    if (!systemFilter && !diffFilter) {
      const unique = Array.from(
        new Map(res.data.map(c => [c.system_code, c.system_name])).entries()
      ).map(([code, name]) => ({ code, name }))
      setSystems(unique)
    }
    setLoading(false)
  }

  const filtered = cases.filter(c =>
    search === '' ||
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.case_id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Perpustakaan Kasus</p>
        <h2 className="text-3xl font-serif font-bold text-gray-900">Pilih Kasus</h2>
        <p className="text-sm text-gray-600 mt-1">
          {meta ? `${meta.total} kasus tersedia` : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="bento-glass-card rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-2 flex-1 min-w-48">
          <Search size={15} className="text-gray-400" />
          <input
            type="text"
            placeholder="Cari kasus..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-[#2c9ca0] placeholder:text-gray-300 outline-none w-full"
          />
        </div>

        {/* System filter */}
        <select
          value={systemFilter}
          onChange={e => setSystemFilter(e.target.value)}
          className="bg-white/60 text-sm text-[#2c9ca0] rounded-lg px-3 py-2 outline-none cursor-pointer"
        >
          <option value="">Semua Sistem</option>
          {systems.map(s => (
            <option key={s.code} value={s.code}>{s.name}</option>
          ))}
        </select>

        {/* Difficulty filter */}
        <div className="flex gap-2">
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              onClick={() => setDiffFilter(diffFilter === d ? '' : d)}
              className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-lg transition-all',
                diffFilter === d
                  ? 'bg-[#2c9ca0] text-white'
                  : 'bg-white/50 text-gray-600 hover:bg-white/80 hover:text-[#2c9ca0]'
              )}
            >
              {difficultyLabel[d]}
            </button>
          ))}
        </div>
      </div>

      {/* Cases Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm font-serif">Memuat kasus...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm font-serif">Tidak ada kasus ditemukan</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(c => (
            <button
              key={c.id}
              onClick={() => router.push(`/dashboard/cases/${c.id}`)}
              className="bento-glass-card hover-gradient-border rounded-lg p-5 text-left transition-all hover:scale-[1.01] hover:shadow-md w-full"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-xs font-mono font-medium text-gray-400">
                  {c.case_id}
                </span>
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', difficultyColor[c.difficulty])}>
                  {difficultyLabel[c.difficulty]}
                </span>
              </div>

              <h3 className="font-serif font-semibold text-[#2c9ca0] text-base leading-snug mb-3">
                {c.title}
              </h3>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 bg-[#2c9ca0]/5 px-2 py-1 rounded-lg">
                  {c.system_name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={12} />
                    {c.station_duration_minutes} menit
                  </span>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
