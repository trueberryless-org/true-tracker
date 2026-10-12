export default defineNuxtPlugin({
  name: 'time-tracker-hydrated',
  enforce: 'pre',
  setup(nuxtApp) {
    const hydrated = useHydrated()
    if (!nuxtApp.isHydrating) {
      hydrated.value = true
      return
    }
    nuxtApp.hooks.hookOnce('app:suspense:resolve', () => {
      hydrated.value = true
    })
  },
})
