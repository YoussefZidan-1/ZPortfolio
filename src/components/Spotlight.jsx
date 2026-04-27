import { useState, useEffect, useRef, useMemo } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Search, Command, Calculator } from 'lucide-react';
import { dockApps, locations } from '#constants';
import useWindowStore from '#store/window.js';
import useLocationStore from '#store/location.js';
import { useWebHaptics } from 'web-haptics/react';
import clsx from 'clsx';

const getIconSrc = (icon) => {
  if (!icon) return '/images/file.svg';
  return icon.startsWith('/') ? icon : `/images/${icon}`;
};

const getTypeLabel = (item) => {
  if (item.isCalc) return "Calculator";
  if (item.isApp) return "Application";
  if (item.kind === "folder") return "Folder";
  if (item.fileType === "pdf") return "PDF Document";
  if (item.fileType === "img") return "Image";
  if (item.fileType === "txt") return "Text Document";
  if (item.fileType === "url") return "Web Link";
  return "File";
};

// Safe Math Evaluator for the built-in Calculator
const evaluateMath = (expr) => {
  const clean = expr.replace(/\s+/g, ''); 
  if (/^[-+*/().0-9]+$/.test(clean) && /[-+*/]/.test(clean)) {
    try {
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${clean}`)();
      if (result !== undefined && !Number.isNaN(result) && Number.isFinite(result)) {
        return Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(4)).toString();
      }
    } catch (e) {
      return null;
    }
  }
  return null;
};

const Spotlight = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const[selectedIndex, setSelectedIndex] = useState(0);
  
  const containerRef = useRef(null);
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const itemRefs = useRef([]);
  
  const { trigger } = useWebHaptics();
  const openWindow = useWindowStore((s) => s.openWindow);
  const setActiveLocation = useLocationStore((s) => s.setActiveLocation);

  const allItems = useMemo(() => {
    const items =[];
    dockApps.forEach(app => {
      if (app.canOpen) items.push({ ...app, isApp: true });
    });

    const parseNode = (node) => {
      if (!node) return;
      if (node.id && node.name) items.push(node);
      if (Array.isArray(node.children)) {
        node.children.forEach(parseNode);
      } else if (typeof node === 'object' && !Array.isArray(node)) {
        Object.values(node).forEach(parseNode);
      }
    };
    parseNode(locations);

    const unique =[];
    const map = new Map();
    for (const item of items) {
      if (!map.has(item.id)) {
        map.set(item.id, true);
        unique.push({ ...item, searchStr: item.name.toLowerCase() });
      }
    }
    return unique;
  }, []);

  const filteredItems = useMemo(() => {
    if (!query) return[];
    
    let results =[];
    const mathResult = evaluateMath(query);
    if (mathResult !== null) {
      results.push({
        id: 'calc-result',
        isCalc: true,
        name: mathResult,
        searchStr: query,
      });
    }

    const textMatches = allItems.filter(item => item.searchStr.includes(query.toLowerCase()));
    results = [...results, ...textMatches];

    return results.slice(0, 7);
  },[query, allItems]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.code === 'Space' || e.key === 'k')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    const handleCustomToggle = () => setIsOpen(p => !p);
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('toggle-spotlight', handleCustomToggle);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('toggle-spotlight', handleCustomToggle);
    };
  },[]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => { setQuery(''); setSelectedIndex(0); }, 300);
    } else {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex, isOpen]);

  const executeItem = (item) => {
    trigger("success");
    setIsOpen(false);
    
    if (item.isCalc) {
      navigator.clipboard.writeText(item.name);
      return;
    }

    if (item.isApp) {
      if (item.id === "trash") {
        setActiveLocation(locations.trash);
        openWindow("finder");
      } else {
        openWindow(item.id);
      }
      return;
    }
    
    if (item.fileType === "pdf") return openWindow("resume");
    if (item.kind === "folder") {
      setActiveLocation(item);
      openWindow("finder");
      return;
    }
    if (["fig", "url"].includes(item.fileType) && item.href) {
      return window.open(item.href, "_blank");
    }
    openWindow(`${item.fileType}${item.kind}`, item);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      trigger("selection");
      if (filteredItems.length > 0) setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      trigger("selection");
      if (filteredItems.length > 0) setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) executeItem(filteredItems[selectedIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  useGSAP(() => {
    if (!containerRef.current || !boxRef.current) return;
    
    if (isOpen) {
      gsap.to(containerRef.current, { opacity: 1, pointerEvents: 'auto', duration: 0.3, ease: "power2.out" });
      gsap.fromTo(boxRef.current, 
        { scale: 0.85, y: -40, opacity: 0, filter: "blur(15px)" }, 
        { scale: 1, y: 0, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "back.out(1.2)", overwrite: true }
      );
    } else {
      gsap.to(containerRef.current, { opacity: 0, pointerEvents: 'none', duration: 0.25, ease: "power2.in" });
      gsap.to(boxRef.current, { scale: 0.95, y: -20, opacity: 0, filter: "blur(5px)", duration: 0.25, ease: "power2.in", overwrite: true });
    }
  }, [isOpen]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-[999999] bg-black/20 dark:bg-black/40 backdrop-blur-sm opacity-0 pointer-events-none flex justify-center pt-[15vh] px-4 transition-all"
      onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false) }}
    >
      <div 
        ref={boxRef} 
        className="w-full max-w-[650px] max-md:max-w-[95vw] h-fit bg-white/80 dark:bg-[#1e1e2e]/85 backdrop-blur-3xl shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-white/50 dark:border-white/10 rounded-[24px] max-md:rounded-[20px] overflow-hidden flex flex-col will-change-transform"
      >
        <div className="flex items-center px-5 py-4 border-b border-transparent data-[has-query=true]:border-gray-400/20 dark:data-[has-query=true]:border-white/10 transition-colors duration-300" data-has-query={!!query}>
          <Search className="text-gray-500 dark:text-gray-400 mr-3 shrink-0" size={24} />
          <input 
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent outline-none text-[22px] md:text-2xl font-medium text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 font-georama"
            placeholder="Spotlight Search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            spellCheck={false}
          />
          <div className="hidden md:flex items-center gap-1 bg-black/5 dark:bg-white/10 px-2 py-1 rounded-md text-gray-500 dark:text-gray-400">
            <Command size={14} />
            <span className="text-xs font-bold font-terminal">K</span>
          </div>
        </div>
        
        {/* EXPERT FIX: CSS Grid Height Transition */}
        <div 
          className={clsx(
            "grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
            query ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="overflow-y-auto scrollbar-hide pt-2 pb-3 max-h-[420px]">
              {filteredItems.length > 0 ? (
                <ul>
                  {filteredItems.map((item, index) => (
                    <li
                      key={item.id}
                      ref={(el) => (itemRefs.current[index] = el)}
                      // EXPERT FIX: Staggered entry animation using Tailwind's animate-in and dynamic animation delays
                      className={clsx(
                        "flex items-center justify-between px-4 py-3 mx-2 my-1 rounded-xl cursor-pointer transition-colors",
                        "animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both", 
                        index === selectedIndex 
                          ? "bg-blue-600 dark:bg-blue-600 text-white shadow-md" 
                          : "hover:bg-black/5 dark:hover:bg-white/10 text-gray-800 dark:text-gray-200"
                      )}
                      style={{ animationDelay: `${index * 30}ms` }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      onClick={() => executeItem(item)}
                    >
                      <div className="flex items-center gap-4 pointer-events-none">
                        {item.isCalc ? (
                          <div className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-white/20 rounded-lg drop-shadow-sm">
                            <Calculator size={18} className={index === selectedIndex ? "text-white" : "text-gray-700 dark:text-gray-200"} />
                          </div>
                        ) : (
                          <img src={getIconSrc(item.icon)} className={clsx("w-8 h-8 object-contain drop-shadow-sm", index === selectedIndex && "scale-110 transition-transform")} />
                        )}
                        <span className={clsx("font-medium text-[15px]", item.isCalc && "text-[18px]")}>
                          {item.name}
                        </span>
                      </div>
                      <span className={clsx("text-xs font-semibold tracking-wide", index === selectedIndex ? "text-blue-100" : "text-gray-500 dark:text-gray-400")}>
                        {item.isCalc ? (index === selectedIndex ? "Press Enter to Copy" : "Calculator") : getTypeLabel(item)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-6 py-10 text-center text-gray-500 dark:text-gray-400 animate-in fade-in zoom-in-[0.98] duration-300">
                  <p className="text-lg font-medium">No results found</p>
                  <p className="text-sm mt-1">Try searching for "ZCinema", "Resume", or "Contact"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Spotlight;