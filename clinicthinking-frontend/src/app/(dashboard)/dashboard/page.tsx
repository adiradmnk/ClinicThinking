'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { CheckCircle2, Circle, ChevronRight, AlertCircle } from 'lucide-react'

type Profile = {
  id: string; name: string; email: string
  institution: string | null; cohort_year: number | null
}
type Summary = {
  total_sessions: number; submitted_sessions: number
  bias_detections: number; top_bias_type: string | null
}
type Session = {
  id: string; status: string; started_at: string
  submitted_at: string | null; case_id: string; case_title: string; difficulty: string
}
type DTIResult = { test_phase: 'pre' | 'post' }

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-none bg-gray-200', className)} />
}

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    if (!localStorage.getItem('token')) router.push('/auth/login')
  }, [router])

  const { data: profile, isLoading: profileLoading, isError: profileError } = useQuery({
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

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions', 'recent'],
    queryFn: async () => {
      const res = await api.get<{ sessions: Session[]; total: number }>('/api/sessions?limit=3')
      return res.success ? (res.data?.sessions ?? []) : []
    },
  })

  const { data: dtiPhases = [] } = useQuery({
    queryKey: ['dti'],
    queryFn: async () => {
      const res = await api.get<DTIResult[]>('/api/dti')
      return res.success ? (res.data ?? []).map(d => d.test_phase) : []
    },
  })

  useEffect(() => {
    if (profileError) router.push('/auth/login')
  }, [profileError, router])

  if (profileLoading) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-40" />
      </div>
    )
  }

  const rate = summary && summary.total_sessions > 0
    ? Math.round((summary.submitted_sessions / summary.total_sessions) * 100)
    : null

  const dtiDone = { pre: dtiPhases.includes('pre'), post: dtiPhases.includes('post') }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-gray-500 mb-0.5">
          {profile?.institution ?? 'Mahasiswa Kedokteran'}
        </p>
        <h1 className="text-2xl font-serif font-bold text-gray-900">
          {profile?.name}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatTile label="Total Sesi" value={summary?.total_sessions ?? 0} />
        <StatTile label="Sesi Selesai" value={summary?.submitted_sessions ?? 0} />
        <StatTile label="Tingkat Selesai" value={rate !== null ? `${rate}%` : '-'} />
        <StatTile
          label="Bias Terdeteksi"
          value={summary?.bias_detections ?? 0}
          highlight={!!summary?.bias_detections}
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">

        {/* Quick actions */}
        <div className="md:col-span-2 space-y-3">
          <ActionCard
            title="Mulai Sesi"
            desc="Pilih sistem organ dan tingkat kesulitan"
            href="/dashboard/sessions/new"
            primary
          />
          <ActionCard
            title="Riwayat Sesi"
            desc="Lihat semua sesi yang sudah dikerjakan"
            href="/dashboard/sessions"
          />
        </div>

        {/* DTI status */}
        <div className="bento-glass-card rounded-none p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">DTI</p>
          <div className="space-y-3">
            {(['pre', 'post'] as const).map(phase => (
              <div key={phase} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Fase {phase === 'pre' ? 'Pre' : 'Post'}</span>
                {dtiDone[phase]
                  ? <CheckCircle2 size={15} className="text-[#2c9ca0]" />
                  : <Circle size={15} className="text-gray-300" />
                }
              </div>
            ))}
          </div>
          {!dtiDone.pre && (
            <button
              onClick={() => router.push('/dashboard/dti')}
              className="mt-4 w-full text-xs text-center text-[#2c9ca0] border border-[#2c9ca0]/30 rounded-none py-1.5 hover:bg-[#2c9ca0]/5 transition-colors"
            >
              Kerjakan sekarang
            </button>
          )}
        </div>
      </div>

      {/* Recent sessions */}
      <div className="bento-glass-card rounded-none p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Sesi Terakhir</p>
          <button
            onClick={() => router.push('/dashboard/sessions')}
            className="text-xs text-[#2c9ca0] hover:underline flex items-center gap-0.5"
          >
            Lihat semua <ChevronRight size={12} />
          </button>
        </div>

        {sessions.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">
            Belum ada sesi. Mulai dari Mulai Sesi.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {sessions.map(s => (
              <button
                key={s.id}
                onClick={() => router.push(`/dashboard/sessions/${s.id}`)}
                className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-50/50 transition-colors rounded-none px-2 -mx-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{s.case_title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(s.started_at)}</p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <SessionStatus status={s.status} />
                  <ChevronRight size={14} className="text-gray-300" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bias info */}
      {summary?.top_bias_type && (
        <div className="mt-4 flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-none px-4 py-3">
          <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-700">
            Bias yang paling sering terdeteksi:{' '}
            <span className="font-medium capitalize">
              {summary.top_bias_type.replace(/_/g, ' ')}
            </span>.
            Perhatikan pola berpikir klinismu.
          </p>
        </div>
      )}
    </div>
  )
}

function StatTile({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="bento-glass-card rounded-none p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={cn(
        'text-2xl font-serif font-bold',
        highlight ? 'text-amber-600' : 'text-gray-900'
      )}>
        {value}
      </p>
    </div>
  )
}

function ActionCard({ title, desc, href, primary }: {
  title: string; desc: string; href: string; primary?: boolean
}) {
  return (
    <a
      href={href}
      className={cn(
        'flex items-center justify-between rounded-none px-5 py-4 transition-all hover:scale-[1.005]',
        primary
          ? 'bg-[#2c9ca0] text-white hover:bg-[#217578]'
          : 'bento-glass-card hover:bg-white/60'
      )}
    >
      <div>
        <p className={cn('text-sm font-medium', primary ? 'text-white' : 'text-gray-800')}>{title}</p>
        <p className={cn('text-xs mt-0.5', primary ? 'text-white/70' : 'text-gray-500')}>{desc}</p>
      </div>
      <ChevronRight size={16} className={primary ? 'text-white/70' : 'text-gray-400'} />
    </a>
  )
}

function SessionStatus({ status }: { status: string }) {
  if (status === 'submitted') return <span className="text-xs text-emerald-600 font-medium">Selesai</span>
  if (status === 'in_progress') return <span className="text-xs text-amber-600 font-medium">Berlangsung</span>
  return <span className="text-xs text-gray-400">Kadaluarsa</span>
}
