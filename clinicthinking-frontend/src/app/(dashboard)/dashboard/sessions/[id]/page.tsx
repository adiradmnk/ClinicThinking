'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ChevronLeft, CheckCircle2, Clock, AlertCircle, RotateCcw, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

type Session = {
  id: string
  status: 'in_progress' | 'submitted' | 'abandoned'
  started_at: string
  submitted_at: string | null
  case_id: string
  case_title: string
}

type SCTItem = {
  sct_item_id: string
  student_response: string
  expert_modal_response: string
  score: number
}

type BiasDetection = {
  bias_type: string
  detected_at_sequence: number
  confidence_note: string
}

type Analysis = {
  session_id: string
  reasoning_raw: string
  sct_normalized_score: number | null
  sct_total_items: number
  sct_items: SCTItem[]
  bias_count: number
  top_bias_type: string | null
  bias_detections: BiasDetection[]
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-none bg-[#2c9ca0]/8', className)} />
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'submitted') return (
    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-none">
      <CheckCircle2 size={11} /> Selesai
    </span>
  )
  if (status === 'in_progress') return (
    <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-none">
      <Clock size={11} /> Berlangsung
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-none">
      <AlertCircle size={11} /> Kadaluarsa
    </span>
  )
}

export default function SessionDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    if (!localStorage.getItem('token')) router.push('/auth/login')
  }, [router])

  const { data: session, isLoading: sessionLoading, isError } = useQuery({
    queryKey: ['session', id],
    queryFn: async () => {
      const res = await api.get<Session>(`/api/sessions/${id}`)
      if (!res.success) throw new Error('not found')
      return res.data
    },
    retry: false,
  })

  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: ['session-analysis', id],
    queryFn: async () => {
      const res = await api.get<Analysis>(`/api/sessions/${id}/analysis`)
      return res.success ? res.data : null
    },
    enabled: session?.status === 'submitted',
  })

  useEffect(() => {
    if (isError) router.push('/dashboard/sessions')
  }, [isError, router])

  const loading = sessionLoading || (session?.status === 'submitted' && analysisLoading)

  if (loading) {
    return (
      <div className="p-8 max-w-3xl mx-auto space-y-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!session) return null

  const scorePct = analysis?.sct_normalized_score != null
    ? Math.round(analysis.sct_normalized_score * 100)
    : null

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.push('/dashboard/sessions')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6"
      >
        <ChevronLeft size={16} /> Riwayat
      </button>

      {/* Session header */}
      <div className="bento-glass-card rounded-none p-5 mb-5">
        <p className="text-xs font-mono text-gray-400 mb-1">{session.case_id}</p>
        <h2 className="font-serif font-bold text-xl text-gray-900 leading-snug mb-3">{session.case_title}</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={session.status} />
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={11} /> {formatDate(session.started_at)}
          </span>
          {session.submitted_at && (
            <span className="text-xs text-gray-400">Selesai: {formatDate(session.submitted_at)}</span>
          )}
        </div>
      </div>

      {/* In progress */}
      {session.status === 'in_progress' && (
        <div className="bento-glass-card rounded-none p-6 text-center">
          <Clock size={28} className="text-amber-400 mx-auto mb-3" />
          <p className="font-serif font-semibold text-gray-800 mb-1">Sesi masih berlangsung</p>
          <p className="text-sm text-gray-500">Lanjutkan sesi di halaman whiteboard.</p>
        </div>
      )}

      {/* Abandoned */}
      {session.status === 'abandoned' && (
        <div className="bento-glass-card rounded-none p-6 flex items-start gap-3">
          <AlertCircle size={16} className="text-rose-400 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-gray-800 text-sm">Sesi kadaluarsa</p>
            <p className="text-xs text-gray-500 mt-0.5">Waktu habis sebelum sesi selesai. Tidak ada data analisis.</p>
          </div>
        </div>
      )}

      {/* Submitted */}
      {session.status === 'submitted' && analysis && (
        <div className="space-y-4">

          {/* SCT Score */}
          <div className="bento-glass-card rounded-none p-6">
            <h3 className="font-serif font-semibold text-gray-900 mb-4">Skor SCT</h3>
            {scorePct !== null ? (
              <>
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-5xl font-serif font-bold text-gray-900">{scorePct}</span>
                  <span className="text-lg text-gray-400 mb-1.5">/ 100</span>
                </div>
                <div className="h-2 w-full bg-[#2c9ca0]/10 rounded-none overflow-hidden mb-5">
                  <div
                    className="h-full bg-[#2c9ca0] transition-all duration-700"
                    style={{ width: `${scorePct}%` }}
                  />
                </div>

                {analysis.sct_items.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Rincian Per Item</p>
                    {analysis.sct_items.map((item, i) => (
                      <div key={item.sct_item_id} className="flex items-center justify-between bg-white/40 rounded-none px-4 py-2.5 text-sm">
                        <span className="text-gray-600">Item {i + 1}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-gray-400">
                            Kamu: <span className="font-mono font-medium text-gray-700">{item.student_response}</span>
                          </span>
                          <span className="text-xs text-gray-400">
                            Expert: <span className="font-mono font-medium text-gray-700">{item.expert_modal_response}</span>
                          </span>
                          <span className={cn(
                            'font-semibold text-xs',
                            item.score >= 0.75 ? 'text-emerald-600' : item.score >= 0.5 ? 'text-amber-600' : 'text-rose-500'
                          )}>
                            {Math.round(item.score * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400">Data SCT tidak tersedia untuk sesi ini.</p>
            )}
          </div>

          {/* Clinical Reasoning */}
          {analysis.reasoning_raw && (
            <div className="bento-glass-card rounded-none p-6">
              <h3 className="font-serif font-semibold text-gray-900 mb-3">Clinical Reasoning</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{analysis.reasoning_raw}</p>
            </div>
          )}

          {/* Bias */}
          <div className="bento-glass-card rounded-none p-6">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={15} className="text-gray-400" />
              <h3 className="font-serif font-semibold text-gray-900">Bias Klinis</h3>
            </div>
            {analysis.bias_detections.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-4 py-3 rounded-none">
                <CheckCircle2 size={15} /> Tidak ada bias yang terdeteksi.
              </div>
            ) : (
              <div className="space-y-2">
                {analysis.bias_detections.map((b, i) => (
                  <div key={i} className="bg-amber-50/80 border border-amber-100 rounded-none px-4 py-3">
                    <p className="text-sm font-medium text-amber-700 capitalize">
                      {b.bias_type.replace(/_/g, ' ')}
                    </p>
                    {b.confidence_note && (
                      <p className="text-xs text-amber-600/70 mt-0.5">{b.confidence_note}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard/sessions/new')}
              className="flex-1 flex items-center justify-center gap-2 bg-[#2c9ca0] text-white font-serif font-semibold py-3.5 rounded-none hover:bg-[#217578] transition-all text-sm"
            >
              <RotateCcw size={15} /> Kasus Lain
            </button>
            <button
              onClick={() => router.push('/dashboard/sessions')}
              className="flex-1 flex items-center justify-center gap-2 bento-glass-card text-gray-700 font-serif font-semibold py-3.5 rounded-none hover:bg-white/60 transition-all text-sm"
            >
              Riwayat Sesi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
