import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, MicOff, Bell, LogIn, LogOut, Calendar, 
  Clock, CheckCircle2, AlertCircle, Loader2, Sparkles,
  Phone, PhoneOff, X, Volume2, LayoutDashboard, ListTodo,
  Settings as SettingsIcon, User as UserIcon, ChevronRight,
  Plus, Trash2, Edit3, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, signIn, signOut, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, addDoc, query, where, orderBy, 
  onSnapshot, serverTimestamp, Timestamp,
  updateDoc, doc, deleteDoc, setDoc
} from 'firebase/firestore';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { format } from 'date-fns';

// --- Types ---

interface Reminder {
  id: string;
  task: string;
  datetime: string;
  repeat: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  original_text: string;
  userId: string;
  createdAt: Timestamp;
}

// --- Audio Utilities ---

const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000; // Higher quality for more natural voice

function floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// --- Main Component ---

type View = 'DASHBOARD' | 'ASSISTANT' | 'REMINDERS' | 'SETTINGS';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userTranscription, setUserTranscription] = useState("");
  const [smartyTranscription, setSmartyTranscription] = useState("");
  const [reminderCreatedInSession, setReminderCreatedInSession] = useState(false);
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [incomingCall, setIncomingCall] = useState<{ reminder: Reminder, type: 'PREPARATION' | 'FINAL' } | null>(null);
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<{buffer: AudioBuffer, time: number}[]>([]);
  const nextStartTimeRef = useRef<number>(0);

  // --- Auth & Data ---

  useEffect(() => {
  // مستخدم وهمي للتطوير
  const guestUser = {
    uid: 'guest-123',
    email: 'guest@example.com',
    displayName: 'ضيف',
    // أضف أي خصائص أخرى يتوقعها التطبيق
  };
  setUser(guestUser as any); // استخدم as any إذا كان النوع صارمًا
  setIsAuthReady(true);
}, []);
  
useEffect(() => {
    if (!user) {
      setReminders([]);
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reminder[];
      setReminders(data);
    }, (err) => {
      console.error("Firestore error:", err);
      setError("Failed to load reminders.");
    });

    return unsubscribe;
  }, [user]);

  // --- Reminder Monitoring ---

  useEffect(() => {
    if (!user || reminders.length === 0) return;

    const checkReminders = () => {
      const now = new Date();
      
      reminders.forEach(reminder => {
        if (notifiedIds.has(reminder.id)) return;

        const reminderTime = new Date(reminder.datetime);
        const diffMs = reminderTime.getTime() - now.getTime();
        const diffSecs = diffMs / 1000;

        // Trigger if we are within 30 seconds of the appointment or it passed in the last 5 minutes
        if (diffSecs <= 10 && diffSecs > -300) {
          console.log("!!! TRIGGERING REMINDER !!!", reminder.task);
          
          // Fallback Alert in case UI/Audio fails
          try {
            // Using a non-blocking way to notify if possible, but alert is the most reliable fallback
            if (document.visibilityState !== 'visible') {
              // If tab is hidden, we try to get attention
              document.title = `🔔 تذكير: ${reminder.task}`;
            }
          } catch (e) {}

          setIncomingCall({ reminder, type: 'FINAL' });
          setNotifiedIds(prev => {
            const next = new Set(prev);
            next.add(reminder.id);
            return next;
          });
          playRingtone();
        }
      });
    };

    const interval = setInterval(checkReminders, 3000); // Check every 3s for maximum precision
    return () => clearInterval(interval);
  }, [user, reminders, notifiedIds]);

  const playRingtone = () => {
    // Simple beep pattern to simulate ringtone
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.1, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    [0, 0.5, 1, 1.5].forEach(delay => {
      playTone(440, ctx.currentTime + delay, 0.3);
      playTone(660, ctx.currentTime + delay + 0.1, 0.3);
    });
  };

  const handleDeclineCall = async () => {
    if (!incomingCall) return;
    
    const { reminder } = incomingCall;
    setIncomingCall(null);

    // Reschedule logic: Move the reminder 5 minutes into the future
    try {
      const newTime = new Date(Date.now() + 5 * 60000).toISOString();
      const reminderRef = doc(db, 'reminders', reminder.id);
      await updateDoc(reminderRef, {
        datetime: newTime
      });
      
      // Remove from notified so it can trigger again
      setNotifiedIds(prev => {
        const next = new Set(prev);
        next.delete(reminder.id);
        return next;
      });
      
      console.log(`Smarty: تم إعادة جدولة "${reminder.task}" بعد 5 دقائق.`);
    } catch (err) {
      console.error("Error rescheduling reminder:", err);
    }
  };

  // --- Audio Playback ---

  const handleAudioOutput = useCallback(async (base64Data: string) => {
    if (!audioContextRef.current) return;
    
    const arrayBuffer = base64ToArrayBuffer(base64Data);
    const int16Data = new Int16Array(arrayBuffer);
    const buffer = audioContextRef.current.createBuffer(1, int16Data.length, OUTPUT_SAMPLE_RATE);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < int16Data.length; i++) {
      channelData[i] = int16Data[i] / 32768;
    }
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    
    const currentTime = audioContextRef.current.currentTime;
    if (nextStartTimeRef.current < currentTime) {
      nextStartTimeRef.current = currentTime + 0.05; // Small buffer
    }
    
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buffer.duration;
  }, []);

  const startSession = async (callContext?: { task: string, type: 'PREPARATION' | 'FINAL' }) => {
    if (!user) return;
    setIsConnecting(true);
    setError(null);
    setIncomingCall(null); // Close call screen if answering

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("متصفحك لا يدعم الوصول إلى الميكروفون. يرجى استخدام Chrome أو Safari حديث.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      audioContextRef.current = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE });
      
      try {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: INPUT_SAMPLE_RATE
          } 
        });
      } catch (micErr: any) {
        console.error("Microphone access denied:", micErr);
        if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
          throw new Error("تم رفض الوصول للميكروفون. يرجى تفعيل الإذن من إعدادات المتصفح بجانب رابط الموقع.");
        }
        throw new Error("تعذر الوصول للميكروفون. تأكد من أنه غير مستخدم من قبل تطبيق آخر.");
      }

      // Ensure AudioContext is running (required by some browsers)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: `[SMARTY ULTRA-INTELLIGENT V5.1 - MALE USER MODE]
أنت Smarty، المساعد الصوتي الأكثر ذكاءً وتفاعلاً. أنت رفيق ذكي يفهم ما وراء الكلمات ويهتم بتنظيم حياة المستخدم ببراعة.

## تنبيه هام جداً:
المستخدم هو **شاب (ذكر)**. يجب عليك دائماً استخدام صيغة المذكر في المخاطبة (مثلاً: "أهلاً بك يا أخي"، "كيف حالك؟"، "لقد حفظت موعدك"). لا تستخدم صيغة المؤنث أبداً.

## قدراتك الفائقة:
1. **مترجم اللهجات**: أنت خبير في اللهجة الجزائرية والمغربية. حول الكلمات مثل "ديرلي"، "حاب"، "غدوة"، "على الزوج" إلى بيانات دقيقة فوراً.
2. **الاستنتاج الاستباقي**: إذا ذكر المستخدم حدثاً (مثل: "عندي مباراة غداً")، بادر فوراً: "هل تود أن أذكرك بموعد المباراة؟".
3. **الذاكرة السياقية**: استخدم قائمة التذكيرات أدناه للإجابة على أي سؤال حول الجدول الزمني أو لتجنب التعارض.

## قائمة التذكيرات الحالية:
${reminders.length > 0 ? reminders.map(r => `- ${r.task} في ${new Date(r.datetime).toLocaleString('ar-EG')}`).join('\n') : 'لا توجد تذكيرات حالياً.'}

${callContext ? `\n## سياق المكالمة:\nأنت تتصل الآن لتذكر المستخدم بـ: ${callContext.task}. كن ودوداً جداً وتأكد من استلامه للتنبيه.` : ''}

## القواعد الذهبية:
- الرد دائماً بالعربية الفصحى الراقية.
- كن مبادراً، ودوداً، ومختصراً.
- احفظ المواعيد بأقل قدر من المعلومات (استخدم القيم الافتراضية الذكية).
- الوقت المحلي الآن: ${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}.
- التاريخ: ${new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`,
          tools: [{
            functionDeclarations: [{
              name: "create_reminder",
              description: "حفظ تذكير في قاعدة البيانات بذكاء",
              parameters: {
                type: "OBJECT" as any,
                properties: {
                  task: { type: "STRING" as any, description: "وصف المهمة" },
                  datetime: { type: "STRING" as any, description: "ISO 8601 (بدون Z)" },
                  category: { type: "STRING" as any, description: "صحة، عمل، شخصي، إلخ" },
                  priority: { type: "STRING" as any, enum: ["low", "medium", "high"] }
                },
                required: ["task", "datetime"]
              }
            }]
          }]
        },
        callbacks: {
          onopen: () => {
            setIsLive(true);
            setIsConnecting(false);
            
            // If it's a call, send an initial greeting trigger
            if (callContext) {
              session.sendRealtimeInput({
                text: `أهلاً بك، أنا أتصل لأذكرك بخصوص: ${callContext.task}. ابدأ الحديث معي.`
              });
            }

            // Start streaming microphone
            const source = audioContextRef.current!.createMediaStreamSource(streamRef.current!);
            processorRef.current = audioContextRef.current!.createScriptProcessor(2048, 1, 1);
            
            processorRef.current.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBuffer = floatTo16BitPCM(inputData);
              
              // More robust base64 conversion
              const bytes = new Uint8Array(pcmBuffer);
              let binary = '';
              for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              const base64 = btoa(binary);

              session.sendRealtimeInput({
                media: { data: base64, mimeType: 'audio/pcm;rate=16000' }
              });
            };
            
            source.connect(processorRef.current);
            // Connect to a mute node to keep the processor running without feedback
            const muteNode = audioContextRef.current!.createGain();
            muteNode.gain.value = 0;
            processorRef.current.connect(muteNode);
            muteNode.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            console.log("Gemini Message:", message);
            
            // Handle Transcriptions
            const modelParts = message.serverContent?.modelTurn?.parts;
            if (modelParts) {
              const textPart = modelParts.find(p => p.text);
              if (textPart?.text) {
                setSmartyTranscription(prev => prev + " " + textPart.text);
              }
            }

            const userParts = (message.serverContent as any)?.userTurn?.parts;
            if (userParts) {
              const textPart = userParts.find(p => p.text);
              if (textPart?.text) {
                setUserTranscription(textPart.text);
                setSmartyTranscription(""); // Clear assistant text when user starts speaking
              }
            }

            // Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              handleAudioOutput(base64Audio);
            }

            // Interruption
            if (message.serverContent?.interrupted) {
              nextStartTimeRef.current = 0;
            }

            // Tool Calls
            const toolCall = (message.serverContent?.modelTurn?.parts?.[0] as any)?.call;
            if (toolCall?.name === "create_reminder") {
              const args = toolCall.args as any;
              try {
                setReminderCreatedInSession(true);
                await addDoc(collection(db, 'reminders'), {
                  ...args,
                  userId: user.uid,
                  createdAt: serverTimestamp()
                });
                session.sendToolResponse({
                  functionResponses: [{
                    id: toolCall.id,
                    name: "create_reminder",
                    response: { success: true }
                  }]
                });
              } catch (err) {
                console.error("Failed to save reminder:", err);
                session.sendToolResponse({
                  functionResponses: [{
                    id: toolCall.id,
                    name: "create_reminder",
                    response: { success: false, error: "Database error" }
                  }]
                });
              }
            }
          },
          onclose: () => stopSession(),
          onerror: (err) => {
            console.error("Live API error:", err);
            setError("Connection lost. Please try again.");
            stopSession();
          }
        }
      });
      
      sessionRef.current = session;
    } catch (err: any) {
      console.error("Failed to start session:", err);
      setError(err.message || "تعذر الاتصال بالذكاء الاصطناعي أو الوصول للميكروفون.");
      setIsConnecting(false);
    }
  };
  const stopSession = async () => {
    // Auto-save logic: if no reminder was created and there's transcription, try one last time in background
    if (!reminderCreatedInSession && userTranscription.trim().length > 10 && user) {
      console.log("Attempting background auto-save...");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `استخرج التذكير من النص التالي واحفظه إذا وجدته: "${userTranscription}". الوقت الحالي: ${new Date().toLocaleString()}. إذا وجدت تذكيراً، رد بصيغة JSON فقط تحتوي على task و datetime.`,
          config: { responseMimeType: "application/json" }
        });
        
        if (response.text) {
          const data = JSON.parse(response.text);
          if (data.task && data.datetime) {
            await addDoc(collection(db, 'reminders'), {
              ...data,
              userId: user.uid,
              createdAt: serverTimestamp(),
              priority: 'medium',
              category: 'General'
            });
          }
        }
      } catch (err) {
        console.error("Background auto-save failed:", err);
      }
    }

    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsLive(false);
    setIsConnecting(false);
    setReminderCreatedInSession(false);
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#0a0502] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#ff4e00] animate-spin" />
      </div>
    );
  }

  const renderView = () => {
    if (!user) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="w-24 h-24 bg-[#ff4e00] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#ff4e00]/20 mx-auto mb-8">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-5xl lg:text-7xl font-light leading-tight text-white">
              Simple. <span className="italic font-serif text-[#ff4e00]">Smart.</span>
            </h2>
            <p className="text-xl text-[#e0d8d0]/60 max-w-md mx-auto">
              Connect your account to start managing your life with just your voice.
            </p>
            <button 
              onClick={signIn}
              className="mt-8 flex items-center gap-3 px-10 py-5 bg-[#ff4e00] text-white rounded-full font-bold text-lg hover:bg-[#ff4e00]/90 transition-all shadow-xl shadow-[#ff4e00]/20 mx-auto"
            >
              <LogIn className="w-6 h-6" />
              <span>Get Started</span>
            </button>
          </motion.div>
        </div>
      );
    }

    switch (currentView) {
      case 'DASHBOARD':
        return (
          <div className="flex-1 p-8 space-y-10 overflow-y-auto custom-scrollbar">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-light text-white">Welcome back, <span className="font-medium">{user.displayName?.split(' ')[0]}</span></h2>
                <p className="text-[#e0d8d0]/40 mt-2">Here's what's happening with your Smarty today.</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-light text-white">{format(new Date(), 'EEEE, MMM d')}</p>
                <p className="text-[#ff4e00] font-mono">{format(new Date(), 'HH:mm')}</p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-3xl font-light text-white">{reminders.length}</p>
                  <p className="text-sm text-[#e0d8d0]/40 uppercase tracking-widest">Active Reminders</p>
                </div>
              </div>
              <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-3xl font-light text-white">{notifiedIds.size}</p>
                  <p className="text-sm text-[#e0d8d0]/40 uppercase tracking-widest">Completed Today</p>
                </div>
              </div>
              <div className="p-8 bg-[#ff4e00] rounded-[2rem] space-y-4 group cursor-pointer" onClick={() => setCurrentView('ASSISTANT')}>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">Talk to Smarty</p>
                  <p className="text-white/70 text-sm">Start a voice session now</p>
                </div>
                <ChevronRight className="w-6 h-6 text-white/40 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <section className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium text-white">Upcoming Reminders</h3>
                  <button onClick={() => setCurrentView('REMINDERS')} className="text-sm text-[#ff4e00] hover:underline">View all</button>
                </div>
                <div className="space-y-4">
                  {reminders.slice(0, 3).map(reminder => (
                    <div key={reminder.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-between group hover:bg-white/[0.07] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${reminder.priority === 'high' ? 'bg-red-500' : 'bg-blue-500'}`} />
                        <div>
                          <h4 className="text-white font-medium">{reminder.task}</h4>
                          <p className="text-xs text-[#e0d8d0]/40">{format(new Date(reminder.datetime), 'h:mm a')}</p>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-[#e0d8d0]/20 group-hover:text-[#ff4e00] transition-colors">{reminder.category}</span>
                    </div>
                  ))}
                  {reminders.length === 0 && (
                    <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-30 italic">
                      No reminders scheduled
                    </div>
                  )}
                </div>
              </section>

              <section className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6">
                <h3 className="text-xl font-medium text-white">Smart Insights</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 shrink-0 bg-[#ff4e00]/10 rounded-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-[#ff4e00]" />
                    </div>
                    <p className="text-sm text-[#e0d8d0]/60 leading-relaxed">
                      You have <span className="text-white font-medium">{reminders.filter(r => r.priority === 'high').length} high priority</span> tasks today. Smarty suggests starting with your most urgent one.
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-xs text-[#e0d8d0]/40 uppercase tracking-widest mb-2 font-bold">Quick Tip</p>
                    <p className="text-sm italic text-[#e0d8d0]/60">"Just say 'Smarty, remind me to buy milk at 6 PM' to quickly add a task."</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        );

      case 'ASSISTANT':
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="w-full max-w-2xl flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center w-80 h-80">
                <AnimatePresence>
                  {isLive && (
                    <>
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0.1, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-[#ff4e00] rounded-full blur-3xl"
                      />
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.2, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute inset-8 bg-[#ff4e00] rounded-full blur-2xl"
                      />
                    </>
                  )}
                </AnimatePresence>
                
                <button
                  onClick={isLive ? stopSession : () => startSession()}
                  disabled={isConnecting}
                  className={`relative z-20 w-48 h-48 rounded-full flex items-center justify-center transition-all duration-700 shadow-[0_0_50px_rgba(255,78,0,0.2)] hover:shadow-[0_0_80px_rgba(255,78,0,0.4)] ${
                    isLive 
                      ? 'bg-white text-[#0a0502] scale-110' 
                      : 'bg-[#ff4e00] text-white hover:scale-105'
                  } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isConnecting ? (
                    <Loader2 className="w-16 h-16 animate-spin" />
                  ) : isLive ? (
                    <MicOff className="w-16 h-16" />
                  ) : (
                    <Mic className="w-16 h-16" />
                  )}
                </button>
              </div>

              <div className="mt-12 text-center space-y-4">
                <h3 className="text-2xl font-light text-white">
                  {isLive ? "Smarty is listening..." : isConnecting ? "Connecting to Smarty..." : "Tap to speak with Smarty"}
                </h3>
                <p className="text-[#e0d8d0]/40 max-w-md mx-auto">
                  {isLive ? "Try saying: 'Remind me to call my brother tomorrow at 10 AM'" : "Your ultra-intelligent voice companion is ready."}
                </p>
              </div>

              {smartyTranscription && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12 p-8 bg-white/5 border border-white/10 rounded-[2.5rem] w-full"
                >
                  <p className="text-xl font-serif italic text-white/80 leading-relaxed">
                    "{smartyTranscription}"
                  </p>
                </motion.div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 flex items-center justify-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm mx-auto"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
            </div>
          </div>
        );

      case 'REMINDERS':
        const filteredReminders = reminders.filter(r => 
          r.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.category.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
          <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar">
            <header className="flex justify-between items-center">
              <h2 className="text-3xl font-light text-white">All Reminders</h2>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e0d8d0]/30" />
                <input 
                  type="text" 
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-6 py-3 bg-white/5 border border-white/10 rounded-full text-sm focus:outline-none focus:border-[#ff4e00]/50 transition-colors w-64"
                />
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredReminders.map(reminder => (
                <motion.div
                  key={reminder.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-6 group hover:border-[#ff4e00]/30 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      reminder.priority === 'high' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {reminder.priority}
                    </span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={async () => {
                          if (confirm('Are you sure you want to delete this reminder?')) {
                            await deleteDoc(doc(db, 'reminders', reminder.id));
                          }
                        }}
                        className="p-2 hover:bg-red-500/10 rounded-full text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-medium text-white leading-tight">{reminder.task}</h4>
                  
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#e0d8d0]/40 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(reminder.datetime), 'MMM d, h:mm a')}
                    </div>
                    <span className="text-[10px] text-[#e0d8d0]/20 font-bold uppercase tracking-widest">{reminder.category}</span>
                  </div>
                </motion.div>
              ))}
              {filteredReminders.length === 0 && (
                <div className="col-span-full py-32 text-center space-y-4 opacity-20">
                  <Calendar className="w-20 h-20 mx-auto" />
                  <p className="text-xl italic">No reminders found</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'SETTINGS':
        return (
          <div className="flex-1 p-8 space-y-12 overflow-y-auto custom-scrollbar">
            <header>
              <h2 className="text-3xl font-light text-white">Settings</h2>
              <p className="text-[#e0d8d0]/40 mt-2">Manage your Smarty profile and preferences.</p>
            </header>

            <div className="max-w-2xl space-y-10">
              <section className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-[#ff4e00] rounded-3xl flex items-center justify-center text-white text-3xl font-bold">
                    {user.displayName?.[0] || 'U'}
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium text-white">{user.displayName}</h3>
                    <p className="text-[#e0d8d0]/40">{user.email}</p>
                  </div>
                </div>
                <div className="pt-8 border-t border-white/5 flex gap-4">
                  <button onClick={signOut} className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/10 rounded-full text-sm font-medium transition-all">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-xl font-medium text-white">Preferences</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Voice Feedback', desc: 'Allow Smarty to speak back to you', icon: Volume2, active: true },
                    { label: 'Push Notifications', desc: 'Get alerts on your device', icon: Bell, active: true },
                    { label: 'Immersive Mode', desc: 'Enable full-screen voice interaction', icon: Sparkles, active: false },
                  ].map(pref => (
                    <div key={pref.label} className="p-6 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                          <pref.icon className="w-5 h-5 text-[#ff4e00]" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{pref.label}</p>
                          <p className="text-xs text-[#e0d8d0]/40">{pref.desc}</p>
                        </div>
                      </div>
                      <div className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${pref.active ? 'bg-[#ff4e00]' : 'bg-white/10'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${pref.active ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0502] text-[#e0d8d0] font-sans selection:bg-[#ff4e00]/30 overflow-hidden relative flex">
      {/* Immersive Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#3a1510] blur-[120px] opacity-40" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#ff4e00] blur-[120px] opacity-10" />
      </div>

      {/* Sidebar */}
      {user && (
        <aside className={`relative z-30 bg-black/20 backdrop-blur-xl border-r border-white/5 transition-all duration-500 flex flex-col ${isSidebarOpen ? 'w-72' : 'w-24'}`}>
          <div className="p-8 flex items-center gap-4">
            <div className="w-10 h-10 bg-[#ff4e00] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-[#ff4e00]/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            {isSidebarOpen && <h1 className="text-xl font-bold tracking-tight text-white">Smarty</h1>}
          </div>

          <nav className="flex-1 px-4 py-8 space-y-2">
            {[
              { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'ASSISTANT', icon: Mic, label: 'Assistant' },
              { id: 'REMINDERS', icon: ListTodo, label: 'Reminders' },
              { id: 'SETTINGS', icon: SettingsIcon, label: 'Settings' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                  currentView === item.id 
                    ? 'bg-[#ff4e00] text-white shadow-lg shadow-[#ff4e00]/20' 
                    : 'text-[#e0d8d0]/40 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-6 h-6 shrink-0" />
                {isSidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="p-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full p-4 rounded-2xl bg-white/5 text-[#e0d8d0]/20 hover:text-white transition-colors flex items-center justify-center"
            >
              <ChevronRight className={`w-6 h-6 transition-transform duration-500 ${isSidebarOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {renderView()}
      </div>

      {/* Incoming Call UI */}
      <AnimatePresence>
        {incomingCall && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0a0502]/95 backdrop-blur-xl flex flex-col items-center justify-between py-24 px-6"
          >
            <div className="flex flex-col items-center space-y-8">
              <div className="relative">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-[#ff4e00] rounded-full blur-2xl"
                />
                <div className="relative w-32 h-32 bg-[#ff4e00] rounded-full flex items-center justify-center shadow-2xl">
                  <Volume2 className="w-16 h-16 text-white animate-pulse" />
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <h2 className="text-xl text-[#ff4e00] font-bold uppercase tracking-widest animate-pulse">
                  {incomingCall.type === 'FINAL' ? 'اتصال عاجل' : 'تذكير استباقي'}
                </h2>
                <h1 className="text-4xl font-light text-white">Smarty يتصل بك</h1>
                <p className="text-2xl text-[#e0d8d0]/60 italic font-serif">
                  "{incomingCall.reminder.task}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-16">
              <button 
                onClick={handleDeclineCall}
                className="group flex flex-col items-center gap-4"
              >
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <PhoneOff className="w-10 h-10 text-white" />
                </div>
                <span className="text-white/60 text-sm uppercase tracking-widest">رفض (إغفاء)</span>
              </button>

              <button 
                onClick={() => {
                  setCurrentView('ASSISTANT');
                  startSession({ task: incomingCall.reminder.task, type: incomingCall.type });
                }}
                className="group flex flex-col items-center gap-4"
              >
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform animate-bounce">
                  <Phone className="w-10 h-10 text-white" />
                </div>
                <span className="text-white/60 text-sm uppercase tracking-widest">رد</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 78, 0, 0.3);
        }
      `}</style>
    </div>
  );
}

export default App;
