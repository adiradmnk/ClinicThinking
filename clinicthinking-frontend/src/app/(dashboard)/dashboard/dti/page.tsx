'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { DTI_ITEMS } from '@/lib/dti-items'
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type DTIResult = {
  id: string
  test_phase: 'pre' | 'post'
  flexibility_in_thinking_score: number
  structure_of_knowledge_score: number
  submitted_at: string
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-none bg-[#2c9ca0]/8', className)} />
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

const MAX_FT = 21 * 6  // 126
const MAX_SK = 20 * 6  // 120

export default function DTIPage() {
  const router      = useRouter()
  const queryClient = useQueryClient()

  const [phase, setPhase]         = useState<'pre' | 'post'>('pre')
  const [answers, setAnswers]     = useState<Record<number, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('token')) router.push('/auth/login')
  }, [router])

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['dti'],
    queryFn: async () => {
      const res = await api.get<DTIResult[]>('/api/dti')
      return res.success ? (res.data ?? []) : []
    },
  })

  useEffect(() => {
    if (!results.map(r => r.test_phase).includes('pre')) setPhase('pre')
    else if (!results.map(r => r.test_phase).includes('post')) setPhase('post')
  }, [results])

  const donePhases    = results.map(r => r.test_phase)
  const availablePhase = !donePhases.includes('pre') ? 'pre' : !donePhases.includes('post') ? 'post' : null
  const allDone       = donePhases.includes('pre') && donePhases.includes('post')

  function setAnswer(item: number, score: number) {
    setAnswers(prev => ({ ...prev, [item]: score }))
  }

  const answeredCount = Object.keys(answers).length
  const allAnswered   = answeredCount === 41

  async function handleSubmit() {
    if (!allAnswered) {
      setError(`Masih ${41 - answeredCount} item belum dijawab.`)
      return
    }
    setError('')
    setSubmitting(true)

    const responses: Record<string, number> = {}
    for (let i = 1; i <= 41; i++) responses[String(i)] = answers[i]

    const res = await api.post<DTIResult>('/api/dti', { test_phase: phase, responses })
    setSubmitting(false)
    if (!res.success) {
      setError((res as { error?: { message: string } }).error?.message ?? 'Gagal submit DTI.')
      return
    }
    queryClient.setQueryData<DTIResult[]>(['dti'], prev => [...(prev ?? []), res.data])
    setAnswers({})
    setSubmitted(true)
  }

  if (isLoading) return (
    <div className="p-8 max-w-3xl mx-auto space-y-4">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Penilaian Diri</p>
        <h2 className="text-3xl font-serif font-bold text-gray-900">Diagnostic Thinking Inventory</h2>
        <p className="text-sm text-gray-600 mt-1">41 item · Skala semantik diferensial 1-6 · Formatif</p>
      </div>

      {/* Info */}
      <div className="bento-glass-card rounded-none p-4 mb-6 flex gap-3 text-sm text-gray-700">
        <Info size={15} className="mt-0.5 shrink-0 text-gray-400" />
        <p>Pilih angka yang paling mencerminkan cara berpikirmu dalam konteks klinis. Tidak ada jawaban benar atau salah, ini bersifat formatif.</p>
      </div>

      {/* Hasil sebelumnya */}
      {results.length > 0 && (
        <div className="space-y-3 mb-6">
          {results.map(r => {
            const ftPct = Math.round((r.flexibility_in_thinking_score / MAX_FT) * 100)
            const skPct = Math.round((r.structure_of_knowledge_score / MAX_SK) * 100)
            return (
              <div key={r.id} className="bento-glass-card rounded-none p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-serif font-semibold text-gray-900 capitalize">
                    Fase {r.test_phase === 'pre' ? 'Pre' : 'Post'}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(r.submitted_at)}</span>
                </div>
                <div className="space-y-2">
                  <ScoreBar label="Flexibility in Thinking (FT)" pct={ftPct} raw={r.flexibility_in_thinking_score} max={MAX_FT} />
                  <ScoreBar label="Structure of Knowledge (SK)" pct={skPct} raw={r.structure_of_knowledge_score} max={MAX_SK} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Sukses submit */}
      {submitted && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-none mb-6">
          <CheckCircle2 size={15} /> DTI berhasil disimpan.
        </div>
      )}

      {/* Form */}
      {!allDone && availablePhase && !submitted && (
        <>
          {/* Phase selector */}
          {donePhases.length === 0 && (
            <div className="bento-glass-card rounded-none p-1.5 flex gap-1 w-fit mb-6">
              {(['pre', 'post'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPhase(p)}
                  className={cn(
                    'px-5 py-2 rounded-none text-sm font-medium transition-all',
                    phase === p ? 'bg-[#2c9ca0] text-white' : 'text-gray-500 hover:text-[#2c9ca0] hover:bg-white/40'
                  )}
                >
                  Fase {p === 'pre' ? 'Pre' : 'Post'}
                </button>
              ))}
            </div>
          )}

          {/* Progress */}
          <div className="flex items-center justify-between text-xs text-gray-400 mb-3 px-1">
            <span>{answeredCount} / 41 dijawab</span>
            <div className="h-1.5 w-40 bg-[#2c9ca0]/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2c9ca0]/50 rounded-full transition-all duration-200"
                style={{ width: `${(answeredCount / 41) * 100}%` }}
              />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3 mb-5">
            {DTI_ITEMS.map(item => (
              <div
                key={item.number}
                className={cn(
                  'bento-glass-card rounded-none p-4 transition-all',
                  answers[item.number] ? 'border-[#2c9ca0]/20' : ''
                )}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-mono text-white bg-[#2c9ca0]/60 px-1.5 py-0.5 rounded">
                    {item.number}
                  </span>
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                    {item.subscale}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 text-right w-24 shrink-0 leading-tight">
                    {item.left}
                  </span>

                  <div className="flex gap-1.5 flex-1 justify-center">
                    {[1, 2, 3, 4, 5, 6].map(score => (
                      <button
                        key={score}
                        onClick={() => setAnswer(item.number, score)}
                        className={cn(
                          'w-9 h-9 rounded-none text-xs font-semibold transition-all',
                          answers[item.number] === score
                            ? 'bg-[#2c9ca0] text-white scale-110 shadow-sm'
                            : 'bg-white/60 text-gray-500 hover:bg-[#2c9ca0]/15 hover:text-[#2c9ca0]'
                        )}
                      >
                        {score}
                      </button>
                    ))}
                  </div>

                  <span className="text-xs text-gray-600 w-24 shrink-0 leading-tight">
                    {item.right}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 px-4 py-3 rounded-none mb-4">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || !allAnswered}
            className="w-full flex items-center justify-center gap-2 bg-[#2c9ca0] hover:bg-[#217578] text-white font-serif font-semibold py-4 rounded-none transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md text-lg"
          >
            <CheckCircle2 size={17} />
            {submitting ? 'Menyimpan...' : `Submit DTI Fase ${phase === 'pre' ? 'Pre' : 'Post'}`}
          </button>
        </>
      )}

      {/* All done state */}
      {allDone && (
        <div className="bento-glass-card rounded-none p-6 text-center">
          <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-3" />
          <p className="font-serif font-semibold text-[#2c9ca0]">Kedua fase DTI sudah selesai</p>
          <p className="text-sm text-gray-500 mt-1">Lihat hasil di atas untuk perbandingan pre-post.</p>
        </div>
      )}
    </div>
  )
}

function ScoreBar({ label, pct, raw, max }: { label: string; pct: number; raw: number; max: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-mono font-medium text-[#2c9ca0]">{raw} / {max}</span>
      </div>
      <div className="h-2 w-full bg-[#2c9ca0]/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#2c9ca0] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
