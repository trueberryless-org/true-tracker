export function useSecondTicker() {
  return useNow({ scheduler: (callback) => useIntervalFn(callback, 1000) })
}
