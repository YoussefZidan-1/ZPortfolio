import { dockApps } from "#constants/index.js";
import useWindowStore from "#store/window.js";
import { memo } from "react";
import { Tooltip } from "react-tooltip";
import { Proximity } from "../proximity-engine/Proximity.jsx";

const Dock = memo(() => {
  const openWindow = useWindowStore((s) => s.openWindow);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const windows = useWindowStore((s) => s.windows);

  const toggleApp = (app) => {
    if (!app.canOpen) {
      return;
    };
    const windowState = windows[app.id];
    if (windowState?.isOpen) {
      closeWindow(app.id);
    } else {
      openWindow(app.id);
    }
  };

  return (
    <section id="dock" className="max-md:hidden">
      <Proximity
        className="dock-container"
        selector=".dock-icon"
        preset="scale-y"
        reach={2}
        falloff={2.4}
        ignoreSelectors={[".os-window"]}
        config={{
          scale:[1, 1.3],
          y: [0, -20],
          duration: 0.3,
          resetDuration: 1,
          ease: "power1.out",
          resetEase: "elastic"
        }}
      >
        {dockApps.map(({ id, name, icon, canOpen }) => (
          <div key={id ?? name} className="relative flex justify-center">
            <button
              type="button"
              className="dock-icon flex items-center justify-center will-change-transform"
              aria-label={name}
              data-tooltip-id="dock-tooltip"
              data-tooltip-content={name}
              data-tooltip-delay-show={150}
              disabled={!canOpen}
              onClick={() => toggleApp({ id, canOpen })}
            >
              <img
                src={`/images/${icon}`}
                alt={name}
                width={56}
                height={56}
                loading="lazy"
                decoding="async"
                className={canOpen ? "" : "opacity-60"}
              />
            </button>
          </div>
        ))}
        <Tooltip id="dock-tooltip" place="top" className="tooltip" />
      </Proximity>
    </section>
  );
});

export default Dock;