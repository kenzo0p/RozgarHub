// Voice helpers for low-literacy workers: speak a search query instead of
// typing it, and hear a job read aloud. Built on the browser-native Web Speech
// API — no dependency — and keyed to the user's chosen language.

// Map our app language codes to BCP-47 locales the speech engines understand.
const LOCALE = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
  bn: "bn-IN",
  gu: "gu-IN",
  pa: "pa-IN",
  ta: "ta-IN",
  te: "te-IN",
};

export function speechLocale(lang) {
  return LOCALE[lang] || "en-IN";
}

// Speech recognition (voice input) — Chrome/Edge expose it prefixed.
export function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function isVoiceInputSupported() {
  return getSpeechRecognition() !== null;
}

// Speech synthesis (read aloud) — widely supported.
export function isSpeechSynthesisSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Read text aloud in the given app language. Cancels anything already speaking
 * so repeated taps don't stack.
 */
export function speak(text, lang) {
  if (!isSpeechSynthesisSupported() || !text) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = speechLocale(lang);
  synth.speak(utterance);
}

export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
}
