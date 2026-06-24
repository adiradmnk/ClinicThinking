// src/components/whiteboard/WhiteboardOverlay.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWhiteboardStore } from '@/store/useWhiteboardStore';

export default function WhiteboardOverlay({ isLoading, error }: { isLoading: boolean, error?: string }) {
  const { hintQueue, biasEvents, dismissHint } = useWhiteboardStore();

  return (
    <div className="absolute inset-0 z-50 pointer-events-none p-6">
      
      {/* 1. LAYER LOADING & ERROR (Full Screen Center) */}
      <AnimatePresence>
        {(isLoading || error) && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm pointer-events-auto"
          >
            {isLoading && (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-blue-600">AI sedang memproses...</p>
              </div>
            )}
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
                <p className="font-bold">Error Sesi</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. LAYER NOTIFIKASI AI (Pojok Kanan Atas) */}
      <div className="absolute top-4 right-4 flex flex-col gap-3 w-80 pointer-events-none">
        <AnimatePresence>
          {/* Hint AI */}
          {hintQueue.map((hint) => (
            <motion.div 
              key={hint.id}
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
              className="pointer-events-auto bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-lg"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-amber-700 uppercase">💡 AI Hint</span>
                <button onClick={() => dismissHint(hint.id)} className="text-amber-500 hover:text-amber-700 font-bold">✕</button>
              </div>
              <p className="text-sm text-amber-900">{hint.message}</p>
            </motion.div>
          ))}

          {/* Bias AI */}
          {biasEvents.map((bias) => (
            <motion.div 
              key={bias.id}
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
              className="pointer-events-auto bg-rose-50 border border-rose-200 p-4 rounded-xl shadow-lg"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-rose-700 uppercase">🚨 Bias: {bias.biasType}</span>
              </div>
              <p className="text-sm text-rose-900 font-bold mb-1">{bias.description}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}