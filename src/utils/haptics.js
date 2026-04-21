// A simple helper for haptic feedback
export const triggerHaptic = (type = "light") => {
  if (!window.navigator.vibrate) return;

  switch (type) {
    case "light":
      window.navigator.vibrate(10); // Short "taptic" pulse
      break;
    case "medium":
      window.navigator.vibrate(20);
      break;
    case "success":
      window.navigator.vibrate([10, 30, 10]); // Double pulse
      break;
    case "error":
      window.navigator.vibrate([50, 100, 50]); // Heavy pulse
      break;
    default:
      window.navigator.vibrate(10);
  }
};