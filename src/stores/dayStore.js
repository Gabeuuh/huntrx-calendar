import { atom } from 'nanostores'

const TOTAL_DAYS = 4
const DEFAULT_DAY = 2

const clampDay = (value) =>
  Math.min(TOTAL_DAYS, Math.max(1, Math.trunc(value)))

export const currentDayStore = atom(DEFAULT_DAY)

export const setCurrentDay = (value) => {
  if (!Number.isFinite(value)) return
  currentDayStore.set(clampDay(value))
}

export const resolveDayState = (day, currentDay) => {
  if (day < currentDay) return 'disabled'
  if (day === currentDay) return 'focus'
  return 'normal'
}

export const hydrateCurrentDayFromQuery = () => {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const fromQuery = Number(params.get('day'))
  if (Number.isFinite(fromQuery) && fromQuery > 0) {
    setCurrentDay(fromQuery)
  }
}
