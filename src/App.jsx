import { Navbar, Welcome, Dock } from "#components";
import { Contact, Finder, Image, Resume, Terminal, Text, ZenBrowser } from "#windows";
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
    </main>
  );
};

export default App;
