export const playHexAudio = async (hexData: string) => {
  try {
    // Convert hex string ke byte array
    const bytes = new Uint8Array(hexData.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    
    // Convert ke Blob
    const blob = new Blob([bytes], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(blob);
    
    // Play audio
    const audio = new Audio(audioUrl);
    await audio.play();
  } catch (error) {
    console.error("[AudioUtils] Gagal memutar audio:", error);
  }
};