import React, { useEffect, useState } from "react";
import { Volume2, Square } from "lucide-react";
import { speak, stopSpeaking, isSpeechSynthesisSupported } from "@/utils/voice";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Reads a block of text aloud in the worker's language — so a low-literacy
 * worker can hear a job description instead of reading it. Toggles between
 * play and stop. Renders nothing where speech synthesis is unavailable.
 */
function ListenButton({ text, className = "" }) {
  const { t, lang } = useI18n();
  const [speaking, setSpeaking] = useState(false);

  // Stop any narration when this button unmounts or the text changes.
  useEffect(() => {
    return () => stopSpeaking();
  }, [text]);

  if (!isSpeechSynthesisSupported() || !text) return null;

  const toggle = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    const utterance = speak(text, lang);
    setSpeaking(true);
    // speechSynthesis resets speaking state when it finishes; poll briefly.
    const timer = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        setSpeaking(false);
        clearInterval(timer);
      }
    }, 400);
    return utterance;
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={speaking ? t("voice.stop") : t("voice.listen")}
      className={`inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary ${className}`}
    >
      {speaking ? (
        <Square className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {speaking ? t("voice.stop") : t("voice.listen")}
    </button>
  );
}

export default ListenButton;
