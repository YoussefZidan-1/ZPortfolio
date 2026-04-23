import WindowWrapper from "#hoc/WindowWrapper.jsx";
import codeEditorRaw from "./CodeEditor.jsx?raw";
import { WindowControls } from "#components";
import { memo, useState, useMemo, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { ChevronRight, ChevronDown, Folder, FolderOpen, Code2, Braces, Hash, PanelLeft, Info, X } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";
import clsx from "clsx";

const globFiles = import.meta.glob([
  '/src/**/*.{jsx,js,css,json,ts,tsx}', 
  '/package.json',
  '/vite.config.js',
  '/eslint.config.js',
  '/index.html',
  '/README.md',
  '/vercel.json',
  '/jsconfig.json',
  '/LICENSE',
  '/.gitignore',
], { query: '?raw', import: 'default', eager: true });

const rawFiles = {
  ...globFiles,
  '/src/windows/CodeEditor.jsx': codeEditorRaw,
};

const buildFileTree = (files) => {
  const root = {};
  Object.entries(files).forEach(([path]) => {
    const parts = path.replace(/^\//, '').split('/');
    let current = root;

    parts.forEach((part, idx) => {
      if (idx === parts.length - 1) {
        current[part] = { type: 'file', name: part, path: path }; 
      } else {
        if (!current[part]) {
          current[part] = { type: 'folder', name: part, children: {} };
        }
        current = current[part].children;
      }
    });
  });
  return root;
};

const getLanguage = (name) => {
  if (name.endsWith('.js') || name.endsWith('.jsx')) return 'javascript';
  if (name.endsWith('.css')) return 'css';
  if (name.endsWith('.json')) return 'json';
  if (name.endsWith('.html')) return 'html';
  if (name.endsWith('.md')) return 'markdown';
  return 'plaintext';
};

const handleEditorWillMount = (monaco) => {
  monaco.editor.defineTheme("catppuccin-mocha", {
    base: "vs-dark",
    inherit: true,
    rules:[
      { token: "", foreground: "cdd6f4" }, 
      { token: "comment", foreground: "6c7086", fontStyle: "italic" }, 
      { token: "keyword", foreground: "cba6f7" }, 
      { token: "identifier", foreground: "cdd6f4" }, 
      { token: "string", foreground: "a6e3a1" }, 
      { token: "number", foreground: "fab387" }, 
      { token: "type", foreground: "f9e2af" }, 
      { token: "class", foreground: "f9e2af" }, 
      { token: "function", foreground: "8caaee" }, 
      { token: "variable", foreground: "cdd6f4" }, 
      { token: "constant", foreground: "fab387" }, 
      { token: "operator", foreground: "89dceb" }, 
      { token: "property", foreground: "74c7ec" },
      { token: "tag", foreground: "cba6f7" },              
      { token: "attribute.name", foreground: "8caaee" },    
      { token: "attribute.value", foreground: "a6e3a1" },   
      { token: "delimiter", foreground: "94e2d5" },
      { token: "string.key.json", foreground: "8caaee" },
      { token: "keyword.json", foreground: "cba6f7" },  
    ],
    colors: {
      "editor.background": "#1e1e2e", 
      "editor.foreground": "#cdd6f4", 
      "editorLineNumber.foreground": "#585b70", 
      "editorCursor.foreground": "#f5e0dc", 
      "editor.selectionBackground": "#45475a", 
      "editor.inactiveSelectionBackground": "#313244", 
      "editorIndentGuide.background": "#313244", 
      "editorIndentGuide.activeBackground": "#585b70", 
      "editorWidget.background": "#181825", 
      "scrollbarSlider.background": "#31324480",
      "scrollbarSlider.hoverBackground": "#45475a",
      "scrollbarSlider.activeBackground": "#585b70",
    },
  });
};

const FileTreeNode = ({ node, level, activePath, openFile, onFileClick }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isFolder = node.type === 'folder';
  const isActive = activePath === node.path;

  const getIcon = () => {
    if (isFolder) return isOpen ? <FolderOpen size={14} color="#8caaee" /> : <Folder size={14} color="#8caaee" />; 
    if (node.name.endsWith('.jsx')) return <span className="text-[#cba6f7] font-bold text-[10px]">JSX</span>; 
    if (node.name.endsWith('.js')) return <span className="text-[#f9e2af] font-bold text-[10px]">JS</span>; 
    if (node.name.endsWith('.css')) return <Hash size={14} color="#89dceb" />; 
    if (node.name.endsWith('.json')) return <Braces size={14} color="#a6e3a1" />; 
    return <Code2 size={14} color="#bac2de" />; 
  };

  const organicStyles = clsx(
    "relative overflow-hidden select-none transition-all duration-150 ease-out cursor-pointer active:scale-[0.97]",
    "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0 before:bg-[#313244] before:transition-all before:duration-300 before:ease-in-out hover:before:w-full",
    "flex items-center gap-1.5 py-1 px-2 text-sm whitespace-nowrap"
  );

  if (isFolder) {
    const children = Object.values(node.children).sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'folder' ? -1 : 1;
    });

    return (
      <div className="select-none">
        <div 
          className={clsx(organicStyles, "text-[#cdd6f4]")}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="relative z-10 flex items-center gap-1.5 pointer-events-none">
            {isOpen ? <ChevronDown size={14} color="#a6adc8" /> : <ChevronRight size={14} color="#a6adc8" />}
            {getIcon()}
            <span>{node.name}</span>
          </div>
        </div>
        {isOpen && children.map(child => (
          <FileTreeNode key={child.name} node={child} level={level + 1} activePath={activePath} openFile={openFile} onFileClick={onFileClick} />
        ))}
      </div>
    );
  }

  return (
    <div 
      className={clsx(
        organicStyles, 
        isActive ? "text-[#cdd6f4] before:w-full before:bg-[#45475a]" : "text-[#bac2de]"
      )}
      style={{ paddingLeft: `${level * 12 + 28}px` }}
      onClick={() => {
        openFile(node.path);
        if (onFileClick) onFileClick(); 
      }}
    >
      <div className="relative z-10 flex items-center gap-2 pointer-events-none">
        {getIcon()}
        <span>{node.name}</span>
      </div>
    </div>
  );
};

const CodeEditor = memo(() => {
  const { trigger } = useWebHaptics();
  const fileTree = useMemo(() => buildFileTree(rawFiles), []);
  
  const [openFiles, setOpenFiles] = useState(["/src/App.jsx"]); 
  const [activePath, setActivePath] = useState("/src/App.jsx");
  const [filesContent, setFilesContent] = useState(() => ({ ...rawFiles }));
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth > 768 : true
  );

  const [saveToast, setSaveToast] = useState(false);
  const toastTimeoutRef = useRef(null);

  const triggerSaveToast = useCallback(() => {
    trigger("success");
    setSaveToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setSaveToast(false), 5000);
  }, [trigger]);

  const openFile = (path) => {
    if (!openFiles.includes(path)) {
      setOpenFiles(prev => [...prev, path]);
    }
    setActivePath(path);
  };

  const closeFile = (path, e) => {
    e.preventDefault();
    e.stopPropagation();
    const newFiles = openFiles.filter(f => f !== path);
    setOpenFiles(newFiles);
    if (activePath === path) {
      setActivePath(newFiles[newFiles.length - 1] || "");
    }
  };

  useEffect(() => {
      const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
          e.preventDefault();
          setIsSidebarOpen(prev => !prev);
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
          e.preventDefault();
          triggerSaveToast();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [triggerSaveToast]);

  const handleEditorDidMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      triggerSaveToast();
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB, () => {
      setIsSidebarOpen(p => !p);
    });
  };

  const handleEditorChange = (value) => {
    setFilesContent((prev) => ({
      ...prev, [activePath]: value
    }));
  };

  const activeFileContent = activePath ? filesContent[activePath] : null;
  const activeFileName = activePath ? activePath.split('/').pop() : "No file open";
  const activeLanguage = getLanguage(activeFileName);

  return (
    <>
      <div id="window-header" className="shrink-0 text-[#cdd6f4] relative flex items-center justify-center z-10">
        <WindowControls target="vscode" />
        <PanelLeft 
          className="hidden max-md:block absolute left-14 text-[#a6adc8] hover:text-[#cdd6f4] cursor-pointer z-50 transition-transform active:scale-95" 
          size={20} 
          onClick={(e) => {
            e.stopPropagation();
            setIsSidebarOpen(!isSidebarOpen);
          }} 
        />
        <h2 className="text-sm font-medium pr-4 truncate w-full text-center">ZED Code — {activeFileName}</h2>
      </div>

      <div className="flex-1 w-full bg-[#1e1e2e] min-h-0 flex flex-row relative overflow-hidden">
        
        {/* EASTER EGG TOAST */}
        <div 
          className={`absolute bottom-6 right-6 z-[100] bg-[#1e1e2e] border border-[#313244] shadow-2xl rounded-lg p-4 max-w-[320px] transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
            saveToast ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex items-start gap-3">
            <Info className="text-[#8caaee] mt-0.5 shrink-0" size={18} />
            <div className="flex flex-col gap-1.5">
              <span className="text-[#cdd6f4] text-sm font-semibold leading-tight">Nice try! 😏</span>
              <span className="text-[#bac2de] text-xs leading-relaxed">
                Actually, you are the only one seeing this. Go to GitHub and send me a PR if you dare! 
                <a href="https://github.com/YoussefZidan-1/zportfolio" target="_blank" rel="noopener noreferrer" className="text-[#cba6f7] hover:underline font-bold flex items-center gap-1 mt-1.5 w-fit">
                  Open Repository <span className="font-terminal text-2xl font-normal px-2"></span>
                </a>
              </span>
            </div>
          </div>
        </div>

        <div 
          className={`md:hidden absolute inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-in-out ${
            isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsSidebarOpen(false)}
        />

        <div 
          className={`shrink-0 border-[#11111b] overflow-hidden transition-all duration-300 ease-in-out z-50 bg-[#181825] 
            max-md:absolute max-md:h-full max-md:shadow-2xl 
            ${isSidebarOpen ? "max-md:translate-x-0 md:w-56 border-r" : "max-md:-translate-x-full md:w-0 border-r-0"}
          `}
        >
          <div className="w-60 md:w-56 pt-3 pb-6 h-full flex flex-col vscode-scroll">
            <div className="flex items-center justify-between px-4 mb-2">
              <span className="text-[11px] text-[#a6adc8] font-semibold uppercase tracking-wider">Explorer</span>
            </div>
            <div className="flex-1 overflow-y-auto vscode-scroll">
              {Object.values(fileTree).sort((a, b) => a.type === 'folder' ? -1 : 1).map(node => (
                <FileTreeNode 
                  key={node.name} 
                  node={node} 
                  level={0} 
                  activePath={activePath} 
                  openFile={openFile}
                  onFileClick={() => {
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e2e]">
          {/* FIXED TAB BAR */}
          <div className="flex bg-[#11111b] shrink-0 items-center h-10 w-full overflow-hidden">
            {/* Toggle Button: Outside the scrollable area so it's ALWAYS clickable */}
            <button 
              onClick={() => setIsSidebarOpen(p => !p)}
              className="p-2 ml-1 text-[#a6adc8] hover:text-[#cdd6f4] transition-colors md:block hidden cursor-pointer z-20 shrink-0"
              title="Toggle Sidebar (Ctrl+B)"
            >
              <PanelLeft size={16} />
            </button>

            {/* Tabs: This part scrolls */}
            <div className="flex-1 flex h-full overflow-x-auto scrollbar-hide items-center">
              {openFiles.map((path) => {
                const fileName = path.split('/').pop();
                const isActive = path === activePath;
                return (
                  <div 
                    key={path}
                    onClick={() => setActivePath(path)}
                    className={clsx(
                      "group flex items-center gap-2 px-3 py-2 text-xs cursor-pointer transition-all duration-200 border-r border-[#11111b] min-w-fit h-full select-none",
                      isActive 
                        ? "bg-[#1e1e2e] text-[#cdd6f4] border-t-2 border-t-[#cba6f7]" 
                        : "bg-[#181825] text-[#a6adc8] hover:bg-[#24273a]"
                    )}
                  >
                    <span className={clsx("font-medium", isActive && "text-white")}>{fileName}</span>
                    <X 
                      size={12} 
                      className={clsx(
                        "opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-sm transition-all z-30",
                        isActive && "opacity-50"
                      )} 
                      onClick={(e) => closeFile(path, e)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-1 w-full min-h-0 pt-2 relative flex items-center justify-center">
            {activePath ? (
              <Editor
                height="100%"
                language={activeLanguage}
                theme="catppuccin-mocha"
                value={activeFileContent || "// File not found or empty"}
                onChange={handleEditorChange}
                beforeMount={handleEditorWillMount}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  readOnly: false,
                  wordWrap: "on",
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorSmoothCaretAnimation: 'on',
                  cursorBlinking: "expand",
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 }
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
                <img src="/images/logo.svg" alt="Arch" className="w-32 h-32 opacity-20 grayscale brightness-200" />
                <p className="text-[#585b70] text-xs font-terminal mt-4">No file selected</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
});

const CodeEditorWindow = WindowWrapper(CodeEditor, "vscode");
export default CodeEditorWindow;