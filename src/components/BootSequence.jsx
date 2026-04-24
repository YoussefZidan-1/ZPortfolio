import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import dayjs from "dayjs";
import { ChevronRight } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";

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

const ASSETS_TO_PRELOAD = [
  "/sounds/oxygen_boot.ogg",
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
];

const BootSequence = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [lines, setLines] = useState([]);
  const [time, setTime] = useState(dayjs());
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  const containerRef = useRef(null);
  const loginRef = useRef(null);
  const bootSound = useRef(new Audio("/sounds/oxygen_boot.ogg"));
  const { trigger } = useWebHaptics();

  useEffect(() => {
    const timer = setInterval(() => setTime(dayjs()), 1000);
    return () => clearInterval(timer);
  },[]);

  useEffect(() => {
    let loadedCount = 0;
    let fontsReady = false;

    const checkCompletion = () => {
      if (loadedCount >= ASSETS_TO_PRELOAD.length && fontsReady) {
        setAssetsLoaded(true);
        setProgress(100);
      }
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        fontsReady = true;
        checkCompletion();
      });
    } else {
      fontsReady = true;
    }

    ASSETS_TO_PRELOAD.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = img.onerror = () => {
        loadedCount++;
        setProgress(Math.min((loadedCount / ASSETS_TO_PRELOAD.length) * 99, 99));
        checkCompletion();
      };
    });
  },[]);

  useEffect(() => {
    if (stage === 0) {
      const t = setTimeout(() => setStage(1), 100);
      return () => clearTimeout(t);
    } else if (stage === 1) {
      let currentLine = 0;
      const interval = setInterval(() => {
        if (currentLine < bootLines.length) {
          setLines((prev) => [...prev, bootLines[currentLine]]);
          currentLine++;
        } else {
          clearInterval(interval);
          setTimeout(() => setStage(2), 200);
        }
      }, 40);
      return () => clearInterval(interval);
    } else if (stage === 2) {
      if (assetsLoaded) {
        const t = setTimeout(() => setStage(3), 500);
        return () => clearTimeout(t);
      }
    }
  }, [stage, assetsLoaded]);

  useGSAP(() => {
    if (stage === 3 && loginRef.current) {
      gsap.fromTo(
        loginRef.current,
        { opacity: 0, scale: 1.1 },
        { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" }
      );
    }
  },[stage]);

  const handleLogin = (e) => {
      e?.preventDefault();
      if (password === "1234") {
        trigger("success");
        const audio = new Audio("/sounds/oxygen_boot.ogg");
        audio.volume = 1;
        audio.play().catch(err => console.log("Audio play blocked:", err));
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
      setErrorMsg("it's 1234 baka i am a creative developer for sure that's my password to my bank account !");
      gsap.fromTo(".login-box", { x: -10 }, { x: 10, yoyo: true, repeat: 5, duration: 0.05 });
    }
  };

  const renderLine = (text) => {
    if (!text || typeof text !== 'string') return ""; 
    if (text.includes("[  OK  ]")) {
      return text.replace("[  OK  ]", `<span class="text-green-500">[  OK  ]</span>`);
    }
    return text;
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-[9999] bg-[#000000] text-white flex flex-col font-terminal overflow-hidden select-none">
      
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
              className="h-full bg-[#1793d1] rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="mt-4 text-[#1793d1] font-terminal text-xs opacity-50">
            {Math.round(progress)}%
          </p>
        </div>
      )}

      {(stage === 3 || stage === 4) && (
        <div ref={loginRef} className="absolute inset-0 bg-[url('/images/wallpaper.webp')] max-md:bg-[url('/images/wallpaper-2.webp')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-3xl flex flex-col items-center">
            
            <div className="mt-[12vh] md:mt-[15vh] text-center">
              <h1 className="text-7xl md:text-9xl font-semibold tracking-tighter text-white drop-shadow-lg transition-all duration-300 font-georama">
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
              <h2 className="text-xl md:text-2xl font-bold mb-6 tracking-wide text-white drop-shadow-md font-georama">Yousef Zedan</h2>
              
              <form onSubmit={handleLogin} className="relative w-full max-w-[300px]">
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
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors cursor-pointer flex items-center justify-center">
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

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes grub-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .cursor-blink {
          animation: grub-blink 0.8s step-end infinite;
        }
      `}} />
    </div>
  );
};

export default BootSequence;