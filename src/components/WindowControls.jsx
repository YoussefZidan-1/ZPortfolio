import useWindowStore from "#store/window.js";
import { ChevronDown } from "lucide-react";
import { triggerHaptic } from "../utils/haptics";
const WindowControls = ({ target }) => {
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const toggleMaximize = useWindowStore((s) => s.toggleMaximize);
  
  return (
    <div id="window-controls">
      <button 
        type="button"
        className="close cursor-pointer" 
        onClick={(e) => {
            triggerHaptic("medium"); 
            e.stopPropagation();
            closeWindow(target);
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
        }}
      />
      
      <button 
        type="button" 
        className="maximize cursor-pointer" 
        onClick={(e) => {
            e.stopPropagation();
            triggerHaptic("light");
            toggleMaximize(target);
        }} 
      />
    </div>
  )
}

export default WindowControls;
