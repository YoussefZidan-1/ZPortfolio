import { locations, dockApps } from "#constants";
import clsx from "clsx";
import { useGSAP } from "@gsap/react";
import Draggable from "gsap/Draggable";
import gsap from "gsap";
import { useWebHaptics } from "web-haptics/react";
import useWindowStore from "#store/window.js";
import useLocationStore from "#store/location.js";
import { useState, useEffect } from "react";
import dayjs from "dayjs";

const projects = locations.work?.children ??[];

const Home = () => {
  const { trigger } = useWebHaptics();
  const setActiveLocation = useLocationStore((s) => s.setActiveLocation);
  const openWindow = useWindowStore((s) => s.openWindow);
  const [time, setTime] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => setTime(dayjs()), 1000);
    return () => clearInterval(timer);
  },[]);

  const handleOpenProjectFinder = (e, project) => {
    trigger("nudge");
    const rect = e.currentTarget.getBoundingClientRect();
    const launchPos = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height,
    };
    setActiveLocation(project);
    openWindow("finder", null, launchPos);
  };

  const handleOpenApp = (e, app) => {
    if (!app.canOpen) { 
      trigger("error");
      return;
    }
    trigger("nudge", { intensity: 0.8 }); 
    const rect = e.currentTarget.getBoundingClientRect();
    const launchPos = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height,
    };
    openWindow(app.id, null, launchPos);
  };

  useGSAP(() => {
    let draggables =[];
    const initDrag = () => {
      if (window.innerWidth > 768) {
        if (draggables.length === 0) {
          draggables = Draggable.create(".folder", {
            type: "x,y",
            bounds: "body",
            dragClickables: true
          });
        } else {
          draggables.forEach(d => d.enable());
        }
      } else {
        if (draggables.length > 0) {
          draggables.forEach(d => d.disable());
          gsap.set(".folder", { clearProps: "x,y,transform" });
        }
      }
    };
    initDrag();
    window.addEventListener("resize", initDrag);
    return () => window.removeEventListener("resize", initDrag);
  },[]);

  // Intercept the apps array to replace Trash with Resume ONLY on mobile
  const mobileApps = dockApps.map(app => 
    app.id === "trash" ? { id: "resume", name: "Resume", icon: "pdf.png", canOpen: true } : app
  );

  return (
    <section id="home" className="absolute inset-0 w-full h-full z-0 overflow-hidden">
      <div className="absolute top-[12vh] left-0 w-full flex flex-col items-center justify-center md:hidden text-white drop-shadow-xl z-20 pointer-events-none select-none">
        <h1 className="text-[5.5rem] font-light tracking-tight leading-none text-center">
          {time.format("h:mm")}
        </h1>
        <p className="text-[1.2rem] font-medium mt-2 tracking-wide text-center">
          {time.format("dddd, MMMM D")}
        </p>
      </div>
      
      <ul className="desktop-projects w-full h-full max-md:hidden">
        {projects.map((project) => (
          <li
            key={project.id}
            className={clsx("group folder", project.windowPosition)}
            onClick={(e) => handleOpenProjectFinder(e, project)}
          >
            <img 
              src="/images/folder.png" 
              alt={project.name}
              width={64}
              height={64}
              loading="eager"
              className="pointer-events-none" 
            />
            <p>{project.name}</p>
          </li>
        ))}
      </ul>

      <ul className="hidden max-md:grid grid-cols-4 gap-x-2 gap-y-6 px-5 relative z-30 w-full box-border mt-[38vh]">
        {mobileApps.map((app) => (
          <li 
            key={app.id || app.name}
            onClick={(e) => handleOpenApp(e, app)}
            className="flex flex-col items-center gap-[6px] cursor-pointer"
          >
            <img 
              src={`/images/${app.icon}`} 
              alt={app.name} 
              className={clsx(
                "w-[16vw] max-w-[64px] h-[16vw] max-h-[64px] object-cover",
                !app.canOpen && "opacity-60"
              )}
            />
            <p className="text-[12px] font-medium text-white drop-shadow-md text-center leading-tight w-full truncate px-1">
              {app.name}
            </p>
          </li>
        ))}
        {projects.map((project) => (
          <li 
            key={project.id}
            onClick={(e) => handleOpenProjectFinder(e, project)}
            className="flex flex-col items-center gap-[6px] cursor-pointer"
          >
            <img 
              src="/images/folder.png" 
              alt={project.name} 
              className="w-[16vw] max-w-[64px] h-[16vw] max-h-[64px] object-cover"
            />
            <p className="text-[12px] font-medium text-white drop-shadow-md text-center leading-tight w-full truncate px-1">
              {project.name}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Home;