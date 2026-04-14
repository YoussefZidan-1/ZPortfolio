import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { WindowControls } from "#components";
import useWindowStore from "#store/window.js";
import { memo } from "react";

const Text = memo(() => {
  const data = useWindowStore((s) => s.windows.txtfile?.data); 

  if (!data) return <div className="flex-1 bg-white/50" />;

  const { name, subtitle, image, description } = data;

  return (
    <>
      <div id="window-header" className="shrink-0 bg-white/10 backdrop-blur-md z-10 relative">
        <WindowControls target="txtfile" />
        <h2 className="text-sm font-medium pr-4 truncate">{name}</h2>
      </div>
      
      <div className="flex-1 w-full bg-white overflow-y-auto min-h-0">
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            {image && (
                <img src={image} alt={name} className="w-full h-auto rounded shadow-sm mb-6" loading="lazy" />
            )}
            
            {subtitle && <h3 className="text-2xl md:text-3xl font-bold text-black tracking-tight">{subtitle}</h3>}

            {Array.isArray(description) && (
            <div className="space-y-4 leading-relaxed text-lg text-gray-800 pb-16">
                {description.map((para, idx) => (
                    <p key={idx}>{para}</p>
                ))}
            </div>
            )}
        </div>
      </div>
    </>
  );
});

const TextWindow = WindowWrapper(Text, "txtfile");
export default TextWindow;