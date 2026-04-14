import React, { memo, useState, useEffect } from "react";
import { navIcons, navLinks } from "#constants";
import useWindowStore from "#store/window.js";
import dayjs from "dayjs";

const Navbar = memo(() => {
  const openWindow = useWindowStore((s) => s.openWindow);
  const [time, setTime] = useState(dayjs().format("ddd MMM D   h:mm A"));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(dayjs().format("ddd MMM D   h:mm A"));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="relative z-50"><div className="flex items-center gap-4"><img src="/images/logo.svg" alt="logo" className="w-5 h-5" /><p className="font-bold whitespace-nowrap">Yousef's Portfolio</p><ul className="flex items-center gap-3">
          {navLinks.map(({ id, name, type }) => (
            <li key={id} className="relative" onClick={() => openWindow(type)}><p className="z-10">{name}</p></li>
          ))}
        </ul></div><div><ul>
          {navIcons.map(({ id, img }) => (
            <li key={id}><img src={img} alt={`icon-${id}`} className="icon-hover" loading="lazy" /></li>
          ))}
        </ul><time>{time}</time></div></nav>
  );
});

export default Navbar;