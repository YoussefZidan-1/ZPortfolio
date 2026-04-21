import useWindowStore from "#store/window.js";
import { ChevronDown } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";
const WindowControls = ({ target }) => {
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const toggleMaximize = useWindowStore((s) => s.toggleMaximize);
  const { trigger } = useWebHaptics();
  return (
    <div id="window-controls">
      <button 
        type="button"
        className="close cursor-pointer" 
        onClick={(e) => { 
            e.stopPropagation();
            closeWindow(target);
            trigger("nudge");
        }}
      >
        <ChevronDown className="hidden max-md:block text-gray-700 stroke-[3px] pointer-events-none" size={18} />
      </button>
      
      <button 
        type="button" 
        className="minimize cursor-pointer" 
        onClick={(e) => {
            e.stopPropagation();
            closeWindow(target);
            trigger("nudge");
        }}
      />
      
      <button 
        type="button" 
        className="maximize cursor-pointer" 
        onClick={(e) => {
            e.stopPropagation();
            toggleMaximize(target);
            trigger("success");
        }} 
      />
    </div>
  )
}

export default WindowControls;
