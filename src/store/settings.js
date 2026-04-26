import { create } from "zustand";

const useSettingsStore = create((set) => ({
  volume: 0.5,
  isMuted: false,
  setVolume: (val) => set({ volume: val, isMuted: val === 0 }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  isDarkMode: false,
  toggleDarkMode: () => set((state) => {
    const nextMode = !state.isDarkMode;
    if (nextMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    return { isDarkMode: nextMode };
  }),
}));

export default useSettingsStore;