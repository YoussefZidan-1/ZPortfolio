import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { WindowControls } from "#components";
import useWindowStore from "#store/window.js";
import { memo } from "react";

const Image = memo(() => {
  const data = useWindowStore((s) => s.windows.imgfile?.data);

  if (!data) return <div className="flex-1 bg-white/50" />;

  const { name, imageUrl } = data;

  return (
    <>
      <div id="window-header" className="shrink-0 bg-white/10 backdrop-blur-md z-10 relative">
        <WindowControls target="imgfile" />
        <h2 className="text-sm font-medium pr-4 truncate">{name}</h2>
      </div>

      <div className="flex-1 w-full bg-white/95 flex items-center justify-center p-4 min-h-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="max-w-full max-h-full object-contain rounded drop-shadow-md"
            decoding="async"
          />
        ) : null}
      </div>
    </>
  );
});

const ImageWindow = WindowWrapper(Image, "imgfile");
export default ImageWindow;