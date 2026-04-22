import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { WindowControls } from "#components";
import { memo, useState, useMemo, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { ChevronRight, ChevronDown, Folder, FolderOpen, Code2, Braces, Hash, PanelLeft, Info} from "lucide-react";
import { useWebHaptics } from "web-haptics/react";

const rawFiles = import.meta.glob([
  '/src/**/*.{jsx,js,css}',
  '/package.json',
  '/vite.config.js',
  '/eslint.config.js',
  '/index.html'
], { query: '?raw', import: 'default', eager: true });

const buildFileTree = (files) => {
  const root = {};
  Object.entries(files).forEach(([path]) => {
    const cleanPath = path.replace(/^\//, ''); 
    const parts = cleanPath.split('/');
    let current = root;

    parts.forEach((part, idx) => {
      if (idx === parts.length - 1) {
        current[part] = { type: 'file', name: part, path: cleanPath };
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

const FileTreeNode = ({ node, level, activePath, setActivePath, onFileClick }) => {
  const[isOpen, setIsOpen] = useState(true);
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

  if (isFolder) {
    const children = Object.values(node.children).sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'folder' ? -1 : 1;
    });

    return (
      <div className="select-none">
        <div 
          className="flex items-center gap-1.5 py-1 px-2 cursor-pointer hover:bg-[#313244] text-[#cdd6f4] text-sm whitespace-nowrap transition-colors"
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronDown size={14} color="#a6adc8" /> : <ChevronRight size={14} color="#a6adc8" />}
          {getIcon()}
          <span>{node.name}</span>
        </div>
        {isOpen && children.map(child => (
          <FileTreeNode key={child.name} node={child} level={level + 1} activePath={activePath} setActivePath={setActivePath} onFileClick={onFileClick} />
        ))}
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center gap-2 py-1 cursor-pointer text-sm whitespace-nowrap transition-colors ${
        isActive ? 'bg-[#45475a] text-[#cdd6f4]' : 'hover:bg-[#313244] text-[#bac2de]'
      }`}
      style={{ paddingLeft: `${level * 12 + 28}px` }}
      onClick={() => {
        setActivePath(node.path);
        if (onFileClick) onFileClick(); 
      }}
    >
      {getIcon()}
      <span>{node.name}</span>
    </div>
  );
};

// 🖥️ Main CodeEditor Component
const CodeEditor = memo(() => {
  const { trigger } = useWebHaptics();
  const fileTree = useMemo(() => buildFileTree(rawFiles), []);
  const[activePath, setActivePath] = useState("src/App.jsx");
  const [filesContent, setFilesContent] = useState(() => ({ ...rawFiles }));
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth > 768 : true
  );

  // 💾 Easter Egg Toast State
  const[saveToast, setSaveToast] = useState(false);
  const toastTimeoutRef = useRef(null);

  const triggerSaveToast = useCallback(() => {
    trigger("success");
    setSaveToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setSaveToast(false), 5000);
  }, [trigger]);

  // ⌨️ Global Keyboard Shortcut Listener
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
      ...prev,[`/${activePath}`]: value
    }));
  };

  const activeFileContent = filesContent[`/${activePath}`] || "// File not found or empty";
  const activeFileName = activePath.split('/').pop();
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
        
        {/* 🍞 EASTER EGG TOAST NOTIFICATION */}
        <div 
          className={`absolute bottom-6 right-6 z-[100] bg-[#1e1e2e] border border-[#313244] shadow-2xl rounded-lg p-4 max-w-[320px] transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
            saveToast ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex items-start gap-3">
            <Info className="text-[#8caaee] mt-0.5 shrink-0" size={18} />
            <div className="flex flex-col gap-1.5">
              <span className="text-[#cdd6f4] text-sm font-semibold leading-tight">
                Nice try! 😏
              </span>
              <span className="text-[#bac2de] text-xs leading-relaxed">
                Actually, you are the only one seeing this. Go to GitHub and send me a PR if you dare! 
                <a href="https://github.com/YoussefZidan-1/zportfolio" target="_blank" rel="noopener noreferrer" className="text-[#cba6f7] hover:underline font-bold flex items-center gap-1 mt-1.5 w-fit">
                  Open Repository
                <span className="font-terminal text-2xl font-normal px-2"></span>
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
                  setActivePath={setActivePath}
                  onFileClick={() => {
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e2e]">
          
          <div className="flex bg-[#11111b] overflow-x-auto scrollbar-hide shrink-0 items-center">
            <button 
              onClick={() => setIsSidebarOpen(p => !p)}
              className="p-2 ml-1 text-[#a6adc8] hover:text-[#cdd6f4] transition-colors md:block hidden cursor-pointer"
              title="Toggle Sidebar (Ctrl+B)"
            >
              <PanelLeft size={16} />
            </button>

            <div className="px-4 py-2 text-sm whitespace-nowrap border-t-2 bg-[#1e1e2e] text-[#cdd6f4] border-[#cba6f7] flex items-center gap-2">
              <span className="text-[#cba6f7] font-bold text-[10px]">
                {activeFileName.split('.').pop().toUpperCase()}
              </span>
              <span>{activeFileName}</span>
            </div>
          </div>

          <div className="flex-1 w-full min-h-0 pt-2 relative">
            <Editor
              height="100%"
              language={activeLanguage}
              theme="catppuccin-mocha"
              value={activeFileContent}
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
                scrollbar: {
                  verticalScrollbarSize: 10,
                  horizontalScrollbarSize: 10,
                }
              }}
            />
          </div>

        </div>
      </div>
    </>
  );
});

const CodeEditorWindow = WindowWrapper(CodeEditor, "vscode");
export default CodeEditorWindow;