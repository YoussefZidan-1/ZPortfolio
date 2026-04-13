import React, { useState, useRef, useEffect } from "react";
import { techStack } from "#constants";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { Check, Terminal as TerminalIcon } from "lucide-react";
import WindowControls from "#components/WindowControls.jsx";

const Terminal = () => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([
    { type: "system", content: "Welcome to Z-Shell v1.0.4 (stable)" },
    { type: "system", content: "Type 'help' to see available commands." },
  ]);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  const executeCommand = (cmd) => {
    const cleanCmd = cmd.trim().toLowerCase();
    let response = null;

    switch (cleanCmd) {
      case "help":
        response = (
          <div className="text-gray-400">
            Available commands: <br />
            <span className="text-blue-400 font-bold">- help:</span> Show this menu <br />
            <span className="text-blue-400 font-bold">- ls:</span> List directory contents <br />
            <span className="text-blue-400 font-bold">- cat techstack.md:</span> Display skills <br />
            <span className="text-blue-400 font-bold">- whoami:</span> About the developer <br />
            <span className="text-blue-400 font-bold">- clear:</span> Clear terminal output <br />
            <span className="text-blue-400 font-bold">- neofetch:</span> System information
          </div>
        );
        break;

      case "ls":
        response = <span className="text-white">about_me.txt  certificates/  projects/  techstack.md  contact.ink</span>;
        break;

      case "whoami":
        response = <span className="text-white">Yousef Zedan - Creative Developer & GSAP Wizard.</span>;
        break;

      case "cat techstack.md":
        response = (
          <div className="mt-2 border-l-2 border-indigo-500 pl-4 py-2 bg-white/5">
            <div className="label mb-2 flex opacity-50 text-xs uppercase tracking-widest">
              <p className="w-32 text-white font-bold">Category</p>
              <p className="text-white font-bold">Technologies</p>
            </div>
            <ul className="space-y-2">
              {techStack.map(({ category, items }) => (
                <li key={category} className="flex items-start">
                  <Check className="text-[#00A154] mr-2 mt-1" size={14} />
                  <h3 className="w-32 font-bold text-[#00A154] text-xs">{category}</h3>
                  <p className="flex-1 text-white text-xs">{items.join(", ")}</p>
                </li>
              ))}
            </ul>
          </div>
        );
        break;

      case "neofetch":
        response = (
          <div className="flex gap-4 text-xs mt-2">
            <pre className="text-blue-500 font-bold leading-tight">
              {`
    /zzzzzzzz
   |_____ zz 
        /zz/ 
       /zz/  
      /zz/   
     /zz/    
    /zzzzzzzz
   |________/
              `}
            </pre>
            <div className="space-y-1 text-white">
              <p><span className="text-blue-500 font-bold">OS:</span> ZED OS v1.0</p>
              <p><span className="text-blue-500 font-bold">Host:</span> Yousef's-PC</p>
              <p><span className="text-blue-500 font-bold">Kernel:</span> React-19.0.0</p>
              <p><span className="text-blue-500 font-bold">Shell:</span> zsh 5.8</p>
              <p><span className="text-blue-500 font-bold">WM:</span> GSAP-Draggable</p>
              <p><span className="text-blue-500 font-bold">CPU:</span> Intel Core 2 Duo e4600</p>
              <p><span className="text-blue-500 font-bold">RAM:</span> 4GB RAM (DDR2)</p>
              <p><span className="text-blue-500 font-bold">GPU:</span> AMD R5 240 1GB</p>
            </div>
          </div>
        );
        break;

      case "clear":
        setHistory([]);
        return;

      default:
        response = cleanCmd ? <span className="text-red-400">zsh: command not found: {cleanCmd}</span> : "";
    }

    if (response !== null) {
      setHistory((prev) => [...prev, { type: "output", content: response }]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setHistory((prev) => [...prev, { type: "command", content: input }]);
      executeCommand(input);
      setInput("");
    }
  };

  return (
    /* FIXED: Added min-h-[450px] so it has a default size, but h-full keeps it synced with resize */
    <div className="flex flex-col h-full min-h-[450px] w-full overflow-hidden rounded-xl">
      <div id="window-header" className="!bg-transparent !border-none shrink-0">
        <WindowControls target="terminal" />
        <div className="flex items-center gap-2 text-white/50">
            <TerminalIcon size={14} />
            <h2 className="font-mono text-xs">zsh — yousef@zportfolio</h2>
        </div>
        <div className="w-10" />
      </div>

      <div 
        /* FIXED: Removed h-[400px]. flex-1 now fills the entire window background automatically */
        className="flex-1 bg-[#0A0B1A] text-white p-4 font-terminal text-sm overflow-y-auto scrollbar-hide border-t border-white/5"
        onClick={handleTerminalClick}
        ref={scrollRef}
      >
        <div className="space-y-2">
          {history.map((line, i) => (
            <div key={i} className="animate-in fade-in slide-in-from-left-2 duration-300">
              {line.type === "command" ? (
                <div className="flex gap-2">
                  <span className="text-blue-400 font-bold"> yousef </span>
                  <span className="text-indigo-400">➜</span>
                  <span className="text-white">{line.content}</span>
                </div>
              ) : (
                <div className={line.type === "system" ? "text-gray-500 italic text-xs" : ""}>
                  {line.content}
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
          <span className="text-blue-400 font-bold whitespace-nowrap"> yousef </span>
          <span className="text-indigo-400">➜</span>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-white caret-pink-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>
    </div>
  );
};

const TerminalWindow = WindowWrapper(Terminal, "terminal");
export default TerminalWindow;