import React, { Suspense, lazy, useState } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import BootSequence from "#components/BootSequence.jsx";
const Navbar = lazy(() => import("#components/Navbar.jsx"));
const Welcome = lazy(() => import("#components/Welcome.jsx"));
const Dock = lazy(() => import("#components/Dock.jsx"));
const Home = lazy(() => import("#components/Home.jsx"));
const Terminal = lazy(() => import("#windows/Terminal.jsx"));
const ZenBrowser = lazy(() => import("#windows/ZenBrowser.jsx"));
const Resume = lazy(() => import("#windows/Resume.jsx"));
const Finder = lazy(() => import("#windows/Finder.jsx"));
const Text = lazy(() => import("#windows/Text.jsx"));
const Image = lazy(() => import("#windows/Image.jsx"));
const Contact = lazy(() => import("#windows/Contact.jsx"));
const Photos = lazy(() => import("#windows/Photos.jsx"));
const CodeEditor = lazy(() => import("#windows/CodeEditor.jsx"));
const ContextMenu = lazy(() => import("#components/ContextMenu.jsx"));

gsap.registerPlugin(Draggable);

if (typeof window !== "undefined") {
  console.log(
    "%c 💻 ZPortfolio by ZED Studios %c Developed by Yousef Zedan %c https://github.com/YoussefZidan-1/zportfolio ",
    "color: white; background: #000; padding: 5px 10px; border-radius: 5px 0 0 5px; font-weight: bold;",
    "color: #fff; background: #007aff; padding: 5px 10px; font-weight: bold;",
    "color: #000; background: #fff; padding: 5px 10px; border-radius: 0 5px 5px 0; border: 1px solid #000;"
  );
}

const App = () => {
  const [isBooted, setIsBooted] = useState(false);
  return (
    <>
      {!isBooted && <BootSequence onComplete={() => setIsBooted(true)} />}
      <div 
        className={`fixed inset-0 w-full h-full transition-opacity duration-1000 ease-in-out z-0 ${
          isBooted ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <Suspense fallback={null}>
          <main className="w-full h-full">
            <div className="ios-home-indicator" />
            <Navbar />
            <Welcome />
            <Home />
            <ContextMenu />
            <Dock />
            <Terminal />
            <ZenBrowser />
            <Resume />
            <Finder />
            <Text />
            <Image />
            <Contact />
            <Photos />
            <CodeEditor /> 
          </main>
        </Suspense>
      </div>
    </>
  );
};

export default App;