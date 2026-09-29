import tailwindcss from '@tailwindcss/vite'

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
