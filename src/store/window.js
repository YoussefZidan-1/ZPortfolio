import { INITIAL_Z_INDEX, WINDOW_CONFIG, dockApps } from "#constants";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

const useWindowStore = create(
  immer((set) => ({
    windows: WINDOW_CONFIG,
    dockItems: dockApps,
    nextZIndex: INITIAL_Z_INDEX + 1,
    removeDockItem: (id) => set((state) => {
      if (id === 'finder' || id === 'trash') return;
      state.dockItems = state.dockItems.filter(item => item.id !== id);
    }),
    moveDockItem: (id1, id2) => set((state) => {
      const idx1 = state.dockItems.findIndex(i => i.id === id1);
      const idx2 = state.dockItems.findIndex(i => i.id === id2);
      if (idx1 === -1 || idx2 === -1 || idx1 === idx2) return;
      
      const temp = state.dockItems[idx1];
      state.dockItems[idx1] = state.dockItems[idx2];
      state.dockItems[idx2] = temp;
    }),
    openWindow: (windowKey, data = null, launchPos = null) =>
      set((state) => {
        const win = state.windows[windowKey];
        if (!win) return;
        win.isOpen = true;
        win.zIndex = state.nextZIndex;
        win.data = data ?? win.data;
        win.launchPos = launchPos;
        state.nextZIndex++;
      }),
    closeWindow: (windowKey) => set((state) => {
      const win = state.windows[windowKey];
      if (!win) return;
      win.isOpen = false;
      win.zIndex = INITIAL_Z_INDEX;
      win.data = null;
      win.launchPos = null;
    }),
    toggleMaximize: (windowKey) => set((state) => {
      const win = state.windows[windowKey];
      if (win) win.isMaximized = !win.isMaximized;
    }),
    focusWindow: (windowKey) => set((state) => {
      const win = state.windows[windowKey];
      if (!win) return;
      win.zIndex = state.nextZIndex++;
    }),
  })),
);

export default useWindowStore;