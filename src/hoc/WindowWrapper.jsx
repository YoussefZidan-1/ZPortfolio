import useWindowStore from "#store/window.js";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Draggable } from "gsap/Draggable";
import { useRef, useState, useEffect, memo } from "react";
import useSound from "use-sound";
import useSettingsStore from "#store/settings.js";

let openPitchCounter = 0;
const PITCH_LEVELS =[1.0, 1.05, 1.1, 1.15];

const WindowWrapper = (Component, windowKey) => {
  const Wrapped = memo((props) => {
    const isOpen = useWindowStore((s) => s.windows[windowKey].isOpen);
    const zIndex = useWindowStore((s) => s.windows[windowKey].zIndex);
    const isMaximized = useWindowStore((s) => s.windows[windowKey].isMaximized);
    const dataId = useWindowStore((s) => s.windows[windowKey].data?.id);
    const launchPos = useWindowStore((s) => s.windows[windowKey].launchPos);
    const focusWindow = useWindowStore((s) => s.focusWindow);
    const[hasLaunched, setHasLaunched] = useState(isOpen);
    const { volume, isMuted } = useSettingsStore();
    const[playOpen, { sound }] = useSound("/sounds/oxygen_open.ogg", { 
      volume: isMuted ? 0 : volume 
    });

    const ref = useRef(null);
    const dragInstance = useRef(null);
    const resizeInstances = useRef([]);
    const [isActuallyVisible, setIsActuallyVisible] = useState(isOpen);
    const preMaxState = useRef(null);
    const[isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);

    useEffect(() => {
      if (isOpen) {
        if (sound) {
            sound.rate(PITCH_LEVELS[openPitchCounter % PITCH_LEVELS.length]);
            playOpen();
            openPitchCounter++;
        }
        if (!hasLaunched) setHasLaunched(true);
        setIsActuallyVisible(true);
      }
    },[isOpen, sound, playOpen, hasLaunched]);
    
    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener("resize", checkMobile, { passive: true });
      return () => window.removeEventListener("resize", checkMobile);
    },[]);
    
    useEffect(() => {
      if (isOpen && !hasLaunched) setHasLaunched(true);
    },[isOpen, hasLaunched]);

    // 1. OPEN / CLOSE ANIMATIONS
    useGSAP(() => {
      const el = ref.current;
      if (!el) return;
      if (isOpen) {
        setIsActuallyVisible(true);
        if (isMobile) {
          if (launchPos) {
            gsap.fromTo(el,
              { opacity: 0, scale: 0.8, transformOrigin: `${launchPos.x}px ${launchPos.y}px`, borderRadius: "32px", x: 0, y: 0 },
              { opacity: 1, scale: 1, borderRadius: "0px", duration: 0.35, ease: "power3.out", overwrite: "auto", x: 0, y: 0 }
            );
          } else {
            gsap.fromTo(el, { yPercent: 100, opacity: 1, x: 0, y: 0 }, { yPercent: 0, duration: 0.35, ease: "power3.out", overwrite: "auto", x: 0, y: 0 });
          }
        } else {
          gsap.fromTo(el, { scale: 0.9, opacity: 0, yPercent: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.5)", overwrite: "auto" });
        }
      } else {
        if (isMobile) {
          gsap.to(el, { opacity: 0, scale: 0.9, duration: 0.25, ease: "power3.in", overwrite: "auto", onComplete: () => setIsActuallyVisible(false) });
        } else {
          gsap.to(el, { scale: 0.8, opacity: 0, duration: 0.25, ease: "power2.in", overwrite: "auto", onComplete: () => setIsActuallyVisible(false) });
        }
      }
    },[isOpen, dataId, isMobile]);

    // 2. MAXIMIZE ANIMATIONS
    const { contextSafe } = useGSAP();

    useEffect(() => {
      if (isMobile) return;
      const el = ref.current;
      if (!el || !isOpen) return;

      const handleMaximize = contextSafe(() => {
        if (isMaximized) {
          const currentX = gsap.getProperty(el, "x");
          const currentY = gsap.getProperty(el, "y");
          const rect = el.getBoundingClientRect();
          preMaxState.current = { width: el.offsetWidth, height: el.offsetHeight, x: currentX, y: currentY };
          
          gsap.to(el, { 
            x: currentX - rect.left, 
            y: currentY - rect.top, 
            width: "100vw", 
            height: "100vh", 
            maxWidth: "none", 
            maxHeight: "none",  
            borderRadius: "0px", 
            duration: 0.5, 
            ease: "expo.inOut", 
            overwrite: true 
          });
        } else if (preMaxState.current) {
          gsap.to(el, { 
            x: preMaxState.current.x, 
            y: preMaxState.current.y, 
            width: preMaxState.current.width, 
            height: preMaxState.current.height, 
            borderRadius: "12px", 
            duration: 0.5, 
            ease: "expo.inOut", 
            overwrite: true, 
            onComplete: () => dragInstance.current?.update() 
          });
        }
      });
      handleMaximize();
    }, [isMaximized, isMobile, isOpen]);

    // 3. DRAG & RESIZE SETUP (With Lazy-Load MutationObserver Fix)
    useGSAP(() => {
      const el = ref.current;
      if (!el || isMobile) return;

      let drag;

      // EXPERT FIX: Function to bind Draggable specifically to the header
      const setupDraggable = () => {
        const header = el.querySelector("#window-header");
        if (header && !drag) {
          drag = Draggable.create(el, {
            trigger: header, // <--- Strictly binds dragging to the header ONLY!
            bounds: "main",
            dragClickables: true,
            allowEventDefault: true,
            onDragStart: function() {
              if (useWindowStore.getState().windows[windowKey].isMaximized) return false;
            }
          })[0];
          dragInstance.current = drag;
        }
      };

      // Try running it immediately
      setupDraggable();

      // If the component is Suspended/Lazy-loading, watch the DOM until the header drops in
      const observer = new MutationObserver(() => {
        if (!drag && el.querySelector("#window-header")) {
          setupDraggable();
          observer.disconnect(); // Kill the observer once hooked
        }
      });
      observer.observe(el, { childList: true, subtree: true });

      // Force cleanup of GSAP's aggressive touch-action properties on the container
      gsap.set(el, { clearProps: "userSelect,touchAction" });
      el.style.userSelect = "auto";
      el.style.touchAction = "auto";

      resizeInstances.current =[];
      const minW = 350;
      const minH = 250;
      const handleConfigs =[
        { cls: ".resizer-n", type: "n" }, { cls: ".resizer-s", type: "s" },
        { cls: ".resizer-e", type: "e" }, { cls: ".resizer-w", type: "w" },
        { cls: ".resizer-nw", type: "nw" }, { cls: ".resizer-ne", type: "ne" },
        { cls: ".resizer-sw", type: "sw" }, { cls: ".resizer-se", type: "se" },
      ];

      handleConfigs.forEach(({ cls, type }) => {
        const hEl = el.querySelector(cls);
        if (!hEl) return;
        const[instance] = Draggable.create(hEl, {
          type: "x,y",
          allowEventDefault: true,
          onPress: function(e) {
            if (useWindowStore.getState().windows[windowKey].isMaximized) return false;
            e.stopPropagation();
            focusWindow(windowKey);
            this.startW = el.offsetWidth;
            this.startH = el.offsetHeight;
            this.startX = gsap.getProperty(el, "x");
            this.startY = gsap.getProperty(el, "y");
            this.startPointerX = this.pointerX;
            this.startPointerY = this.pointerY;
          },
          onDrag: function() {
            gsap.set(this.target, { x: 0, y: 0 });
            const deltaX = this.pointerX - this.startPointerX;
            const deltaY = this.pointerY - this.startPointerY;
            let w = this.startW, h = this.startH, x = this.startX, y = this.startY;
            if (type.includes("e")) w = this.startW + deltaX;
            if (type.includes("w")) {
              const constrainedDelta = Math.min(deltaX, this.startW - minW);
              w = this.startW - constrainedDelta;
              x = this.startX + constrainedDelta;
            }
            if (type.includes("s")) h = this.startH + deltaY;
            if (type.includes("n")) {
              const constrainedDelta = Math.min(deltaY, this.startH - minH);
              h = this.startH - constrainedDelta;
              y = this.startY + constrainedDelta;
            }
            gsap.set(el, { width: Math.max(w, minW), height: Math.max(h, minH), x, y });
          },
          onDragEnd: function() {
            gsap.set(this.target, { x: 0, y: 0 });
            dragInstance.current?.update();
          }
        });
        resizeInstances.current.push(instance);
      });

      return () => {
        dragInstance.current?.kill();
        resizeInstances.current.forEach(i => i.kill());
        observer.disconnect();
      };
    }, [isMobile]);

    return (
      <section
        id={windowKey}
        ref={ref}
        onPointerDownCapture={() => focusWindow(windowKey)}
        className="os-window absolute flex flex-col overflow-hidden group bg-white/30 backdrop-blur-xl rounded-xl shadow-2xl transition-none max-md:bg-white"
        style={{
            zIndex,
            display: isActuallyVisible ? "flex" : "none",
            willChange: "transform, width, height, opacity",
            transform: "translate3d(0,0,0)",
        }}
      >
        {hasLaunched && <Component {...props} />}

        {isMobile && (
          <div className="absolute bottom-0 left-0 w-full h-8 z-[2000] flex justify-center items-end pb-2 pointer-events-none">
            <div className="w-[130px] h-1.5 bg-black/40 rounded-full" />
          </div>
        )}

        {!isMobile && (
          <div className={isMaximized ? "hidden pointer-events-none" : ""}>
            <div className="resizer-n absolute top-0 left-0 w-full h-1.5 cursor-ns-resize z-50" />
            <div className="resizer-s absolute bottom-0 left-0 w-full h-1.5 cursor-ns-resize z-50" />
            <div className="resizer-w absolute top-0 left-0 h-full w-1.5 cursor-ew-resize z-50" />
            <div className="resizer-e absolute top-0 right-0 h-full w-1.5 cursor-ew-resize z-50" />
            <div className="resizer-nw absolute top-0 left-0 size-4 cursor-nwse-resize z-[60]" />
            <div className="resizer-ne absolute top-0 right-0 size-4 cursor-nesw-resize z-[60]" />
            <div className="resizer-sw absolute bottom-0 left-0 size-4 cursor-nesw-resize z-[60]" />
            <div className="resizer-se absolute bottom-0 right-0 size-4 cursor-nwse-resize z-[60]" />
          </div>
        )}
      </section>
    );
  });

  Wrapped.displayName = `WindowWrapper(${Component.displayName || Component.name || "Component"})`;
  return Wrapped;
};

export default WindowWrapper;