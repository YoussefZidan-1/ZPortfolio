import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { useGSAP } from "@gsap/react";
import dayjs from "dayjs";
import { ChevronRight } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";

// ─── GRUB boot lines ──────────────────────────────────────────────────────────
const bootLines =[
  "Starting GRUB bootloader...",
  "Loading Linux linux-cachyos v7.0 ...",
  "Loading initial ramdisk ...",
  ":: running early hook [udev]",
  "Starting systemd-udevd version 255.3-1-cachyos",
  ":: running hook [udev]",
  "Triggering uevents...",
  "[  OK  ] Reached target Local File Systems (Pre).",
  "[  OK  ] Reached target Local File Systems.",
  "Mounting /sys/kernel/debug...",
  "Mounting /sys/kernel/tracing...",
  "[  OK  ] Started Create Static Device Nodes in /dev.",
  "[  OK  ] Started Rule-based Manager for Device Events and Files.",
  "[  OK  ] Found device /dev/disk/by-uuid/cachy-os-7.0",
  "Mounting /boot/efi...",
  "[  OK  ] Reached target Initrd Root Device.",
  "Starting File System Check on /dev/disk/by-uuid/cachy-7.0...",
  "[  OK  ] Reached target Initrd Root File System.",
  "Starting Switch Root...",
  "Switching root to Linux 7.0.",
  "[  OK  ] Started Journal Service.",
  "[  OK  ] Started Load Kernel Modules.",
  "[  OK  ] Reached target Sound Card.",
  "[  OK  ] Reached target Network.",
  "Starting CachyOS Display Manager...",
];

// ─── All Images and Icons to preload ──────────────────────────────────────────
const IMAGE_ASSETS =[
  "/images/wallpaper.webp",
  "/images/wallpaper-2.webp",
  "/images/yousef-5.webp",
  "/images/arch.webp",
  "/images/folder.png",
  "/images/finder.webp",
  "/images/safari.webp",
  "/images/photos.png",
  "/images/contact.png",
  "/images/terminal.webp",
  "/images/vscode.png",
  "/images/trash.webp",
  "/images/yousef.webp",
  "/images/yousef-2.webp",
  "/images/yousef-3.webp",
  "/images/yousef-4.webp",
  "/images/logo.svg",
  "/images/zcinema.png",
  "/images/project-1.webp",
  "/images/zproximity.svg",
  "/images/project-2.JPG",
  "/images/txt.png",
  "/images/image.png",
  "/images/pdf.png",
  "/images/blog1.png",
  "/images/blog2.png",
  "/images/blog3.png",
  "/images/trash-1.webp",
  "/images/trash-2.webp",
  "/icons/wifi.svg",
  "/icons/search.svg",
  "/icons/user.svg",
  "/icons/mode.svg",
  "/icons/github.svg",
  "/icons/atom.svg",
  "/icons/twitter.svg",
  "/icons/linkedin.svg",
  "/icons/gicon1.svg",
  "/icons/gicon2.svg",
  "/icons/gicon4.svg",
  "/icons/gicon5.svg",
  "/icons/file.svg",
  "/icons/info.svg",
  "/icons/trash.svg",
  "/icons/work.svg"
];

// ─── Lazy component chunks to preload (Using EXACT aliases from App.jsx) ──────
const COMPONENT_IMPORTS =[
  () => import("#components/Navbar.jsx"),
  () => import("#components/Welcome.jsx"),
  () => import("#components/Dock.jsx"),
  () => import("#components/Home.jsx"),
  () => import("#windows/Terminal.jsx"),
  () => import("#windows/ZenBrowser.jsx"),
  () => import("#windows/Resume.jsx"),
  () => import("#windows/Finder.jsx"),
  () => import("#windows/Text.jsx"),
  () => import("#windows/Image.jsx"),
  () => import("#windows/Contact.jsx"),
  () => import("#windows/Photos.jsx"),
  () => import("#windows/CodeEditor.jsx"), 
];

// ─── Sound assets ─────────────────────────────────────────────────────────────
const SOUND_ASSETS =[
  "/sounds/oxygen_boot.ogg",
  "/sounds/oxygen_close.ogg",
  "/sounds/oxygen_maximize.ogg",
  "/sounds/oxygen_minimize.ogg",
];

// Total task count for progress calculation
const TOTAL_TASKS =
  IMAGE_ASSETS.length + COMPONENT_IMPORTS.length + SOUND_ASSETS.length + 1; // +1 for fonts

// ─── Component ────────────────────────────────────────────────────────────────
const BootSequence = ({ onComplete }) => {
  const [stage, setStage] = useState(0);       // 0=cursor 1=grub 2=arch-bar 3=login 4=fading
  const [lines, setLines] = useState([]);
  const [time, setTime] = useState(dayjs());
  const[password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  // Split Real vs Displayed progress
  const [loadedProgress, setLoadedProgress] = useState(0);
  const [displayedProgress, setDisplayedProgress] = useState(0);
  
  const[everythingReady, setEverythingReady] = useState(false);

  const containerRef = useRef(null);
  const loginRef = useRef(null);
  const hasStartedLoading = useRef(false);
  const[completedCount, setCompletedCount] = useState(0);
  const { trigger } = useWebHaptics();

  // ── clock ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setTime(dayjs()), 1000);
    return () => clearInterval(t);
  },[]);

  useEffect(() => {
    gsap.registerPlugin(Draggable);
  },[]);

  // ── Real asset / component loading ────────────────────────────────────────
  useEffect(() => {
    // Prevent React StrictMode from double-firing the preloader
    if (hasStartedLoading.current) return;
    hasStartedLoading.current = true;

    let currentCount = 0;
    
    const tick = () => {
      currentCount += 1;
      setCompletedCount(currentCount); // Update the text in the UI
      
      const pct = Math.min(
        Math.floor((currentCount / TOTAL_TASKS) * 100),
        100
      );
      setLoadedProgress(pct);
      
      if (currentCount >= TOTAL_TASKS) {
        setEverythingReady(true);
      }
    };

    // 1. Preload Images
    IMAGE_ASSETS.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = tick;
      img.onerror = tick;
    });

    // 2. Preload Components
    COMPONENT_IMPORTS.forEach((importFn) => {
      importFn().then(tick).catch(tick);
    });

    // 3. Preload Sounds
    SOUND_ASSETS.forEach((src) => {
      fetch(src)
        .then((response) => response.blob())
        .then(tick)
        .catch((err) => {
            console.warn(`Failed to preload audio: ${src}`, err);
            tick(); 
        });
    });

    // 4. Preload Fonts
    if (document.fonts?.ready) {
      document.fonts.ready.then(tick).catch(tick);
    } else {
      tick();
    }
  },[]);

  // Stage 0 → 1
  useEffect(() => {
    if (stage !== 0) return;
    const t = setTimeout(() => setStage(1), 100);
    return () => clearTimeout(t);
  },[stage]);

  // Stage 1: GRUB text scroll
  useEffect(() => {
    if (stage !== 1) return;
    let i = 0;
    const interval = setInterval(() => {
      setLines((prev) => [...prev, bootLines[i]]);
      i++;
      if (i >= bootLines.length) {
        clearInterval(interval);
        setStage(2); 
      }
    }, 60); 
    return () => clearInterval(interval);
  }, [stage]);

  // Stage 2: Smooth / Minimum Time Progress Bar Animation
  useEffect(() => {
    if (stage !== 2) return;
    
    const interval = setInterval(() => {
      setDisplayedProgress((prev) => {
        if (prev >= 100) return 100;
        
        // Target the real loaded percentage unless we're totally done
        const target = everythingReady ? 100 : loadedProgress;
        
        // Add artificial delay per tick so the bar takes a minimum of ~1.5 - 2s to complete
        let next = prev + (Math.random() * 5 + 3); 
        
        if (next > target) {
            return target;
        }
        return next;
      });
    }, 120);
    
    return () => clearInterval(interval);
  }, [stage, loadedProgress, everythingReady]);

  // Stage 2 → 3: Wait until the Displayed bar visually hits 100%
  useEffect(() => {
    if (stage === 2 && displayedProgress >= 100) {
      // Pause for half a second at 100% before flashing to the login screen
      const t = setTimeout(() => setStage(3), 600); 
      return () => clearTimeout(t);
    }
  }, [stage, displayedProgress]);

  // ── Login screen fade-in ───────────────────────────────────────────────────
  useGSAP(() => {
    if (stage === 3 && loginRef.current) {
      gsap.fromTo(
        loginRef.current,
        { opacity: 0, scale: 1.08 },
        { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" }
      );
    }
  }, [stage]);

  // ── Login handler ─────────────────────────────────────────────────────────
  const handleLogin = (e) => {
    e?.preventDefault();
    if (password === "1234") {
      trigger("success");
      const audio = new Audio("/sounds/oxygen_boot.ogg");
      audio.volume = 1;
      audio.play().catch(() => {});
      setStage(4);
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 1.05,
        duration: 1.2,
        ease: "power2.inOut",
        onComplete: onComplete,
      });
    } else {
      trigger("error");
      setErrorMsg(
        "it's 1234 baka — i am a creative developer, for sure that's my bank password!"
      );
      gsap.fromTo(
        ".login-box",
        { x: -10 },
        { x: 10, yoyo: true, repeat: 5, duration: 0.05 }
      );
    }
  };

  const renderLine = (text) => {
    if (!text || typeof text !== "string") return "";
    if (text.includes("[  OK  ]")) {
      return text.replace(
        "[  OK  ]",
        `<span class="text-green-500">[  OK  ]</span>`
      );
    }
    return text;
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-[#000000] text-white flex flex-col font-terminal overflow-hidden select-none"
    >
      {stage === 0 && (
        <div className="p-5 text-2xl font-bold">
          <span className="cursor-blink">_</span>
        </div>
      )}

      {stage === 1 && (
        <div className="p-5 flex flex-col justify-start h-full overflow-hidden">
          {lines.map((line, i) => (
            <div
              key={i}
              className="text-sm md:text-base text-gray-300 leading-tight"
              dangerouslySetInnerHTML={{ __html: renderLine(line) }}
            />
          ))}
          <div className="mt-2 text-xs text-gray-600">
            {!everythingReady
              ? `[ Loading ZPortfolio assets... ${Math.round(loadedProgress)}% ]`
              : `[ Assets loaded. Starting Display Manager... ]`}
          </div>
        </div>
      )}

      {stage === 2 && (
        <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-700">
          <img
            src="/images/arch.webp"
            alt="Arch Logo"
            fetchPriority="high"
            className="w-32 h-32 md:w-48 md:h-48 mb-10 object-contain"
          />

          <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1793d1] transition-all duration-200 ease-out"
              style={{ width: `${displayedProgress}%` }}
            />
          </div>

          <p className="mt-4 text-[#1793d1] font-terminal text-xs opacity-50">
            {displayedProgress < 100
              ? `${Math.round(displayedProgress)}% — loading components...`
              : "Ready."}
          </p>

          <p className="mt-1 text-gray-700 font-terminal text-[10px]">
            {completedCount} / {TOTAL_TASKS} tasks
          </p>
        </div>
      )}

      {(stage === 3 || stage === 4) && (
        <div
          ref={loginRef}
          className="absolute inset-0 bg-[url('/images/wallpaper.webp')] max-md:bg-[url('/images/wallpaper-2.webp')] bg-cover bg-center"
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-3xl flex flex-col items-center">
            <div className="mt-[12vh] md:mt-[15vh] text-center">
              <h1 className="text-7xl md:text-9xl font-semibold tracking-tighter text-white drop-shadow-lg font-georama">
                {time.format("h:mm")}
              </h1>
              <p className="text-xl md:text-3xl mt-2 font-medium text-white/90 drop-shadow-md font-georama">
                {time.format("dddd, MMMM D")}
              </p>
            </div>

            <div className="login-box mt-auto mb-[20vh] flex flex-col items-center z-10 w-full px-5">
              <img
                src="/images/yousef-5.webp"
                alt="Yousef Zedan"
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-2xl mb-5 border-[3px] border-white/20"
              />
              <h2 className="text-xl md:text-2xl font-bold mb-6 tracking-wide text-white drop-shadow-md font-georama">
                Yousef Zedan
              </h2>

              <form
                onSubmit={handleLogin}
                className="relative w-full max-w-[300px]"
              >
                <input
                  type="password"
                  autoFocus
                  placeholder="come on try don't be shy"
                  className="w-full bg-white/10 border border-white/20 rounded-full px-5 py-3.5 text-center text-white placeholder:text-white/60 outline-none focus:bg-white/20 focus:border-white/40 backdrop-blur-xl transition-all shadow-xl font-georama text-[15px]"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                />
                {password.length > 0 && (
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors cursor-pointer flex items-center justify-center"
                  >
                    <ChevronRight size={18} />
                  </button>
                )}
              </form>

              <div className="h-16 mt-4 flex items-start justify-center">
                {errorMsg && (
                  <p className="text-red-300 text-[13px] md:text-sm font-medium max-w-sm text-center drop-shadow-md px-2 animate-in fade-in zoom-in-95 font-georama">
                    {errorMsg}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes grub-blink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0; }
          }
          .cursor-blink {
            animation: grub-blink 0.8s step-end infinite;
          }
        `,
        }}
      />
    </div>
  );
};

export default BootSequence;