'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { Clock, ChevronLeft, ChevronDown, ChevronUp, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

type VitalSigns = { blood_pressure: string; heart_rate: string; respiratory_rate: string; spo2: string; temperature: string }
type PatientPresentation = { name_placeholder: string; age: number; gender: string; chief_complaint: string; vital_signs: VitalSigns }
type IllnessScript = { primary_diagnosis: string; enabling_conditions: string[]; fault_pathophysiology: string; consequences: { symptoms: string[]; physical_signs: string[]; diagnostic_findings: string[] } }
type DiffDx = { diagnosis: string; distinguishing_features: string; relevance_note: string }
type OSCEChecklist = { anamnesis_items: string[]; physical_exam_items: string[]; expected_workup: string[] }
type SCTItem = { id: string; item_id: string; scenario_addition: string; hypothesis_tested: string; rationale: string }

type CaseDetail = {
  id: string; case_id: string; title: string; difficulty: string
  station_duration_minutes: number; system_code: string; system_name: string
  patient_presentation: PatientPresentation
  illness_script: IllnessScript
  differential_diagnoses: DiffDx[]
  osce_checklist: OSCEChecklist
  sct_items: SCTItem[]
}

const difficultyLabel: Record<string, string> = { basic: 'Dasar', intermediate: 'Menengah', advanced: 'Lanjut' }
const difficultyColor: Record<string, string> = { basic: 'bg-emerald-100 text-emerald-700', intermediate: 'bg-amber-100 text-amber-700', advanced: 'bg-rose-100 text-rose-700' }

export default function CaseDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [caseData, setCaseData] = useState<CaseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>('presentation')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }
    api.get<CaseDetail>(`/api/cases/${id}`).then(res => {
      if (res.success) setCaseData(res.data)
      setLoading(false)
    })
  }, [id, router])

  async function handleStart() {
    setStarting(true)
    const res = await api.post<{ id: string }>('/api/sessions', { case_id: id })
    if (res.success && caseData) {
      sessionStorage.setItem('active_case', JSON.stringify({
        id,
        title: caseData.title,
        duration: caseData.station_duration_minutes,
        sct_items: caseData.sct_items,
      }))
      router.push(`/session/${res.data.id}`)
    } else {
      setStarting(false)
    }
  }

  function toggle(section: string) {
    setOpenSection(prev => prev === section ? null : section)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-400 text-sm font-serif">Memuat kasus...</p>
    </div>
  )
  if (!caseData) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-rose-400 text-sm">Kasus tidak ditemukan.</p>
    </div>
  )

  const p = caseData.patient_presentation
  const is = caseData.illness_script

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ChevronLeft size={16} /> Kembali
      </button>

      {/* Header */}
      <div className="bento-glass-card rounded-none p-6 mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-mono text-gray-400">{caseData.case_id}</span>
            <h2 className="text-2xl font-serif font-bold text-gray-700 mt-1 leading-snug">{caseData.title}</h2>
          </div>
          <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full shrink-0 mt-1', difficultyColor[caseData.difficulty])}>
            {difficultyLabel[caseData.difficulty]}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="bg-[#2c9ca0]/5 px-3 py-1 rounded-none">{caseData.system_name}</span>
          <span className="flex items-center gap-1"><Clock size={13} />{caseData.station_duration_minutes} menit</span>
        </div>
      </div>

      <div className="space-y-3 mb-6">

        <Section title="Presentasi Pasien" section="presentation" open={openSection} toggle={toggle}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Info label="Nama" value={p.name_placeholder} />
            <Info label="Usia" value={`${p.age} tahun`} />
            <Info label="Jenis Kelamin" value={p.gender} />
          </div>
          <div className="mb-4">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">Keluhan Utama</p>
            <p className="text-sm text-gray-700 leading-relaxed">{p.chief_complaint}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">Tanda Vital</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(p.vital_signs).map(([k, v]) => (
                <Info key={k} label={k.replace('_', ' ')} value={v} />
              ))}
            </div>
          </div>
        </Section>


        <Section title="Illness Script" section="illness" open={openSection} toggle={toggle}>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">Diagnosis Utama</p>
          <p className="font-serif font-semibold text-gray-700 mb-4">{is.primary_diagnosis}</p>

          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">Enabling Conditions</p>
          <ul className="space-y-1 mb-4">{is.enabling_conditions.map((c, i) => <li key={i} className="text-sm text-gray-600 flex gap-2"><span className="text-gray-300">•</span>{c}</li>)}</ul>

          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">Patofisiologi</p>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">{is.fault_pathophysiology}</p>

          {(['symptoms', 'physical_signs', 'diagnostic_findings'] as const).map(key => (
            <div key={key} className="mb-3">
              <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">{key.replace('_', ' ')}</p>
              <ul className="space-y-1">{is.consequences[key].map((s, i) => <li key={i} className="text-sm text-gray-600 flex gap-2"><span className="text-gray-300">•</span>{s}</li>)}</ul>
            </div>
          ))}
        </Section>

        {/* Differential Diagnoses */}
        <Section title={`Diagnosis Banding (${caseData.differential_diagnoses.length})`} section="diff" open={openSection} toggle={toggle}>
          <div className="space-y-3">
            {caseData.differential_diagnoses.map((d, i) => (
              <div key={i} className="bg-white/40 rounded-none p-4">
                <p className="font-serif font-semibold text-gray-700 text-sm mb-1">{d.diagnosis}</p>
                <p className="text-xs text-gray-600 mb-1">{d.distinguishing_features}</p>
                {d.relevance_note && <p className="text-xs text-gray-400 italic">{d.relevance_note}</p>}
              </div>
            ))}
          </div>
        </Section>

        {/* OSCE Checklist */}
        <Section title="OSCE Checklist" section="osce" open={openSection} toggle={toggle}>
          {[
            { label: 'Anamnesis', items: caseData.osce_checklist.anamnesis_items },
            { label: 'Pemeriksaan Fisik', items: caseData.osce_checklist.physical_exam_items },
            { label: 'Workup', items: caseData.osce_checklist.expected_workup },
          ].map(({ label, items }) => items.length > 0 && (
            <div key={label} className="mb-4">
              <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">{label}</p>
              <ul className="space-y-1">{items.map((item, i) => <li key={i} className="text-sm text-gray-600 flex gap-2"><span className="text-gray-300">✓</span>{item}</li>)}</ul>
            </div>
          ))}
        </Section>

        {/* SCT Items */}
        <Section title={`SCT Items (${caseData.sct_items.length})`} section="sct" open={openSection} toggle={toggle}>
          <div className="space-y-3">
            {caseData.sct_items.map((item, i) => (
              <div key={item.id} className="bg-white/40 rounded-none p-4">
                <p className="text-xs font-mono text-gray-300 mb-1">{item.item_id}</p>
                <p className="text-sm font-medium text-gray-700 mb-1">Hipotesis: {item.hypothesis_tested}</p>
                <p className="text-sm text-gray-600">{item.scenario_addition}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Start Session Button */}
      <button
        onClick={handleStart}
        disabled={starting}
        className="w-full flex items-center justify-center gap-2 bg-[#2c9ca0] hover:bg-[#217578] text-white font-serif font-semibold py-4 rounded-none transition-all hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed shadow-md text-lg"
      >
        <Play size={18} fill="white" />
        {starting ? 'Memulai sesi...' : 'Mulai Sesi'}
      </button>
    </div>
  )
}

function Section({ title, section, open, toggle, children }: {
  title: string; section: string; open: string | null
  toggle: (s: string) => void; children: React.ReactNode
}) {
  const isOpen = open === section
  return (
    <div className="bento-glass-card rounded-none overflow-hidden">
      <button onClick={() => toggle(section)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/20 transition-colors">
        <span className="font-serif font-semibold text-gray-700 text-sm">{title}</span>
        {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {isOpen && <div className="px-5 pb-5 border-t border-gray-100">{children}</div>}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/40 rounded-none px-3 py-2">
      <p className="text-xs text-gray-400 capitalize">{label}</p>
      <p className="text-sm font-medium text-gray-700">{value}</p>
    </div>
  )
}
