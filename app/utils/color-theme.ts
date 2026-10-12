import { THEMES } from '~~/shared/atproto/lexicons'

export function applyColorTheme(theme: Theme) {
  const { classList } = document.documentElement
  for (const name of THEMES) classList.remove(name)
  if (theme !== 'default') classList.add(theme)

  try {
    localStorage.setItem(COLOR_THEME_KEY, theme)
  } catch {}
}

export function getColorThemeBootScript(): string {
  return `try{var t=localStorage.getItem(${JSON.stringify(COLOR_THEME_KEY)});if(t&&t!=='default'&&${JSON.stringify(THEMES)}.includes(t))document.documentElement.classList.add(t)}catch(e){}`
}
