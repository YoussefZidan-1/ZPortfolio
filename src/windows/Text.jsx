import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { WindowControls } from "#components";
import useWindowStore from "#store/window.js";

const Text = () => {
  const { windows } = useWindowStore();
  const data = windows.txtfile?.data; 

  if (!data) return null;

  const { name, subtitle, image, description } = data;

  return (
    <>
      <div id="window-header">
        <WindowControls target="txtfile" />
        <h2 className="text-sm font-medium">{name}</h2>
      </div>

      <div className="p-5 space-y-6 bg-white overflow-y-auto max-h-[70vh]">
        {image && (
          <div className="w-full">
            <img src={image} alt={name} className="w-full h-auto rounded" />
          </div>
        )}
        
        {subtitle && <h3 className="text-lg font-semibold text-black">{subtitle}</h3>}

        {Array.isArray(description) && (
          <div className="space-y-3 leading-relaxed text-base text-gray-800">
            {description.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

const TextWindow = WindowWrapper(Text, "txtfile");
export default TextWindow;