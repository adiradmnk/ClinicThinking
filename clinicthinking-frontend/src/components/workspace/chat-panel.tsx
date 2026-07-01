"use client";
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, User, Mic, MicOff } from "lucide-react";
import { useRoomContext } from "@livekit/components-react";
import { useLocalParticipant } from "@livekit/components-react";
import { playHexAudio } from "@/utils/audioUtils";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

interface Message {
  role: "ai" | "user";
  content: string;
  audioDurationMs?: number;
}

interface ChatPanelProps {
  sessionId: string;
  isOpen: boolean;
  isMicEnabled: boolean;
  onToggle: () => void;
  messages: Message[];
  onUserMessage: (text: string) => void;
  secondsRemaining?: number;
}


export const ChatPanel = ({
  sessionId,
  isOpen,
  isMicEnabled,
  onToggle,
  messages,
  onUserMessage,
  secondsRemaining,
}: ChatPanelProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [activeTranscript, setActiveTranscript] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [latestAudio, setLatestAudio] = useState<string | null>(null);

  const [isDiagnosisModalOpen, setIsDiagnosisModalOpen] = useState(false);
  const [diagnosisText, setDiagnosisText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // SCT state
  const [isSctModalOpen, setIsSctModalOpen] = useState(false);
  const [sctItems, setSctItems] = useState<any[]>([]);
  const [sctAnswers, setSctAnswers] = useState<Record<string, string>>({});
  const [isSctSubmitting, setIsSctSubmitting] = useState(false);

  const handleSubmitDiagnosis = async () => {
    if (!diagnosisText.trim()) return;
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const res = await api.post<any>(`/api/sessions/${sessionId}/submit`, {
        raw_input: diagnosisText,
        input_modality: "text"
      });
      if (res.success) {
        setIsDiagnosisModalOpen(false);
        
        // Ambal sct_items dari sessionStorage
        try {
          const activeCaseStr = sessionStorage.getItem("active_case");
          if (activeCaseStr) {
            const activeCase = JSON.parse(activeCaseStr);
            const items = activeCase.sct_items || [];
            if (items.length > 0) {
              setSctItems(items);
              // Inisialisasi jawaban default "0" (netral) untuk masing-masing item
              const initialAnswers: Record<string, string> = {};
              items.forEach((item: any) => {
                initialAnswers[item.id || item.item_id] = "0";
              });
              setSctAnswers(initialAnswers);
              setIsSctModalOpen(true);
              return;
            }
          }
        } catch (e) {
          console.error("Gagal membaca sct_items dari session storage:", e);
        }

        // Fallback jika tidak ada sct_items, langsung redirect
        window.location.href = `/dashboard/sessions/${sessionId}`;
      } else {
        setErrorMsg(res.error?.message || "Gagal mengumpulkan diagnosis.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Koneksi gagal. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitSct = async () => {
    setIsSctSubmitting(true);
    setErrorMsg("");
    try {
      const answersArray = Object.entries(sctAnswers).map(([itemId, val]) => ({
        sct_item_id: itemId,
        response: val
      }));

      const res = await api.post<any>(`/api/sessions/${sessionId}/sct`, {
        answers: answersArray
      });

      if (res.success) {
        setIsSctModalOpen(false);
        window.location.href = `/dashboard/sessions/${sessionId}`;
      } else {
        setErrorMsg(res.error?.message || "Gagal mengirimkan jawaban SCT.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Koneksi gagal saat mengirim SCT. Silakan coba lagi.");
    } finally {
      setIsSctSubmitting(false);
    }
  };


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAiThinking, activeTranscript]);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === "ai") {
      setIsAiThinking(false);
    }
  }, [messages]);

  useEffect(() => {
    const handleData = (event: any) => {
      try {
        const payload = JSON.parse(new TextDecoder().decode(event.data));
        if (payload.type === 'audio_stream') {
          setLatestAudio(payload.data); // Simpan hex audio ke state
        }
      } catch (e) {}
    };

    room.localParticipant.on("dataReceived", handleData);
    return () => { room.localParticipant.off("dataReceived", handleData); };
  }, [room]);

  const sendToAI = useCallback((text: string) => {
    if (!text.trim()) return;

    setActiveTranscript(null);
    setIsAiThinking(true);
    onUserMessage(text);

    if (room?.localParticipant) {
      const payload = JSON.stringify({ type: "user_input", content: text });
      room.localParticipant.publishData(new TextEncoder().encode(payload), { reliable: true });
      console.log("[ChatPanel] user_input dikirim:", text.slice(0, 60));
    } else {
      console.warn("[ChatPanel] room.localParticipant belum tersedia");
      setIsAiThinking(false);
    }
  }, [room, onUserMessage]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) return; // sudah aktif

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("[ChatPanel] Browser tidak mendukung SpeechRecognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsRecording(true);
      console.log("[ChatPanel] SpeechRecognition dimulai.");
    };

    // Track waktu mulai listening untuk menghindari transkripsi welcome message suara speaker
    const startTime = Date.now();

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }

      // Abaikan transkripsi jika terlalu dekat dengan inisialisasi awal (3.5 detik pertama)
      // dan teksnya mirip dengan pesan sambutan (welcome) tutor/pasien
      const timeElapsed = Date.now() - startTime;
      const lowerText = transcript.toLowerCase();
      if (timeElapsed < 4500 && (
        lowerText.includes("selamat datang") ||
        lowerText.includes("simulasi osce") ||
        lowerText.includes("anamnesis") ||
        lowerText.includes("menit") ||
        lowerText.includes("pasien anda")
      )) {
        console.log("[ChatPanel] Mengabaikan transkripsi suara robot awal:", transcript);
        return;
      }

      setActiveTranscript(transcript);

      // Reset timer inaktivitas — kirim setelah 2 detik diam
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        sendToAI(transcript);
      }, 2000);
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") {
        console.log("[ChatPanel] SpeechRecognition timeout (no-speech) — restarting listener...");
        return;
      }
      console.error("[ChatPanel] SpeechRecognition error:", event.error);
      if (event.error === "not-allowed") {
        console.error("Izin mikrofon ditolak.");
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (isMicEnabled && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (_) {}
      }
    };

    recognition.start();
  }, [isMicEnabled, sendToAI]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; 
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
    setIsRecording(false);
    setActiveTranscript(null);
  }, []);

  const currentMicState = localParticipant?.isMicrophoneEnabled ?? false;

  useEffect(() => {
    if (currentMicState) {
      startListening();
    } else {
      stopListening();
    }
    return () => { stopListening(); };
  }, [currentMicState, startListening, stopListening]);
  const toggleMic = useCallback(async () => {
    if (!localParticipant) return;

    if (room && !room.canPlaybackAudio) {
      try {
        await room.startAudio();
        console.log("[LiveKit] AudioContext diaktifkan melalui toggle mic gesture.");
      } catch (err) {
        console.warn("[LiveKit] Gagal mengaktifkan AudioContext:", err);
      }
    }

    const newState = !localParticipant.isMicrophoneEnabled;
    await localParticipant.setMicrophoneEnabled(newState);
  }, [localParticipant, room]);

  return (
    <div className="h-full flex flex-col w-[340px]">
      <div className="h-full w-[340px] flex flex-col bg-transparent border-l border-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
          </div>
        </div>


        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <Mic size={20} className="text-teal-500" />
              </div>
              <p className="text-sm font-semibold text-slate-600">Mulai anamnesis Anda</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nyalakan mikrofon di bawah untuk berbicara dengan pasien Ardi.
              </p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const isLastMessage = i === messages.length - 1;
              const isLatestAiMessage = isLastMessage && msg.role === 'ai';

              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className={`flex gap-2 items-end ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`
                    w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px]
                    ${msg.role === "ai"
                      ? "bg-teal-500/10 text-teal-600 border border-teal-500/20"
                      : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    }
                  `}>
                    {msg.role === "ai" ? <Sparkles size={11} /> : <User size={11} />}
                  </div>
                  <div className={`
                    px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed max-w-[78%]
                    shadow-sm border backdrop-blur-md transition-all duration-300
                    ${msg.role === "ai"
                      ? "bg-white/40 border-white/50 text-slate-800 rounded-tl-sm"
                      : "bg-teal-500/20 border-teal-500/20 text-slate-800 rounded-tr-sm"
                    }
                  `}>
                    {isLatestAiMessage ? (
                      <AudioStreamingText text={msg.content} audioDurationMs={msg.audioDurationMs}/>
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Live transcript saat user bicara */}
          {activeTranscript && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 items-end flex-row-reverse"
            >
              <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center bg-teal-500/10 text-teal-600 border border-teal-500/20">
                <User size={11} />
              </div>
              <div className="px-3.5 py-2.5 rounded-2xl rounded-br-sm text-[13px] leading-relaxed max-w-[78%] bg-teal-500/10 text-teal-800 border border-teal-500/20 backdrop-blur-md shadow-sm">
                {activeTranscript}
                <span className="inline-block w-0.5 h-3.5 bg-teal-400 ml-1 animate-pulse" />
              </div>
            </motion.div>
          )}

          {/* AI thinking indicator */}
          {isAiThinking && (
            <div className="flex gap-2 items-end">
              <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center bg-teal-500/15 text-teal-600">
                <Sparkles size={11} className="" />
              </div>
              <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-white/40 border border-white/50 shadow-sm backdrop-blur-md">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {!(typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'view') && (
          <>
            <div className="px-4 pt-2">
              <button
                onClick={() => setIsDiagnosisModalOpen(true)}
                className="w-full py-2 px-4 rounded-xl bg-teal-500/20 backdrop-blur-md border border-teal-400/30 text-white font-bold text-xs shadow-md shadow-teal-500/10 hover:bg-teal-500/30 hover:shadow-lg transition-all duration-300 active:scale-98"
              >
                Kumpulkan Diagnosis Akhir
              </button>
            </div>

            <div className="px-4 pb-6 pt-2">
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md border border-white/30 px-3 py-2 rounded-2xl shadow-sm">
                <button
                  onClick={toggleMic}
                  disabled={isAiThinking}
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center
                    transition-all duration-300 active:scale-95 flex-shrink-0
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${currentMicState
                      ? "bg-red-500 text-white shadow-md shadow-red-200/50 hover:bg-red-600"
                      : "bg-white/60 hover:bg-white/80 border border-slate-200/50 text-slate-600"
                    }
                  `}
                >
                  {currentMicState ? <Mic size={18} /> : <MicOff size={18} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-bold truncate ${currentMicState ? "text-red-500" : "text-slate-500"}`}>
                    {currentMicState ? "Mendengarkan..." : "Mikrofon mati"}
                  </p>
                  <p className="text-[9px] text-slate-400 truncate">
                    {currentMicState ? "Bicara sekarang, hening 2s untuk mengirim" : "Klik ikon mikrofon untuk berbicara"}
                  </p>
                </div>
                {currentMicState && (
                  <div className="flex gap-0.5 items-center px-1">
                    <span className="w-0.5 h-3 bg-red-400 rounded-full animate-pulse" />
                    <span className="w-0.5 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                    <span className="w-0.5 h-2 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {isDiagnosisModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-sm pointer-events-auto">
          <div className="bg-white/95 border border-white/20 p-6 rounded-3xl shadow-2xl max-w-md w-full mx-4 transition-all duration-300">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Kumpulkan Diagnosis Akhir</h3>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
              Tuliskan diagnosis akhir beserta simpulan singkat temuan klinis Anda. Tindakan ini akan mengakhiri sesi simulasi dan mengarahkan Anda ke halaman umpan balik.
            </p>
            
            <textarea
              value={diagnosisText}
              onChange={(e) => setDiagnosisText(e.target.value)}
              placeholder="Contoh: Appendisitis Akut karena adanya nyeri tekan titik McBurney positif, demam, leukositosis..."
              className="w-full h-32 p-3 text-xs border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 resize-none mb-4 text-slate-800"
            />
            
            {errorMsg && (
              <p className="text-xs text-red-500 mb-4">{errorMsg}</p>
            )}
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsDiagnosisModalOpen(false);
                  setErrorMsg("");
                }}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitDiagnosis}
                disabled={isSubmitting || !diagnosisText.trim()}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-teal-500/10 transition-all flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mengirim...
                  </>
                ) : "Kirim & Selesai"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isSctModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-sm pointer-events-auto p-4">
          <div className="bg-white/95 border border-white/20 p-6 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col transition-all duration-300">
            <h3 className="text-base font-bold text-slate-800 mb-1 font-serif">Script Concordance Test (SCT)</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Silakan evaluasi bagaimana temuan klinis baru memengaruhi hipotesis diagnosis yang sedang Anda pertimbangkan.
            </p>

            <div className="flex-1 overflow-y-auto space-y-5 pr-1 mb-6">
              {sctItems.map((item, idx) => {
                const itemId = item.id || item.item_id;
                const selectedVal = sctAnswers[itemId] || "0";
                
                return (
                  <div key={itemId} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200/50 pb-2">
                      <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider font-mono">Soal {idx + 1}</span>
                      <span className="text-xs text-slate-400 font-semibold font-mono">{item.item_id}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Hipotesis Diagnostik</span>
                        <p className="font-semibold text-slate-700">{item.hypothesis_tested}</p>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Temuan / Kasus Baru</span>
                        <p className="text-slate-600 leading-relaxed">{item.scenario_addition}</p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">Pengaruh Temuan Baru Terhadap Hipotesis</span>
                      
                      <div className="grid grid-cols-5 gap-1.5 max-w-lg mx-auto">
                        {[
                          { val: "-2", label: "-2", desc: "Sangat Melemahkan" },
                          { val: "-1", label: "-1", desc: "Melemahkan" },
                          { val: "0", label: "0", desc: "Netral" },
                          { val: "+1", label: "+1", desc: "Menguatkan" },
                          { val: "+2", label: "+2", desc: "Sangat Menguatkan" }
                        ].map((opt) => {
                          const active = selectedVal === opt.val;
                          return (
                            <button
                              key={opt.val}
                              type="button"
                              onClick={() => {
                                setSctAnswers(prev => ({ ...prev, [itemId]: opt.val }));
                              }}
                              className={`
                                flex flex-col items-center py-2 px-1 rounded-xl border text-center transition-all duration-200
                                ${active
                                  ? "bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-500/20"
                                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                                }
                              `}
                            >
                              <span className="text-sm font-bold">{opt.label}</span>
                              <span className={`text-[8px] font-medium leading-tight mt-0.5 opacity-80 ${active ? "text-white" : "text-slate-400"}`}>
                                {opt.desc}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {errorMsg && (
              <p className="text-xs text-red-500 mb-4">{errorMsg}</p>
            )}

            <div className="flex gap-3 justify-end border-t border-slate-100 pt-4">
              <button
                onClick={handleSubmitSct}
                disabled={isSctSubmitting}
                className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-teal-500/10 transition-all flex items-center gap-1.5"
              >
                {isSctSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mengirim Jawaban...
                  </>
                ) : "Kirim Jawaban & Selesaikan Sesi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};

const AudioStreamingText = ({ text, audioDurationMs }: { text: string, audioDurationMs?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  const words = useRef(text.split(" "));
  const currentIndex = useRef(0);


  useEffect(() => {
    words.current = text.split(" ");
    currentIndex.current = 0;
    setDisplayedText("");


    if (audioDurationMs === 0 && typeof window !== "undefined" && "speechSynthesis" in window) {
      console.log("[AudioStreamingText] Audio track backend kosong. Menggunakan browser SpeechSynthesis fallback...");
      try {
        window.speechSynthesis.cancel(); 
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "id-ID";
        
        const textLower = text.toLowerCase();
        const isTutor = textLower.includes("selamat datang") || 
                        textLower.includes("simulasi osce") || 
                        textLower.includes("waktu anda") || 
                        textLower.includes("sesi berakhir") ||
                        textLower.includes("mengalihkan");
                        
      
        utterance.rate = isTutor ? 1.15 : 1.25; 
        
        const voices = window.speechSynthesis.getVoices();
        
        let idVoice = null;
        if (isTutor) {
          idVoice = voices.find(v => v.lang.startsWith("id") && v.name.toLowerCase().includes("female")) ||
                    voices.find(v => v.lang.startsWith("id"));
        } else {
          idVoice = voices.find(v => v.lang.startsWith("id") && v.name.toLowerCase().includes("male")) ||
                    voices.find(v => v.lang.startsWith("id"));
        }
        
        if (idVoice) {
          utterance.voice = idVoice;
        }
        
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("[AudioStreamingText] Gagal menjalankan browser SpeechSynthesis:", err);
      }
    }

    const totalDuration = audioDurationMs || (words.current.length * 200);
    const intervalTime = Math.max(10, totalDuration / words.current.length);

    console.log(`[AudioStreamingText] Menganimasikan ${words.current.length} kata dengan durasi total ${totalDuration}ms (interval: ${intervalTime}ms)`);

    const interval = setInterval(() => {
      if (currentIndex.current < words.current.length) {
        setDisplayedText(prev => {
          const nextWord = words.current[currentIndex.current];
          currentIndex.current += 1;
          return prev ? `${prev} ${nextWord}` : nextWord;
        });
      } else {
        clearInterval(interval);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [text, audioDurationMs]);

  return <span>{displayedText}</span>;
};