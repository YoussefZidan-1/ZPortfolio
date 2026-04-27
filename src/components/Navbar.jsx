import React, { memo, useState, useEffect, useRef } from "react";
import { navIcons, navLinks } from "#constants";
import useWindowStore from "#store/window.js";
import dayjs from "dayjs";
import { Battery, Signal, Wifi } from "lucide-react";
import ControlCenter from "./ControlCenter.jsx";

const Navbar = memo(() => {
  const openWindow = useWindowStore((s) => s.openWindow);
  const [time, setTime] = useState(dayjs().format("ddd MMM D   h:mm A"));
  const [timeStr, setTimeStr] = useState(dayjs().format("h:mm"));

  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const controlCenterRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(dayjs().format("ddd MMM D   h:mm A"));
      setTimeStr(dayjs().format("h:mm"));
    }, 10000);
    return () => clearInterval(timer);
  },[]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (controlCenterRef.current && !controlCenterRef.current.contains(event.target)) {
        setIsControlCenterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  },[]);

  return (
    <nav className="relative z-50 max-md:z-1500 max-md:fixed max-md:top-0 max-md:left-0 max-md:right-0 max-md:h-12 max-md:bg-transparent max-md:border-none max-md:pointer-events-none max-md:p-0 max-md:px-0 box-border">
    
      {/* PC Navbar */}
      <div className="flex items-center gap-4 max-md:hidden">
        <img src="/images/logo.svg" alt="logo" width={20} height={20} className="w-5 h-5 dark:invert" />
        <p className="font-bold whitespace-nowrap dark:text-white">Yousef's Portfolio</p>
        <ul className="flex items-center gap-3">
          {navLinks.map(({ id, name, type }) => (
            <li 
              key={id} 
              className="relative cursor-pointer"
              onClick={() => openWindow(type)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openWindow(type)}
            >
              <p className="z-10">{name}</p>
            </li>
          ))}
        </ul>
      </div>
      
      {/* iOS Mobile Status Bar */}
      <div className="hidden max-md:flex w-full h-full items-center justify-between text-white drop-shadow-md pointer-events-auto px-6 box-border">
        <time className="text-[15px] font-bold tracking-wide">{timeStr}</time>
        
        {/* Dynamic Island - Now perfectly centered vertically in the h-12 nav */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1 w-[120px] h-[32px] bg-black rounded-full z-50 shadow-sm" />
        
        <div className="flex items-center gap-1.5">
          <Signal size={16} className="fill-white" strokeWidth={2.5} />
          <Wifi size={16} strokeWidth={2.5} />
          <Battery size={20} strokeWidth={2} className="fill-white" />
        </div>
      </div>

      {/* PC Right Side */}
      <div className="flex items-center gap-5 max-md:hidden" ref={controlCenterRef}>
        <ul>
          {navIcons.map(({ id, img }) => (
            <li key={id}>
              <img 
                src={img} 
                alt={`icon-${id}`} 
                width={18} 
                height={18} 
                className="w-[22px] h-[22px] p-[2px] transition-all duration-300 ease-in-out 
                                 rounded-md cursor-pointer dark:invert
                                 hover:bg-black/10 dark:hover:bg-white/20 
                                 hover:scale-110 active:scale-95" 
                loading="lazy" 
                onClick={() => {
                  if (id === 4) setIsControlCenterOpen(!isControlCenterOpen);
                  if (id === 2) window.dispatchEvent(new CustomEvent('toggle-spotlight'));
                }}
              />
            </li>
          ))}
        </ul>
        <time>{time}</time>
        <ControlCenter isOpen={isControlCenterOpen} />
      </div>
    </nav>
  );
});

export default Navbar;