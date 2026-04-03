import { techStack } from "#constants";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { Check, Flag } from "lucide-react";
import WindowControls from "#components/WindowControls.jsx";


const Terminal = () => {
  return (
    <>
      <div id="window-header">
        <WindowControls target="terminal"/>
        <h2>Tech Stack</h2>
      </div>
      <div className="techstack">
        <p>
          <span className="font-bold text-blue-500"> yousef   </span>
          <span className="text-indigo-500">cat </span>
          <span className="text-blue-600 underline">techstack.md</span>
        </p>
        <div className="label">
          <p className="w-32">Category</p>
          <p>Technologies</p>
        </div>
        <ul className="content">
          {techStack.map(({ category, items }) => (
            <li key={category} className="flex items-center">
              <Check className="check" size={20} />
              <h3>{category}</h3>
              <ul>
                {items.map((item, i) => (
                  <li key={i}>
                    {item}
                    {i < items.length - 1 ? "," : ""}{" "}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <div className="footnote">
          <p>
            <Check size={20} /> 5 of 7 tasks loaded successfully ==&gt; (71.43%)
             ---c--C-0-0-
          </p>
          <p className="text-blue-500">
            <Flag size={15} fill="red" />
            Render Time: 6ms
          </p>
        </div>
      </div>
    </>
  );
};

const TerminalWindow = WindowWrapper(Terminal, "terminal");

export default TerminalWindow;
