import { useSyncExternalStore } from 'react'

export const useNanoStore = (store) =>
  useSyncExternalStore(store.subscribe, store.get, store.get)
