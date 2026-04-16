import React, { memo, useState, useEffect } from "react";
import { navIcons, navLinks } from "#constants";
import useWindowStore from "#store/window.js";
import dayjs from "dayjs";

const Navbar = memo(() => {
  const openWindow = useWindowStore((s) => s.openWindow);
  const[time, setTime] = useState(dayjs().format("ddd MMM D   h:mm A"));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(dayjs().format("ddd MMM D   h:mm A"));
    }, 10000);
    return () => clearInterval(timer);
  },[]);

  return (
    <nav className="relative z-50 max-md:bg-transparent max-md:border-none max-md:pt-4 max-md:px-6">
    
      <div className="flex items-center gap-4 max-md:hidden">
        <img src="/images/logo.svg" alt="logo" width={20} height={20} className="w-5 h-5" />
        <p className="font-bold whitespace-nowrap">Yousef's Portfolio</p>
        <ul className="flex items-center gap-3">
          {navLinks.map(({ id, name, type }) => (
            <li key={id} className="relative" onClick={() => openWindow(type)}>
              <p className="z-10">{name}</p>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="hidden max-md:flex w-full items-center justify-between text-white drop-shadow-md">
        <span className="text-xs font-semibold tracking-wider">ZED</span>
        <time className="text-[15px] font-bold absolute left-1/2 -translate-x-1/2">
            {dayjs().format("h:mm")}
        </time>
        <ul className="flex items-center gap-2">
          {navIcons.map(({ id, img }) => (
            <li key={id}>
              <img src={img} alt={`icon-${id}`} width={16} height={16} className="brightness-200 w-[15px] h-[15px]" loading="lazy" />
            </li>
          ))}
        </ul>
      </div>

      <div className="max-md:hidden">
        <ul>
          {navIcons.map(({ id, img }) => (
            <li key={id}>
              <img src={img} alt={`icon-${id}`} width={18} height={18} className="icon-hover w-[18px] h-[18px]" loading="lazy" />
            </li>
          ))}
        </ul>
        <time>{time}</time>
      </div>
    </nav>
  );
});

export default Navbar;