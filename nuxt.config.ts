import tailwindcss from '@tailwindcss/vite'

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "connect-src 'self' https:",
  "font-src 'self' data:",
  "form-action 'self' https:",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob: https:",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  'upgrade-insecure-requests',
].join('; ')

const SECURITY_HEADERS = {
  'permissions-policy': 'camera=(), geolocation=(), microphone=(), payment=()',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
}

const SITE_URL = 'https://time-tracker.space'
const OG_IMAGE_URL = `${SITE_URL}/og-image.png`
const OG_IMAGE_ALT = 'Time Tracker: Track your time, locally or on ATproto.'

const DESCRIPTION = 'Track the time you spend on your projects, locally or on your own ATproto repository.'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  ssr: true,

  devServer: { host: '127.0.0.1' },

  modules: ['@nuxtjs/color-mode', '@vueuse/nuxt'],

  css: ['~/assets/css/main.css'],

  components: [
    { path: '~/components/ui', pathPrefix: false },
    { path: '~/components', pathPrefix: true },
  ],

  routeRules: {
    '/**': {
      headers:
        process.env.NODE_ENV === 'production'
          ? { ...SECURITY_HEADERS, 'content-security-policy': CONTENT_SECURITY_POLICY }
          : SECURITY_HEADERS,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  colorMode: {
    classSuffix: '',
    fallback: 'light',
    preference: 'system',
    storageKey: 'theme',
  },

  app: {
    head: {
      title: 'Time Tracker',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: DESCRIPTION },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Time Tracker' },
        { property: 'og:title', content: 'Time Tracker' },
        { property: 'og:description', content: DESCRIPTION },
        { property: 'og:image', content: OG_IMAGE_URL },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: OG_IMAGE_ALT },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: OG_IMAGE_URL },
        { name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#020817', media: '(prefers-color-scheme: dark)' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        noUncheckedIndexedAccess: true,
      },
    },
  },
})
