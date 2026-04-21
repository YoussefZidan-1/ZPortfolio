import { memo } from "react";

const SpotifyWidget = memo(() => {
  return (
    <div className="absolute top-20 w-[400px] right-5 z-1 max-md:hidden pointer-events-auto flex items-center justify-center">
      <iframe 
        style={{ borderRadius: '12px' }} 
        src="https://open.spotify.com/embed/playlist/1q1ric95ZY0O1p49ej4TGh?utm_source=generator&theme=0" 
        width="100%" 
        height="350" 
        frameBorder="1" 
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture" 
        loading="lazy"
        title="Spotify Playlist"
      />
    </div>
  );
});

export default SpotifyWidget;