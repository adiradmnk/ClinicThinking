import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWhiteboardStore } from '@/store/useWhiteboardStore';

export default function WhiteboardOverlay({ isLoading, error }: { isLoading: boolean, error?: string }) {
  return (
    <AnimatePresence>
      {(isLoading || error) && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm"
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
  );
}