/**
 * SlidePro High-Fidelity Text-To-Speech (TTS) Service
 * - 4 distinct Male/Female voice profiles (Bắc/Nam)
 * - Dual Engine: High-Quality Neural Audio Stream (Google TTS API Proxy) + Web Speech Synthesis fallback
 * - Natural sentence chunking & smooth sequential playback
 */

export interface VoiceProfile {
  id: string;
  name: string;
  shortLabel: string;
  gender: 'female' | 'male';
  region: 'Bắc' | 'Nam';
  description: string;
  pitch: number;
  rate: number;
  sampleText: string;
}

export const VOICE_PROFILES: VoiceProfile[] = [
  {
    id: 'female-young',
    name: 'Nữ - Giọng Bắc (Hà Nội)',
    shortLabel: 'Nữ Bắc',
    gender: 'female',
    region: 'Bắc',
    description: 'Trong trẻo, thanh thoát, truyền cảm hứng',
    pitch: 1.15,
    rate: 0.98,
    sampleText:
      'Xin chào quý thầy cô và các bạn học sinh! Tôi là trợ lý ảo giọng Nữ miền Bắc trên hệ thống SlidePro.',
  },
  {
    id: 'male-inspiring',
    name: 'Nam - Giọng Bắc (Hà Nội)',
    shortLabel: 'Nam Bắc',
    gender: 'male',
    region: 'Bắc',
    description: 'Trầm ấm, đĩnh đạc, thuyết trình chuyên nghiệp',
    pitch: 0.82,
    rate: 0.94,
    sampleText:
      'Kính chào quý vị và các bạn! Tôi là giảng viên ảo giọng Nam miền Bắc đồng hành cùng bài giảng hôm nay.',
  },
  {
    id: 'female-south',
    name: 'Nữ - Giọng Nam (Nam Bộ)',
    shortLabel: 'Nữ Nam',
    gender: 'female',
    region: 'Nam',
    description: 'Nhẹ nhàng, ngọt ngào, gần gũi và truyền cảm',
    pitch: 1.05,
    rate: 0.92,
    sampleText:
      'Dạ xin kính chào quý thầy cô và các bạn học sinh! Rất vui được hỗ trợ bài thuyết trình của bạn hôm nay.',
  },
  {
    id: 'male-pro',
    name: 'Nam - Giọng Nam (Nam Bộ)',
    shortLabel: 'Nam Nam',
    gender: 'male',
    region: 'Nam',
    description: 'Năng động, rõ ràng, phong thái tự tin hiện đại',
    pitch: 0.88,
    rate: 1.02,
    sampleText:
      'Chào mọi người! Tôi là trợ lý giọng Nam miền Nam, chúc các bạn một buổi học thật hiệu quả và thú vị.',
  },
];

export function getVoiceProfile(nameOrId?: string): VoiceProfile {
  if (!nameOrId) return VOICE_PROFILES[0];
  const found = VOICE_PROFILES.find(
    (v) =>
      v.id.toLowerCase() === nameOrId.toLowerCase() ||
      v.name.toLowerCase() === nameOrId.toLowerCase() ||
      v.shortLabel.toLowerCase() === nameOrId.toLowerCase() ||
      (nameOrId.includes('Nam') && !nameOrId.includes('Nữ') && v.gender === 'male') ||
      (nameOrId.includes('Nữ') && v.gender === 'female')
  );
  return found || VOICE_PROFILES[0];
}

/**
 * Split long script text into natural sentence chunks (<180 chars) for smooth streaming
 */
export function splitTextIntoChunks(text: string, maxLen = 160): string[] {
  if (!text) return [];
  const cleaned = text
    .replace(/\s+/g, ' ')
    .replace(/\[.*?\]/g, '') // remove bracket tags
    .trim();

  // Split by sentence terminators
  const rawSentences = cleaned.split(/(?<=[.?!;\n])\s+/);
  const chunks: string[] = [];

  for (const s of rawSentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    if (trimmed.length <= maxLen) {
      chunks.push(trimmed);
    } else {
      // Split by commas or conjunctions if a sentence is too long
      const subParts = trimmed.split(/(?<=[,:])\s+/);
      let currentChunk = '';
      for (const part of subParts) {
        if ((currentChunk + ' ' + part).length <= maxLen) {
          currentChunk = currentChunk ? `${currentChunk} ${part}` : part;
        } else {
          if (currentChunk) chunks.push(currentChunk);
          currentChunk = part;
        }
      }
      if (currentChunk) chunks.push(currentChunk);
    }
  }

  return chunks.length > 0 ? chunks : [cleaned.slice(0, maxLen)];
}

// Global active audio controller to prevent overlapping narrations
let currentActivePlayback: {
  stop: () => void;
  id: string;
} | null = null;

export function stopAnyPlayingAudio(): void {
  if (currentActivePlayback) {
    try {
      currentActivePlayback.stop();
    } catch {
      // ignore
    }
    currentActivePlayback = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

export function isAudioPlaying(id?: string): boolean {
  if (!currentActivePlayback) return false;
  if (!id) return true;
  return currentActivePlayback.id === id;
}

/**
 * Main play function that tries high-fidelity server TTS stream first,
 * falling back to client Web Speech API with gender-matched pitch and rate.
 */
export function playLectureAudio(options: {
  text: string;
  voiceNameOrId?: string;
  playbackId?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}): { stop: () => void } {
  const { text, voiceNameOrId, playbackId = 'global', onStart, onEnd, onError } = options;

  // Stop any currently running speech
  stopAnyPlayingAudio();

  const profile = getVoiceProfile(voiceNameOrId);
  const chunks = splitTextIntoChunks(text);
  let isCancelled = false;

  let currentAudioEl: HTMLAudioElement | null = null;

  const stop = () => {
    isCancelled = true;
    if (currentAudioEl) {
      currentAudioEl.pause();
      currentAudioEl.src = '';
      currentAudioEl = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (currentActivePlayback?.id === playbackId) {
      currentActivePlayback = null;
    }
  };

  currentActivePlayback = { stop, id: playbackId };

  if (chunks.length === 0) {
    onEnd?.();
    return { stop };
  }

  // Fallback: Web Speech API with tuned pitch and rate
  const fallbackToWebSpeech = () => {
    if (isCancelled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.pitch = profile.pitch;
      utterance.rate = profile.rate;

      const voices = window.speechSynthesis.getVoices();
      const viVoices = voices.filter(
        (v) => v.lang.toLowerCase().includes('vi') || v.lang.toLowerCase().includes('vn')
      );

      // Best effort matching voice gender
      if (viVoices.length > 0) {
        let matchingVoice: SpeechSynthesisVoice | undefined;
        if (profile.gender === 'female') {
          matchingVoice = viVoices.find(
            (v) =>
              v.name.toLowerCase().includes('female') ||
              v.name.toLowerCase().includes('hoaimy') ||
              v.name.toLowerCase().includes('linh') ||
              v.name.toLowerCase().includes('nữ')
          );
        } else {
          matchingVoice = viVoices.find(
            (v) =>
              v.name.toLowerCase().includes('male') ||
              v.name.toLowerCase().includes('namminh') ||
              v.name.toLowerCase().includes('nam') ||
              v.name.toLowerCase().includes('an')
          );
        }
        utterance.voice = matchingVoice || viVoices[0];
      }

      utterance.onstart = () => {
        if (!isCancelled) onStart?.();
      };
      utterance.onend = () => {
        if (!isCancelled) {
          currentActivePlayback = null;
          onEnd?.();
        }
      };
      utterance.onerror = (e) => {
        if (!isCancelled) {
          currentActivePlayback = null;
          onError?.(e);
          onEnd?.();
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      onError?.(err);
      onEnd?.();
    }
  };

  // Primary High-Fidelity Audio Stream via /api/tts
  let currentChunkIndex = 0;

  const playNextChunk = () => {
    if (isCancelled) return;

    if (currentChunkIndex >= chunks.length) {
      currentActivePlayback = null;
      onEnd?.();
      return;
    }

    const chunkText = chunks[currentChunkIndex];
    const ttsUrl = `/api/tts?text=${encodeURIComponent(chunkText)}&lang=vi`;

    const audio = new Audio(ttsUrl);
    currentAudioEl = audio;

    // Apply voice-specific rate
    audio.playbackRate = profile.rate;

    audio.oncanplay = () => {
      if (currentChunkIndex === 0 && !isCancelled) {
        onStart?.();
      }
    };

    audio.onended = () => {
      currentChunkIndex++;
      playNextChunk();
    };

    audio.onerror = () => {
      // If server route or network fails on first chunk, seamlessly fallback to Web Speech
      if (currentChunkIndex === 0) {
        fallbackToWebSpeech();
      } else {
        // Continue to next chunk if minor glitch
        currentChunkIndex++;
        playNextChunk();
      }
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        if (currentChunkIndex === 0) {
          fallbackToWebSpeech();
        }
      });
    }
  };

  playNextChunk();

  return { stop };
}
