import { Navbar, Welcome, Dock } from "#components";
import { Terminal, Safari } from "#windows";
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
      <Safari/>
    </main>
  );
};

export default App;
