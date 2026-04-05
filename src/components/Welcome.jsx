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

      let centers = [];
      const updateCenters = () => {
        centers = Array.from(letters).map((letter) => {
          const rect = letter.getBoundingClientRect();
          return rect.left + rect.width / 2;
        });
      };

      updateCenters();
      window.addEventListener("resize", updateCenters);

      const handleMouseMove = (e) => {
        const mouseX = e.clientX;
        letters.forEach((letter, i) => {
          const distance = Math.abs(mouseX - centers[i]);
          
          if (distance > 600) {
            gsap.to(letter, {
              fontVariationSettings: `'wght' ${config.default}`,
              duration: 0.4,
              overwrite: true,
            });
            return;
          }

          const intensity = Math.exp(-(distance ** 2) / 15000);
          const weight = config.min + (config.max - config.min) * intensity;

          gsap.to(letter, {
            fontVariationSettings: `'wght' ${weight}`,
            duration: 0.1,
            overwrite: true,
            ease: "power1.out",
          });
        });
      };

      const handleMouseLeave = () => {
        gsap.to(letters, {
          fontVariationSettings: `'wght' ${config.default}`,
          duration: 0.5,
          stagger: 0.02,
          overwrite: true,
          ease: "power2.out",
        });
      };

      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        window.removeEventListener("resize", updateCenters);
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    };

    const cleanupTitle = setupEffect(titleRef.current, "title");
    const cleanupSubtitle = setupEffect(subtitleRef.current, "subtitle");

    return () => {
      cleanupTitle?.();
      cleanupSubtitle?.();
    };
  }, []);

  return (
    <section id="welcome" className="flex flex-col items-center justify-center min-h-screen">
      <div ref={subtitleRef} className="cursor-default">
        {renderText("Hey, I'm Yousef Zedan! Welcome to my", "text-3xl font-georama", 150)}
      </div>
      <div ref={titleRef} className="mt-7 cursor-default">
        {renderText("ZPortfolio", "text-9xl italic font-georama", 400)}
      </div>
      <div className="small-screen mt-10">
        <p>This Portfolio is designed for desktop/tablet screens only.</p>
      </div>
    </section>
  );
};

export default Welcome;
