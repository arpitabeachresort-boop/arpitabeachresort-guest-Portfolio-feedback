import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SpeechToTextButtonProps {
  value: string;
  onChange: (value: string) => void;
  language: 'en' | 'hi' | 'or' | 'bn';
  placeholderName?: string;
  className?: string;
}

const LANG_CODES: Record<'en' | 'hi' | 'or' | 'bn', string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  or: 'or-IN',
  bn: 'bn-IN'
};

export default function SpeechToTextButton({
  value,
  onChange,
  language,
  placeholderName = "feedback",
  className = ""
}: SpeechToTextButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false; // Single utterance at a time is safer and more accurate
      rec.interimResults = false;
      
      rec.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      rec.onresult = (event: any) => {
        const resultIndex = event.resultIndex;
        const transcript = event.results[resultIndex][0].transcript;
        if (transcript) {
          // Clean up whitespaces and append elegantly
          const cleanedTranscript = transcript.trim();
          const currentValue = valueRef.current;
          const newVal = currentValue.trim() 
            ? `${currentValue.trim()} ${cleanedTranscript}` 
            : cleanedTranscript;
          onChangeRef.current(newVal);
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error', event);
        if (event.error === 'not-allowed') {
          setError('Microphone access blocked. Please enable microphone permissions.');
        } else if (event.error === 'no-speech') {
          // No speech is a common harmless error, just reset
        } else {
          setError(`Error: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore error if already stopped
        }
      }
    };
  }, []);

  // Handle dynamic language updates
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = LANG_CODES[language];
    }
  }, [language]);

  // Clean up listening state on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  if (!isSupported) {
    return null; // Don't render anything if Speech Recognition isn't supported in the browser
  }

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        setError(null);
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setError('Could not start microphone.');
        setIsListening(false);
      }
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={toggleListening}
        className={`p-2 rounded-full border transition-all duration-300 flex items-center justify-center cursor-pointer shadow-sm ${
          isListening
            ? 'bg-red-500 text-white border-red-400 animate-pulse scale-110'
            : 'bg-white text-gold border-gold/30 hover:bg-gold/5'
        }`}
        title={isListening ? "Stop listening" : `Dictate ${placeholderName}`}
      >
        {isListening ? (
          <MicOff className="w-3.5 h-3.5" />
        ) : (
          <Mic className="w-3.5 h-3.5" />
        )}
      </button>

      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.9 }}
            className="absolute right-10 top-1/2 -translate-y-1/2 z-20 whitespace-nowrap bg-red-500 text-white text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            Listening in {language.toUpperCase()}...
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute left-0 top-10 z-30 w-48 bg-white border border-red-100 rounded-lg p-2 shadow-lg text-red-500 text-[9px] leading-snug flex gap-1 items-start"
          >
            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
