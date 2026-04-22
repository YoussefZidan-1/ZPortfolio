import { memo, useState } from "react";
import { Play, Music } from "lucide-react";

const SpotifyWidget = memo(() => {
  const [isBooted, setIsBooted] = useState(false);

  return (
    <div className="absolute top-20 w-[400px] right-5 z-1 max-md:hidden pointer-events-auto flex items-center justify-center">
      <div className="relative w-full h-[170px]">
        
        <div 
          onClick={() => setIsBooted(true)}
          className={`absolute inset-0 w-full h-full bg-black/40 backdrop-blur-xl rounded-[12px] border border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-black/50 transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] group shadow-2xl z-10 ${
            isBooted ? "opacity-0 pointer-events-none scale-95" : "opacity-100 scale-100"
          }`}
        >
          <div className="size-16 rounded-full bg-[#1DB954] flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg mb-4">
            <Play className="text-white fill-white ml-1" size={28} />
          </div>
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Music size={18} /> Load Spotify Player
          </h3>
          <p className="text-white/50 text-xs mt-2">Click to load music player</p>
        </div>

        {isBooted && (
          <div className="absolute inset-0 w-full h-full z-0 animate-in fade-in zoom-in-95 duration-700 delay-150">
            <iframe 
              style={{ borderRadius: '12px' }} 
              src="https://open.spotify.com/embed/playlist/1q1ric95ZY0O1p49ej4TGh?utm_source=generator&theme=0" 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture" 
              loading="lazy"
              title="Spotify Playlist"
            />
          </div>
        )}

      </div>
    </div>
  );
});

export default SpotifyWidget;