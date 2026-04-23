import useWindowStore from "#store/window.js";
import { ChevronDown } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";
import useSettingsStore from "#store/settings.js";
import useSound from "use-sound";

const WindowControls = ({ target }) => {
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const toggleMaximize = useWindowStore((s) => s.toggleMaximize);
  const { trigger } = useWebHaptics();

  const { volume, isMuted } = useSettingsStore();
  const effectiveVolume = isMuted ? 0 : volume;

  const [playClose] = useSound("/sounds/oxygen_close.ogg", { volume: effectiveVolume });
  const [playMinimize] = useSound("/sounds/oxygen_minimize.ogg", { volume: effectiveVolume });
  const [playMaximize] = useSound("/sounds/oxygen_maximize.ogg", { volume: effectiveVolume });

  return (
    <div id="window-controls">
      <button 
        type="button"
        className="close cursor-pointer" 
        onPointerDown={(e) => { 
            e.stopPropagation();
            closeWindow(target);
            trigger("nudge");
            playClose();
        }}
      >
        <ChevronDown className="hidden max-md:block text-gray-700 stroke-[3px] pointer-events-none" size={18} />
      </button>
      
      <button 
        type="button" 
        className="minimize cursor-pointer" 
        onPointerDown={(e) => {
            e.stopPropagation();
            closeWindow(target);
            trigger("nudge");
            playMinimize();
        }}
      />
      
      <button 
        type="button" 
        className="maximize cursor-pointer" 
        onPointerDown={(e) => {
            e.stopPropagation();
            toggleMaximize(target);
            trigger("success");
            playMaximize();
        }} 
      />
    </div>
  )
}

export default WindowControls;