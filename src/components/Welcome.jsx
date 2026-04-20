import { ProximityText } from "../proximity-engine/ProximityText.jsx";

const Welcome = () => {
  return (
    <section id="welcome" className="max-md:hidden pointer-events-none w-full">
      <ProximityText
        text="Hey, I'm Yousef Zedan! Welcome to my"
        preset="opacity-y"
        splitBy="letter"
        global={true}
        config={{
          duration: 1.5,
          resetDuration: 1.5,
          ease: "elastic",
          resetEase: "elastic"
        }}
        reach={0.6}
        falloff={2}
        className="cursor-default text-center px-4"
        textClassName="text-[5vw] sm:text-2xl md:text-3xl font-georama font-[150]"
      />
      <ProximityText
        text="ZPortfolio"
        preset="weight"
        global={true}
        config={{
          duration: 1,
          resetDuration: 1,
          weight: [400, 900],
          ease: "elastic",
          resetEase: "elastic"
        }}
        reach={0.5}
        falloff={2}
        className="mt-4 md:mt-7 cursor-default text-center"
        textClassName="text-[10.5vw] sm:text-7xl md:text-9xl italic font-georama"
      />
    </section>
  );
};

export default Welcome;