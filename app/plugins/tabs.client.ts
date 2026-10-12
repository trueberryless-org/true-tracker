export default defineNuxtPlugin(() => {
  if (import.meta.test) return

  const authUser = useAuthUser()

  useEventListener(window, 'storage', (event) => {
    if (event.storageArea !== localStorage) return

    if (authUser.value) {
      if (event.key === getAccountDataKey(authUser.value.did)) adoptAccountCacheFromOtherTab(authUser.value.did)
      return
    }
    if (event.key === LOCAL_DATA_KEY) adoptGuestDataFromOtherTab()
  })

  useEventListener(document, 'visibilitychange', () => {
    if (document.visibilityState === 'visible' && authUser.value) void refreshFromRemote(authUser.value)
  })
})
