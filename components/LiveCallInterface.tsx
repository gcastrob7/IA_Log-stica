import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Mic, MicOff, Phone, PhoneOff, Activity, AlertCircle } from 'lucide-react';
import { API_KEY, LIVE_MODEL_NAME, PAISA_SYSTEM_INSTRUCTION } from '../constants';
import { ConnectionState } from '../types';

// --- Audio Helpers (Custom Implementation as per Guidelines) ---

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  
  let binary = '';
  const bytes = new Uint8Array(int16.buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  return {
    data: base64,
    mimeType: 'audio/pcm;rate=16000',
  };
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- Component ---

export const LiveCallInterface: React.FC = () => {
  const [status, setStatus] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // References
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  
  // Ref to track mute state inside closures
  const isMicMutedRef = useRef(isMicMuted);

  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  const cleanup = () => {
    // Stop all audio sources
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();

    // Close Audio Contexts
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }

    // Stop Microphone Stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    // Close Session (Dereference)
    liveSessionRef.current = null;

    // Disconnect processor
    if (processorRef.current) {
        try {
            processorRef.current.disconnect();
        } catch (e) {
            console.error("Error disconnecting processor", e);
        }
        processorRef.current = null;
    }

    setStatus(ConnectionState.DISCONNECTED);
    nextStartTimeRef.current = 0;
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, []);

  const startCall = async () => {
    setStatus(ConnectionState.CONNECTING);
    setErrorMessage(null);

    try {
      // 1. Initialize Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      
      // Safety check for AudioContext support
      if (!AudioContextClass) {
        throw new Error("AudioContext not supported in this browser");
      }

      inputAudioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
      
      const outputNode = outputAudioContextRef.current.createGain();
      outputNode.connect(outputAudioContextRef.current.destination);

      // 2. Get User Media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // 3. Initialize Gemini Client
      const ai = new GoogleGenAI({ apiKey: API_KEY });

      // 4. Connect to Live API
      const sessionPromise = ai.live.connect({
        model: LIVE_MODEL_NAME,
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Connected');
            setStatus(ConnectionState.CONNECTED);

            // Set up audio processing pipeline
            if (!inputAudioContextRef.current) return;
            
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              // Use Ref for current mute state
              if (isMicMutedRef.current) return; 

              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);

              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output from Model
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              
              // Ensure playback time logic
              nextStartTimeRef.current = Math.max(
                nextStartTimeRef.current,
                ctx.currentTime
              );

              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                ctx,
                24000,
                1
              );

              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              console.log('Interrupted');
              sourcesRef.current.forEach(source => source.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            console.log('Gemini Live Closed');
            cleanup();
          },
          onerror: (err) => {
            console.error('Gemini Live Error', err);
            setErrorMessage("Error de conexión con la IA. Verifica tu API Key.");
            setStatus(ConnectionState.ERROR);
            // Don't fully cleanup here to allow user to see error and retry
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            // Using 'Kore' as it is typically a female voice
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: PAISA_SYSTEM_INSTRUCTION
        }
      });
      
      liveSessionRef.current = sessionPromise;

    } catch (error) {
      console.error("Failed to start call:", error);
      setErrorMessage("No se pudo iniciar la llamada. Verifica permisos de micrófono.");
      setStatus(ConnectionState.ERROR);
      cleanup();
    }
  };

  const endCall = () => {
    cleanup();
  };

  const toggleMic = () => {
    setIsMicMuted(!isMicMuted);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-white">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900 opacity-90 z-0"></div>
      
      {/* Animated Rings for Call Status */}
      {status === ConnectionState.CONNECTED && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] z-0">
           <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-20 animate-ping"></span>
           <span className="absolute inline-flex h-[80%] w-[80%] top-[10%] left-[10%] rounded-full bg-rose-500 opacity-20 animate-pulse delay-75"></span>
        </div>
      )}

      <div className="z-10 flex flex-col items-center space-y-8 w-full max-w-md">
        
        {/* Status Display */}
        <div className="text-center space-y-2">
           <h2 className="text-2xl font-bold tracking-wide">
             {status === ConnectionState.CONNECTED ? "En llamada con Camila" : "Llamada Logística"}
           </h2>
           <p className={`text-sm font-medium px-3 py-1 rounded-full inline-block ${
             status === ConnectionState.CONNECTED ? "bg-green-500/20 text-green-300" :
             status === ConnectionState.CONNECTING ? "bg-yellow-500/20 text-yellow-300" :
             status === ConnectionState.ERROR ? "bg-red-500/20 text-red-300" :
             "bg-slate-700 text-slate-300"
           }`}>
             {status === ConnectionState.CONNECTED ? "● Conectado - Voz Activa" :
              status === ConnectionState.CONNECTING ? "Estableciendo conexión..." :
              status === ConnectionState.ERROR ? "Error de conexión" :
              "Listo para conectar"}
           </p>
        </div>

        {/* Visualizer / Avatar */}
        <div className="relative w-40 h-40 rounded-full border-4 border-slate-700 bg-slate-800 flex items-center justify-center shadow-inner">
            {status === ConnectionState.CONNECTED ? (
               <Activity size={64} className="text-rose-400 animate-pulse" />
            ) : (
               <Phone size={64} className="text-slate-500" />
            )}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2 text-sm text-center">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-6">
          {status === ConnectionState.DISCONNECTED || status === ConnectionState.ERROR ? (
            <button 
              onClick={startCall}
              className="group relative flex items-center gap-3 bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-green-500/30 hover:-translate-y-1"
            >
              <Phone className="animate-bounce" />
              Iniciar Llamada
            </button>
          ) : (
            <>
              <button 
                onClick={toggleMic}
                className={`p-5 rounded-full transition-all border-2 ${
                  isMicMuted 
                    ? 'bg-slate-700 border-slate-600 text-red-400 hover:bg-slate-600' 
                    : 'bg-white text-slate-900 border-transparent hover:bg-slate-200'
                }`}
              >
                {isMicMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              
              <button 
                onClick={endCall}
                className="p-5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all border-4 border-slate-900 hover:border-red-900 shadow-lg"
              >
                <PhoneOff size={24} />
              </button>
            </>
          )}
        </div>

        <div className="text-xs text-slate-400 text-center max-w-xs">
          <p>Experimenta la IA con latencia ultrabaja.</p>
          <p className="mt-1 opacity-75">Modelo: {LIVE_MODEL_NAME}</p>
        </div>
      </div>
    </div>
  );
};