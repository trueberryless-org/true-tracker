// Utility function to set the theme
export function setTheme(theme: any) {
  const htmlElement = document.documentElement;
  const themes = [
    "default",
    "palette",
    "sapphire",
    "ruby",
    "emerald",
    "coral",
    "amber",
    "amethyst",
    "daylight",
    "midnight",
  ];

  // Remove all theme classes
  themes.forEach((t) => htmlElement.classList.remove(t));

  // Add the new theme class if it's not 'gray'
  if (theme !== "default") {
    htmlElement.classList.add(theme);
  }
}

// Utility function to get the current theme
export function getCurrentTheme() {
  const htmlElement = document.documentElement;
  const themes = [
    "default",
    "palette",
    "sapphire",
    "ruby",
    "emerald",
    "coral",
    "amber",
    "amethyst",
    "daylight",
    "midnight",
  ];

  for (const theme of themes) {
    if (htmlElement.classList.contains(theme)) {
      return theme;
    }
  }
  return "default";
}
