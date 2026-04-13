import useWindowStore from "#store/window.js";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Draggable } from "gsap/Draggable";
import { useRef, useState } from "react";

const WindowWrapper = (Component, windowKey) => {
  const Wrapped = (props) => {
    const { focusWindow, windows } = useWindowStore();
    const { isOpen, zIndex, isMaximized } = windows[windowKey];
    const ref = useRef(null);
    const dragInstance = useRef(null);
    const resizeInstances = useRef([]);
    const [isActuallyVisible, setIsActuallyVisible] = useState(isOpen);
    
    // This ref will now store the exact state before maximize
    const preMaxState = useRef(null);

    // 1. OPEN / CLOSE 
    useGSAP(() => {
      const el = ref.current;
      if (!el) return;
      if (isOpen) {
        setIsActuallyVisible(true);
        gsap.fromTo(el, 
          { display: "block", scale: 0.5, opacity: 0, y: 50 },
          { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.5)", overwrite: true }
        );
      } else {
        gsap.to(el, {
          scale: 0.8, opacity: 0, y: 50, duration: 0.25, ease: "power2.in", overwrite: true,
          onComplete: () => setIsActuallyVisible(false),
        });
      }
    }, [isOpen]);

    // 2. MAXIMIZE / UNMAXIMIZE (THE DRIFT FIX)
    useGSAP(() => {
      const el = ref.current;
      if (!el || !isOpen) return;

      if (isMaximized) {
        // SAVE: Capture current width, height, and Draggable's x/y
        preMaxState.current = {
          width: gsap.getProperty(el, "width"),
          height: gsap.getProperty(el, "height"),
          x: dragInstance.current.x,
          y: dragInstance.current.y,
        };

        if (dragInstance.current) dragInstance.current.disable();
        resizeInstances.current.forEach(i => i.disable());

        // We calculate the offset to 0,0 based on its current CSS position
        // This prevents the "shifting" bug
        const rect = el.getBoundingClientRect();
        const offsetX = rect.left - dragInstance.current.x;
        const offsetY = rect.top - dragInstance.current.y;

        gsap.to(el, {
          x: -offsetX,
          y: -offsetY,
          width: "100vw",
          height: "100vh",
          borderRadius: "0px",
          duration: 0.5,
          ease: "expo.inOut",
        });
      } else if (preMaxState.current) {
        // RESTORE: Go exactly back to the saved x, y, w, h
        if (dragInstance.current) dragInstance.current.enable();
        resizeInstances.current.forEach(i => i.enable());

        gsap.to(el, {
          x: preMaxState.current.x,
          y: preMaxState.current.y,
          width: preMaxState.current.width,
          height: preMaxState.current.height,
          borderRadius: "12px",
          duration: 0.5,
          ease: "expo.inOut",
          onComplete: () => {
             // Sync Draggable's internal record with the new position
             dragInstance.current.update();
          }
        });
      }
    }, [isMaximized]);

    // 3. MULTI-DIRECTIONAL RESIZING
    useGSAP(() => {
      const el = ref.current;
      if (!el) return;

      [dragInstance.current] = Draggable.create(el, {
        onPress: () => focusWindow(windowKey),
        trigger: el.querySelector("#window-header") || el,
        bounds: "main",
      });

      const minW = 300;
      const minH = 200;

      const handleConfigs = [
        { cls: ".resizer-n",  type: "n" }, { cls: ".resizer-s",  type: "s" },
        { cls: ".resizer-e",  type: "e" }, { cls: ".resizer-w",  type: "w" },
        { cls: ".resizer-nw", type: "nw" }, { cls: ".resizer-ne", type: "ne" },
        { cls: ".resizer-sw", type: "sw" }, { cls: ".resizer-se", type: "se" },
      ];

      handleConfigs.forEach(({ cls, type }) => {
        const hEl = el.querySelector(cls);
        if (!hEl) return;

        const [instance] = Draggable.create(hEl, {
          onPress: function(e) {
            e.stopPropagation();
            focusWindow(windowKey);
            this.startW = gsap.getProperty(el, "width");
            this.startH = gsap.getProperty(el, "height");
            this.startX = gsap.getProperty(el, "x");
            this.startY = gsap.getProperty(el, "y");
          },
          onDrag: function() {
            let w = this.startW, h = this.startH, x = this.startX, y = this.startY;

            if (type.includes("e")) w = this.startW + this.x;
            if (type.includes("w")) {
              w = this.startW - this.x;
              if (w > minW) x = this.startX + this.x;
            }
            if (type.includes("s")) h = this.startH + this.y;
            if (type.includes("n")) {
              h = this.startH - this.y;
              if (h > minH) y = this.startY + this.y;
            }

            gsap.set(el, { width: Math.max(w, minW), height: Math.max(h, minH), x, y });
          },
          onDragEnd: function() {
            gsap.set(this.target, { x: 0, y: 0 });
            dragInstance.current.update(); // Important: keep Draggable in sync
          }
        });
        resizeInstances.current.push(instance);
      });

      return () => {
        dragInstance.current?.kill();
        resizeInstances.current.forEach(i => i.kill());
      };
    }, []);

    return (
      <section
        id={windowKey}
        ref={ref}
        className="absolute overflow-hidden group bg-white/30 backdrop-blur-xl rounded-xl shadow-2xl"
        style={{ zIndex, display: isActuallyVisible ? "block" : "none" }}
      >
        <Component {...props} />
        {!isMaximized && (
          <>
            <div className="resizer-n absolute top-0 left-0 w-full h-[6px] cursor-ns-resize z-50" />
            <div className="resizer-s absolute bottom-0 left-0 w-full h-[6px] cursor-ns-resize z-50" />
            <div className="resizer-w absolute top-0 left-0 h-full w-[6px] cursor-ew-resize z-50" />
            <div className="resizer-e absolute top-0 right-0 h-full w-[6px] cursor-ew-resize z-50" />
            <div className="resizer-nw absolute top-0 left-0 size-4 cursor-nwse-resize z-[60]" />
            <div className="resizer-ne absolute top-0 right-0 size-4 cursor-nesw-resize z-[60]" />
            <div className="resizer-sw absolute bottom-0 left-0 size-4 cursor-nesw-resize z-[60]" />
            <div className="resizer-se absolute bottom-0 right-0 size-4 cursor-nwse-resize z-[60]" />
          </>
        )}
      </section>
    );
  };

  Wrapped.displayName = `WindowWrapper(${Component.displayName || Component.name || "Component"})`;
  return Wrapped;
};

export default WindowWrapper;