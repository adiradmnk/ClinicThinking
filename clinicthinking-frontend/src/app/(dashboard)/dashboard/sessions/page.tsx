'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Clock, ChevronRight, CheckCircle2, Circle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type Session = {
  id: string
  status: 'in_progress' | 'submitted' | 'expired'
  started_at: string
  submitted_at: string | null
  case_id: string
  case_title: string
  difficulty: 'basic' | 'intermediate' | 'advanced'
}

const difficultyLabel: Record<string, string> = { basic: 'Dasar', intermediate: 'Menengah', advanced: 'Lanjut' }
const difficultyColor: Record<string, string> = {
  basic: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-rose-100 text-rose-700',
}

function StatusBadge({ status }: { status: Session['status'] }) {
  if (status === 'submitted') return (
    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
      <CheckCircle2 size={12} /> Selesai
    </span>
  )
  if (status === 'in_progress') return (
    <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
      <Circle size={12} /> Berlangsung
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-gray-400 bg-[#2c9ca0]/5 px-2.5 py-1 rounded-full">
      <AlertCircle size={12} /> Kadaluarsa
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function SessionsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'submitted' | 'in_progress'>('all')

  useEffect(() => {
    if (!localStorage.getItem('token')) router.push('/auth/login')
  }, [router])

  const { data, isLoading } = useQuery({
    queryKey: ['sessions', 'all'],
    queryFn: async () => {
      const res = await api.get<Session[]>('/api/sessions?limit=100')
      if (!res.success) return { sessions: [], total: 0 }
      const sessions = res.data ?? []
      return { sessions, total: res.meta?.total ?? sessions.length }
    },
  })

  const sessions = data?.sessions ?? []
  const total    = data?.total    ?? 0
  const filtered = sessions.filter(s => filter === 'all' || s.status === filter)

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Aktivitas Saya</p>
        <h2 className="text-3xl font-serif font-bold text-gray-900">Riwayat Sesi</h2>
        <p className="text-sm text-gray-600 mt-1">{total} sesi total</p>
      </div>

      {/* Filter tabs */}
      <div className="bento-glass-card rounded-none p-1.5 mb-6 flex gap-1 w-fit">
        {(['all', 'submitted', 'in_progress'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'text-sm px-4 py-2 rounded-none font-medium transition-all',
              filter === f
                ? 'bg-[#2c9ca0] text-white shadow-sm'
                : 'text-gray-500 hover:text-[#2c9ca0] hover:bg-white/40'
            )}
          >
            {f === 'all' ? 'Semua' : f === 'submitted' ? 'Selesai' : 'Berlangsung'}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-400 text-sm font-serif">Memuat riwayat...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm font-serif">
          {filter === 'all' ? 'Belum ada sesi. Mulai dari Pilih Kasus!' : 'Tidak ada sesi di kategori ini.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => (
            <button
              key={s.id}
              onClick={() => router.push(`/dashboard/sessions/${s.id}`)}
              className="w-full bento-glass-card hover-gradient-border rounded-none p-5 text-left transition-all hover:scale-[1.005] hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-mono text-gray-400">{s.case_id}</span>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', difficultyColor[s.difficulty])}>
                      {difficultyLabel[s.difficulty]}
                    </span>
                  </div>
                  <h3 className="font-serif font-semibold text-gray-800 text-base leading-snug truncate mb-2">
                    {s.case_title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {formatDate(s.started_at)}
                    </span>
                    {s.submitted_at && (
                      <span>Selesai: {formatDate(s.submitted_at)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 mt-0.5">
                  <StatusBadge status={s.status} />
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
