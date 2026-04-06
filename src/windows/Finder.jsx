import { WindowControls } from "#components";
import { locations } from "#constants";
import WindowWrapper from "#hoc/WindowWrapper";
import useLocationStore from "#store/location";
import { Search } from "lucide-react";
import clsx from "clsx";
import useWindowStore from "#store/window";

const Finder = () => {
  const { openWindow } = useWindowStore();
  const { activeLocation, setActiveLocation } = useLocationStore();
  const openItem = (item) => {
    if(item.fileType === 'pdf') return openWindow('resume')
  };
  const renderList = (name, items) => (
    <div>
      <h3>{name}</h3>
      <ul>
        {items.map((item) => (
          <li
            key={item.id}
            onClick={() => setActiveLocation(item)}
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
        <Search className="icon" />
      </div>

      <div className="bg-white flex h-full">
        <div className="sidebar">
          <ul>{renderList("Favourites", Object.values(locations))}</ul>
          <ul>{renderList("Work", locations.work.children)}</ul>
        </div>
      <ul className="content">
        {activeLocation?.children.map((item) => (
          <li
            key={item.id}
            className={item.position}
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
