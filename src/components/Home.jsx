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
  
  const getInitialItems = () => {
    const apps = dockApps.map(app => 
      app.id === "trash" ? { ...app, id: "resume", name: "Resume", icon: "pdf.png", canOpen: true } : app
    );
    const projects = locations.work?.children ||[];
    return [...apps, ...projects];
  };

  const [mobileItems, setMobileItems] = useState(getInitialItems);

  const flipStateRef = useRef(null);
  const longPressTimer = useRef(null);
  const pointerPos = useRef({ x: 0, y: 0 });
  const rippleRef = useRef(null);
  const desktopGhostRef = useRef(null); // Reference for the Grid Ghost Box

  useEffect(() => {
    const timer = setInterval(() => setTime(dayjs()), 1000);
    return () => clearInterval(timer);
  },[]);

  const moveItem = (id1, id2) => {
    if (id1 === id2) return;
    const next =[...mobileItems];
    const idx1 = next.findIndex((i) => (i.id || i.name) === id1);
    const idx2 = next.findIndex((i) => (i.id || i.name) === id2);
    if (idx1 === -1 || idx2 === -1) return;
    
    const [movedItem] = next.splice(idx1, 1);
    next.splice(idx2, 0, movedItem);
    setMobileItems(next);
  };

  const handleThemeToggle = (e) => {
    e.stopPropagation();
    trigger("selection");

    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);

    const ripple = rippleRef.current;
    gsap.set(ripple, { 
        left: x, 
        top: y, 
        scale: 0, 
        opacity: 1, 
        backgroundColor: isDarkMode ? "#ffffff" : "#000000" 
    });

    gsap.to(ripple, {
      scale: 60,
      duration: 0.8,
      ease: "expo.inOut",
      onComplete: () => {
        toggleDarkMode();
        gsap.to(ripple, { opacity: 0, duration: 0.4 });
      }
    });
  };

  const restoreSystem = () => {
    trigger("success");
    const state = Flip.getState(".mobile-app-item");
    setMobileItems(getInitialItems());
    
    setTimeout(() => {
      Flip.from(state, {
        duration: 0.6,
        ease: "back.out(1.2)",
        stagger: 0.04,
        onEnter: (elements) => gsap.from(elements, { y: 100, opacity: 0, stagger: 0.04 })
      });
    }, 50);
  };

  useLayoutEffect(() => {
    if (flipStateRef.current) {
      Flip.from(flipStateRef.current, {
        targets: ".mobile-app-item:not(.is-dragging)",
        duration: 0.4,
        ease: "back.out(1.2)",
        absolute: false,
        onEnter: (elements) => gsap.fromTo(elements, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 }),
        onLeave: (elements) => gsap.to(elements, { scale: 0, opacity: 0, duration: 0.3 })
      });
      flipStateRef.current = null;
    }
  }, [mobileItems]);

  // -------------------------------------------------------------
  // EXPERT FEATURE: Desktop Grid Snapping with Ghost Collision!
  // -------------------------------------------------------------
  useGSAP(() => {
    const GRID_W = 120; // Grid Cell Width
    const GRID_H = 140; // Grid Cell Height
    const ghost = desktopGhostRef.current;

    const draggables = Draggable.create(".desktop-projects .folder", {
      type: "x,y",
      bounds: "main",
      dragClickables: true,
      onPress: function () {
        // Record where the item was originally placed in the DOM vs its current GSAP transform
        const currentX = gsap.getProperty(this.target, "x");
        const currentY = gsap.getProperty(this.target, "y");
        const rect = this.target.getBoundingClientRect();
        
        this.baseGlobalX = rect.left - currentX;
        this.baseGlobalY = rect.top - currentY;
        this.startX = currentX;
        this.startY = currentY;
      },
      onDragStart: function () {
        this.target.classList.add("is-dragging-desktop");
        gsap.to(this.target, { scale: 1.05, opacity: 0.9, duration: 0.2 });

        // 1. Gather positions of all OTHER folders to detect collisions
        this.occupied =[];
        const allFolders = document.querySelectorAll(".desktop-projects .folder");
        allFolders.forEach(f => {
          if (f === this.target) return;
          const r = f.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const gridX = Math.round(cx / GRID_W) * GRID_W;
          const gridY = Math.round(cy / GRID_H) * GRID_H;
          this.occupied.push({ x: gridX, y: gridY });
        });

        // 2. Setup the Ghost Box
        const iconWidth = this.target.offsetWidth;
        const iconHeight = this.target.offsetHeight;
        ghost.style.display = "block";
        ghost.style.width = `${iconWidth + 24}px`;
        ghost.style.height = `${iconHeight + 24}px`;
        
        // Pop in animation for the Ghost Box
        gsap.set(ghost, { scale: 0.8, opacity: 0 });
        gsap.to(ghost, { scale: 1, opacity: 1, duration: 0.2, ease: "back.out(2)" });
      },
      onDrag: function () {
        const rect = this.target.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        // Calculate the snapped grid intersection point
        const snapGlobalX = Math.round(cx / GRID_W) * GRID_W;
        const snapGlobalY = Math.round(cy / GRID_H) * GRID_H;

        // Position the ghost box centered on the intersection
        const ghostWidth = this.target.offsetWidth + 24;
        const ghostHeight = this.target.offsetHeight + 24;
        const ghostLeft = snapGlobalX - ghostWidth / 2;
        const ghostTop = snapGlobalY - ghostHeight / 2;

        // Check if another icon is already sitting in this slot
        const isColliding = this.occupied.some(pos => pos.x === snapGlobalX && pos.y === snapGlobalY);
        
        this.isValidDrop = !isColliding;
        
        // Calculate where the dragged icon SHOULD glide to if released
        this.snapLocalX = (snapGlobalX - this.target.offsetWidth / 2) - this.baseGlobalX;
        this.snapLocalY = (snapGlobalY - this.target.offsetHeight / 2) - this.baseGlobalY;

        // Animate Ghost box snapping
        gsap.to(ghost, { x: ghostLeft, y: ghostTop, duration: 0.15, ease: "power2.out" });

        // Update Ghost colors based on collision status
        if (isColliding) {
          ghost.className = "fixed z-0 pointer-events-none rounded-2xl border-[3px] transition-colors duration-150 border-red-500/80 bg-red-500/30 backdrop-blur-md";
        } else {
          ghost.className = "fixed z-0 pointer-events-none rounded-2xl border-[3px] transition-colors duration-150 border-white/40 bg-white/10 dark:border-white/20 dark:bg-white/5 backdrop-blur-md";
        }
      },
      onDragEnd: function () {
        this.target.classList.remove("is-dragging-desktop");
        
        // Hide Ghost box
        gsap.to(ghost, { scale: 0.8, opacity: 0, duration: 0.2, onComplete: () => ghost.style.display = "none" });

        if (this.isValidDrop) {
          trigger("success"); // Haptic pop
          gsap.to(this.target, {
            x: this.snapLocalX,
            y: this.snapLocalY,
            scale: 1,
            opacity: 1,
            duration: 0.4,
            ease: "back.out(1.2)"
          });
        } else {
          trigger("error"); // Haptic buzz/error
          // Reject Drop: Fly back to where you started
          gsap.to(this.target, {
            x: this.startX,
            y: this.startY,
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: "elastic.out(1, 0.5)"
          });
        }
      }
    });

    return () => {
      draggables.forEach(d => d.kill());
    };
  },[]);

  // -------------------------------------------------------------
  // Mobile App Grid Draggable
  // -------------------------------------------------------------
  useGSAP(() => {
    if (!isEditMode) return;

    const draggables = Draggable.create(".mobile-app-item", {
      type: "x,y",
      dragClickables: true, 
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
            const dx = rectAfter.left - rectBefore.left;
            const dy = rectAfter.top - rectBefore.top;

            const currentX = gsap.getProperty(el, "x");
            const currentY = gsap.getProperty(el, "y");

            gsap.set(el, { x: currentX - dx, y: currentY - dy });
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

    return () => draggables.forEach(d => d.kill());
  },[isEditMode, mobileItems.length]);

  const handleRemove = (e, targetId) => {
    e.stopPropagation();
    trigger("success");
    flipStateRef.current = Flip.getState(".mobile-app-item");
    flushSync(() => setMobileItems(prev => prev.filter(item => (item.id || item.name) !== targetId)));
  };

  const handlePointerDown = (e) => {
    pointerPos.current = { x: e.clientX, y: e.clientY };
    longPressTimer.current = setTimeout(() => {
      setIsEditMode(true);
      trigger("selection");
    }, 600);
  };

  const handlePointerUp = (e, item) => {
    clearTimeout(longPressTimer.current);
    const dx = Math.abs(e.clientX - pointerPos.current.x);
    const dy = Math.abs(e.clientY - pointerPos.current.y);

    if (dx < 5 && dy < 5 && !isEditMode) {
      trigger("nudge");
      const rect = e.currentTarget.getBoundingClientRect();
      const launchPos = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height,
      };

      if (item.kind === "folder") {
        setActiveLocation(item);
        openWindow("finder", null, launchPos);
      } else {
        openWindow(item.id, null, launchPos);
      }
    }
  };

  return (
    <section 
      id="home" 
      className="absolute inset-0 w-full h-full z-0 overflow-hidden"
      onPointerDown={(e) => e.target === e.currentTarget && setIsEditMode(false)}
    >
      <SpotifyWidget /> 

      {/* Ripple Effect Layer */}
      <div ref={rippleRef} className="fixed size-10 rounded-full pointer-events-none z-[9999] opacity-0 -translate-x-1/2 -translate-y-1/2 will-change-transform" />

      {/* Desktop Grid Ghost Indicator */}
      <div 
        ref={desktopGhostRef} 
        className="fixed z-0 pointer-events-none rounded-2xl border-2 hidden"
      />

      {/* Clock Area (Dark mode trigger) */}
      <div 
        className="absolute top-[12vh] left-0 w-full flex flex-col items-center justify-center md:hidden text-white drop-shadow-xl z-20 select-none cursor-pointer"
        onClick={handleThemeToggle}
      >
        <h1 className="text-[5.5rem] font-light tracking-tight leading-none text-center active:scale-95 transition-transform">
          {time.format("h:mm")}
        </h1>
        <p className="text-[1.2rem] font-medium mt-2 tracking-wide text-center opacity-80">
          {time.format("dddd, MMMM D")}
        </p>
        <div className="mt-4 p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </div>
      </div>
      
      {/* PC View Folders */}
      <ul className="desktop-projects w-full h-full max-md:hidden">
        {locations.work.children.map((project) => (
          <li
            key={project.id}
            className={clsx("group folder", project.windowPosition)}
            onDoubleClick={() => { 
              trigger("selection");
              setActiveLocation(project); 
              openWindow("finder"); 
            }}
          >
            <img src="/images/folder.png" alt={project.name} width={64} height={60} className="pointer-events-none" />
            <p className="pointer-events-none">{project.name}</p>
          </li>
        ))}
      </ul>

      {/* Mobile Grid */}
      <ul className="hidden max-md:grid grid-cols-4 gap-x-2 gap-y-6 px-5 relative z-30 w-full box-border mt-[38vh]">
        {mobileItems.map((item) => {
          const id = item.id || item.name;
          return (
            <li 
              key={id}
              data-id={id}
              data-flip-id={id}
              onPointerDown={(e) => handlePointerDown(e, item)}
              onPointerUp={(e) => handlePointerUp(e, item)}
              className={clsx(
                "mobile-app-item flex flex-col items-center gap-[6px] cursor-pointer touch-none select-none",
                isEditMode && "is-wiggling"
              )}
            >
              <div className="relative icon-container pointer-events-none">
                <img 
                  src={item.icon.startsWith('/') ? item.icon : `/images/${item.icon}`} 
                  alt={item.name} 
                  className={clsx(
                    "w-[16vw] max-w-[64px] h-[16vw] max-h-[64px] object-cover shadow-lg rounded-[14px]",
                    !item.canOpen && "opacity-60"
                  )}
                />
                
                {isEditMode && (
                  <button 
                    className="absolute -top-2 -left-2 size-6 bg-white dark:bg-gray-700 backdrop-blur-md rounded-full flex items-center justify-center shadow-md z-[1100] border border-black/10 active:scale-90 transition-transform pointer-events-auto"
                    onPointerDown={(e) => handleRemove(e, id)}
                  >
                    <div className="w-2.5 h-[2.5px] bg-black dark:bg-white rounded-full" />
                  </button>
                )}
              </div>
              <p className="text-[12px] font-medium text-white drop-shadow-md text-center leading-tight w-full truncate px-1 pointer-events-none">
                {item.name}
              </p>
            </li>
          );
        })}

        {mobileItems.length === 0 && (
          <li className="col-span-4 flex flex-col items-center justify-center py-20 gap-4">
              <RefreshCw size={32} className="text-white/40 animate-spin-slow" />
              <button 
                onClick={restoreSystem} 
                className="px-8 py-3 bg-white text-black font-bold rounded-2xl shadow-2xl active:scale-95 transition-transform"
              >
                Restore System
              </button>
          </li>
        )}
      </ul>

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
        .is-wiggling .icon-container {
          animation: wiggle 0.25s ease-in-out infinite;
        }
        .is-dragging .icon-container {
          animation: none !important;
        }
        .animate-spin-slow {
          animation: spin 4s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </section>
  );
};

export default Home;