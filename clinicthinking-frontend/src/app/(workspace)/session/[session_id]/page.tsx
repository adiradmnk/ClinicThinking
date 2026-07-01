'use client'

import { use, useState, useEffect, useCallback, useRef } from 'react';
import { LiveKitRoom, useRoomContext, RoomAudioRenderer } from '@livekit/components-react';
import WhiteboardContainer from './components/WhiteboardContainer';
import { ChatPanel } from '@/components/workspace/chat-panel';
import { useWhiteboardStore } from '@/store/useWhiteboardStore';
import { api } from '@/lib/api';
import { RoomEvent } from 'livekit-client';
import { ReactFlowProvider } from 'reactflow';
const SESSION_DURATION_SEC = 600; // 10 menit

/** Format detik → MM:SS */
function formatTimer(seconds: number): string {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// ── Timer Display Component ───────────────────────────────────────────
function TimerDisplay({ seconds }: { seconds: number }) {
  const isUrgent = seconds <= 60;
  const isWarning = seconds <= 180 && seconds > 60;

  return (
    <div className={`
      flex items-center gap-2 font-mono text-xl font-bold select-none transition-all duration-300
      ${isUrgent
        ? 'text-red-500 animate-pulse'
        : isWarning
        ? 'text-amber-500'
        : 'text-slate-600'
      }
    `}>
      <span className={`w-2 h-2 rounded-full ${isUrgent ? 'bg-red-500 animate-ping' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`} />
      <span>{formatTimer(seconds)}</span>
      {isUrgent && <span className="text-xs font-normal opacity-85 ml-1">Segera simpulkan!</span>}
    </div>
  );
}

// ── Room Content ──────────────────────────────────────────────────────
/**
 * Semua komponen yang memerlukan LiveKit room context dipasang di sini.
 * SATU DataReceived listener terpusat — tidak ada duplikasi.
 */
function RoomContent({
  session_id,
  setIsMicOn,
  isChatOpen,
  setIsChatOpen,
  isMicOn,
  secondsRemaining,
  setSecondsRemaining,
}: {
  session_id: string;
  setIsMicOn: (val: boolean) => void;
  isChatOpen: boolean;
  setIsChatOpen: (val: boolean) => void;
  isMicOn: boolean;
  secondsRemaining: number;
  setSecondsRemaining: (val: number) => void;
}) {
  const room = useRoomContext();
  const { processAiAction, initSession } = useWhiteboardStore();
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; content: string; audioDurationMs?: number }[]>([]);
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Mengaktifkan AudioContext pada interaksi pertama pengguna untuk melewati blok autoplay browser
  useEffect(() => {
    if (!room) return;
    const unlockAudio = async () => {
      if (room.canPlaybackAudio) return; // sudah aktif
      try {
        await room.startAudio();
        console.log('[LiveKit] AudioContext diaktifkan melalui klik halaman.');
        window.removeEventListener('click', unlockAudio);
      } catch (err) {
        console.warn('[LiveKit] Gagal mengaktifkan AudioContext via klik:', err);
      }
    };
    window.addEventListener('click', unlockAudio);
    return () => window.removeEventListener('click', unlockAudio);
  }, [room]);

  // Panggil initSession setelah room terhubung, lalu kirim client_ready ke AI
  useEffect(() => {
    if (!room) return;

    let ws: WebSocket | null = null;

    const onConnected = async () => {
      console.log('[LiveKit] Koneksi sukses! Memuat riwayat sesi...');

      // 1. Ambil detail sesi untuk inisialisasi status dan timer
      try {
        const sessionRes = await api.get<any>(`/api/sessions/${session_id}`);
        if (sessionRes.success && sessionRes.data) {
          const s = sessionRes.data;
          console.log('[LiveKit] Detail sesi berhasil dimuat:', s);
          
          // Jika status sudah selesai atau kadaluarsa, arahkan ke feedback KECUALI jika diakses dalam mode=view
          const isViewMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'view';
          if ((s.status === 'submitted' || s.status === 'abandoned') && !isViewMode) {
            console.log(`[LiveKit] Sesi sudah berakhir dengan status: ${s.status}. Mengalihkan ke feedback...`);
            window.location.href = `/dashboard/sessions/${session_id}`;
            return;
          }
          
          // Set secondsRemaining ke waktu tersisa dari backend
          if (typeof s.seconds_remaining === 'number') {
            console.log(`[LiveKit] Menginisialisasi timer dengan waktu tersisa: ${s.seconds_remaining} detik.`);
            setSecondsRemaining(s.seconds_remaining);
          }
        }
      } catch (err) {
        console.error('[LiveKit] Gagal mengambil detail sesi:', err);
      }

      const history = await initSession(session_id);
      if (history && history.length > 0) {
        console.log(`[LiveKit] Riwayat chat berhasil dimuat: ${history.length} pesan.`);
        setMessages(history);
      }

      // Trigger timer backend: buka koneksi websocket secara silent
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        // Tentukan host websocket berdasarkan API url
        const apiHost = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
        const wsProtocol = apiHost.startsWith('https') ? 'wss' : 'ws';
        const wsHost = apiHost.replace(/^https?:\/\//, '');
        const wsUrl = `${wsProtocol}://${wsHost}/ws/sessions/${session_id}?token=${token}`;
        
        console.log('[WebSocket] Menghubungkan untuk trigger timer...', wsUrl);
        ws = new WebSocket(wsUrl);
        ws.onopen = () => console.log('[WebSocket] Timer terpicu di backend.');
        ws.onerror = (e) => console.error('[WebSocket] Gagal trigger timer:', e);
        ws.onclose = () => console.log('[WebSocket] Koneksi timer ditutup.');
      } else {
        console.warn('[WebSocket] Token tidak ditemukan, backend timer mungkin tidak terpicu.');
      }

      // Kirim sinyal ke AI agent agar mengirim welcome message HANYA JIKA tidak ada riwayat chat sebelumnya
      if (!history || history.length === 0) {
        const readyPayload = JSON.stringify({ type: 'client_ready' });
        room.localParticipant.publishData(new TextEncoder().encode(readyPayload), { reliable: true });
        console.log('[LiveKit] Sesi baru — client_ready dikirim ke AI agent.');
      } else {
        console.log('[LiveKit] Sesi pemulihan — client_ready dilonwati.');
      }
    };

    // Handler jika agen bergabung kemudian (mengatasi race condition)
    const onParticipantConnected = (participant: any) => {
      console.log('[LiveKit] Participant terhubung:', participant.identity);
      if (messagesRef.current.length === 0) {
        const readyPayload = JSON.stringify({ type: 'client_ready' });
        room.localParticipant.publishData(new TextEncoder().encode(readyPayload), { reliable: true });
        console.log('[LiveKit] Agen terdeteksi bergabung. Mengirim ulang client_ready...');
      }
    };

    if (room.state === 'connected') {
      onConnected();
    } else {
      room.once(RoomEvent.Connected, onConnected);
    }

    room.on(RoomEvent.ParticipantConnected, onParticipantConnected);

    return () => {
      room.off(RoomEvent.Connected, onConnected);
      room.off(RoomEvent.ParticipantConnected, onParticipantConnected);
      if (ws) {
        ws.close();
      }
    };
  }, [room, session_id, initSession]);

  // ── Central DataReceived handler ──────────────────────────────────
  useEffect(() => {
    if (!room) return;

    const handleData = (payload: Uint8Array) => {
      try {
        const decoded = new TextDecoder().decode(payload);
        const data = JSON.parse(decoded);
        
        console.log(`[LiveKit-DataReceived] Menerima pesan tipe: "${data.type}" dari jaringan.`);

        switch (data.type) {
          case 'chat_message':
            console.log(`[LiveKit-DataReceived] Chat Message dari ${data.role || 'ai'}: "${data.content?.slice(0, 60)}..." (duration: ${data.audio_duration_ms}ms)`);
            // Pesan teks dari AI — tampilkan di chat panel jika belum ada
            setMessages(prev => {
              const exists = prev.some(m => m.role === (data.role ?? 'ai') && m.content === data.content);
              if (exists) return prev;
              return [...prev, { 
                role: data.role ?? 'ai', 
                content: data.content,
                audioDurationMs: data.audio_duration_ms
              }];
            });

            // Mute mic saat AI mulai berbicara untuk mencegah feedback echo
            const isAiRole = (data.role ?? 'ai') === 'ai';
            if (isAiRole && room?.localParticipant?.isMicrophoneEnabled) {
              const durationMs = data.audio_duration_ms || (data.content.split(" ").length * 400);
              console.log(`[Auto-Mute] AI mulai berbicara. Menonaktifkan mic selama ${durationMs}ms...`);
              room.localParticipant.setMicrophoneEnabled(false);
              
              // Unmute kembali setelah AI selesai berbicara
              setTimeout(() => {
                if (room?.localParticipant && !room.localParticipant.isMicrophoneEnabled) {
                  room.localParticipant.setMicrophoneEnabled(true);
                  console.log('[Auto-Mute] AI selesai berbicara. Mengaktifkan kembali mic.');
                }
              }, durationMs + 500); // beri buffer 500ms
            }
            
            // Simpan respons AI ke database secara dinamis agar tidak hilang saat refresh
            api.sendEvent(session_id, {
              event_type: 'ai_response',
              event_data: {
                type: 'chat_message',
                role: data.role ?? 'ai',
                content: data.content,
                audio_duration_ms: data.audio_duration_ms
              }
            }).catch(e => console.error('[LiveKit-DataReceived] Gagal menyimpan chat_message ke DB:', e));
            break;

          case 'ai_action':
            console.log('[LiveKit-DataReceived] AI Whiteboard Action Payload:', data.payload);
            // Aksi whiteboard dari AI/backend (format standar):
            // { type: 'ai_action', payload: { type: 'add_node', data: {...} } }
            if (data.payload && typeof data.payload === 'object') {
              console.log(`[LiveKit-DataReceived] Meneruskan ke whiteboard store: ${data.payload.type}`);
              processAiAction(data.payload);

              // Simpan whiteboard action ke database secara dinamis agar tidak hilang saat refresh
              api.sendEvent(session_id, {
                event_type: 'ai_action',
                event_data: {
                  type: 'ai_action',
                  payload: data.payload
                }
              }).catch(e => console.error('[LiveKit-DataReceived] Gagal menyimpan ai_action ke DB:', e));
            } else {
              console.warn('[LiveKit-DataReceived] AI Action payload tidak valid:', data.payload);
            }
            break;

          case 'timer_tick':
            // Tick dari backend Go setiap detik
            if (typeof data.payload?.seconds_remaining === 'number') {
              setSecondsRemaining(data.payload.seconds_remaining);
            }
            break;

          case 'timer_control':
            console.log('[LiveKit-DataReceived] Kontrol timer diterima:', data.action);
            // AI meminta start/stop timer (dari timerAction di SimulationStep)
            if (data.action === 'start') {
              setSecondsRemaining(SESSION_DURATION_SEC);
            }
            break;

          case 'session_ended':
            console.log('[LiveKit-DataReceived] Sesi berakhir. Mengalihkan ke feedback...');
            setMessages(prev => [...prev, {
              role: 'ai',
              content: `⏱️ Sesi berakhir. Mengalihkan ke halaman feedback...`
            }]);
            setTimeout(() => {
              window.location.href = `/dashboard/sessions/${session_id}`;
            }, 3000);
            break;

          default:
            console.log('[LiveKit-DataReceived] Tipe tidak dikenal / tidak ditangani:', data.type);
        }
      } catch (e) {
        console.error('[LiveKit-DataReceived] Gagal memproses payload data:', e);
      }
    };

    room.on(RoomEvent.DataReceived, handleData);
    return () => { room.off(RoomEvent.DataReceived, handleData); };
  }, [room, session_id, processAiAction, setSecondsRemaining]);

  // Arahkan ke feedback jika waktu tersisa mencapai 0 secara lokal (KECUALI dalam mode=view)
  useEffect(() => {
    const isViewMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'view';
    if (secondsRemaining <= 0 && !isViewMode) {
      console.log('[Timer] Waktu habis secara lokal. Mengalihkan ke feedback...');
      const timer = setTimeout(() => {
        window.location.href = `/dashboard/sessions/${session_id}`;
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [secondsRemaining, session_id]);

  // Callback untuk menambah pesan user dari ChatPanel
  const addUserMessage = useCallback((text: string) => {
    setMessages(prev => {
      const exists = prev.some(m => m.role === 'user' && m.content === text);
      if (exists) return prev;
      return [...prev, { role: 'user', content: text }];
    });

    // Simpan pesan mahasiswa ke DB agar ter-recover saat refresh
    api.sendEvent(session_id, {
      event_type: 'question_asked', // atau event_type lain yang valid di backend
      event_data: {
        type: 'chat_message',
        role: 'user',
        content: text
      }
    }).catch(e => console.error('[addUserMessage] Gagal menyimpan user message ke DB:', e));
  }, [session_id]);

  return (
    <>
      {/* Whiteboard (fullscreen background) */}
      <div className="absolute inset-0 z-0">
        <WhiteboardContainer
          sessionId={session_id}
          onMicStatusChange={setIsMicOn}
          isMicOn={isMicOn}
        />
      </div>

      {/* Timer — tengah atas */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <TimerDisplay seconds={secondsRemaining} />
      </div>

      {/* Chat Panel — pojok kanan */}
      <div className="absolute top-0 right-0 bottom-0 z-10 w-[340px]">
        <ChatPanel
          sessionId={session_id}
          isOpen={isChatOpen}
          isMicEnabled={isMicOn}
          onToggle={() => setIsChatOpen(!isChatOpen)}
          messages={messages}
          onUserMessage={addUserMessage}
          secondsRemaining={secondsRemaining}
        />
      </div>
    </>
  );
}

// ── Main Workspace Page ───────────────────────────────────────────────
export default function WorkspacePage({ params }: { params: Promise<{ session_id: string }> }) {
  const { session_id } = use(params);
  const [connection, setConnection] = useState<{ token: string; serverUrl: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(SESSION_DURATION_SEC);

  useEffect(() => {
    api.getLiveKitToken(session_id, 'user-123')
      .then(setConnection)
      .catch(err => console.error('Gagal ambil token LiveKit:', err))
      .finally(() => setIsLoading(false));
  }, [session_id]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Menghubungkan ke sesi simulasi...</p>
        </div>
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="flex h-screen items-center justify-center bg-red-50">
        <p className="text-red-500">Gagal terhubung ke sesi. Coba refresh halaman.</p>
      </div>
    );
  }

  return (
    <main className="w-screen h-screen overflow-hidden relative bg-gradient-to-br from-teal-50 to-emerald-100">
      <ReactFlowProvider>
        <LiveKitRoom
          serverUrl={connection.serverUrl}
          token={connection.token}
          connect={true}
          audio={false}
          video={false}
          className="h-full w-full"
          onConnected={() => console.log('[LiveKitRoom] Terhubung!')}
          onDisconnected={() => console.log('[LiveKitRoom] Terputus.')}
        >
          <RoomAudioRenderer />
          <RoomContent
            session_id={session_id}
            setIsMicOn={setIsMicOn}
            isMicOn={isMicOn}
            isChatOpen={isChatOpen}
            setIsChatOpen={setIsChatOpen}
            secondsRemaining={secondsRemaining}
            setSecondsRemaining={setSecondsRemaining}
          />
        </LiveKitRoom>
      </ReactFlowProvider>
    </main>
  );
}