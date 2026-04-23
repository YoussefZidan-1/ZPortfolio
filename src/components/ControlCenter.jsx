import { memo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import useSettingsStore from "#store/settings.js";
import { Wifi, Bluetooth, Volume2, VolumeX, Moon, Sun, Monitor } from "lucide-react";
import clsx from "clsx";

const ControlCenter = memo(({ isOpen }) => {
  const { volume, setVolume, isMuted, toggleMute, isDarkMode, toggleDarkMode } = useSettingsStore();
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const stopProp = (e) => e.stopPropagation();
    el.addEventListener("mousedown", stopProp);
    el.addEventListener("touchstart", stopProp, { passive: true });
    return () => {
      el.removeEventListener("mousedown", stopProp);
      el.removeEventListener("touchstart", stopProp);
    };
  }, [isOpen]);

  const content = (
    <div 
      ref={containerRef}
      className={clsx(
        "fixed top-11 right-2 w-[320px] border border-white/40 shadow-[0_20px_80px_rgba(0,0,0,0.2)] rounded-[28px] p-3.5 flex flex-col gap-3 z-[99999] text-gray-800 origin-top-right transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        "bg-white/20 backdrop-blur-[60px] backdrop-saturate-[200%]",
        isOpen 
          ? "opacity-100 scale-100 pointer-events-auto translate-y-0" 
          : "opacity-0 scale-75 pointer-events-none -translate-y-4"
      )}
    >
      
      {/* Top Grid */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* Connectivity Block */}
        <div className={clsx(
            "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            isOpen ? "opacity-100 translate-y-0 scale-100 delay-[70ms]" : "opacity-0 translate-y-4 scale-90"
        )}>
          <div className="bg-white/40 rounded-2xl p-3 flex flex-col gap-3 shadow-sm border border-white/50 hover:bg-white/60 transition-all duration-300 h-full active:scale-[0.98]">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="size-8 rounded-full bg-blue-500 flex items-center justify-center shadow-md group-hover:bg-blue-400 group-active:scale-90 transition-all duration-300">
                <Wifi size={16} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-tight">Wi-Fi</span>
                <span className="text-[10px] text-gray-600 font-medium group-hover:text-gray-800">ZED Network</span>
              </div>
            </div>
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="size-8 rounded-full bg-blue-500 flex items-center justify-center shadow-md group-hover:bg-blue-400 group-active:scale-90 transition-all duration-300">
                <Bluetooth size={16} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-tight">Bluetooth</span>
                <span className="text-[10px] text-gray-600 font-medium group-hover:text-gray-800">On</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dark Mode & Display Block */}
        <div className="grid grid-rows-2 gap-3">
          {/* Dark Mode */}
          <div className={clsx(
              "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
              isOpen ? "opacity-100 translate-y-0 scale-100 delay-[140ms]" : "opacity-0 translate-y-4 scale-90"
          )}>
            <div 
              onClick={toggleDarkMode}
              className="bg-white/40 hover:bg-white/60 rounded-2xl p-3 flex items-center justify-center gap-2 shadow-sm border border-white/50 cursor-pointer active:scale-95 transition-all duration-300 group h-full"
            >
              <div className="group-hover:rotate-12 group-active:-rotate-12 transition-transform duration-300">
                {isDarkMode ? <Moon size={18} className="text-indigo-600" /> : <Sun size={18} className="text-orange-500" />}
              </div>
              <span className="text-xs font-bold">{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
            </div>
          </div>

          {/* Display */}
          <div className={clsx(
              "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
              isOpen ? "opacity-100 translate-y-0 scale-100 delay-[210ms]" : "opacity-0 translate-y-4 scale-90"
          )}>
            <div className="bg-white/20 rounded-2xl p-3 flex items-center justify-center gap-2 shadow-sm border border-white/30 cursor-default opacity-50 h-full">
              <Monitor size={18} />
              <span className="text-xs font-bold">Display</span>
            </div>
          </div>
        </div>
      </div>

      {/* Volume Slider Block */}
      <div className={clsx(
          "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isOpen ? "opacity-100 translate-y-0 scale-100 delay-[280ms]" : "opacity-0 translate-y-4 scale-90"
      )}>
        <div className="bg-white/40 rounded-2xl p-3 shadow-sm border border-white/50 hover:bg-white/60 transition-all duration-300 active:scale-[0.98]">
          <span className="text-xs font-bold ml-1 mb-2 block">Sound</span>
          <div className="flex items-center gap-3">
            <div 
              className="size-8 rounded-full bg-white flex items-center justify-center shadow-md cursor-pointer hover:scale-105 active:scale-90 transition-all duration-300 shrink-0 border border-gray-100 group"
              onClick={toggleMute}
            >
              <div className="group-hover:scale-110 transition-transform duration-300">
                {isMuted || volume === 0 ? <VolumeX size={16} className="text-gray-400" /> : <Volume2 size={16} className="text-gray-800" />}
              </div>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/50 rounded-lg appearance-none cursor-pointer hover:h-2 transition-all duration-200 shadow-inner"
              style={{
                 background: `linear-gradient(to right, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.4) ${(isMuted ? 0 : volume) * 100}%)`,
                 outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
});

export default ControlCenter;