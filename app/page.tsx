"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import {
  Building2,
  Globe,
  Send,
  Paperclip,
  X,
  Sparkles,
  ShieldCheck,
  Clock,
  UserCheck,
  Wrench,
  Package,
  MapPin,
  Flame,
  ChevronDown,
  Loader2,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Compass,
  QrCode,
} from "lucide-react";
import { LobbyQrModal } from "@/components/LobbyQrModal";

// Languages supported by Al Bayan AI
interface Language {
  code: string;
  name: string;
  native: string;
  flag: string;
  dir: "ltr" | "rtl";
  greeting: string;
}

const LANGUAGES: Language[] = [
  { code: "ar", name: "Arabic", native: "العربية", flag: "🇦🇪", dir: "rtl", greeting: "مرحباً بك في برج كريست جراند (برج أ). كيف يمكنني مساعدتك اليوم؟" },
  { code: "en", name: "English", native: "English", flag: "🇬🇧", dir: "ltr", greeting: "Welcome to Crest Grande – Tower A. How may I assist you today?" },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷", dir: "ltr", greeting: "Bienvenue à Crest Grande – Tour A. Comment puis-je vous aider aujourd'hui?" },
  { code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳", dir: "ltr", greeting: "क्रेस्ट ग्रांडे - टावर ए में आपका स्वागत है। आज मैं आपकी क्या सहायता कर सकता हूँ?" },
  { code: "zh", name: "Chinese", native: "中文", flag: "🇨🇳", dir: "ltr", greeting: "欢迎来到 Crest Grande – A 座。今天有什么可以为您效劳的？" },
  { code: "ru", name: "Russian", native: "Русский", flag: "🇷우스", dir: "ltr", greeting: "Добро пожаловать в Crest Grande – Башня А. Чем я могу вам помочь сегодня?" },
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸", dir: "ltr", greeting: "Bienvenido a Crest Grande – Torre A. ¿En qué puedo ayudarle hoy?" },
];

export default function Home() {
  const [selectedLang, setSelectedLang] = useState<Language>(LANGUAGES[1]); // Default English
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [attachedImage, setAttachedImage] = useState<{ name: string; url: string } | null>(null);
  const [activeToolStatus, setActiveToolStatus] = useState<string | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Vercel AI SDK useChat Hook for automatic stream protocol decoding
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setInput,
    append,
    isLoading,
    setMessages,
  } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "msg-welcome",
        role: "assistant",
        content:
          LANGUAGES[1].greeting +
          "\n\nI am your 24/7 digital concierge for **Crest Grande – Tower A, Sobha Hartland**. I can generate visitor passes, reserve BBQ zones, dispatch emergency maintenance, or answer any community inquiries.",
      },
    ],
    onFinish: () => {
      setActiveToolStatus(null);
    },
    onError: (err) => {
      console.error("Chat streaming error:", err);
      setActiveToolStatus(null);
    },
  });

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, activeToolStatus]);

  // Clean stream protocol markers if any residual protocol tags exist
  const parseCleanContent = (content: string): string => {
    if (!content) return "";
    if (content.startsWith('0:"') || content.includes('\n0:"')) {
      return content
        .split("\n")
        .filter((line) => line.startsWith('0:"'))
        .map((line) => {
          try {
            return JSON.parse(line.substring(2));
          } catch {
            return line.replace(/^0:"/, "").replace(/"$/, "");
          }
        })
        .join("");
    }
    return content;
  };

  // Handle Language selection change
  const handleSelectLanguage = (lang: Language) => {
    setSelectedLang(lang);
    setLangMenuOpen(false);

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-lang-${Date.now()}`,
        role: "assistant",
        content: lang.greeting,
      },
    ]);
  };

  // Handle Quick Action Card clicks
  const handleQuickAction = async (actionPrompt: string) => {
    if (isLoading) return;
    submitQuery(actionPrompt);
  };

  // Image Upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedImage({
          name: file.name,
          url: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Concierge Query
  const submitQuery = async (queryText: string) => {
    if ((!queryText.trim() && !attachedImage) || isLoading) return;

    let finalQueryText = queryText.trim();
    if (attachedImage) {
      finalQueryText += `\n[Attached Maintenance Image: ${attachedImage.name}]`;
    }

    // Auto detect language direction if user types in Arabic
    const containsArabic = /[\u0600-\u06FF]/.test(finalQueryText);
    if (containsArabic && selectedLang.code !== "ar") {
      const arabicLang = LANGUAGES.find((l) => l.code === "ar");
      if (arabicLang) setSelectedLang(arabicLang);
    }

    // Client tool execution status badge indicator
    const lowerQuery = finalQueryText.toLowerCase();
    let simulatedToolLabel = "";

    if (lowerQuery.includes("pass") || lowerQuery.includes("visitor") || lowerQuery.includes("guest") || lowerQuery.includes("gate")) {
      simulatedToolLabel = "Issuing Digital Visitor Gate Pass...";
    } else if (lowerQuery.includes("maintenance") || lowerQuery.includes("fix") || lowerQuery.includes("leak") || lowerQuery.includes("ac") || lowerQuery.includes("repair")) {
      simulatedToolLabel = "Filing Maintenance Ticket in Neon Database...";
    } else if (lowerQuery.includes("bbq") || lowerQuery.includes("reserve") || lowerQuery.includes("book") || lowerQuery.includes("lounge")) {
      simulatedToolLabel = "Checking Amenity Availability & Securing Slot...";
    } else if (lowerQuery.includes("pool") || lowerQuery.includes("gym") || lowerQuery.includes("school") || lowerQuery.includes("landmark") || lowerQuery.includes("hours")) {
      simulatedToolLabel = "Searching Crest Grande Tower A Knowledge Base (pgvector)...";
    }

    if (simulatedToolLabel) {
      setActiveToolStatus(simulatedToolLabel);
    }

    setAttachedImage(null);
    setInput("");

    // Append to useChat stream handler
    await append({
      role: "user",
      content: finalQueryText,
    });
  };

  return (
    <div
      dir={selectedLang.dir}
      className={`min-h-screen flex flex-col bg-canvas text-espresso overflow-x-hidden ${
        selectedLang.dir === "rtl" ? "font-serif" : "font-sans"
      }`}
    >
      {/* 1. RESPONSIVE TOP HEADER */}
      <header className="sticky top-0 z-50 bg-espresso-dark border-b border-gold/30 shadow-luxury text-surface px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between transition-all max-w-full">
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gold-gradient p-0.5 flex items-center justify-center shadow-gold-glow shrink-0">
            <div className="w-full h-full rounded-full bg-espresso flex items-center justify-center">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-gold-bright" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-serif text-sm sm:text-base md:text-lg font-bold tracking-wider text-gold-bright whitespace-nowrap">
                AL BAYAN AI
              </h1>
              <span className="text-[9px] sm:text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-gold/20 text-gold-bright border border-gold/40 shrink-0">
                Tower A
              </span>
            </div>
            <p className="hidden md:block text-[11px] sm:text-xs text-subtext-muted tracking-wide truncate">
              RESIDENT & GUEST DIGITAL CONCIERGE
            </p>
          </div>
        </div>

        {/* Actions Controls (QR Display & Language Dropdown) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            onClick={() => setQrModalOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-gold/20 text-gold-bright border border-gold/40 hover:bg-gold/30 hover:border-gold-bright transition-all text-xs font-semibold shadow-sm shrink-0"
            title="Physical Lobby Display & Elevator QR Code"
          >
            <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-bright" />
            <span className="hidden sm:inline">Lobby QR</span>
          </button>

          {/* Language Selection Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-espresso text-surface border border-gold/40 hover:border-gold-bright transition-all text-xs font-medium shrink-0"
              aria-label="Select Language"
            >
              <span className="text-xs sm:text-sm">{selectedLang.flag}</span>
              <span className="hidden xs:inline">{selectedLang.native}</span>
              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-bright" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 sm:w-48 rounded-xl bg-espresso-dark border border-gold/40 shadow-2xl z-50 overflow-hidden py-1 max-h-60 overflow-y-auto">
                <div className="px-3 py-1.5 border-b border-gold/20 text-[9px] sm:text-[10px] font-semibold tracking-wider text-gold-bright uppercase">
                  Select Concierge Language
                </div>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleSelectLanguage(lang)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-gold/20 transition-colors ${
                      selectedLang.code === lang.code ? "bg-gold/30 text-gold-bright font-semibold" : "text-surface"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.native}</span>
                    </span>
                    {selectedLang.code === lang.code && <CheckCircle2 className="w-3.5 h-3.5 text-gold-bright" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN RESPONSIVE CONTAINER */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 overflow-x-hidden">
        {/* 2. HERO BANNER */}
        <section className="rounded-xl sm:rounded-2xl bg-surface border border-border p-4 sm:p-6 md:p-8 shadow-luxury text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-gold/10 rounded-full blur-3xl -z-0"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-40 sm:h-40 bg-gold/10 rounded-full blur-3xl -z-0"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gold-gradient p-0.5 mb-2.5 sm:mb-3 shadow-gold-glow flex items-center justify-center">
              <div className="w-full h-full rounded-xl sm:rounded-2xl bg-espresso flex items-center justify-center">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-gold-bright animate-gold-pulse" />
              </div>
            </div>

            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-extrabold text-espresso tracking-tight mb-1.5 sm:mb-2">
              Al Bayan AI Concierge
            </h2>
            <p className="text-subtext text-xs sm:text-sm md:text-base max-w-lg mx-auto mb-3 sm:mb-4 font-light leading-relaxed">
              Your community assistant, anytime, in any language. Restricting 100% of answers to official Crest Grande – Tower A facts.
            </p>

            {/* Multilingual Flag Strip */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-1 max-w-full">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang)}
                  className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-medium border transition-all flex items-center gap-1.5 ${
                    selectedLang.code === lang.code
                      ? "bg-gold text-white border-gold shadow-sm"
                      : "bg-surface-alt border-border text-subtext hover:border-gold/60"
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 3. QUICK-ACTION GRID BUTTONS */}
        <section>
          <div className="flex items-center justify-between mb-2.5 sm:mb-3 px-1">
            <h3 className="text-[11px] sm:text-xs uppercase font-semibold tracking-wider text-subtext flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-gold" /> Quick Concierge Services
            </h3>
            <span className="text-[10px] sm:text-[11px] text-subtext-muted">Click to request instantly</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
            {/* Card 1: Amenities */}
            <button
              onClick={() => handleQuickAction("What are the swimming pool, gym, BBQ area, and sauna hours for Crest Grande Tower A?")}
              className="p-3 sm:p-4 rounded-xl bg-surface border border-border hover:border-gold hover:shadow-luxury transition-all text-left group flex flex-col justify-between h-auto min-h-[95px] sm:h-32"
            >
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-gold/10 text-gold flex items-center justify-center group-hover:bg-gold group-hover:text-white transition-colors shrink-0 mb-1 sm:mb-0">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-espresso group-hover:text-gold transition-colors leading-tight">
                  Amenities & Facilities
                </h4>
                <p className="text-[10px] sm:text-[11px] text-subtext line-clamp-2 sm:line-clamp-1 mt-0.5">Pool, Gym, BBQ & timings</p>
              </div>
            </button>

            {/* Card 2: Visitors & Access */}
            <button
              onClick={() => handleQuickAction("Generate a digital visitor pass for my guest visiting Unit 1402 today for 4 hours. Plate: DUBAI A-84920")}
              className="p-3 sm:p-4 rounded-xl bg-surface border border-border hover:border-gold hover:shadow-luxury transition-all text-left group flex flex-col justify-between h-auto min-h-[95px] sm:h-32"
            >
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-gold/10 text-gold flex items-center justify-center group-hover:bg-gold group-hover:text-white transition-colors shrink-0 mb-1 sm:mb-0">
                <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-espresso group-hover:text-gold transition-colors leading-tight">
                  Visitors & Access
                </h4>
                <p className="text-[10px] sm:text-[11px] text-subtext line-clamp-2 sm:line-clamp-1 mt-0.5">Gate passes, parking & entry</p>
              </div>
            </button>

            {/* Card 3: Deliveries */}
            <button
              onClick={() => handleQuickAction("How are food deliveries and courier parcel collections handled at Tower A?")}
              className="p-3 sm:p-4 rounded-xl bg-surface border border-border hover:border-gold hover:shadow-luxury transition-all text-left group flex flex-col justify-between h-auto min-h-[95px] sm:h-32"
            >
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-gold/10 text-gold flex items-center justify-center group-hover:bg-gold group-hover:text-white transition-colors shrink-0 mb-1 sm:mb-0">
                <Package className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-espresso group-hover:text-gold transition-colors leading-tight">
                  Deliveries & Mail
                </h4>
                <p className="text-[10px] sm:text-[11px] text-subtext line-clamp-2 sm:line-clamp-1 mt-0.5">Parcels, couriers & reception</p>
              </div>
            </button>

            {/* Card 4: Maintenance */}
            <button
              onClick={() => handleQuickAction("Report an AC cooling breakdown in unit 1805 requiring urgent engineer support.")}
              className="p-3 sm:p-4 rounded-xl bg-surface border border-border hover:border-gold hover:shadow-luxury transition-all text-left group flex flex-col justify-between h-auto min-h-[95px] sm:h-32"
            >
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-gold/10 text-gold flex items-center justify-center group-hover:bg-gold group-hover:text-white transition-colors shrink-0 mb-1 sm:mb-0">
                <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-espresso group-hover:text-gold transition-colors leading-tight">
                  Maintenance Support
                </h4>
                <p className="text-[10px] sm:text-[11px] text-subtext line-clamp-2 sm:line-clamp-1 mt-0.5">Repairs, AC & 24/7 fix</p>
              </div>
            </button>

            {/* Card 5: Building Info */}
            <button
              onClick={() => handleQuickAction("What are the move-in, move-out, elevator booking, and Sobha NOC procedures?")}
              className="p-3 sm:p-4 rounded-xl bg-surface border border-border hover:border-gold hover:shadow-luxury transition-all text-left group flex flex-col justify-between h-auto min-h-[95px] sm:h-32"
            >
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-gold/10 text-gold flex items-center justify-center group-hover:bg-gold group-hover:text-white transition-colors shrink-0 mb-1 sm:mb-0">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-espresso group-hover:text-gold transition-colors leading-tight">
                  Building Information
                </h4>
                <p className="text-[10px] sm:text-[11px] text-subtext line-clamp-2 sm:line-clamp-1 mt-0.5">Rules, NOC & elevator</p>
              </div>
            </button>

            {/* Card 6: Nearby Landmarks */}
            <button
              onClick={() => handleQuickAction("What are the nearest schools, supermarkets, and drive times to Downtown and DXB?")}
              className="p-3 sm:p-4 rounded-xl bg-surface border border-border hover:border-gold hover:shadow-luxury transition-all text-left group flex flex-col justify-between h-auto min-h-[95px] sm:h-32"
            >
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-gold/10 text-gold flex items-center justify-center group-hover:bg-gold group-hover:text-white transition-colors shrink-0 mb-1 sm:mb-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-espresso group-hover:text-gold transition-colors leading-tight">
                  Nearby & Location
                </h4>
                <p className="text-[10px] sm:text-[11px] text-subtext line-clamp-2 sm:line-clamp-1 mt-0.5">Schools, markets & landmarks</p>
              </div>
            </button>
          </div>
        </section>

        {/* 4. ACTIVE CHAT CANVAS */}
        <section className="flex-1 rounded-xl sm:rounded-2xl bg-surface border border-border shadow-luxury flex flex-col min-h-[380px] h-[58vh] sm:h-[520px] max-h-[650px] overflow-hidden">
          {/* Active Chat Header */}
          <div className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 border-b border-border bg-surface-alt flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-espresso truncate">Al Bayan Concierge Active Session</span>
            </div>
            <div className="hidden xs:flex items-center gap-1.5 text-[10px] sm:text-[11px] text-subtext shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-gold shrink-0" /> Grounded in Tower A
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
            {messages.map((msg) => {
              const cleanContent = parseCleanContent(msg.content);

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 sm:gap-3 max-w-[92%] sm:max-w-[80%] ${
                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] sm:text-xs font-bold ${
                      msg.role === "user"
                        ? "bg-espresso text-gold-bright"
                        : "bg-gold-gradient text-white shadow-sm"
                    }`}
                  >
                    {msg.role === "user" ? "RES" : "AB"}
                  </div>

                  {/* Bubble */}
                  <div className="flex flex-col gap-1 min-w-0">
                    <div
                      className={`rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm whitespace-pre-line leading-relaxed shadow-sm break-words ${
                        msg.role === "user"
                          ? "bg-espresso text-surface rounded-tr-none"
                          : "bg-white border border-border-light text-espresso rounded-tl-none"
                      }`}
                    >
                      {cleanContent}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Visual Tool Execution Loading Indicator */}
            {activeToolStatus && (
              <div className="flex items-center gap-2 text-xs text-gold font-medium bg-gold/10 border border-gold/30 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 w-fit animate-pulse">
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-gold shrink-0" />
                <span className="text-xs truncate">{activeToolStatus}</span>
              </div>
            )}

            {/* Standard Typing Indicator */}
            {isLoading && !activeToolStatus && (
              <div className="flex gap-2.5 max-w-[85%] mr-auto">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gold-gradient text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0">
                  AB
                </div>
                <div className="bg-white border border-border-light rounded-xl sm:rounded-2xl rounded-tl-none px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center gap-1.5 text-xs text-subtext">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span className="ml-1 text-[10px] sm:text-[11px]">Formulating guidance...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 5. BOTTOM RESPONSIVE INPUT BAR */}
          <div className="p-2.5 sm:p-4 bg-surface-alt border-t border-border">
            {/* Attachment Preview Chip */}
            {attachedImage && (
              <div className="mb-2 px-2.5 py-1 rounded-lg bg-surface border border-gold/40 w-fit flex items-center gap-2 text-xs text-espresso">
                <FileText className="w-3.5 h-3.5 text-gold shrink-0" />
                <span className="font-mono text-[10px] sm:text-[11px] truncate max-w-[150px] sm:max-w-[200px]">{attachedImage.name}</span>
                <button
                  onClick={() => setAttachedImage(null)}
                  className="p-0.5 rounded hover:bg-gold/20 text-subtext"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitQuery(input);
              }}
              className="flex items-center gap-1.5 sm:gap-2 w-full"
            >
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-surface border border-border hover:border-gold hover:text-gold text-subtext transition-colors shrink-0"
                title="Attach photo or report"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder={
                  selectedLang.code === "ar"
                    ? "اطرح سؤالك أو اطلب تصريح زائر..."
                    : "Ask Al Bayan AI or request passes..."
                }
                className="flex-1 min-w-0 bg-surface border border-border focus:border-gold focus:outline-none rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-espresso placeholder:text-subtext-muted"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={isLoading || (!input.trim() && !attachedImage)}
                className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-espresso hover:bg-espresso-dark text-gold-bright disabled:opacity-40 transition-all shadow-md flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </section>

        {/* 6. TRUST BADGE FOOTER */}
        <footer className="text-center py-1.5 sm:py-2 flex flex-col items-center gap-0.5 sm:gap-1">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-subtext">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold shrink-0" />
            <span>Information you can trust. Answers you can rely on.</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-subtext-muted font-light px-2">
            Crest Grande – Tower A, Sobha Hartland, Nad Al Sheba First, Dubai • Powered by Al Bayan AI Architecture
          </p>
        </footer>
      </main>

      {/* Lobby & Elevator Physical Display QR Modal */}
      <LobbyQrModal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} />
    </div>
  );
}
