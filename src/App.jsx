/**
 * 💻 ZPortfolio — MacOS Inspired Creative Portfolio
 * ------------------------------------------------
 * Created & Developed by: Yousef Zedan (ZED Studios)
 * GitHub: https://github.com/YoussefZidan-1/zportfolio
 * License: MIT (Attribution is required)
 * ------------------------------------------------
 * "If you're using this template, a star on GitHub would mean a lot! ⭐"
 */

import { Navbar, Welcome, Dock, Home } from "#components";
import { Contact, Finder, Image, Photos, Resume, Terminal, Text, ZenBrowser } from "#windows";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
gsap.registerPlugin(Draggable);

// 🕵️‍♂️ The "ZED" Signature - Visible only in the browser console

if (typeof window !== "undefined") {
  console.log(
    "%c 💻 ZPortfolio by ZED Studios %c Developed by Yousef Zedan %c https://github.com/YoussefZidan-1/zportfolio ",
    "color: white; background: #000; padding: 5px 10px; border-radius: 5px 0 0 5px; font-weight: bold;",
    "color: #fff; background: #007aff; padding: 5px 10px; font-weight: bold;",
    "color: #000; background: #fff; padding: 5px 10px; border-radius: 0 5px 5px 0; border: 1px solid #000;"
  );
}

const App = () => {
  return (
    <main>
      <Navbar />
      <Welcome />
      <Home />
      <Dock />
      <Terminal />
      <ZenBrowser />
      <Resume />
      <Finder />
      <Text />
      <Image />
      <Contact />
      <Photos />
    </main>
  );
};

export default App;
