import useWindowStore from "#store/window.js";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Draggable } from "gsap/Draggable";
import { useLayoutEffect, useRef } from "react";
const WindowWrapper = (Component, windowKey) => {
  const Wrapped = (props) => {
    const { focusWindow, windows } = useWindowStore();
    const { isOpen, zIndex } = windows[windowKey];
    const ref = useRef(null);

    useGSAP(() => {
      const el = ref.current;
      if (!el || !isOpen) return;

      const tl = gsap.timeline();

      tl.fromTo(
        el,
        {
          display: "block",
          scale: 0.1,
          opacity: 0,
          y: "50vh",
          x: "50vw",
        },
        {
          scale: 1.03,
          opacity: 1,
          y: 0,
          x: 0,
          duration: 0.4,
          ease: "power2.out",
        },
      ).to(el, {
        scale: 1,
        duration: 0.4,
        ease: "back.inOut(2)",
      });
    }, [isOpen]);

    useGSAP(() => {
      const el = ref.current;
      if (!el) return;
      const [instance] = Draggable.create(el, { onPress: () => focusWindow(windowKey) });
      return () => instance.kill();
    }, []);

    useLayoutEffect(() => {
      const el = ref.current;
      if (!el) return;

      el.style.display = isOpen ? "block" : "none";
    }, [isOpen]);

    return (
      <section id={windowKey} ref={ref} style={{ zIndex }} className="absolute">
        <Component {...props} />
      </section>
    );
  };
  Wrapped.displayName = `WindowWrapper(${Component.displayName || Component.name || "Component"})`;

  return Wrapped;
};

export default WindowWrapper;
