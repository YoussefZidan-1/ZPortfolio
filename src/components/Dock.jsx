import { locations } from "#constants/index.js";
import useWindowStore from "#store/window.js";
import useLocationStore from "#store/location.js";
import { useGSAP } from "@gsap/react";
import { Draggable } from "gsap/Draggable";
import { Flip } from "gsap/Flip";
import gsap from "gsap";
import useSound from "use-sound";
import useSettingsStore from "#store/settings.js";
import { useWebHaptics } from "web-haptics/react";
import { memo, useRef, useLayoutEffect } from "react";
import { flushSync } from "react-dom";
import { Tooltip } from "react-tooltip";
import { Proximity } from "../proximity-engine/Proximity.jsx";

gsap.registerPlugin(Draggable, Flip);

const Dock = memo(() => {
  const openWindow = useWindowStore((s) => s.openWindow);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const windows = useWindowStore((s) => s.windows);
  const dockItems = useWindowStore((s) => s.dockItems);
  const removeDockItem = useWindowStore((s) => s.removeDockItem);
  const moveDockItem = useWindowStore((s) => s.moveDockItem);
  const setActiveLocation = useLocationStore((s) => s.setActiveLocation);
  
  const { trigger } = useWebHaptics();
  const { volume, isMuted } = useSettingsStore();
  const [playTrash] = useSound("/sounds/oxygen_trash.ogg", { volume: isMuted ? 0 : volume });

  const flipStateRef = useRef(null);

  const toggleApp = (app) => {
    if (!app.canOpen) return;
    if (app.id === "trash") {
      setActiveLocation(locations.trash);
      openWindow("finder");
      return;
    }
    const windowState = windows[app.id];
    if (windowState?.isOpen) {
      closeWindow(app.id);
    } else {
      openWindow(app.id);
    }
  };

  useLayoutEffect(() => {
    if (flipStateRef.current) {
      Flip.from(flipStateRef.current, {
        targets: ".dock-container, .dock-wrapper:not(.is-dragging)",
        duration: 0.4,
        ease: "back.out(1.2)",
        absolute: true,
        zIndex: 9999,
      });
      flipStateRef.current = null;
    }
  }, [dockItems]);

  useGSAP(() => {
    Draggable.create(".dock-draggable", {
      type: "x,y",
      dragClickables: true,
      allowContextMenu: true,
      onDragStart: function() {
        this.target.classList.add("is-dragging");
        gsap.to(this.target, { opacity: 0.9, scale: 1.15, duration: 0.2 });
      },
      onDrag: function() {
        const el = this.target;
        const id = el.getAttribute("data-id");
        
        if (id === 'finder' || id === 'trash') return;

        const items = Array.from(document.querySelectorAll(".dock-draggable:not(.is-dragging)"));
        for (const item of items) {
          const targetId = item.getAttribute("data-id");
          if (targetId === 'finder' || targetId === 'trash') continue;

          if (this.hitTest(item, "50%")) {
            const rectBefore = el.getBoundingClientRect();
            
            flipStateRef.current = Flip.getState(".dock-container, .dock-wrapper:not(.is-dragging)");
            
            flushSync(() => {
              moveDockItem(id, targetId);
            });
            
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
        const el = this.target;
        const id = el.getAttribute("data-id");
        el.classList.remove("is-dragging");

        if (id === 'finder' || id === 'trash') {
           gsap.to(el, { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.5)" });
           return;
        }

        const trashEl = document.querySelector(".dock-draggable[data-id='trash']");
        if (trashEl && this.hitTest(trashEl, "30%")) {
           trigger("success");
           playTrash();
           gsap.to(el, { 
             scale: 0, opacity: 0, rotation: -90, duration: 0.3, ease: "back.in(1.5)",
             onComplete: () => {
                 flipStateRef.current = Flip.getState(".dock-container, .dock-wrapper:not(.is-dragging)");
                 removeDockItem(id);
             } 
           });
           return;
        }

        const dockContainer = document.querySelector(".dock-container");
        const dockRect = dockContainer.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const isOutside = (
          elRect.bottom < dockRect.top - 50 ||
          elRect.top > dockRect.bottom + 50 ||
          elRect.right < dockRect.left - 50 ||
          elRect.left > dockRect.right + 50
        );

        if (isOutside) {
           trigger("success");
           gsap.to(el, { 
             scale: 1.5, opacity: 0, filter: "blur(10px)", duration: 0.3, ease: "power2.out",
             onComplete: () => {
                 flipStateRef.current = Flip.getState(".dock-container, .dock-wrapper:not(.is-dragging)");
                 removeDockItem(id);
             } 
           });
           return;
        }

        gsap.to(el, { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.5)" });
      }
    });
  }, [dockItems.length]);

  return (
    <section id="dock" className="max-md:hidden">
      <Proximity
        className="dock-container"
        selector=".dock-icon"
        preset="scale-y"
        reach={2}
        config={{
          scale: [1, 1.3],
          y: [0, -30],
          duration: 0.1,
          resetDuration: 1,
          ease: "power2.out",
          resetEase: "elastic",
        }}
      >
        {dockItems.map(({ id, name, icon, canOpen }) => (
          <div 
            key={id ?? name} 
            data-flip-id={`wrapper-${id}`}
            className="relative flex justify-center dock-wrapper dock-item dock-draggable"
            data-id={id}
          >
            <button
              type="button"
              className="dock-icon flex items-center justify-center will-change-transform z-10"
              aria-label={name}
              data-tooltip-id="dock-tooltip"
              data-tooltip-content={name}
              data-tooltip-delay-show={150}
              onClick={(e) => {
                if (e.button !== 0) return;
                toggleApp({ id, canOpen });
              }}
            >
              <img
                src={`/images/${icon}`}
                alt={name}
                width={56}
                height={56}
                loading="lazy"
                decoding="async"
                className={canOpen ? "pointer-events-none" : "opacity-60 pointer-events-none"}
              />
            </button>
          </div>
        ))}
      </Proximity>
      <Tooltip id="dock-tooltip" place="top" className="tooltip" />
    </section>
  );
});

export default Dock;