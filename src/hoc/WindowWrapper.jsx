import useWindowStore from "#store/window.js";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Draggable } from "gsap/Draggable";
import { useRef, useState, memo } from "react";

const WindowWrapper = (Component, windowKey) => {
  const Wrapped = memo((props) => {
    const isOpen = useWindowStore((s) => s.windows[windowKey].isOpen);
    const zIndex = useWindowStore((s) => s.windows[windowKey].zIndex);
    const isMaximized = useWindowStore((s) => s.windows[windowKey].isMaximized);
    const dataId = useWindowStore((s) => s.windows[windowKey].data?.id);
    const focusWindow = useWindowStore((s) => s.focusWindow);

    const ref = useRef(null);
    const dragInstance = useRef(null);
    const resizeInstances = useRef([]);
    const [isActuallyVisible, setIsActuallyVisible] = useState(isOpen);
    const preMaxState = useRef(null);

    // 1. OPEN / CLOSE 
    useGSAP(() => {
      const el = ref.current;
      if (!el) return;
      if (isOpen) {
        setIsActuallyVisible(true);
        gsap.fromTo(el, 
          { scale: 0.9, opacity: 0, y: 20 },
          { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.5)", overwrite: "auto" }
        );
      } else {
        gsap.to(el, {
          scale: 0.8, opacity: 0, y: 50, duration: 0.25, ease: "power2.in", overwrite: "auto",
          onComplete: () => setIsActuallyVisible(false),
        });
      }
    },[isOpen, dataId]);

    // 2. PERFECT MAXIMIZE LOGIC
    useGSAP(() => {
      const el = ref.current;
      if (!el || !isOpen) return;

      if (isMaximized) {
        const currentX = gsap.getProperty(el, "x");
        const currentY = gsap.getProperty(el, "y");
        const rect = el.getBoundingClientRect();

        preMaxState.current = {
          width: el.offsetWidth,
          height: el.offsetHeight,
          x: currentX,
          y: currentY,
        };

        if (dragInstance.current) dragInstance.current.disable();
        resizeInstances.current.forEach(i => i.disable());

        gsap.to(el, {
          x: currentX - rect.left,
          y: currentY - rect.top,
          width: "100vw",
          height: "100vh",
          borderRadius: "0px",
          duration: 0.5,
          ease: "expo.inOut",
        });
      } else if (preMaxState.current) {
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
          onComplete: () => dragInstance.current.update()
        });
      }
    }, [isMaximized]);

    // 3. FLAWLESS POINTER-BASED RESIZING
    useGSAP(() => {
      const el = ref.current;
      if (!el) return;

      [dragInstance.current] = Draggable.create(el, {
        onPress: () => focusWindow(windowKey),
        trigger: el.querySelector("#window-header") || el,
        bounds: "main",
      });

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
        
        const [instance] = Draggable.create(hEl, {
          type: "x,y",
          onPress: function(e) {
            e.stopPropagation();
            focusWindow(windowKey);
            this.startW = el.offsetWidth;
            this.startH = el.offsetHeight;
            this.startX = gsap.getProperty(el, "x");
            this.startY = gsap.getProperty(el, "y");
            // Store Absolute Pointer position
            this.startPointerX = this.pointerX;
            this.startPointerY = this.pointerY;
          },
          onDrag: function() {
            // Instantly clear the handle's movement to stop feedback loops
            gsap.set(this.target, { x: 0, y: 0 });

            // Calculate absolute mouse movement delta
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
            dragInstance.current.update();
          }
        });
        resizeInstances.current.push(instance);
      });

      return () => {
        dragInstance.current?.kill();
        resizeInstances.current.forEach(i => i.kill());
      };
    },[]);

    return (
      <section
        id={windowKey}
        ref={ref}
        className="absolute flex flex-col overflow-hidden group bg-white/30 backdrop-blur-xl rounded-xl shadow-2xl transition-none"
        style={{ 
            zIndex, 
            display: isActuallyVisible ? "flex" : "none",
            willChange: "transform, width, height",
            transform: "translate3d(0,0,0)",
        }}
      >
        <Component {...props} />
        {!isMaximized && (
          <><div className="resizer-n absolute top-0 left-0 w-full h-1.5 cursor-ns-resize z-50" /><div className="resizer-s absolute bottom-0 left-0 w-full h-1.5 cursor-ns-resize z-50" /><div className="resizer-w absolute top-0 left-0 h-full w-1.5 cursor-ew-resize z-50" /><div className="resizer-e absolute top-0 right-0 h-full w-1.5 cursor-ew-resize z-50" /><div className="resizer-nw absolute top-0 left-0 size-4 cursor-nwse-resize z-[60]" /><div className="resizer-ne absolute top-0 right-0 size-4 cursor-nesw-resize z-[60]" /><div className="resizer-sw absolute bottom-0 left-0 size-4 cursor-nesw-resize z-[60]" /><div className="resizer-se absolute bottom-0 right-0 size-4 cursor-nwse-resize z-[60]" /></>
        )}
      </section>
    );
  });

  Wrapped.displayName = `WindowWrapper(${Component.displayName || Component.name || "Component"})`;
  return Wrapped;
};

export default WindowWrapper;