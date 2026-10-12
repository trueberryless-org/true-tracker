import { readFileSync, writeFileSync } from 'node:fs'

const [input, output] = process.argv.slice(2)
const css = readFileSync(input, 'utf8')
const blocks = {}
for (const match of css.matchAll(/([.:\w\s-]+?)\s*\{([^{}]*)\}/g)) {
  const selector = match[1].trim()
  const vars = {}
  for (const v of match[2].matchAll(/--([\w-]+):\s*([^;]+);/g)) vars[v[1]] = v[2].trim()
  blocks[selector] = { ...blocks[selector], ...vars }
}

const parse = (value) => value.match(/[\d.]+/g).map(Number)
function toRgb([h, s, l]) {
  s /= 100
  l /= 100
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0), f(8), f(4)].map((c) => Math.round(c * 255))
}
const lum = (rgb) => {
  const [r, g, b] = rgb.map((c) => {
    c /= 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a, b) => {
  const [x, y] = [lum(toRgb(a)), lum(toRgb(b))].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}
const fmt = ([h, s, l]) => `${+h.toFixed(1)} ${+s.toFixed(1)}% ${+l.toFixed(1)}%`

function fit(color, against) {
  const passes = (c) => against.every((b) => ratio(c, b) >= 4.5)
  if (passes(color)) return null
  for (let delta = 0.5; delta <= 100; delta += 0.5) {
    for (const sign of [-1, 1]) {
      const l = color[2] + sign * delta
      if (l < 0 || l > 100) continue
      const candidate = [color[0], color[1], l]
      if (passes(candidate)) return candidate
    }
  }
  throw new Error(`Cannot fit ${fmt(color)}`)
}

const themes = [
  'default',
  'palette',
  'amethyst',
  'sapphire',
  'emerald',
  'ruby',
  'coral',
  'amber',
  'daylight',
  'midnight',
]
const lines = [
  '/* Generated contrast fixes: the smallest lightness changes that bring every theme to WCAG 2.2 AA (4.5:1). */',
]
const report = []

for (const theme of themes) {
  for (const mode of ['light', 'dark']) {
    const base = { ...blocks[':root'] }
    if (mode === 'dark') Object.assign(base, blocks['.dark'])
    if (theme !== 'default') Object.assign(base, blocks[`.${theme}`])
    if (theme !== 'default' && mode === 'dark') Object.assign(base, blocks[`.${theme}.dark`])
    const t = Object.fromEntries(
      Object.entries(base)
        .filter(([, v]) => /^[\d.]+ [\d.]+% [\d.]+%$/.test(v))
        .map(([k, v]) => [k, parse(v)]),
    )
    const out = {}
    const set = (name, value) => {
      if (!value) return
      t[name] = value
      out[name] = fmt(value)
    }

    for (const [fg, bgs] of [
      ['foreground', ['background']],
      ['card-foreground', ['card']],
      ['popover-foreground', ['popover']],
      ['secondary-foreground', ['secondary']],
      ['muted-foreground', ['muted', 'background', 'card', 'popover']],
    ]) {
      set(
        fg,
        fit(
          t[fg],
          bgs.map((b) => t[b]),
        ),
      )
    }
    for (const [fg, bg] of [
      ['accent-foreground', 'accent'],
      ['primary-foreground', 'primary'],
      ['destructive-foreground', 'destructive'],
    ]) {
      const background = fit(t[bg], [t[fg]])
      const foreground = fit(t[fg], [t[bg]])
      if (!background || !foreground) continue
      if (Math.abs(background[2] - t[bg][2]) <= Math.abs(foreground[2] - t[fg][2])) set(bg, background)
      else set(fg, foreground)
    }
    out['primary-text'] = fmt(fit(t.primary, [t.card, t.background, t.popover]) ?? t.primary)
    out['destructive-text'] = fmt(fit(t.destructive, [t.card, t.background, t.popover]) ?? t.destructive)

    const others = themes
      .filter((name) => name !== 'default')
      .map((name) => `.${name}`)
      .join(', ')
    const selector =
      theme === 'default'
        ? mode === 'dark'
          ? `:root.dark:not(${others})`
          : `:root:not(.dark):not(${others})`
        : mode === 'dark'
          ? `:root.${theme}.dark`
          : `:root.${theme}:not(.dark)`
    lines.push(`${selector} {`, ...Object.entries(out).map(([k, v]) => `  --${k}: ${v};`), '}')
    const changed = Object.entries(out).filter(([k]) => !k.endsWith('-text'))
    if (changed.length) report.push(`${theme} ${mode}: ${changed.map(([k, v]) => `${k} ${base[k]} → ${v}`).join(', ')}`)
  }
}

writeFileSync(output, `${lines.join('\n')}\n`)
console.log(report.join('\n'))
