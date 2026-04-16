import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const FONT_WEIGHT = {
  subtitle: { min: 100, max: 400, default: 100 },
  title: { min: 400, max: 900, default: 400 },
};

const Welcome = () => {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  const renderText = (text, className, baseWeight = 400) => {
    return (
      <span aria-label={text} role="text">
        {[...text].map((char, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`${className} inline-block select-none`}
            style={{ fontVariationSettings: `'wght' ${baseWeight}` }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
    );
  };

  useGSAP(() => {
    const setupEffect = (container, type) => {
      if (!container) return;
      const letters = container.querySelectorAll("span[aria-hidden='true']");
      const config = FONT_WEIGHT[type];

      let centers =[];
      const updateCenters = () => {
        centers = Array.from(letters).map((letter) => {
          const rect = letter.getBoundingClientRect();
          return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2, // FIX: Now tracking the Y axis too!
          };
        });
      };

      setTimeout(updateCenters, 100);
      window.addEventListener("resize", updateCenters, { passive: true });

      let ticking = false;
      
      const animateLetters = (clientX, clientY) => {
        if (!ticking) {
          requestAnimationFrame(() => {
            letters.forEach((letter, i) => {
              const dx = clientX - centers[i].x;
              const dy = clientY - centers[i].y;
              const distance = Math.hypot(dx, dy); 

              
              if (distance > 250) {
                gsap.to(letter, {
                  fontVariationSettings: `'wght' ${config.default}`,
                  duration: 0.4,
                  overwrite: "auto",
                });
                return;
              }

              const intensity = Math.exp(-(distance ** 2) / 10000);
              const weight = config.min + (config.max - config.min) * intensity;
              
              gsap.to(letter, {
                fontVariationSettings: `'wght' ${weight}`,
                duration: 0.1,
                overwrite: "auto",
                ease: "none",
              });
            });
            ticking = false;
          });
          ticking = true;
        }
      };
      const handleMouseMove = (e) => animateLetters(e.clientX, e.clientY);
      const handleTouchMove = (e) => animateLetters(e.touches[0].clientX, e.touches[0].clientY);

      const handleMouseLeave = () => {
        gsap.to(letters, {
          fontVariationSettings: `'wght' ${config.default}`,
          duration: 0.5,
          stagger: 0.01,
          overwrite: "auto",
          ease: "power2.out",
        });
      };

      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("mouseleave", handleMouseLeave);
      window.addEventListener("touchend", handleMouseLeave);

      return () => {
        window.removeEventListener("resize", updateCenters);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("mouseleave", handleMouseLeave);
        window.removeEventListener("touchend", handleMouseLeave);
      };
    };

    const cleanupTitle = setupEffect(titleRef.current, "title");
    const cleanupSubtitle = setupEffect(subtitleRef.current, "subtitle");

    return () => {
      cleanupTitle?.();
      cleanupSubtitle?.();
    };
  },[]);

  return (
    <section id="welcome" className="pointer-events-none w-full">
      <div ref={subtitleRef} className="cursor-default text-center px-4">
        {renderText("Hey, I'm Yousef Zedan! Welcome to my", "text-[5vw] sm:text-2xl md:text-3xl font-georama", 150)}
      </div>
      <div ref={titleRef} className="mt-4 md:mt-7 cursor-default text-center">
        {renderText("ZPortfolio", "text-[10.5vw] sm:text-7xl md:text-9xl italic font-georama", 400)}
      </div>
    </section>
  );
};

export default Welcome;