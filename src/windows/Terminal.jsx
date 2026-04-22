import React, { useState, useRef, useEffect } from "react";
import { useWebHaptics } from "web-haptics/react";
import { techStack } from "#constants";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { Check, Terminal as TerminalIcon } from "lucide-react";
import WindowControls from "#components/WindowControls.jsx";
import useWindowStore from "#store/window.js"; 

// 📁 Virtual File System (VFS)
const fileSystem = {
  "about_me.txt": { type: "file", content: "Hey! I'm Youssef 👋, a Creative developer who enjoys building sleek, interactive websites that actually work well.\nI specialize in JavaScript, React, and GSAP—and I love making things feel smooth, fast, and just a little bit delightful." },
  "certificates": { 
    type: "dir", 
    content: { 
      "cs50x.md": { type: "file", content: "Harvard CS50x Certificate\nCompleted: June 27, 2025\nLink: https://cs50.harvard.edu/certificates/4e5fe04c-408a-40f9-9da4-126af12a296f" },
      "responsive_web.md": { type: "file", content: "freeCodeCamp Responsive Web Design\nCompleted: Jan 11, 2026" },
      "js_algorithms.md": { type: "file", content: "freeCodeCamp JavaScript Algorithms and Data Structures\nCompleted: Feb 19, 2026" }
    } 
  },
  "projects": { 
    type: "dir", 
    content: { 
      "zcinema.txt": { type: "file", content: "ZCinema\nA sleek and modern platform designed for searching films and trending lists.\nBuilt with React.js and Tailwind." },
      "zproximity.txt": { type: "file", content: "ZProximity Engine\nA modern platform designed to help programmers make high-performance organic animations using GSAP." }
    } 
  },
  "techstack.md": { type: "file", content: "SPECIAL" },
  "contact.ink": { type: "file", content: "Email: zedstudios.devs@gmail.com\nLinkedIn: https://www.linkedin.com/in/yousef-zedan-6a275a400/\nGithub: https://github.com/YoussefZidan-1/" }
};

// 🚀 App Executables map
const SYSTEM_APPS = {
  "zen-browser": { id: "safari", name: "Zen Browser" },
  "safari": { id: "safari", name: "Zen Browser" },
  "projects": { id: "finder", name: "Projects Explorer" },
  "finder": { id: "finder", name: "Projects Explorer" },
  "gallery": { id: "photos", name: "Photos Gallery" },
  "photos": { id: "photos", name: "Photos Gallery" },
  "contact": { id: "contact", name: "Contact Manager" },
  "resume": { id: "resume", name: "Resume Viewer" },
  "code": {id: "vscode", name: "ZED Code Editor"}
};

// Valid commands for Syntax Highlighting & Auto-complete
const validCommands =[
  "help", "ls", "cd", "pwd", "cat", "xdg-open", "whoami", "fastfetch", "neofetch", "clear", "kill", "sudo",
  ...Object.keys(SYSTEM_APPS)
];

const Terminal = () => {
  const { trigger } = useWebHaptics();
  const openWindow = useWindowStore((s) => s.openWindow);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const [input, setInput] = useState("");
  const[cwd, setCwd] = useState([]); 
  
  // Terminal History states
  const [history, setHistory] = useState([
    { type: "system", content: "Welcome to Z-Shell v1.0.7 (stable)" },
    { type: "system", content: "Type 'help' to see available commands." },
  ]);
  const [cmdHistory, setCmdHistory] = useState([]);
  const[historyIndex, setHistoryIndex] = useState(-1);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const el = document.getElementById("terminal");
    if (el && !el.style.height) {
      el.style.height = "450px"; 
    }
  },[]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  const resolveNode = (pathArray) => {
    let node = { type: 'dir', content: fileSystem };
    for (const p of pathArray) {
      if (node.type === 'dir' && node.content[p]) {
        node = node.content[p];
      } else {
        return null; 
      }
    }
    return node;
  };

  const resolvePath = (target) => {
    if (!target) return { node: resolveNode(cwd), path: cwd };
    if (target === '~') return { node: resolveNode([]), path:[] };
    
    let currentPath = target.startsWith('~') || target.startsWith('/') ? [] : [...cwd];
    const parts = target.replace(/^~?\/?/, '').split('/').filter(Boolean);
    
    for (const p of parts) {
      if (p === '.') continue;
      if (p === '..') {
        currentPath.pop();
      } else {
        currentPath.push(p);
      }
    }
    return { node: resolveNode(currentPath), path: currentPath };
  };

  // 📝 Real-time ZSH Auto-Suggestion Engine
  const getSuggestion = () => {
    if (!input) return "";
    
    const parts = input.split(" ");
    const cmd = parts[0].toLowerCase();
    const lastPart = parts[parts.length - 1];
    
    // Command Suggestion
    if (parts.length === 1) {
          const matches = validCommands.filter(c => c.startsWith(input));
          if (matches.length > 0) {
            return matches[0].substring(input.length) + " "; 
          }
          return "";
        }
    if (cmd === "kill") {
          const appKeys = Object.keys(SYSTEM_APPS);
          const matches = appKeys.filter(app => app.startsWith(lastPart));
          if (matches.length > 0) {
            return matches[0].substring(lastPart.length);
          }
          return "";
        }

    // Path / File Suggestion
    const target = parts[parts.length - 1];
    if (!target) return ""; 

    if (!lastPart && input.endsWith(" ")) return "";
    const lastSlashIdx = target.lastIndexOf("/");
    const dirPart = lastSlashIdx !== -1 ? target.substring(0, lastSlashIdx) : "";
    const filePart = lastSlashIdx !== -1 ? target.substring(lastSlashIdx + 1) : target;
    
    const { node } = resolvePath(dirPart);
    if (node && node.type === "dir") {
      const matches = Object.keys(node.content).filter(k => k.startsWith(filePart));
      if (matches.length > 0) {
        const match = matches[0]; // Suggest first alphabetical match
        const isDir = node.content[match].type === "dir";
        const remainder = match.substring(filePart.length);
        return remainder + (isDir ? "/" : "");
      }
    }
    return "";
  };

  const suggestionText = getSuggestion();

  // ⌨️ Keyboard Shortcuts (Arrows & Tab)
  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const nextIndex = historyIndex + 1 < cmdHistory.length ? historyIndex + 1 : historyIndex;
        setHistoryIndex(nextIndex);
        setInput(cmdHistory[cmdHistory.length - 1 - nextIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(cmdHistory[cmdHistory.length - 1 - nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (suggestionText) setInput(input + suggestionText);
    } else if (e.key === "ArrowRight") {
      // Accept suggestion if the user presses right arrow at the end of their input
      if (inputRef.current?.selectionStart === input.length && suggestionText) {
        e.preventDefault();
        setInput(input + suggestionText);
      }
    }
  };

  const executeCommand = (cmdText) => {
    const args = cmdText.trim().split(/\s+/);
    const cmd = args[0].toLowerCase();
    
    if (validCommands.includes(cmd) || SYSTEM_APPS[cmd]) {
          trigger("nudge");
        } else {
          trigger("error");
        }
    
    const arg = args[1];
    let response = null;

    if (SYSTEM_APPS[cmd]) {
      openWindow(SYSTEM_APPS[cmd].id);
      response = <span className="text-blue-400">Launching {SYSTEM_APPS[cmd].name}...</span>;
    } 
    else {
      switch (cmd) {
        case "help":
          response = (
            <div className="text-gray-400">
              Available commands: <br />
              <span className="text-blue-400 font-bold">- help:</span> Show this menu <br />
              <span className="text-blue-400 font-bold">- ls [dir]:</span> List directory contents <br />
              <span className="text-blue-400 font-bold">- cd [dir]:</span> Change directory <br />
              <span className="text-blue-400 font-bold">- pwd:</span> Print working directory <br />
              <span className="text-blue-400 font-bold">- cat [file]:</span> Display file content in terminal <br />
              <span className="text-blue-400 font-bold">- kill [app]:</span> Kill app <br />
              <span className="text-blue-400 font-bold">- xdg-open[file]:</span> Open file in graphical window <br />
              <span className="text-blue-400 font-bold">- whoami:</span> About the developer <br />
              <span className="text-blue-400 font-bold">- fastfetch:</span> System information <br />
              <span className="text-blue-400 font-bold">- clear:</span> Clear terminal output <br /><br />
              <span className="text-gray-500">Global Executables:</span> <span className="text-white">zen-browser, projects, gallery, contact, resume, code</span>
            </div>
          );
          break;

        case "ls": {
          const { node } = resolvePath(arg || "");
          if (!node) {
            response = <span className="text-red-400">ls: no such file or directory: {arg}</span>;
          } else if (node.type === "file") {
            response = <span className="text-white">{arg}</span>;
          } else {
            const keys = Object.keys(node.content);
            response = (
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {keys.map(k => (
                  <span key={k} className={node.content[k].type === "dir" ? "text-blue-400 font-bold" : "text-white"}>
                    {k}{node.content[k].type === "dir" ? '/' : ''}
                  </span>
                ))}
              </div>
            );
          }
          break;
        }

        case "cd": {
          const target = arg || "~";
          const { node, path } = resolvePath(target);
          if (!node) {
            response = <span className="text-red-400">cd: no such file or directory: {arg}</span>;
          } else if (node.type !== "dir") {
            response = <span className="text-red-400">cd: not a directory: {arg}</span>;
          } else {
            setCwd(path);
            return; 
          }
          break;
        }

        case "pwd":
          response = <span className="text-white">~{cwd.length ? '/' + cwd.join('/') : ''}</span>;
          break;

        case "cat": {
          if (!arg) {
            response = <span className="text-red-400">cat: missing file operand</span>;
            break;
          }
          const { node } = resolvePath(arg);
          if (!node) {
            response = <span className="text-red-400">cat: {arg}: No such file or directory</span>;
          } else if (node.type === "dir") {
            response = <span className="text-red-400">cat: {arg}: Is a directory</span>;
          } else {
            if (arg === "techstack.md" || arg.endsWith("/techstack.md")) {
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
                        <h3 className="w-32 font-bold text-[#00A154] text-xs">
                          {category}
                        </h3>
                        <p className="flex-1 text-white text-xs">
                          {items.join(", ")}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            } else {
              response = <span className="text-white whitespace-pre-wrap leading-relaxed">{node.content}</span>;
            }
          }
          break;
        }

        case "xdg-open": {
          if (!arg) {
            response = <span className="text-red-400">xdg-open: missing file operand</span>;
            break;
          }
          if (SYSTEM_APPS[arg]) {
            openWindow(SYSTEM_APPS[arg].id);
            response = <span className="text-blue-400">Launching {SYSTEM_APPS[arg].name}...</span>;
            break;
          }
          
          const { node, path } = resolvePath(arg);
          if (!node) {
            response = <span className="text-red-400">xdg-open: {arg}: No such file or directory</span>;
          } else if (node.type === "dir") {
            response = <span className="text-red-400">xdg-open: {arg}: Is a directory</span>;
          } else {
            const fileName = path[path.length - 1];
            if (fileName === "techstack.md") {
              response = <span className="text-blue-400">techstack.md is a CLI-only module. Use 'cat techstack.md'</span>;
            } else {
              openWindow("txtfile", {
                id: fileName,
                name: fileName,
                description: node.content.split('\n')
              });
              response = <span className="text-blue-400">Opening {fileName} in Text Editor...</span>;
            }
          }
          break;
        }
          
        case "kill": {
                  if (!arg) {
                    response = <span className="text-red-400">kill: missing operand</span>;
                    break;
                  }
                  
                  const targetApp = arg.toLowerCase();
                  
                  if (SYSTEM_APPS[targetApp]) {
                    closeWindow(SYSTEM_APPS[targetApp].id);
                    response = <span className="text-blue-400">Killing {SYSTEM_APPS[targetApp].name}...</span>;
                  } else {
                    response = <span className="text-red-400">kill: {arg}: process not found</span>;
                  }
                  break;
                }

        case "whoami":
          response = (
            <span className="text-white">
              Yousef Zedan - Creative Developer & GSAP Wizard.
            </span>
          );
          break;

        case "fastfetch":
          response = (
            <div className="flex gap-4 text-xs mt-2">
              <pre className="text-blue-500 font-bold leading-tight">
                {`
      /ZZZZZZZZ
     |_____ ZZ
          /ZZ/
         /ZZ/
        /ZZ/
       /ZZ/
      /ZZZZZZZZ
     |________/
                `}
              </pre>
              <div className="space-y-1 text-white">
                <p><span className="text-blue-500 font-bold">OS:</span> ZED OS v6.7</p>
                <p><span className="text-blue-500 font-bold">Distro:</span> CachyOS (Based on Arch BTW)</p>
                <p><span className="text-blue-500 font-bold">Host:</span> Yousef's-PC</p>
                <p><span className="text-blue-500 font-bold">Kernel:</span> React-19</p>
                <p><span className="text-blue-500 font-bold">Shell:</span> zsh 5.8</p>
                <p><span className="text-blue-500 font-bold">WM:</span> GSAP-Draggable</p>
                <p><span className="text-blue-500 font-bold">CPU:</span> Intel Core 2 Duo e4600 @ 2.40 GHz</p>
                <p><span className="text-blue-500 font-bold">RAM:</span> 4GB RAM (DDR2)</p>
                <p><span className="text-blue-500 font-bold">GPU:</span> AMD R5 240 1GB VRAM</p>
              </div>
            </div>
          );
          break;
        
          case "neofetch":
            response = (
              <div className="flex flex-col">
                <span className="text-[#fb7185]">zsh: command not found: neofetch</span>
                <span className="text-gray-500 italic mt-1">
                  "You are so old... use <span className="text-white">fastfetch</span>, stupid! 🙄"
                </span>
              </div>
            );
          break;
        
          case "sudo": {
            response = (
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-white">[sudo] password for yousef:</span>
                  <span className="text-[#fb7185]/90 animate-pulse"></span>
                </div>
                <div className="text-red-400 mt-1 font-bold">
                  Exaaaacttlllyyyy! You don't know it because I AM the super user here. 😎👑
                </div>
                <span className="text-gray-500 text-xs italic">
                  (Trying to bypass ZED OS security? Cute 󰄛 .)
                </span>
              </div>
            );
            break;
          }

        case "clear":
          setHistory([]);
          return;

        default:
          response = cmd ? (
            <span className="text-red-400">
              zsh: command not found: {cmd}
            </span>
          ) : (
            ""
          );
      }
    }

    if (response !== null) {
      setHistory((prev) =>[...prev, { type: "output", content: response }]);
    }
  };

  const currentDirStr = `~${cwd.length ? '/' + cwd.join('/') : ''}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanInput = input.trim();
    if (cleanInput) {
      setHistory((prev) =>[...prev, { type: "command", content: input, dir: currentDirStr }]);
      
      if (cmdHistory[cmdHistory.length - 1] !== cleanInput) {
        setCmdHistory(prev => [...prev, cleanInput]);
      }
      
      setHistoryIndex(-1);
      executeCommand(input);
      setInput("");
    } else {
      setHistory((prev) => [...prev, { type: "command", content: "", dir: currentDirStr }]);
    }
  };

  const handleInputScroll = (e) => {
    if (overlayRef.current) {
      overlayRef.current.style.transform = `translateX(-${e.target.scrollLeft}px)`;
    }
  };

  // 🌈 Syntax Highlighting Logic
  const cmdWord = input.split(" ")[0];
  const restOfCmd = input.substring(cmdWord.length);
  const isKnownCommand = validCommands.includes(cmdWord);
  const cmdColor = cmdWord ? (isKnownCommand ? "text-[#10b981]" : "text-[#fb7185]") : "";

  return (
    <div className="flex flex-col h-full w-full overflow-hidden rounded-xl">
      <div id="window-header" className="shrink-0">
        <WindowControls target="terminal" />
        <div className="flex items-center gap-2 text-white/50">
          <TerminalIcon size={14} />
          <h2 className="font-mono text-xs">zsh — yousef@zportfolio</h2>
        </div>
        <div className="w-10" />
      </div>

      <div
        className="flex-1 bg-[#0A0B1A] text-white p-4 font-terminal text-sm overflow-y-auto scrollbar-hide border-t border-white/5"
        onClick={handleTerminalClick}
        ref={scrollRef}
      >
        <div className="space-y-2">
          {history.map((line, i) => (
            <div
              key={i}
              className="animate-in fade-in slide-in-from-left-2 duration-300"
            >
              {line.type === "command" ? (
                <div className="flex gap-2">
                  <span className="text-blue-400 font-bold whitespace-nowrap"> yousef </span>
                  <span className="text-indigo-400 whitespace-nowrap">{line.dir} ➜</span>
                  <span className="text-white break-all">{line.content}</span>
                </div>
              ) : (
                <div
                  className={
                    line.type === "system" ? "text-gray-500 italic text-xs" : ""
                  }
                >
                  {line.content}
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 mt-2 items-center relative">
          <span className="text-blue-400 font-bold whitespace-nowrap">
             yousef 
          </span>
          <span className="text-indigo-400 whitespace-nowrap">{currentDirStr} ➜</span>
          
          <div className="relative flex-1 flex items-center h-[20px] overflow-hidden">

            <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center">
              <div ref={overlayRef} className="whitespace-pre font-terminal text-sm flex items-center w-max h-full">
                <span className={`${cmdColor} font-bold`}>{cmdWord}</span>
                <span className="text-white">{restOfCmd}</span>
                <span className="text-white/30">{suggestionText}</span>
              </div>
            </div>
            
            <input
              ref={inputRef}
              type="text"
              className="w-full h-full bg-transparent border-none outline-none text-transparent caret-pink-500 font-terminal text-sm m-0 p-0"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setHistoryIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              onScroll={handleInputScroll}
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

const TerminalWindow = WindowWrapper(Terminal, "terminal");
export default TerminalWindow;