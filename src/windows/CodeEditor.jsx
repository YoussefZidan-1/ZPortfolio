import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { WindowControls } from "#components";
import { memo } from "react";

const CodeEditor = memo(() => {
  return (
    <>
      {/* Draggable Header */}
      <div id="window-header" className="shrink-0 border-b border-[#333] text-gray-300">
        <WindowControls target="vscode" />
        <h2 className="text-sm font-medium pr-4 truncate w-full text-center">App.jsx — ZED CodeEditor</h2>
      </div>

      {/* The iframe Editor */}
      <div className="flex-1 w-[750px] bg-[#1e1e1e] relative min-h-0 h-[500px]">
        <iframe
          // StackBlitz React/Vite template embedded in dark mode!
          src="https://stackblitz.com/edit/vitejs-vite-r26ruzwf?embed=1&file=src%2FApp.jsx"
          className="w-full h-full border-none"
          title="VS Code Sandbox"
          allow="cross-origin-isolated"
        />
      </div>
    </>
  );
});

// Wrap it so it becomes a draggable, resizable OS window
const CodeEditorWindow = WindowWrapper(CodeEditor, "vscode");
export default CodeEditorWindow;