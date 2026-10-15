import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Headphones,
  Sliders,
  Send,
  MessageSquare,
  Bot
} from 'lucide-react';
import type { AnalysisResult, VoiceOption } from '../types.ts';
import { cleanMarkdownForSpeech } from '../utils/ai-helpers.ts';

interface VoiceAgentProps {
  currentAnalysis: AnalysisResult | null;
  isSpeaking: boolean;
  setIsSpeaking: (speaking: boolean) => void;
  onVoiceTrigger?: (action: string) => void;
}

const AVAILABLE_VOICES: VoiceOption[] = [
  { id: 'aria', name: 'Aria', voiceName: 'Kore', description: 'Executive Advisor · Articulate & Strategic', gender: 'Female' },
  { id: 'zephyr', name: 'Zephyr', voiceName: 'Zephyr', description: 'Technical Architect · Precise & Analytical', gender: 'Neutral' },
  { id: 'fenrir', name: 'Fenrir', voiceName: 'Fenrir', description: 'Risk Strategist · Direct & Observant', gender: 'Male' },
  { id: 'puck', name: 'Puck', voiceName: 'Puck', description: 'Creative Synthesizer · Dynamic & Engaging', gender: 'Male' }
];

export const VoiceAgent: React.FC<VoiceAgentProps> = ({
  currentAnalysis,
  isSpeaking,
  setIsSpeaking
}) => {
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(AVAILABLE_VOICES[0]);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeScript, setActiveScript] = useState<string>('');
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize default intro script when currentAnalysis changes
  useEffect(() => {
    if (currentAnalysis) {
      const defaultScript = `Hello! I have analyzed "${currentAnalysis.title}". The key finding is: ${currentAnalysis.summary} Let me know if you would like me to detail the action roadmap or highlight the risk factors.`;
      setActiveScript(defaultScript);
    } else {
      setActiveScript('OmniMind Voice Assist Agent is ready. Run an analysis or select a template to hear an executive audio explanation.');
    }
  }, [currentAnalysis]);

  // Handle Play / Stop
  const handleTogglePlayback = async () => {
    if (isSpeaking) {
      stopAudio();
      return;
    }

    if (!activeScript) return;
    await speakText(activeScript);
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Speak text via Gemini TTS API or browser fallback
  const speakText = async (textToSpeak: string) => {
    stopAudio();
    setIsLoadingAudio(true);
    setErrorMessage(null);

    const cleanText = cleanMarkdownForSpeech(textToSpeak);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          voice: selectedVoice.voiceName,
          style: 'Executive, articulate, conversational audio guide',
        }),
      });

      if (!response.ok) {
        throw new Error('TTS server responded with status ' + response.status);
      }

      const data = await response.json();

      if (data.audioBase64) {
        const url = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
        setAudioUrl(url);

        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.playbackRate = playbackSpeed;
          audioRef.current.muted = isMuted;
          await audioRef.current.play();
          setIsSpeaking(true);
        }
      } else {
        // Fallback to browser speech synthesis
        fallbackSpeech(cleanText);
      }
    } catch {
      // Graceful fallback to browser Web Speech API
      fallbackSpeech(cleanText);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const fallbackSpeech = (cleanText: string) => {
    if (!('speechSynthesis' in window)) {
      setErrorMessage('Audio synthesis is not supported on this browser.');
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = playbackSpeed;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Dedicated action walkthroughs
  const handleQuickExplain = async (type: 'summary' | 'findings' | 'actions' | 'risks') => {
    if (!currentAnalysis) {
      setErrorMessage('Please run an analysis first.');
      return;
    }

    let scriptText = '';
    switch (type) {
      case 'summary':
        scriptText = `Executive summary for ${currentAnalysis.title}: ${currentAnalysis.summary} Overall confidence rating is ${currentAnalysis.confidenceScore} percent.`;
        break;
      case 'findings':
        scriptText = `Here are the top findings for ${currentAnalysis.title}: First, ${currentAnalysis.keyFindings.slice(0, 3).join('. Next, ')}.`;
        break;
      case 'actions':
        scriptText = `Here is your strategic action plan: Priority one: ${currentAnalysis.actionItems[0] || 'Implement baseline changes'}. Priority two: ${currentAnalysis.actionItems[1] || 'Monitor metrics'}. Next: ${currentAnalysis.actionItems[2] || 'Scale deployment'}.`;
        break;
      case 'risks':
        scriptText = `Strategic risk advisory: We identified the following critical vulnerabilities: ${currentAnalysis.risks.join('. In addition: ')}. Immediate mitigation is advised.`;
        break;
    }

    setActiveScript(scriptText);
    await speakText(scriptText);
  };

  // Custom question to Voice Agent
  const handleAskAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    setIsLoadingAudio(true);
    setErrorMessage(null);
    const q = customQuestion;
    setCustomQuestion('');

    try {
      const response = await fetch('/api/agent-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: currentAnalysis || { title: 'General Inquiries' },
          question: q,
          voice: selectedVoice.voiceName,
          persona: selectedVoice.name,
        }),
      });

      const data = await response.json();
      const script = data.script || `Regarding "${q}": I recommend prioritizing immediate workflow validation and continuous feedback cycles.`;
      setActiveScript(script);

      if (data.audioBase64) {
        const url = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
        setAudioUrl(url);
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.playbackRate = playbackSpeed;
          audioRef.current.muted = isMuted;
          await audioRef.current.play();
          setIsSpeaking(true);
        }
      } else {
        fallbackSpeech(cleanMarkdownForSpeech(script));
      }
    } catch {
      const fallbackMsg = `Regarding "${q}": Based on our intelligence matrix, ensure all dependencies are locked and progress is reviewed daily.`;
      setActiveScript(fallbackMsg);
      fallbackSpeech(fallbackMsg);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm">
      <audio
        ref={audioRef}
        onEnded={() => setIsSpeaking(false)}
        onError={() => setIsSpeaking(false)}
        className="hidden"
      />

      {/* Header bar of Voice Agent */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
            isSpeaking
              ? 'border-indigo-500/60 bg-indigo-500/20 text-indigo-400'
              : 'border-slate-700 bg-slate-800 text-slate-400'
          }`}>
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Voice Assist Agent</h2>
              <span className="text-xs text-slate-400">· {selectedVoice.name} Persona</span>
              {isSpeaking && (
                <span className="text-xs text-indigo-400 font-medium">· Speaking live</span>
              )}
            </div>
            <p className="text-xs text-slate-400">{selectedVoice.description}</p>
          </div>
        </div>

        {/* Voice Persona Selector & Speed */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-800/80 px-2 py-1 text-xs text-slate-300">
            <Headphones className="h-3.5 w-3.5 text-indigo-400" />
            <select
              aria-label="Select Voice Persona"
              value={selectedVoice.id}
              onChange={(e) => {
                const found = AVAILABLE_VOICES.find(v => v.id === e.target.value);
                if (found) setSelectedVoice(found);
              }}
              className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer"
            >
              {AVAILABLE_VOICES.map((voice) => (
                <option key={voice.id} value={voice.id} className="bg-slate-900 text-slate-200">
                  {voice.name} ({voice.gender})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-800/80 px-2 py-1 text-xs text-slate-300">
            <Sliders className="h-3.5 w-3.5 text-indigo-400" />
            <select
              aria-label="Playback Speed"
              value={playbackSpeed}
              onChange={(e) => {
                const rate = parseFloat(e.target.value);
                setPlaybackSpeed(rate);
                if (audioRef.current) audioRef.current.playbackRate = rate;
              }}
              className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer"
            >
              <option value="0.8" className="bg-slate-900">0.8x</option>
              <option value="1.0" className="bg-slate-900">1.0x</option>
              <option value="1.25" className="bg-slate-900">1.25x</option>
              <option value="1.5" className="bg-slate-900">1.5x</option>
            </select>
          </div>
        </div>
      </div>

      {/* Real-time Waveform & Audio Player Controller */}
      <div className="my-4 flex flex-col md:flex-row items-center justify-between gap-4 rounded-lg bg-slate-950/70 border border-slate-800/80 p-3.5">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={handleTogglePlayback}
            disabled={isLoadingAudio}
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-white font-medium shadow-sm transition-colors cursor-pointer ${
              isSpeaking
                ? 'bg-rose-600 hover:bg-rose-500'
                : 'bg-indigo-600 hover:bg-indigo-500'
            } ${isLoadingAudio ? 'opacity-60 cursor-not-allowed' : ''}`}
            aria-label={isSpeaking ? 'Pause voice explanation' : 'Play voice explanation'}
          >
            {isLoadingAudio ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isSpeaking ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 fill-white" />
            )}
          </button>

          <button
            type="button"
            onClick={() => speakText(activeScript)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            aria-label="Replay audio explanation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              if (audioRef.current) audioRef.current.muted = nextMuted;
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            aria-label={isMuted ? 'Unmute voice' : 'Mute voice'}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white">
              {isSpeaking ? 'Agent Speaking' : isLoadingAudio ? 'Synthesizing Speech...' : 'Audio Ready'}
            </span>
            <span className="text-[11px] text-slate-400">
              Gemini 3.8 Flash-Lite TTS (24kHz Mono WAV)
            </span>
          </div>
        </div>

        {/* Frequency Waveform Animation */}
        <div className="flex items-center gap-1.5 h-7 px-3 py-1 bg-slate-900/90 rounded border border-slate-800/80">
          {[40, 70, 90, 50, 85, 30, 65, 95, 45, 60, 80, 55, 35, 75, 90, 50].map((heightPercent, idx) => (
            <span
              key={idx}
              className={`w-1 rounded-full transition-all duration-150 ${
                isSpeaking
                  ? 'bg-indigo-400 animate-pulse'
                  : 'bg-slate-700'
              }`}
              style={{
                height: isSpeaking ? `${Math.max(20, (heightPercent + ((idx * 7) % 30)) % 100)}%` : '20%',
                animationDelay: `${idx * 0.08}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Live Transcript / Explanation Box */}
      <div className="rounded-lg border border-slate-800/90 bg-slate-950/50 p-3.5">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium text-slate-300">Live Voice Script</span>
          {audioUrl && (
            <a
              href={audioUrl}
              download="omnimind-voice-explanation.wav"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Download WAV
            </a>
          )}
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-normal">
          "{activeScript}"
        </p>
      </div>

      {/* Quick Spoken Insights Shortcuts */}
      <div className="mt-4">
        <span className="text-xs font-medium text-slate-400 block mb-2">
          Instant Voice Explanations:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handleQuickExplain('summary')}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/70 px-2.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Executive Brief</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickExplain('findings')}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/70 px-2.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
          >
            <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
            <span>Key Findings</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickExplain('actions')}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/70 px-2.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
          >
            <Bot className="h-3.5 w-3.5 text-indigo-400" />
            <span>Action Roadmap</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickExplain('risks')}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/70 px-2.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
          >
            <Volume2 className="h-3.5 w-3.5 text-rose-400" />
            <span>Critical Risks</span>
          </button>
        </div>
      </div>

      {/* Ask Voice Agent a Custom Question */}
      <form onSubmit={handleAskAgent} className="mt-4 flex items-center gap-2">
        <label htmlFor="voice-inquiry" className="sr-only">Ask Voice Agent</label>
        <input
          id="voice-inquiry"
          type="text"
          value={customQuestion}
          onChange={(e) => setCustomQuestion(e.target.value)}
          placeholder="Ask voice agent: e.g. What should be done first in sprint 1?"
          className="flex-1 rounded-lg border border-slate-800 bg-slate-950/80 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoadingAudio || !customQuestion.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Ask Voice</span>
        </button>
      </form>

      {errorMessage && (
        <p className="mt-2 text-xs text-amber-400 font-medium">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
