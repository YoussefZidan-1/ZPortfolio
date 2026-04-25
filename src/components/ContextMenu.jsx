import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { FolderPlus, Terminal, Code, RefreshCw, Moon, Sun, Info } from "lucide-react";
import useWindowStore from "#store/window.js";
import useSettingsStore from "#store/settings.js";
import { useWebHaptics } from "web-haptics/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import clsx from "clsx";

const ActionItem = ({ icon: Icon, label, onClick, divider }) => (
  <>
    <div 
      className="flex items-center gap-2.5 w-full px-3 py-[4px] text-[13px] font-medium rounded-[6px] text-gray-800 hover:bg-blue-500 hover:text-white transition-all duration-150 ease-out cursor-pointer group"
      onClick={onClick}
    >
      {Icon && <Icon size={15} className="text-gray-600 group-hover:text-white drop-shadow-sm transition-colors duration-150" />}
      <span className="tracking-wide drop-shadow-sm">{label}</span>
    </div>
    {divider && <div className="h-[1px] w-full bg-gray-400/20 my-[2px]" />}
  </>
);

const ContextMenu = () => {
  const [contextData, setContextData] = useState({ visible: false, exiting: false, x: 0, y: 0 });
  const openWindow = useWindowStore((s) => s.openWindow);
  const { isDarkMode, toggleDarkMode } = useSettingsStore();
  const { trigger } = useWebHaptics();
  
  const closeTimeoutRef = useRef(null);
  const menuRef = useRef(null);
  
  // Track if the menu was already visible so we know whether to animate IN or MOVE
  const wasVisible = useRef(false);

  const closeMenu = useCallback(() => {
    setContextData((prev) => {
      if (!prev.visible || prev.exiting) return prev;
      
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      
      // Trigger exit animation, then unmount after GSAP finishes
      closeTimeoutRef.current = setTimeout(() => {
        setContextData((p) => ({ ...p, visible: false, exiting: false }));
      }, 200);
      
      return { ...prev, exiting: true };
    });
  }, []);

  const handleContextMenu = useCallback((e) => {
    const target = e.target;
    if (
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.closest('.monaco-editor') ||
      target.closest('.react-pdf__Page')
    ) return;

    e.preventDefault();
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    
    const menuWidth = 220;
    const menuHeight = 240;
    let x = e.clientX;
    let y = e.clientY;
    
    if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 5;
    if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 5;
    
    setContextData({ visible: true, exiting: false, x, y });
    trigger("selection");
  }, [trigger]);

  const handlePointerDown = useCallback((e) => {
    if (e.button === 2) return;
    if (menuRef.current && menuRef.current.contains(e.target)) return;
    closeMenu();
  }, [closeMenu]);

  useEffect(() => {
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("pointerdown", handlePointerDown, { capture: true });
    window.addEventListener("scroll", closeMenu, { passive: true, capture: true });
    window.addEventListener("resize", closeMenu, { passive: true });
    
    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("pointerdown", handlePointerDown, { capture: true });
      window.removeEventListener("scroll", closeMenu, { capture: true });
      window.removeEventListener("resize", closeMenu);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, [handleContextMenu, handlePointerDown, closeMenu]);

  // ─── Organic Apple Animations ──────────────────────────────────────────
  useGSAP(() => {
    if (!menuRef.current) return;

    if (contextData.visible && !contextData.exiting) {
      
      if (!wasVisible.current) {
        gsap.set(menuRef.current, { top: contextData.y, left: contextData.x });
        gsap.fromTo(menuRef.current, 
          { scale: 0.8, opacity: 0 }, 
          { 
            scale: 1, 
            opacity: 1, 
            duration: 0.3, 
            ease: "back.out(1.7)", 
            overwrite: true 
          }
        );
        wasVisible.current = true;
      } else {
        gsap.to(menuRef.current, {
          top: contextData.y,
          left: contextData.x,
          duration: 0.35,
          ease: "back.out(1.2)",
          overwrite: "auto" 
        });

        gsap.fromTo(menuRef.current,
          { scale: 0.94 },
          { scale: 1, duration: 0.35, ease: "back.out(1.5)" }
        );
      }
      
    } else if (contextData.exiting) {
      // 3️⃣ EXIT ANIMATION
      gsap.to(menuRef.current, { 
        scale: 0.95, 
        opacity: 0, 
        duration: 0.15, 
        ease: "power2.in", 
        overwrite: true,
        onComplete: () => {
          wasVisible.current = false;
        }
      });
    }
  }, { dependencies: [contextData.visible, contextData.exiting, contextData.x, contextData.y], scope: menuRef });

  if (!contextData.visible) return null;

  const handleActionClick = (e, actionCallback) => {
    e.stopPropagation();
    trigger("nudge");
    actionCallback();
    closeMenu();
  };

  return createPortal(
    <div 
      ref={menuRef}
      className={clsx(
        "fixed z-[999999] min-w-[220px] bg-white/50 backdrop-blur-[40px] backdrop-saturate-[150%] border border-white/40 rounded-xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)] p-1.5 select-none origin-top-left",
      )}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <ActionItem 
        icon={FolderPlus} 
        label="New Folder" 
        onClick={(e) => handleActionClick(e, () => openWindow("finder"))} 
        divider 
      />
      <ActionItem 
        icon={Terminal} 
        label="Open in Terminal" 
        onClick={(e) => handleActionClick(e, () => openWindow("terminal"))} 
      />
      <ActionItem 
        icon={Code} 
        label="Open in ZED Code" 
        onClick={(e) => handleActionClick(e, () => openWindow("vscode"))} 
        divider
      />
      <ActionItem 
        icon={isDarkMode ? Sun : Moon} 
        label={isDarkMode ? "Light Mode" : "Dark Mode"} 
        onClick={(e) => handleActionClick(e, toggleDarkMode)} 
      />
      <ActionItem 
        icon={Info} 
        label="About ZED OS" 
        onClick={(e) => handleActionClick(e, () => openWindow("txtfile", {
          id: "about-os",
          name: "About ZED OS",
          subtitle: "ZED OS v1.0",
          description:[
            "A modern, web-based operating system portfolio built with React, Tailwind CSS, and GSAP.", 
            "Designed and developed by Yousef Zedan."
          ]
        }))}
        divider
      />
      <ActionItem 
        icon={RefreshCw} 
        label="Reload OS" 
        onClick={(e) => handleActionClick(e, () => window.location.reload())} 
      />
    </div>, 
    document.body
  );
};

export default ContextMenu;