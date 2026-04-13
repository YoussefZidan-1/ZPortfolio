import { INITIAL_Z_INDEX, WINDOW_CONFIG } from "#constants";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

const useWindowStore = create(
  immer((set) => ({
    windows: WINDOW_CONFIG,
    nextZIndex: INITIAL_Z_INDEX + 1,
    openWindow: (windowKey, data = null) =>
      set((state) => {
        const win = state.windows[windowKey];
        win.isOpen = true;
        win.zIndex = state.nextZIndex;
        win.data = data ?? win.data;
        state.nextZIndex++;
      }),
    closeWindow: (windowKey) => set((state) => {
      const win = state.windows[windowKey];
      if (!win) return;
      win.isOpen = false;
      win.isMaximized = false; // Reset maximize on close
      win.zIndex = INITIAL_Z_INDEX;
      win.data = null;
    }),
    // ADD THIS FUNCTION
    toggleMaximize: (windowKey) => set((state) => {
      const win = state.windows[windowKey];
      if (win) win.isMaximized = !win.isMaximized;
    }),
    focusWindow: (windowKey) => set((state) => {
      const win = state.windows[windowKey];
      win.zIndex = state.nextZIndex++;
    }),
  })),
);
export default useWindowStore;