import useWindowStore from "#store/window.js";
import { ChevronDown } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";
import useSettingsStore from "#store/settings.js";
import useSound from "use-sound";
let pitchCounter = 0;
const PITCH_LEVELS =[1.0, 1.05, 1.1, 1.15]; 

const WindowControls = ({ target }) => {
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const toggleMaximize = useWindowStore((s) => s.toggleMaximize);
  const { trigger } = useWebHaptics();
  const { volume, isMuted } = useSettingsStore();
  const effectiveVolume = isMuted ? 0 : volume;
  const [playClose, { sound: closeSound }] = useSound("/sounds/oxygen_close.ogg", { volume: effectiveVolume });
  const [playMinimize, { sound: minSound }] = useSound("/sounds/oxygen_minimize.ogg", { volume: effectiveVolume });
  const[playMaximize, { sound: maxSound }] = useSound("/sounds/oxygen_maximize.ogg", { volume: effectiveVolume });
  const playDynamicPitch = (playFn, soundObj) => {
    if (soundObj) {
      soundObj.rate(PITCH_LEVELS[pitchCounter % PITCH_LEVELS.length]);
    }
    playFn();
    pitchCounter++;
  };

  return (
    <div id="window-controls">
      <button 
        type="button"
        className="close cursor-pointer" 
        onPointerDown={(e) => { 
            e.stopPropagation();
            closeWindow(target);
            trigger("nudge");
            playDynamicPitch(playClose, closeSound);
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
            playDynamicPitch(playMinimize, minSound);
        }}
      />
      
      <button 
        type="button" 
        className="maximize cursor-pointer" 
        onPointerDown={(e) => {
            e.stopPropagation();
            toggleMaximize(target);
            trigger("success");
            playDynamicPitch(playMaximize, maxSound);
        }} 
      />
    </div>
  )
}

export default WindowControls;