import { Mail, Search } from "lucide-react"
import WindowWrapper from "#hoc/WindowWrapper"
import WindowControls from "#components/WindowControls"
import { gallery, photosLinks } from "#constants/index.js"
import useWindowStore from "#store/window"

const Photos = () => {
  const { openWindow } = useWindowStore();
  return (
    <>
      <div id="window-header" className="shrink-0">
        <WindowControls target="photos" />
        <div className="w-full flex justify-end items-center gap-3 text-indigo-500">
          <Mail className="icon" />
          <Search className="icon"/>
        </div>
      </div>
      
      <div className="flex flex-1 h-full overflow-hidden">
        <div className="sidebar shrink-0 h-full overflow-y-auto">
          <h2>Photos</h2>
          <ul>
            {photosLinks.map(({ id, icon, title }) => (
              <li key={id}>
                <img src={icon} alt={title} />
                <p>{title}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="gallery flex-1 h-full overflow-y-auto min-h-0 p-5">
          <ul>
            {gallery.map(({ id, img }) => (
              <li
                key={id}
                onClick={() => 
                  openWindow("imgfile", {
                    id,
                    name: "Gallery image",
                    icon: "/images/image.png",
                    kind: "file",
                    fileType: "img",
                    imageUrl: img,
                  })
                }
              >
                <img src={img} alt={`Gallery Image ${id}`}   loading="lazy" 
                decoding="async" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}

const PhotosWindow = WindowWrapper(Photos, "photos");
PhotosWindow.displayName = "Photos";

export default PhotosWindow;