import React from "react";
import { Phone, MessageCircle } from "lucide-react";

/**
 * Tap-to-call + WhatsApp buttons for a phone number.
 *
 * Phone calls and WhatsApp are how India's blue-collar workforce actually
 * communicates, so once two parties are connected we hand off to those apps
 * directly (tel: and wa.me links) rather than building an in-app chat.
 *
 * @param {string|number} phone - 10-digit Indian mobile number
 * @param {string} [message] - prefilled WhatsApp message
 * @param {"sm"|"xs"} [size]
 */
function ContactButtons({ phone, message = "", size = "sm" }) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "");
  const waNumber = digits.length === 10 ? `91${digits}` : digits;
  const pad = size === "xs" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";
  const icon = size === "xs" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div className="inline-flex items-center gap-2">
      <a
        href={`tel:+91${digits}`}
        className={`inline-flex items-center gap-1.5 rounded-md border border-border bg-background font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary ${pad}`}
      >
        <Phone className={icon} aria-hidden="true" />
        Call
      </a>
      <a
        href={`https://wa.me/${waNumber}${message ? `?text=${encodeURIComponent(message)}` : ""}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 font-medium text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400 ${pad}`}
      >
        <MessageCircle className={icon} aria-hidden="true" />
        WhatsApp
      </a>
    </div>
  );
}

export default ContactButtons;
