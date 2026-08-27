"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "ai/react";
import {
  Building2,
  Send,
  Paperclip,
  X,
  Sparkles,
  ShieldCheck,
  Wrench,
  Package,
  MapPin,
  Flame,
  ChevronDown,
  Loader2,
  CheckCircle2,
  FileText,
  Compass,
  QrCode,
  MessageSquare,
  Globe,
} from "lucide-react";
import { LobbyQrModal } from "@/components/LobbyQrModal";
import { ChatMessage } from "@/components/ChatMessage";

/* ─── TYPES ─────────────────────────────────────────────────── */
interface Language {
  code: string;
  name: string;
  native: string;
  flag: string;
  dir: "ltr" | "rtl";
  greeting: string;
  placeholder: string;
}

/* ─── DATA ───────────────────────────────────────────────────── */
const LANGUAGES: Language[] = [
  {
    code: "ar", name: "Arabic", native: "العربية", flag: "🇦🇪", dir: "rtl",
    greeting: "مرحباً بك في برج كريست جراند (برج أ). كيف يمكنني مساعدتك اليوم؟",
    placeholder: "اطرح سؤالك عن برج أ...",
  },
  {
    code: "en", name: "English", native: "English", flag: "🇬🇧", dir: "ltr",
    greeting: "Welcome to Crest Grande – Tower A. How may I assist you today?",
    placeholder: "Ask Al Bayan AI anything about Tower A...",
  },
  {
    code: "fr", name: "French", native: "Français", flag: "🇫🇷", dir: "ltr",
    greeting: "Bienvenue à Crest Grande – Tour A. Comment puis-je vous aider aujourd'hui?",
    placeholder: "Posez votre question au concierge...",
  },
  {
    code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳", dir: "ltr",
    greeting: "क्रेस्ट ग्रांडे - टावर ए में आपका स्वागत है। आज मैं आपकी क्या सहायता कर सकता हूँ?",
    placeholder: "अपना प्रश्न पूछें...",
  },
  {
    code: "zh", name: "Chinese", native: "中文", flag: "🇨🇳", dir: "ltr",
    greeting: "欢迎来到 Crest Grande – A 座。今天有什么可以为您效劳的？",
    placeholder: "请输入您的问题...",
  },
  {
    code: "ru", name: "Russian", native: "Русский", flag: "🇷🇺", dir: "ltr",
    greeting: "Добро пожаловать в Crest Grande – Башня А. Чем я могу вам помочь сегодня?",
    placeholder: "Задайте вопрос консьержу...",
  },
  {
    code: "es", name: "Spanish", native: "Español", flag: "🇪🇸", dir: "ltr",
    greeting: "Bienvenido a Crest Grande – Torre A. ¿En qué puedo ayudarle hoy?",
    placeholder: "Pregunte al concierge...",
  },
];

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  sub: string;
  prompt: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: <Flame className="w-5 h-5" />,
    label: "Amenities",
    sub: "Pool, Gym, BBQ & Sauna",
    prompt: "What are the swimming pool, gym, BBQ area, and sauna hours for Crest Grande Tower A?",
  },
  {
    icon: <Package className="w-5 h-5" />,
    label: "Deliveries",
    sub: "Parcels & couriers",
    prompt: "How are food deliveries and courier parcel collections handled at Tower A?",
  },
  {
    icon: <Wrench className="w-5 h-5" />,
    label: "Maintenance",
    sub: "Repairs & AC 24/7",
    prompt: "How do I request maintenance or report a repair issue at Tower A?",
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    label: "Building Info",
    sub: "NOC, rules & elevators",
    prompt: "What are the move-in, move-out, elevator booking, and Sobha NOC procedures?",
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    label: "Nearby",
    sub: "Schools & landmarks",
    prompt: "What are the nearest schools, supermarkets, and drive times to Downtown and DXB?",
  },
];

/* ─── TOOL LABEL DETECTOR ────────────────────────────────────── */
function detectToolLabel(q: string): string {
  const lq = q.toLowerCase();
  if (lq.includes("pass") || lq.includes("visitor") || lq.includes("guest") || lq.includes("gate"))
    return "Issuing Digital Visitor Gate Pass…";
  if (lq.includes("maintenance") || lq.includes("fix") || lq.includes("leak") || lq.includes("ac") || lq.includes("repair"))
    return "Filing Maintenance Ticket…";
  if (lq.includes("bbq") || lq.includes("reserve") || lq.includes("book") || lq.includes("lounge"))
    return "Checking Amenity Availability…";
  if (lq.includes("pool") || lq.includes("gym") || lq.includes("school") || lq.includes("landmark") || lq.includes("hours"))
    return "Searching Tower A Knowledge Base…";
  return "";
}

/* ─── STREAM PARSER ──────────────────────────────────────────── */
function parseCleanContent(content: string): string {
  if (!content) return "";
  if (content.startsWith('0:"') || content.includes('\n0:"')) {
    return content
      .split("\n")
      .filter((l) => l.startsWith('0:"'))
      .map((l) => {
        try { return JSON.parse(l.slice(2)); }
        catch { return l.replace(/^0:"/, "").replace(/"$/, ""); }
      })
      .join("");
  }
  return content;
}

/* ─── COMPONENT ──────────────────────────────────────────────── */
export default function Home() {
  const [selectedLang, setSelectedLang] = useState<Language>(LANGUAGES[1]);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string } | null>(null);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  /* useChat hook */
  const { messages, input, handleInputChange, append, isLoading, setInput, setMessages } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Welcome! I'm your AI Resident Assistant.\nAsk me anything about your community, anytime, in any language. 🌍\nHow can I help today?",
      },
    ],
    onFinish: () => setToolStatus(null),
    onError: (e) => { console.error(e); setToolStatus(null); },
  });

  /* Auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, toolStatus]);

  /* Close lang dropdown on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Language handler */
  const selectLang = useCallback((lang: Language) => {
    setSelectedLang(lang);
    setLangMenuOpen(false);
    setMessages((prev) => [
      ...prev,
      { id: `lang-${Date.now()}`, role: "assistant", content: lang.greeting },
    ]);
  }, [setMessages]);

  /* Submit query */
  const submitQuery = useCallback(async (text: string) => {
    if ((!text.trim() && !attachedFile) || isLoading) return;

    let finalText = text.trim();
    if (attachedFile) finalText += `\n[Attached: ${attachedFile.name}]`;

    /* Auto-detect Arabic */
    if (/[\u0600-\u06FF]/.test(finalText) && selectedLang.code !== "ar") {
      const ar = LANGUAGES.find((l) => l.code === "ar");
      if (ar) setSelectedLang(ar);
    }

    const label = detectToolLabel(finalText);
    if (label) setToolStatus(label);

    setAttachedFile(null);
    setInput("");
    await append({ role: "user", content: finalText });
  }, [attachedFile, isLoading, selectedLang, append, setInput]);

  /* ─── RENDER ─── */
  return (
    <div
      dir={selectedLang.dir}
      className={`min-h-screen flex flex-col bg-canvas text-espresso overflow-x-hidden ${
        selectedLang.dir === "rtl" ? "font-serif" : "font-sans"
      }`}
    >
      {/* ══════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-espresso-dark border-b border-gold/30 text-surface shadow-[0_2px_12px_rgba(44,34,30,0.25)]">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">

          {/* Brand */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Logo ring */}
            <div className="w-9 h-9 rounded-full bg-gold-gradient p-[2px] flex-shrink-0 shadow-[0_0_16px_rgba(212,175,55,0.35)]">
              <div className="w-full h-full rounded-full bg-espresso flex items-center justify-center">
                <Building2 className="w-4 h-4 text-gold-bright" />
              </div>
            </div>

            {/* Text */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold tracking-widest text-gold-bright text-sm sm:text-base whitespace-nowrap leading-none">
                  AL BAYAN AI
                </h1>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-gold/20 text-gold-bright border border-gold/40 flex-shrink-0 leading-none">
                  Tower A
                </span>
              </div>
              <p className="text-[10px] text-subtext-muted tracking-widest mt-0.5 hidden sm:block">
                RESIDENT &amp; GUEST DIGITAL CONCIERGE
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* QR Button */}
            <button
              onClick={() => setQrOpen(true)}
              title="Lobby QR Code"
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-gold/20 border border-gold/40 text-gold-bright hover:bg-gold/30 hover:border-gold-bright active:scale-95 transition-all text-xs font-semibold"
            >
              <QrCode className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Lobby QR</span>
            </button>

            {/* Language Selector */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangMenuOpen((o) => !o)}
                aria-label="Select language"
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-espresso border border-gold/40 hover:border-gold-bright active:scale-95 transition-all text-xs font-medium"
              >
                <Globe className="w-4 h-4 text-gold-bright flex-shrink-0" />
                <span className="hidden sm:inline text-surface">{selectedLang.native}</span>
                <ChevronDown className={`w-3 h-3 text-gold-bright transition-transform duration-200 ${langMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] w-44 rounded-xl bg-espresso-dark border border-gold/40 shadow-2xl z-[60] overflow-hidden animate-fade-in">
                  <p className="px-3 py-2 text-[9px] uppercase tracking-widest font-bold text-gold-bright border-b border-gold/20">
                    Language
                  </p>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => selectLang(lang)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                        selectedLang.code === lang.code
                          ? "bg-gold/25 text-gold-bright font-semibold"
                          : "text-surface/80 hover:bg-gold/10 hover:text-surface"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.native}</span>
                      </span>
                      {selectedLang.code === lang.code && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-gold-bright flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6">

        {/* ── HERO ── */}
        <section className="rounded-2xl bg-surface border border-border shadow-luxury overflow-hidden">
          {/* Decorative top bar */}
          <div className="h-1 w-full bg-gold-gradient" />

          <div className="px-4 sm:px-8 py-5 sm:py-8 flex flex-col items-center text-center">
            {/* Icon */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gold-gradient p-[2px] mb-4 shadow-[0_0_24px_rgba(212,175,55,0.4)]">
              <div className="w-full h-full rounded-2xl bg-espresso flex items-center justify-center">
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-gold-bright animate-gold-pulse" />
              </div>
            </div>

            <h2 className="font-serif font-extrabold text-espresso tracking-tight text-xl sm:text-2xl md:text-3xl mb-2">
              Al Bayan AI Concierge
            </h2>
            <p className="text-subtext text-sm sm:text-base max-w-md mx-auto font-light leading-relaxed mb-5">
              Your 24/7 community assistant, in any language — grounded 100% in verified Tower A facts.
            </p>

            {/* Language pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => selectLang(lang)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95 ${
                    selectedLang.code === lang.code
                      ? "bg-gold text-white border-gold shadow-sm"
                      : "bg-surface-alt border-border text-subtext hover:border-gold/50 hover:text-espresso"
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── QUICK ACTIONS ── */}
        <section>
          <div className="flex items-center justify-between mb-3 px-0.5">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-subtext">
              <Compass className="w-3.5 h-3.5 text-gold flex-shrink-0" />
              Quick Concierge Services
            </h3>
            <span className="text-[10px] text-subtext-muted hidden xs:block">Tap to request instantly</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => submitQuery(action.prompt)}
                disabled={isLoading}
                className="group relative flex flex-col gap-2.5 p-3.5 sm:p-4 rounded-xl bg-surface border border-border text-left
                           hover:border-gold hover:shadow-luxury active:scale-[0.97]
                           disabled:opacity-60 disabled:cursor-not-allowed
                           transition-all duration-200 overflow-hidden"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/[0.03] transition-colors rounded-xl pointer-events-none" />

                {/* Icon */}
                <div className="w-9 h-9 rounded-lg bg-gold/10 text-gold flex items-center justify-center
                                group-hover:bg-gold group-hover:text-white flex-shrink-0
                                transition-colors duration-200">
                  {action.icon}
                </div>

                {/* Text */}
                <div>
                  <p className="font-semibold text-sm text-espresso group-hover:text-gold transition-colors leading-snug">
                    {action.label}
                  </p>
                  <p className="text-[11px] text-subtext mt-0.5 leading-snug">
                    {action.sub}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── CHAT ── */}
        <section className="flex flex-col rounded-2xl bg-surface border border-border shadow-luxury overflow-hidden flex-1">

          {/* Chat header bar */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border bg-surface-alt flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <span className="text-xs font-semibold text-espresso">Al Bayan Concierge</span>
              <span className="hidden sm:inline text-[10px] text-subtext-muted">· Active Session</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-subtext">
              <ShieldCheck className="w-3.5 h-3.5 text-gold flex-shrink-0" />
              <span className="hidden sm:inline">Verified Tower A Records</span>
              <span className="sm:hidden">Verified</span>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-3"
            style={{ minHeight: "260px", maxHeight: "clamp(300px, 45vh, 520px)" }}
          >
            {messages.map((msg) => {
              const content = parseCleanContent(msg.content);
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 animate-slide-up ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold leading-none
                      ${isUser ? "bg-espresso text-gold-bright" : "bg-gold-gradient text-white shadow-sm"}`}
                  >
                    {isUser ? "YOU" : "AB"}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[83%] sm:max-w-[75%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
                    <div
                      className={`px-4 py-3 text-sm leading-relaxed break-words w-full
                        ${isUser
                          ? "bg-espresso text-surface rounded-2xl rounded-tr-sm"
                          : "bg-white border border-border-light text-espresso rounded-2xl rounded-tl-sm shadow-sm"
                        }`}
                    >
                      <ChatMessage content={content} isUser={isUser} />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Tool status */}
            {toolStatus && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gold/10 border border-gold/30 w-fit max-w-[85%] animate-slide-up">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-gold flex-shrink-0" />
                <span className="text-xs font-medium text-gold">{toolStatus}</span>
              </div>
            )}

            {/* Typing indicator */}
            {isLoading && !toolStatus && (
              <div className="flex gap-2.5 animate-slide-up">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gold-gradient flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                  AB
                </div>
                <div className="bg-white border border-border-light rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold dot-1" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gold dot-2" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gold dot-3" />
                  <span className="ml-2 text-[11px] text-subtext">Formulating guidance…</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="flex-shrink-0 border-t border-border bg-surface-alt px-3 sm:px-4 py-3">
            {/* Attachment chip */}
            {attachedFile && (
              <div className="mb-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-gold/30 w-fit max-w-full">
                <FileText className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                <span className="text-[11px] text-espresso truncate max-w-[160px] sm:max-w-xs">{attachedFile.name}</span>
                <button onClick={() => setAttachedFile(null)} className="p-0.5 rounded hover:bg-gold/20">
                  <X className="w-3.5 h-3.5 text-subtext" />
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => { e.preventDefault(); submitQuery(input); }}
              className="flex items-center gap-2"
            >
              {/* Hidden file */}
              <input
                type="file"
                ref={fileRef}
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setAttachedFile({ name: f.name });
                }}
              />

              {/* Attach button */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                title="Attach image or PDF"
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-surface border border-border
                           hover:border-gold hover:text-gold text-subtext transition-colors active:scale-95"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Text input */}
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder={selectedLang.placeholder}
                className="flex-1 min-w-0 h-10 bg-surface border border-border focus:border-gold focus:outline-none
                           rounded-xl px-4 text-sm text-espresso placeholder:text-subtext-muted
                           disabled:opacity-60 transition-colors"
              />

              {/* Send button */}
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && !attachedFile)}
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl
                           bg-espresso hover:bg-espresso-dark text-gold-bright
                           disabled:opacity-40 transition-all active:scale-95 shadow-md"
              >
                {isLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />
                }
              </button>
            </form>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="flex flex-col items-center gap-1 py-2 text-center">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-gold flex-shrink-0" />
            <span className="text-xs font-semibold text-subtext">Information you can trust. Answers you can rely on.</span>
          </div>
          <p className="text-[11px] text-subtext-muted font-light max-w-sm leading-relaxed">
            Crest Grande – Tower A, Sobha Hartland, Nad Al Sheba First, Dubai
          </p>
        </footer>
      </main>

      {/* ── QR MODAL ── */}
      <LobbyQrModal isOpen={qrOpen} onClose={() => setQrOpen(false)} />
    </div>
  );
}
