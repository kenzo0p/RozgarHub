import React, { useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";
import { toast } from "sonner";
import { getSpeechRecognition, speechLocale, isVoiceInputSupported } from "@/utils/voice";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * A mic button that lets a worker speak their search instead of typing it —
 * the biggest accessibility win for low-literacy users. Recognizes speech in
 * the user's chosen language and hands the transcript back via onResult.
 * Renders nothing on browsers without the Web Speech API.
 *
 * @param {(text: string) => void} onResult - called with the spoken text
 */
function VoiceSearchButton({ onResult, size = "md" }) {
  const { t, lang } = useI18n();
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // Clean up any in-flight recognition when unmounting.
  useEffect(() => {
    return () => recognitionRef.current?.abort?.();
  }, []);

  if (!isVoiceInputSupported()) return null;

  const start = () => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = speechLocale(lang);
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onerror = (event) => {
      setListening(false);
      if (event.error !== "aborted" && event.error !== "no-speech") {
        toast.error(t("voice.error"));
      }
    };
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) onResult(transcript);
    };

    try {
      recognition.start();
    } catch {
      // start() throws if called while already running — ignore.
    }
  };

  const stop = () => recognitionRef.current?.stop?.();

  const dim = size === "lg" ? "h-11 w-11" : size === "sm" ? "h-8 w-8" : "h-9 w-9";

  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      aria-label={t("voice.search")}
      title={listening ? t("voice.listening") : t("voice.search")}
      className={`flex ${dim} shrink-0 items-center justify-center rounded-full transition-colors ${
        listening
          ? "animate-pulse bg-red-500 text-white"
          : "text-muted-foreground hover:bg-muted hover:text-primary"
      }`}
    >
      <Mic className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}

export default VoiceSearchButton;
