/**
 * 💻 ZPortfolio — MacOS Inspired Creative Portfolio
 * ------------------------------------------------
 * Created & Developed by: Yousef Zedan (ZED Studios)
 * GitHub: https://github.com/YoussefZidan-1/zportfolio
 * License: MIT (Attribution is required)
 * ------------------------------------------------
 * "If you're using this template, a star on GitHub would mean a lot! ⭐"
 */

import React, { Suspense, lazy } from "react";
import { Navbar, Welcome, Dock, Home } from "#components";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
gsap.registerPlugin(Draggable);

const Terminal = lazy(() => import("#windows/Terminal.jsx"));
const ZenBrowser = lazy(() => import("#windows/ZenBrowser.jsx"));
const Resume = lazy(() => import("#windows/Resume.jsx"));
const Finder = lazy(() => import("#windows/Finder.jsx"));
const Text = lazy(() => import("#windows/Text.jsx"));
const Image = lazy(() => import("#windows/Image.jsx"));
const Contact = lazy(() => import("#windows/Contact.jsx"));
const Photos = lazy(() => import("#windows/Photos.jsx"));

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
      <div className="ios-home-indicator" />
      <Navbar />
      <Welcome />
      <Home />
      <Dock />
      <Suspense fallback={null}>
        <Terminal />
        <ZenBrowser />
        <Resume />
        <Finder />
        <Text />
        <Image />
        <Contact />
        <Photos />
      </Suspense>
    </main>
  );
};

export default App;