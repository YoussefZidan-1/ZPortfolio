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
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { flushSync } from "react-dom";
import dayjs from "dayjs";

gsap.registerPlugin(Draggable, Flip);

const Home = () => {
  const { trigger } = useWebHaptics();
  const setActiveLocation = useLocationStore((s) => s.setActiveLocation);
  const openWindow = useWindowStore((s) => s.openWindow);
  
  // States
  const [time, setTime] = useState(dayjs());
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Merge apps and projects into one reorderable list for mobile
  const [mobileItems, setMobileItems] = useState(() => {
    const apps = dockApps.map(app => 
      app.id === "trash" ? { ...app, id: "resume", name: "Resume", icon: "pdf.png" } : app
    );
    const projects = locations.work?.children || [];
    return [...apps, ...projects];
  });

  const flipStateRef = useRef(null);
  const longPressTimer = useRef(null);
  const pointerPos = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle reordering logic
  const moveItem = (id1, id2) => {
    if (id1 === id2) return;
    setMobileItems((prev) => {
      const next = [...prev];
      const idx1 = next.findIndex((i) => (i.id || i.name) === id1);
      const idx2 = next.findIndex((i) => (i.id || i.name) === id2);
      if (idx1 === -1 || idx2 === -1) return prev;
      const [movedItem] = next.splice(idx1, 1);
      next.splice(idx2, 0, movedItem);
      return next;
    });
  };

  // Flip Animation on list change
  useLayoutEffect(() => {
    if (flipStateRef.current) {
      Flip.from(flipStateRef.current, {
        targets: ".mobile-app-item",
        duration: 0.4,
        ease: "power3.out",
        stagger: 0.02,
      });
      flipStateRef.current = null;
    }
  }, [mobileItems]);

  const handlePointerDown = (e, item) => {
    pointerPos.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;

    // Start Long Press Timer
    longPressTimer.current = setTimeout(() => {
      if (!isDraggingRef.current) {
        setIsEditMode(true);
        trigger("selection"); // Haptic vibration
        // Optional: play a subtle sound here
      }
    }, 600);
  };

  const handlePointerUp = (e, item) => {
    clearTimeout(longPressTimer.current);
    const dx = Math.abs(e.clientX - pointerPos.current.x);
    const dy = Math.abs(e.clientY - pointerPos.current.y);

    // If we didn't move much and we aren't in edit mode, open the app
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

  useGSAP(() => {
    if (!isEditMode) return;

    const draggables = Draggable.create(".mobile-app-item", {
      type: "x,y",
      onDragStart: function() {
        isDraggingRef.current = true;
        this.target.style.zIndex = "100";
        gsap.to(this.target, { scale: 1.2, opacity: 0.8, duration: 0.2 });
      },
      onDrag: function() {
        const id = this.target.getAttribute("data-id");
        const others = document.querySelectorAll(`.mobile-app-item:not([data-id="${id}"])`);
        
        for (let other of others) {
          if (this.hitTest(other, "50%")) {
            const otherId = other.getAttribute("data-id");
            
            flipStateRef.current = Flip.getState(".mobile-app-item");
            
            flushSync(() => {
              moveItem(id, otherId);
            });
            
            // Adjust position of dragged element to avoid jumping
            const rect = this.target.getBoundingClientRect();
            this.update(); 
            break;
          }
        }
      },
      onDragEnd: function() {
        this.target.style.zIndex = "30";
        gsap.to(this.target, { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.3, ease: "back.out" });
        // Optional: Reset edit mode if user clicks background, or keep it on.
        // For now, we'll stay in edit mode until a "done" action (like iOS)
      }
    });

    return () => draggables.forEach(d => d.kill());
  }, [isEditMode, mobileItems]);

  // Click background to exit edit mode
  const exitEditMode = () => {
    if (isEditMode) {
      setIsEditMode(false);
      trigger("nudge");
    }
  };

  return (
    <section 
      id="home" 
      className="absolute inset-0 w-full h-full z-0 overflow-hidden"
      onPointerDown={(e) => e.target === e.currentTarget && exitEditMode()}
    >
      <SpotifyWidget /> 

      {/* Clock Display */}
      <div className="absolute top-[12vh] left-0 w-full flex flex-col items-center justify-center md:hidden text-white drop-shadow-xl z-20 pointer-events-none select-none">
        <h1 className="text-[5.5rem] font-light tracking-tight leading-none text-center">
          {time.format("h:mm")}
        </h1>
        <p className="text-[1.2rem] font-medium mt-2 tracking-wide text-center">
          {time.format("dddd, MMMM D")}
        </p>
      </div>
      
      {/* PC View Folders */}
      <ul className="desktop-projects w-full h-full max-md:hidden">
        {locations.work.children.map((project) => (
          <li
            key={project.id}
            className={clsx("group folder", project.windowPosition)}
            onPointerDown={(e) => {
              pointerPos.current = { x: e.clientX, y: e.clientY };
            }}
            onPointerUp={(e) => {
              const dx = Math.abs(e.clientX - pointerPos.current.x);
              const dy = Math.abs(e.clientY - pointerPos.current.y);
              if (dx < 5 && dy < 5) {
                setActiveLocation(project);
                openWindow("finder");
              }
            }}
          >
            <img src="/images/folder.png" alt={project.name} width={64} height={60} className="pointer-events-none" />
            <p>{project.name}</p>
          </li>
        ))}
      </ul>

      {/* Mobile View Grid */}
      <ul className={clsx(
        "hidden max-md:grid grid-cols-4 gap-x-2 gap-y-6 px-5 relative z-30 w-full box-border mt-[38vh]",
        isEditMode && "edit-mode"
      )}>
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
                "mobile-app-item flex flex-col items-center gap-[6px] cursor-pointer touch-none",
                isEditMode && "animate-wiggle"
              )}
            >
              <div className="relative">
                <img 
                  src={item.icon.startsWith('/') ? item.icon : `/images/${item.icon}`} 
                  alt={item.name} 
                  className={clsx(
                    "w-[16vw] max-w-[64px] h-[16vw] max-h-[64px] object-cover pointer-events-none shadow-lg rounded-[14px]",
                    item.canOpen === false && "opacity-60"
                  )}
                />
                {isEditMode && (
                  <div 
                    className="absolute -top-2 -left-2 size-5 bg-gray-400/80 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20"
                    onClick={(e) => {
                        e.stopPropagation();
                        // You could implement "removing" apps here if you want
                    }}
                  >
                    <div className="w-2.5 h-[2px] bg-white rounded-full" />
                  </div>
                )}
              </div>
              <p className="text-[12px] font-medium text-white drop-shadow-md text-center leading-tight w-full truncate px-1">
                {item.name}
              </p>
            </li>
          );
        })}
      </ul>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wiggle {
          0% { transform: rotate(-1.5deg); }
          50% { transform: rotate(1.5deg); }
          100% { transform: rotate(-1.5deg); }
        }
        .animate-wiggle {
          animation: wiggle 0.25s ease-in-out infinite;
        }
        .mobile-app-item {
          user-select: none;
          -webkit-user-drag: none;
        }
      `}} />
    </section>
  );
};

export default Home;