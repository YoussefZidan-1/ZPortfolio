import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  FolderPlus, Terminal, Code, RefreshCw, Moon, Sun, 
  Info, Trash2, ExternalLink, XCircle, PinOff 
} from "lucide-react";
import useWindowStore from "#store/window.js";
import useSettingsStore from "#store/settings.js";
import useLocationStore from "#store/location.js";
import { useWebHaptics } from "web-haptics/react";
import useSound from "use-sound";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import clsx from "clsx";

const ActionItem = ({ icon: Icon, label, onClick, divider, variant = "default" }) => (
  <>
    <div 
      className={clsx(
        "flex items-center gap-2.5 w-full px-3 py-[6px] text-[13px] font-medium rounded-[6px] transition-all duration-150 ease-out cursor-pointer group select-none",
        variant === "danger" 
          ? "text-red-500 hover:bg-red-500 hover:text-white" 
          : "text-gray-800 dark:text-gray-200 hover:bg-blue-500 hover:text-white"
      )}
      onClick={onClick}
    >
      {Icon && <Icon size={15} className={clsx("transition-colors duration-150", variant !== "danger" && "text-gray-600 dark:text-gray-400 group-hover:text-white")} />}
      <span className="tracking-wide">{label}</span>
    </div>
    {divider && <div className="h-[1px] w-full bg-gray-400/20 my-[2px]" />}
  </>
);

const ContextMenu = () => {
  const [contextData, setContextData] = useState({ 
    visible: false, 
    exiting: false, 
    x: 0, 
    y: 0,
    targetType: 'desktop', // 'desktop' | 'app' | 'trash'
    targetId: null 
  });

  const openWindow = useWindowStore((s) => s.openWindow);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const { isDarkMode, toggleDarkMode, volume, isMuted } = useSettingsStore();
  const { emptyTrash } = useLocationStore();
  const { trigger } = useWebHaptics();

  // 🔊 Sounds
  const [playTrash] = useSound("/sounds/oxygen_trash.ogg", { volume: isMuted ? 0 : volume });
  
  const menuRef = useRef(null);
  const wasVisible = useRef(false);

  const closeMenu = useCallback(() => {
    setContextData((prev) => {
      if (!prev.visible || prev.exiting) return prev;
      setTimeout(() => {
        setContextData((p) => ({ ...p, visible: false, exiting: false }));
      }, 200);
      return { ...prev, exiting: true };
    });
  }, []);

  const handleContextMenu = useCallback((e) => {
    const target = e.target;
    // Don't show custom menu on inputs or editors
    if (target.tagName === 'INPUT' || target.closest('.monaco-editor')) return;

    e.preventDefault();
    
    // 🔍 Detect Target
    const dockItem = target.closest('.dock-item');
    const isTrash = dockItem?.getAttribute('data-id') === 'trash';
    
    let type = 'desktop';
    let id = null;

    if (isTrash) {
      type = 'trash';
    } else if (dockItem) {
      type = 'app';
      id = dockItem.getAttribute('data-id');
    }

    // Position constraints
    const menuWidth = 220;
    const menuHeight = type === 'app' ? 120 : 260;
    let x = e.clientX;
    let y = e.clientY;
    if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10;
    if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 10;
    
    setContextData({ visible: true, exiting: false, x, y, targetType: type, targetId: id });
    trigger("selection");
  }, [trigger]);

  useEffect(() => {
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("pointerdown", (e) => {
        if (menuRef.current && !menuRef.current.contains(e.target)) closeMenu();
    });
    return () => window.removeEventListener("contextmenu", handleContextMenu);
  }, [handleContextMenu, closeMenu]);

  // ─── Animations ───────────────────────────────────────
  useGSAP(() => {
    if (!menuRef.current) return;
    if (contextData.visible && !contextData.exiting) {
      gsap.fromTo(menuRef.current, 
        { scale: 0.8, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)", overwrite: true }
      );
    } else if (contextData.exiting) {
      gsap.to(menuRef.current, { scale: 0.95, opacity: 0, duration: 0.15, ease: "power2.in" });
    }
  }, [contextData.visible, contextData.exiting]);

  if (!contextData.visible) return null;

  const handleAction = (cb) => {
    trigger("nudge");
    cb();
    closeMenu();
  };

  return createPortal(
    <div 
      ref={menuRef}
      className="fixed z-[999999] min-w-[200px] bg-white/60 dark:bg-[#1c1c1e]/70 backdrop-blur-3xl border border-white/40 dark:border-white/10 rounded-xl shadow-2xl p-1.5 select-none"
      style={{ top: contextData.y, left: contextData.x }}
    >
      {/* 🗑️ TRASH CONTEXT */}
      {contextData.targetType === 'trash' && (
        <>
          <ActionItem 
            icon={ExternalLink} 
            label="Open Trash" 
            onClick={() => handleAction(() => openWindow('finder'))} 
          />
          <ActionItem 
            icon={Trash2} 
            label="Empty Trash" 
            variant="danger"
            onClick={() => handleAction(() => {
                emptyTrash();
                playTrash();
            })} 
          />
        </>
      )}

      {/* 🚀 APP ICON CONTEXT */}
      {contextData.targetType === 'app' && (
        <>
          <ActionItem 
            icon={ExternalLink} 
            label="Open App" 
            onClick={() => handleAction(() => openWindow(contextData.targetId))} 
          />
          <ActionItem 
            icon={PinOff} 
            label="Unpin from Dock" 
            onClick={() => handleAction(() => trigger("error"))} 
            divider
          />
          <ActionItem 
            icon={XCircle} 
            label="Force Quit" 
            variant="danger"
            onClick={() => handleAction(() => closeWindow(contextData.targetId))} 
          />
        </>
      )}

      {/* 🖥️ DESKTOP CONTEXT */}
      {contextData.targetType === 'desktop' && (
        <>
          <ActionItem 
            icon={FolderPlus} 
            label="New Folder" 
            onClick={() => handleAction(() => openWindow("finder"))} 
            divider 
          />
          <ActionItem 
            icon={Terminal} 
            label="Open in Terminal" 
            onClick={() => handleAction(() => openWindow("terminal"))} 
          />
          <ActionItem 
            icon={Code} 
            label="Open in ZED Code" 
            onClick={() => handleAction(() => openWindow("vscode"))} 
            divider
          />
          <ActionItem 
            icon={isDarkMode ? Sun : Moon} 
            label={isDarkMode ? "Light Mode" : "Dark Mode"} 
            onClick={() => handleAction(toggleDarkMode)} 
          />
          <ActionItem 
            icon={Info} 
            label="About ZED OS" 
            onClick={() => handleAction(() => openWindow("txtfile", {
              id: "about-os",
              name: "About ZED OS",
              description: ["ZED OS v1.0", "A high-performance web portfolio."]
            }))}
            divider
          />
          <ActionItem 
            icon={RefreshCw} 
            label="Reload OS" 
            onClick={() => handleAction(() => window.location.reload())} 
          />
        </>
      )}
    </div>, 
    document.body
  );
};

export default ContextMenu;