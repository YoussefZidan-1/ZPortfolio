import { memo, useState } from "react";
import { Play, Music } from "lucide-react";

const SpotifyWidget = memo(() => {
  const [isBooted, setIsBooted] = useState(false);

  return (
    <div className="absolute top-20 w-[400px] right-5 z-1 max-md:hidden pointer-events-auto flex items-center justify-center">
      {!isBooted ? (
        <div 
          onClick={() => setIsBooted(true)}
          className="w-full h-[160px] bg-black/40 backdrop-blur-xl rounded-[12px] border border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-black/50 transition-all duration-300 group shadow-2xl"
        >
          <div className="size-16 rounded-full bg-[#1DB954] flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg mb-4">
            <Play className="text-white fill-white ml-1" size={28} />
          </div>
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Music size={18} /> Load Spotify Player
          </h3>
          <p className="text-white/50 text-xs mt-2">Click to load music player</p>
        </div>
      ) : (
        <iframe 
          style={{ borderRadius: '12px' }} 
          src="https://open.spotify.com/embed/playlist/1q1ric95ZY0O1p49ej4TGh?utm_source=generator&theme=0" 
          width="100%" 
          height="170" 
          frameBorder="1" 
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture" 
          loading="lazy"
          title="Spotify Playlist"
          className="animate-in fade-in duration-500"
        />
      )}
    </div>
  );
});

export default SpotifyWidget;