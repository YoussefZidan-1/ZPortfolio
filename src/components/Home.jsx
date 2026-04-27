import { locations, dockApps } from "#constants";
import clsx from "clsx";
import { useGSAP } from "@gsap/react";
import Draggable from "gsap/Draggable";
import { Flip } from "gsap/Flip";
import gsap from "gsap";
import SpotifyWidget from "./SpotifyWidget.jsx";
import { useWebHaptics } from "web-haptics/react";
import useWindowStore from "#store/window.js";
import useLocationStore from "#store/location.js";
import useSettingsStore from "#store/settings.js";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { flushSync } from "react-dom";
import { RefreshCw, Moon, Sun } from "lucide-react";
import dayjs from "dayjs";

gsap.registerPlugin(Draggable, Flip);

const Home = () => {
  const { trigger } = useWebHaptics();
  const setActiveLocation = useLocationStore((s) => s.setActiveLocation);
  const openWindow = useWindowStore((s) => s.openWindow);
  const { isDarkMode, toggleDarkMode } = useSettingsStore();
  
  const [time, setTime] = useState(dayjs());
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Initial state for recovery
  const getInitialItems = () => {
    const apps = dockApps.map(app => 
      app.id === "trash" ? { ...app, id: "resume", name: "Resume", icon: "pdf.png", canOpen: true } : app
    );
    const projects = locations.work?.children || [];
    return [...apps, ...projects];
  };

  const [mobileItems, setMobileItems] = useState(getInitialItems);

  const flipStateRef = useRef(null);
  const longPressTimer = useRef(null);
  const pointerPos = useRef({ x: 0, y: 0 });
  const rippleRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- RECOVERY LOGIC ---
  const restoreSystem = () => {
    trigger("success");
    const state = Flip.getState(".mobile-app-item");
    setMobileItems(getInitialItems());
    
    // Animation of icons flying in from random directions
    setTimeout(() => {
      Flip.from(state, {
        duration: 0.8,
        ease: "back.out(1.5)",
        stagger: 0.05,
        absolute: true,
        onEnter: (elements) => gsap.from(elements, { 
          y: 500, 
          opacity: 0, 
          scale: 0, 
          rotation: 45, 
          stagger: 0.05 
        })
      });
    }, 50);
  };

  // --- LIQUID THEME TRANSITION ---
  const handleThemeToggle = (e) => {
    e.stopPropagation();
    trigger("selection");

    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);

    // Create a temporary ripple effect
    const ripple = rippleRef.current;
    gsap.set(ripple, { 
        left: x, 
        top: y, 
        scale: 0, 
        opacity: 1, 
        backgroundColor: isDarkMode ? "#ffffff" : "#000000" 
    });

    gsap.to(ripple, {
      scale: 50, // Huge scale to cover screen
      duration: 1,
      ease: "power4.inOut",
      onComplete: () => {
        toggleDarkMode();
        gsap.to(ripple, { opacity: 0, duration: 0.5 });
      }
    });
  };

  // --- REORDER LOGIC ---
  const moveItem = (id1, id2) => {
    if (id1 === id2) return;
    const next = [...mobileItems];
    const idx1 = next.findIndex((i) => (i.id || i.name) === id1);
    const idx2 = next.findIndex((i) => (i.id || i.name) === id2);
    if (idx1 === -1 || idx2 === -1) return;
    const [movedItem] = next.splice(idx1, 1);
    next.splice(idx2, 0, movedItem);
    setMobileItems(next);
  };

  useLayoutEffect(() => {
    if (flipStateRef.current) {
      Flip.from(flipStateRef.current, {
        targets: ".mobile-app-item:not(.is-dragging)",
        duration: 0.4,
        ease: "back.out(1.2)",
        absolute: false,
      });
      flipStateRef.current = null;
    }
  }, [mobileItems]);

  useGSAP(() => {
    if (!isEditMode) return;
    Draggable.create(".mobile-app-item", {
      type: "x,y",
      onDragStart: function() {
        this.target.classList.add("is-dragging");
        gsap.to(this.target, { scale: 1.15, zIndex: 1000, duration: 0.2 });
      },
      onDrag: function() {
        const el = this.target;
        const id = el.getAttribute("data-id");
        const items = Array.from(document.querySelectorAll(".mobile-app-item:not(.is-dragging)"));
        for (const item of items) {
          if (this.hitTest(item, "50%")) {
            const targetId = item.getAttribute("data-id");
            const rectBefore = el.getBoundingClientRect();
            flipStateRef.current = Flip.getState(".mobile-app-item:not(.is-dragging)");
            flushSync(() => moveItem(id, targetId));
            const rectAfter = el.getBoundingClientRect();
            gsap.set(el, { x: gsap.getProperty(el, "x") - (rectAfter.left - rectBefore.left), y: gsap.getProperty(el, "y") - (rectAfter.top - rectBefore.top) });
            this.update();
            break;
          }
        }
      },
      onDragEnd: function() {
        this.target.classList.remove("is-dragging");
        gsap.to(this.target, { x: 0, y: 0, scale: 1, zIndex: 30, duration: 0.4, ease: "back.out(1.5)" });
      }
    });
  }, [isEditMode, mobileItems.length]);

  const handleRemove = (e, targetId) => {
    e.stopPropagation();
    trigger("success");
    flipStateRef.current = Flip.getState(".mobile-app-item");
    flushSync(() => setMobileItems(prev => prev.filter(item => (item.id || item.name) !== targetId)));
  };

  return (
    <section 
      id="home" 
      className="absolute inset-0 w-full h-full z-0 overflow-hidden"
      onPointerDown={(e) => {
          pointerPos.current = { x: e.clientX, y: e.clientY };
          if (e.target === e.currentTarget) {
              longPressTimer.current = setTimeout(() => {
                  setIsEditMode(true);
                  trigger("selection");
              }, 600);
          }
      }}
      onPointerUp={() => {
          clearTimeout(longPressTimer.current);
          if (isEditMode) return;
      }}
    >
      <SpotifyWidget /> 

      {/* LIQUID TRANSITION LAYER */}
      <div ref={rippleRef} className="fixed size-10 rounded-full pointer-events-none z-[9999] opacity-0 translate-x-[-50%] translate-y-[-50%]" />

      {/* CLOCK AREA + DARK MODE TRIGGER */}
      <div 
        className="absolute top-[12vh] left-0 w-full flex flex-col items-center justify-center md:hidden text-white drop-shadow-xl z-20 select-none"
        onClick={handleThemeToggle}
      >
        <h1 className="text-[5.5rem] font-light tracking-tight leading-none text-center transition-transform active:scale-95 cursor-pointer">
          {time.format("h:mm")}
        </h1>
        <p className="text-[1.2rem] font-medium mt-2 tracking-wide text-center opacity-80">
          {time.format("dddd, MMMM D")}
        </p>
        <div className="mt-4 p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 animate-bounce">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </div>
      </div>
      
      {/* PC VIEW */}
      <ul className="desktop-projects w-full h-full max-md:hidden">
        {locations.work.children.map((project) => (
          <li key={project.id} className={clsx("group folder", project.windowPosition)} onPointerUp={() => { setActiveLocation(project); openWindow("finder"); }}>
            <img src="/images/folder.png" alt={project.name} width={64} height={60} />
            <p>{project.name}</p>
          </li>
        ))}
      </ul>

      {/* MOBILE GRID */}
      {mobileItems.length > 0 ? (
        <ul className="hidden max-md:grid grid-cols-4 gap-x-2 gap-y-6 px-5 relative z-30 w-full box-border mt-[38vh]">
            {mobileItems.map((item) => {
            const id = item.id || item.name;
            return (
                <li 
                key={id}
                data-id={id}
                data-flip-id={id}
                onPointerDown={(e) => {
                    pointerPos.current = { x: e.clientX, y: e.clientY };
                    longPressTimer.current = setTimeout(() => {
                        setIsEditMode(true);
                        trigger("selection");
                    }, 600);
                }}
                onPointerUp={(e) => {
                    clearTimeout(longPressTimer.current);
                    if (isEditMode) return;
                    const dx = Math.abs(e.clientX - pointerPos.current.x);
                    const dy = Math.abs(e.clientY - pointerPos.current.y);
                    if (dx < 5 && dy < 5) {
                        trigger("nudge");
                        if (item.kind === "folder") { setActiveLocation(item); openWindow("finder"); }
                        else openWindow(item.id);
                    }
                }}
                className={clsx(
                    "mobile-app-item flex flex-col items-center gap-[6px] cursor-pointer touch-none select-none",
                    isEditMode && "is-wiggling"
                )}
                >
                <div className="relative icon-container">
                    <img src={item.icon.startsWith('/') ? item.icon : `/images/${item.icon}`} className={clsx("w-[16vw] max-w-[64px] h-[16vw] max-h-[64px] object-cover pointer-events-none shadow-lg rounded-[14px]", !item.canOpen && "opacity-60")} />
                    {isEditMode && (
                    <button className="absolute -top-2 -left-2 size-6 bg-white dark:bg-gray-700 backdrop-blur-md rounded-full flex items-center justify-center shadow-md z-[1100] border border-black/10 active:scale-90" onPointerDown={(e) => handleRemove(e, id)}>
                        <div className="w-2.5 h-[2.5px] bg-black dark:bg-white rounded-full" />
                    </button>
                    )}
                </div>
                <p className="text-[12px] font-medium text-white drop-shadow-md text-center leading-tight w-full truncate px-1">{item.name}</p>
                </li>
            );
            })}
        </ul>
      ) : (
        /* EMPTY STATE UI */
        <div className="hidden max-md:flex absolute inset-0 flex-col items-center justify-center z-50 p-10 animate-in fade-in zoom-in duration-500">
            <div className="p-8 bg-white/10 backdrop-blur-2xl rounded-[40px] border border-white/20 flex flex-col items-center text-center gap-6 shadow-2xl">
                <div className="size-20 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                    <RefreshCw size={40} className="animate-spin-slow" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2 font-georama">System Zen</h2>
                    <p className="text-white/60 text-sm leading-relaxed">All modules uninstalled. Would you like to restore the default environment?</p>
                </div>
                <button 
                    onClick={restoreSystem}
                    className="w-full py-4 bg-white text-black font-bold rounded-2xl active:scale-95 transition-transform shadow-xl"
                >
                    Restore System
                </button>
            </div>
        </div>
      )}

      {/* Done Button for Edit Mode */}
      {isEditMode && (
          <button 
            onClick={() => setIsEditMode(false)}
            className="fixed top-14 right-5 z-[5000] px-4 py-1.5 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white text-sm font-bold animate-in fade-in slide-in-from-top-4"
          >
              Done
          </button>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wiggle {
          0% { transform: rotate(-1.5deg); }
          50% { transform: rotate(1.5deg); }
          100% { transform: rotate(-1.5deg); }
        }
        .is-wiggling .icon-container { animation: wiggle 0.25s ease-in-out infinite; }
        .is-dragging .icon-container { animation: none !important; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </section>
  );
};

export default Home;