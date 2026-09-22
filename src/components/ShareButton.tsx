// src/components/ShareButton.tsx

import { useState, useRef, useEffect } from "react";
import { Share2, Link, Mail, Twitter, Globe, Lock, Check, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface ShareButtonProps {
  roadmapId?: string;
  roadmapTitle?: string;
  isPublic?: boolean;
  isOwner?: boolean;
  onToggleVisibility?: (val: boolean) => Promise<void>;
  className?: string;
}

export function ShareButton({
  roadmapId,
  roadmapTitle = "Career Roadmap",
  isPublic = false,
  isOwner = true,
  onToggleVisibility,
  className = "",
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const shareUrl = roadmapId
    ? `${window.location.origin}/roadmap/${roadmapId}`
    : window.location.href;

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleToggle = async () => {
    if (!onToggleVisibility || isToggling) return;
    try {
      setIsToggling(true);
      await onToggleVisibility(!isPublic);
    } catch (err) {
      console.error("Failed to toggle visibility:", err);
    } finally {
      setIsToggling(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  };

  const handleCopyLink = async () => {
    try {
      // If owner copies link while it is private, automatically enable link sharing
      if (isOwner && !isPublic && onToggleVisibility) {
        setIsToggling(true);
        try {
          await onToggleVisibility(true);
          toast.info("Link sharing enabled automatically!");
        } catch {
          // If toggle fails, still proceed to copy
        } finally {
          setIsToggling(false);
        }
      }

      await copyToClipboard(shareUrl);
      setCopied(true);
      toast.success("Roadmap link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      toast.error("Failed to copy link to clipboard");
    }
  };

  const handleWhatsApp = async () => {
    if (isOwner && !isPublic && onToggleVisibility) {
      try {
        await onToggleVisibility(true);
      } catch {
        // Continue
      }
    }
    const url = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(
      `Check out this ${roadmapTitle} roadmap on Navixo! 🚀`,
    );
    window.open(`https://wa.me/?text=${text}%20${url}`, "_blank");
    setIsOpen(false);
  };

  const handleEmail = async () => {
    if (isOwner && !isPublic && onToggleVisibility) {
      try {
        await onToggleVisibility(true);
      } catch {
        // Continue
      }
    }
    const subject = encodeURIComponent(`Career Roadmap: ${roadmapTitle} | Navixo`);
    const body = encodeURIComponent(
      `Check out this personalized career roadmap on Navixo:\n\n${shareUrl}`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setIsOpen(false);
  };

  const handleTwitter = async () => {
    if (isOwner && !isPublic && onToggleVisibility) {
      try {
        await onToggleVisibility(true);
      } catch {
        // Continue
      }
    }
    const url = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(
      `Check out my personalized career roadmap for ${roadmapTitle} on Navixo! 🚀`,
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
    );
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      {/* Share Button */}
      <Button
        ref={buttonRef}
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={`gap-1 md:gap-2 border-[#333333] ${
          isOpen ? "bg-[#2B2B2B]" : "bg-transparent"
        } text-white hover:bg-white/5 text-xs md:text-sm flex-1 sm:flex-none transition-colors ${className}`}
        style={{ fontWeight: 500 }}
      >
        <Share2 className="w-3 h-3 md:w-4 md:h-4" />
        <span className="hidden sm:inline">Share</span>
      </Button>

      {/* Share Panel Popup */}
      {isOpen && (
        <div
          ref={panelRef}
          className="absolute bottom-full right-0 mb-2 w-72 bg-[#181A22]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
          style={{
            animation: "slideDown 200ms ease-out",
          }}
        >
          <div className="p-4 space-y-3">
            {/* Header */}
            <div>
              <h4 className="text-white text-sm font-semibold">
                Share Roadmap
              </h4>
              <p className="text-slate-400 text-xs mt-0.5">
                Share with friends, mentors, or colleagues.
              </p>
            </div>

            {/* Visibility Settings (Owner Only) */}
            {isOwner ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                        isPublic
                          ? "bg-purple-500/20 border-purple-500/30 text-purple-300"
                          : "bg-slate-800 border-white/10 text-slate-400"
                      }`}
                    >
                      {isPublic ? (
                        <Globe className="w-3.5 h-3.5 text-cyan-300" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white">
                          Public Link
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                            isPublic
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-slate-700/60 text-slate-400"
                          }`}
                        >
                          {isPublic ? "Active" : "Private"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {isPublic
                          ? "Anyone with link can view"
                          : "Only you can view"}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isPublic}
                    onClick={handleToggle}
                    disabled={isToggling}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isPublic
                        ? "bg-gradient-to-r from-purple-500 to-cyan-500"
                        : "bg-slate-700"
                    } ${isToggling ? "opacity-60 cursor-wait" : ""}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isPublic ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <span className="text-xs text-slate-300">
                  Shared Public Roadmap
                </span>
              </div>
            )}

            {/* Share Options */}
            <div className="space-y-1 pt-1 border-t border-white/5">
              {/* Copy Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Link className="w-3.5 h-3.5 text-purple-400" />
                    )}
                  </div>
                  <span className="text-white text-xs group-hover:text-purple-300 transition-colors font-medium">
                    {copied ? "Link Copied!" : "Copy Link"}
                  </span>
                </div>
                {copied && (
                  <span className="text-[10px] text-emerald-400 font-medium">
                    Done
                  </span>
                )}
              </button>

              {/* WhatsApp */}
              <button
                type="button"
                onClick={handleWhatsApp}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-colors text-left group"
              >
                <div className="w-7 h-7 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-3.5 h-3.5 text-green-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <span className="text-white text-xs group-hover:text-green-300 transition-colors font-medium">
                  WhatsApp
                </span>
              </button>

              {/* Email */}
              <button
                type="button"
                onClick={handleEmail}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-colors text-left group"
              >
                <div className="w-7 h-7 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <span className="text-white text-xs group-hover:text-cyan-300 transition-colors font-medium">
                  Email
                </span>
              </button>

              {/* X (Twitter) */}
              <button
                type="button"
                onClick={handleTwitter}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-colors text-left group"
              >
                <div className="w-7 h-7 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Twitter className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <span className="text-white text-xs group-hover:text-sky-300 transition-colors font-medium">
                  X (Twitter)
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
export default ShareButton;
