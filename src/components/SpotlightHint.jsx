import { useState, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Info, X, Command } from "lucide-react";
import useSettingsStore from "#store/settings.js";
import { useWebHaptics } from "web-haptics/react";

const SpotlightHint = ({ isBooted }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { volume, isMuted } = useSettingsStore();
  const { trigger } = useWebHaptics();
  const notificationRef = useRef(null);

  useEffect(() => {
    if (isBooted) {
      // Wait seconds after boot before showing the hint
      const timer = setTimeout(() => {
        setIsVisible(true);
        
        // Play the notification sound
        const audio = new Audio("/sounds/oxygen_aurora.mp3");
        audio.volume = isMuted ? 0 : volume;
        audio.play().catch((e) => console.log("Sound play blocked:", e));
        
        trigger("notification");
      }, 14500);

      return () => clearTimeout(timer);
    }
  }, [isBooted, volume, isMuted, trigger]);

  useGSAP(() => {
    if (isVisible) {
      gsap.fromTo(
        notificationRef.current,
        { x: 400, opacity: 0, scale: 0.9 },
        { 
          x: 0, 
          opacity: 1, 
          scale: 1, 
          duration: 0.8, 
          ease: "elastic.out(1, 0.75)" 
        }
      );

      // Auto-hide after 8 seconds
      const hideTimer = setTimeout(() => handleClose(), 8000);
      return () => clearTimeout(hideTimer);
    }
  }, [isVisible]);

  const { contextSafe } = useGSAP();
  
  const handleClose = contextSafe(() => {
    gsap.to(notificationRef.current, {
      x: 100,
      opacity: 0,
      scale: 0.9,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => setIsVisible(false)
    });
  });

  const openSpotlight = () => {
    window.dispatchEvent(new CustomEvent('toggle-spotlight'));
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div 
      ref={notificationRef}
      className="fixed top-16 right-4 z-[999999] w-[320px] bg-white/70 dark:bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-4 cursor-pointer group select-none overflow-hidden"
      onClick={openSpotlight}
    >
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      
      <div className="flex items-start gap-3 relative z-10">
        <div className="size-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
          <Search size={22} className="text-white" />
        </div>
        
        <div className="flex-1 flex flex-col gap-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-gray-900 dark:text-white uppercase tracking-tight opacity-50">System Intelligence</span>
            <button 
              onClick={(e) => { e.stopPropagation(); handleClose(); }}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={14} className="text-gray-500" />
            </button>
          </div>
          <h4 className="text-[15px] font-semibold text-gray-900 dark:text-white leading-tight">Spotlight Search</h4>
          <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-snug mt-0.5">
            Press <span className="inline-flex items-center gap-0.5 bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded border border-black/5 dark:border-white/10 font-terminal text-[11px] font-bold text-gray-800 dark:text-gray-200">
              <Command size={10} /> K
            </span> to quickly search apps and files.
          </p>
        </div>
      </div>

      {/* Progress bar timer */}
      <div className="absolute bottom-0 left-0 h-1 bg-blue-500/30 w-full">
        <div className="h-full bg-blue-500 animate-[progress_8s_linear_forwards]" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}} />
    </div>
  );
};

// Simple Search Icon internal to file
const Search = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);

export default SpotlightHint;