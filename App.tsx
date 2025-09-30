import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Language, AppStatus } from './types';
import { SUPPORTED_LANGUAGES } from './constants';
import { translateText } from './services/geminiService';
import LanguageSelector from './components/LanguageSelector';
import StatusIndicator from './components/StatusIndicator';
import TranscriptPanel from './components/TranscriptPanel';

// Fix: Add type definitions for the Web Speech API to resolve TypeScript errors.
// The Web Speech API is not fully standardized and types may be missing from default lib.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// SVG Icons defined inside the component for simplicity
const MicrophoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14a2 2 0 0 0 2-2V6a2 2 0 0 0-4 0v6a2 2 0 0 0 2 2z" />
    <path d="M12 17a5 5 0 0 0 5-5h-2a3 3 0 0 1-6 0H7a5 5 0 0 0 5 5z" />
    <path d="M12 2a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0V3a1 1 0 0 0-1-1zM4.22 5.64a1 1 0 0 0-1.42 1.42l.71.71a1 1 0 0 0 1.42-1.42zM19.78 5.64a1 1 0 0 0-.71-.29 1 1 0 0 0-.71 1.71l.71.71a1 1 0 0 0 1.42-1.42z" />
    <path d="M12 4a4 4 0 0 0-4 4v6a4 4 0 0 0 8 0V8a4 4 0 0 0-4-4z" />
    <path d="M19 11a1 1 0 0 0-1 1 6 6 0 0 1-12 0 1 1 0 0 0-2 0 8 8 0 0 0 7 7.93V22a1 1 0 0 0 2 0v-2.07A8 8 0 0 0 19 12a1 1 0 0 0-1-1z" />
  </svg>
);

const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h12v12H6z" />
  </svg>
);

const SwapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
);


const App: React.FC = () => {
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [myLanguage, setMyLanguage] = useState<Language>('pt-BR');
  const [theirLanguage, setTheirLanguage] = useState<Language>('en-US');
  const [status, setStatus] = useState<AppStatus>('idle');
  const [originalText, setOriginalText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const processSpeech = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setStatus('processing');
    setOriginalText(text);
    try {
      const translation = await translateText(text, myLanguage, theirLanguage);
      setTranslatedText(translation);
      speak(translation, theirLanguage);
    } catch (e) {
      const err = e as Error;
      console.error(err);
      setError(err.message);
      setStatus('error');
    }
  }, [myLanguage, theirLanguage]);

  const speak = (text: string, lang: Language) => {
    setStatus('speaking');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        setStatus('error');
    };
    utterance.onend = () => {
        if (isTranslating) {
            recognitionRef.current?.start();
        } else {
            setStatus('idle');
        }
    };
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = myLanguage;

    recognition.onstart = () => {
        setStatus('listening');
    };
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        recognitionRef.current?.stop();
        processSpeech(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setError(`Erro de reconhecimento de fala: ${event.error}`);
        setStatus('error');
    };

    recognition.onend = () => {
      if (isTranslating && status !== 'processing' && status !== 'speaking') {
        recognition.start();
      } else if (!isTranslating) {
        setStatus('idle');
      }
    };

    recognitionRef.current = recognition;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myLanguage, processSpeech]);

  useEffect(() => {
    if (recognitionRef.current) {
        recognitionRef.current.lang = myLanguage;
    }
  }, [myLanguage]);

  const handleToggleTranslation = () => {
    if (isTranslating) {
      recognitionRef.current?.stop();
      setIsTranslating(false);
    } else {
      setOriginalText('');
      setTranslatedText('');
      setError(null);
      recognitionRef.current?.start();
      setIsTranslating(true);
    }
  };

  const handleSwapLanguages = () => {
      setMyLanguage(theirLanguage);
      setTheirLanguage(myLanguage);
  };

  if (!isSupported) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-100">
        <div className="text-center p-8 bg-brand-dark rounded-lg">
          <h1 className="text-2xl font-bold mb-4">Navegador Não Suportado</h1>
          <p>A API de Fala da Web não é suportada pelo seu navegador. Por favor, use o Google Chrome.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-10">
      {/* Inform the user when the app is falling back to a public translation service */}
      {typeof window !== 'undefined' && (window as any).__translationFallback && (
        <div className="w-full max-w-4xl mx-auto mb-4">
          <div className="text-sm text-yellow-200 bg-yellow-900/30 border border-yellow-600 rounded p-3">
            Tradução via serviço público (modo fallback). Resultados podem ser limitados ou temporariamente indisponíveis.
          </div>
        </div>
      )}
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-primary">
            VozAtiva
          </h1>
          <p className="text-teal-300 mt-2">Fale e obtenha traduções instantâneas.</p>
        </header>

        <main>
          <div className="bg-brand-dark/60 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-brand-primary/30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <LanguageSelector id="my-lang" label="Seu Idioma" value={myLanguage} onChange={setMyLanguage} options={SUPPORTED_LANGUAGES} />
              <button onClick={handleSwapLanguages} className="mt-4 sm:mt-0 p-2 rounded-full hover:bg-brand-dark/80 transition-colors" aria-label="Trocar idiomas">
                  <SwapIcon />
              </button>
              <LanguageSelector id="their-lang" label="Idioma Alvo" value={theirLanguage} onChange={setTheirLanguage} options={SUPPORTED_LANGUAGES} />
            </div>
          </div>
          
          <div className="mt-8 text-center">
             <button
              onClick={handleToggleTranslation}
              className={`relative rounded-full w-28 h-28 flex items-center justify-center mx-auto transition-all duration-300 shadow-xl focus:outline-none focus:ring-4 ${
                isTranslating
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500/50'
                  : 'bg-brand-primary hover:bg-brand-secondary focus:ring-brand-secondary/50'
              }`}
            >
              {isTranslating ? <StopIcon /> : <MicrophoneIcon />}
            </button>
          </div>

          <StatusIndicator status={isTranslating ? status : 'idle'} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <TranscriptPanel title="Você Disse" text={originalText} />
            <TranscriptPanel title="Tradução" text={translatedText} />
          </div>

          {error && <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">{error}</div>}
        </main>
      </div>
    </div>
  );
};

export default App;