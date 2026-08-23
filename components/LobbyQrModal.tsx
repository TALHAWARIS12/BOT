"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Building2,
  X,
  Copy,
  Check,
  Printer,
  Sparkles,
  ExternalLink,
  QrCode,
} from "lucide-react";

interface LobbyQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TARGET_CONCIERGE_URL = "https://al-bayan-ai-theta.vercel.app/";
const QR_VECTOR_SRC = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
  TARGET_CONCIERGE_URL
)}&color=2C221E&bgcolor=FAF5EE&margin=15&format=svg`;

export function LobbyQrModal({ isOpen, onClose }: LobbyQrModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(TARGET_CONCIERGE_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintSticker = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-espresso-dark border border-gold/40 rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8 flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-espresso text-subtext-muted hover:text-gold-bright hover:bg-gold/20 transition-all"
          aria-label="Close QR Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Emblem */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-9 h-9 rounded-full bg-gold-gradient p-0.5 flex items-center justify-center shadow-gold-glow">
            <div className="w-full h-full rounded-full bg-espresso flex items-center justify-center">
              <Building2 className="w-4 h-4 text-gold-bright" />
            </div>
          </div>
          <span className="font-serif text-lg font-bold tracking-wider text-gold-bright">
            AL BAYAN AI
          </span>
        </div>

        <p className="text-[11px] uppercase tracking-widest text-subtext-muted font-mono mb-6">
          Lobby & Elevator Physical QR Display
        </p>

        {/* 2. SPECIFIED BRANDED QR CARD */}
        <div
          className="w-full rounded-2xl p-6 shadow-2xl flex flex-col items-center border-2 transition-all transform hover:scale-[1.01]"
          style={{
            backgroundColor: "#FAF5EE", // Cream
            borderColor: "#C5A880", // Brushed Gold
          }}
        >
          {/* Top Card Emblem */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#2C221E] text-[#D4AF37] flex items-center justify-center font-bold text-xs">
              AB
            </div>
            <div className="text-left">
              <h3 className="font-serif font-bold text-sm text-[#2C221E] leading-tight">
                AL BAYAN AI
              </h3>
              <p className="text-[10px] text-[#6E6359] font-medium">
                Crest Grande – Tower A
              </p>
            </div>
          </div>

          {/* QR Code Vector Container */}
          <div className="relative w-64 h-64 p-2 rounded-xl bg-[#FAF5EE] border border-[#C5A880]/40 shadow-inner flex items-center justify-center my-1">
            <Image
              src={QR_VECTOR_SRC}
              alt="Al Bayan AI Concierge Mobile QR Code"
              width={400}
              height={400}
              unoptimized
              priority
              className="w-full h-full object-contain rounded-lg"
            />
          </div>

          {/* Specified Caption */}
          <p className="text-xs md:text-sm font-semibold text-[#2C221E] mt-4 px-2 leading-relaxed">
            Scan to open your digital concierge on mobile
          </p>
          <span className="text-[10px] text-[#6E6359] mt-1 font-mono">
            Sobha Hartland • Nad Al Sheba First, Dubai
          </span>
        </div>

        {/* Actions Footer */}
        <div className="w-full grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-espresso border border-gold/40 text-gold-bright hover:bg-gold/20 text-xs font-semibold transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied Link!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy URL</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrintSticker}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold-gradient text-espresso font-bold text-xs hover:opacity-90 transition-all shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Print Sticker</span>
          </button>
        </div>
      </div>
    </div>
  );
}
