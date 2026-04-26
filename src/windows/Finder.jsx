import { useState } from "react";
import { WindowControls } from "#components";
import { locations } from "#constants";
import WindowWrapper from "#hoc/WindowWrapper";
import useLocationStore from "#store/location";
import { Search, PanelLeft } from "lucide-react";
import clsx from "clsx";
import useWindowStore from "#store/window";

const Finder = () => {
  const { openWindow } = useWindowStore();
  const { activeLocation, setActiveLocation } = useLocationStore();
  const[showSidebar, setShowSidebar] = useState(false);

  const openItem = (item) => {
    if (item.fileType === "pdf") return openWindow("resume");
    if (item.kind === "folder") return setActiveLocation(item);
    if (["fig", "url"].includes(item.fileType) && item.href)
      return window.open(item.href, "_blank");
    openWindow(`${item.fileType}${item.kind}`, item);
  };

  const renderList = (name, items) => (
    <div>
      <h3>{name}</h3>
      <ul>
        {items.map((item) => (
          <li
            key={item.id}
            onClick={() => {
              setActiveLocation(item);
              setShowSidebar(false);
            }}
            className={clsx(
              item.id === activeLocation.id ? "active" : "not-active",
            )}
          >
            <img src={item.icon} className="w-4" alt={item.name} />
            <p className="text-sm font-medium truncate">{item.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      <div id="window-header">
        <WindowControls target="finder" />
        
        <PanelLeft 
          className="hidden max-md:block absolute left-15 bottom-3.5 text-blue-600 cursor-pointer z-50 transition-transform active:scale-95" 
          size={22} 
          onClick={(e) => {
            e.stopPropagation();
            setShowSidebar(!showSidebar);
          }} 
        />
        
        <Search className="icon" />
      </div>

      <div className="flex h-full relative">
        
        <div 
          className={clsx(
            "hidden max-md:block absolute inset-0 bg-black/20 z-45 transition-opacity duration-300 ease-in-out",
            showSidebar ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setShowSidebar(false)}
        />
        
        <div className={clsx(
          "sidebar",
          "max-md:flex! max-md:absolute max-md:top-0 max-md:left-0 max-md:h-full max-md:z-50 max-md:w-60 max-md:shadow-2xl max-md:transition-transform max-md:duration-300 max-md:ease-in-out",
          showSidebar ? "max-md:translate-x-0" : "max-md:-translate-x-full"
        )}>
          <ul>{renderList("Favourites", Object.values(locations))}</ul>
          <ul>{renderList("Work", locations.work.children)}</ul>
        </div>
        
        <ul className="content">
          {activeLocation?.children.map((item) => (
            <li
              key={item.id}
              className={clsx(item.position, "max-md:top-auto! max-md:left-auto!")}
              onClick={() => openItem(item)}
            >
              <img src={item.icon} alt={item.name} />
              <p>{item.name}</p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

const FinderWindow = WindowWrapper(Finder, "finder");

export default FinderWindow;