/**
 * 💻 ZPortfolio — MacOS Inspired Creative Portfolio
 * Developed by: Yousef Zedan (ZED Studios)
 * Original Repo: https://github.com/YoussefZidan-1/zportfolio
 * "If you're using this template, a star on GitHub would mean a lot! ⭐"
 */

import { Navbar, Welcome, Dock, Home } from "#components";
import { Contact, Finder, Image, Photos, Resume, Terminal, Text, ZenBrowser } from "#windows";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
gsap.registerPlugin(Draggable);

const App = () => {
  return (
    <main>
      <Navbar />
      <Welcome />
      <Dock />
      <Terminal />
      <ZenBrowser />
      <Resume />
      <Finder />
      <Text />
      <Image />
      <Contact />
      <Home />
      <Photos />
    </main>
  );
};

export default App;
