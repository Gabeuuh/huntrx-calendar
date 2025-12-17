import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import diceImg from './assets/Dice Cubes.png'
import cloudImg from './assets/Nuage.png'
import caseBleu from './assets/Case/Case-bleu.png'
import caseGrise from './assets/Case/Case-grise.png'
import caseJaune from './assets/Case/Case-jaune.png'
import caseMauve from './assets/Case/Case-mauve.png'
import caseRose from './assets/Case/Case-rose.png'
import caseRouge from './assets/Case/Case-rouge.png'
import caseViolette from './assets/Case/Case-violette.png'
import './App.css'

const caseImages = [
  caseBleu,
  caseRouge,
  caseJaune,
  caseRose,
  caseViolette,
  caseMauve,
  caseGrise,
]

const SLOT_SPACING = 160
const TOP_OFFSET = 140
const INITIAL_SLOTS = 14
const APPEND_SLOTS = 10
const HERO_EVERY = 7
const HERO_OFFSET = 3
const SCROLL_PAD_BOTTOM = 140
const TOP_BOUNCE_REST = 80
const BOUNCE_SETTLE_MS = 130

const buildSlots = (startIndex, count) =>
  Array.from({ length: count }, (_, i) => {
    const slotIndex = startIndex + i
    const isHero = slotIndex % HERO_EVERY === HERO_OFFSET
    return {
      id: `slot-${slotIndex}`,
      slotIndex,
      type: isHero ? 'hero' : 'number',
      image: caseImages[slotIndex % caseImages.length],
    }
  })

const heroCountBefore = (index) => {
  if (index < HERO_OFFSET) return 0
  return Math.floor((index - HERO_OFFSET) / HERO_EVERY) + 1
}

const buildPath = (height) => {
  const startX = 150
  const minX = 70
  const maxX = 190
  const segment = 220
  let d = `M ${startX} -40`
  let x = startX
  let y = -40
  let flip = false

  while (y < height + 120) {
    const nextX = flip ? maxX : minX
    const nextY = y + segment
    const c1X = x
    const c1Y = y + segment * 0.35
    const c2X = nextX
    const c2Y = y + segment * 0.65
    d += ` C ${c1X} ${c1Y} ${c2X} ${c2Y} ${nextX} ${nextY}`
    x = nextX
    y = nextY
    flip = !flip
  }

  return d
}

function App() {
  const [slots, setSlots] = useState(() => buildSlots(0, INITIAL_SLOTS))
  const scrollRef = useRef(null)
  const appendLock = useRef(false)
  const initialScrollSet = useRef(false)
  const scrollEndTimer = useRef(null)
  const lastScrollTop = useRef(0)
  const lastDirection = useRef('down')

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onScroll = () => {
      const currentTop = el.scrollTop
      if (currentTop < lastScrollTop.current) {
        lastDirection.current = 'up'
      } else if (currentTop > lastScrollTop.current) {
        lastDirection.current = 'down'
      }
      lastScrollTop.current = currentTop

      if (!appendLock.current) {
        const nearTop = currentTop <= 220
        if (nearTop) {
          appendLock.current = true
          setSlots((prev) => [...prev, ...buildSlots(prev.length, APPEND_SLOTS)])
          requestAnimationFrame(() => {
            appendLock.current = false
          })
        }
      }

      if (scrollEndTimer.current) {
        clearTimeout(scrollEndTimer.current)
      }
      scrollEndTimer.current = setTimeout(() => {
        if (lastDirection.current === 'up' && el.scrollTop < TOP_BOUNCE_REST) {
          el.scrollTo({ top: TOP_BOUNCE_REST, behavior: 'smooth' })
        }
      }, BOUNCE_SETTLE_MS)
    }

    el.addEventListener('scroll', onScroll)
    return () => {
      el.removeEventListener('scroll', onScroll)
      if (scrollEndTimer.current) {
        clearTimeout(scrollEndTimer.current)
      }
    }
  }, [])

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el || initialScrollSet.current) return
    el.scrollTop = Math.max(0, el.scrollHeight - el.clientHeight)
    lastScrollTop.current = el.scrollTop
    initialScrollSet.current = true
  }, [slots.length])

  const trackHeight = TOP_OFFSET + slots.length * SLOT_SPACING
  const pathData = useMemo(() => buildPath(trackHeight), [trackHeight])
  const orderedSlots = useMemo(() => [...slots].reverse(), [slots])

  return (
    <main className="screen">
      <div className="ambient" aria-hidden="true" />
      <img className="cloud" src={cloudImg} alt="" aria-hidden="true" />
      <div
        className="scroll"
        ref={scrollRef}
        style={{ '--scroll-pad': `${SCROLL_PAD_BOTTOM}px` }}
      >
        <div className="track" style={{ height: `${trackHeight}px` }}>
          <svg
            className="path"
            viewBox={`0 0 260 ${trackHeight}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d={pathData} />
          </svg>

          {orderedSlots.map((slot, index) => {
            const top = TOP_OFFSET + index * SLOT_SPACING
            const left = index % 2 === 0 ? '58%' : '30%'

            if (slot.type === 'hero') {
              return (
                <div
                  key={slot.id}
                  className="step step-hero"
                  style={{ top: `${top}px`, left }}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 64 64" className="hero-icon">
                    <circle cx="23" cy="16" r="6" />
                    <path d="M20 24 L20 40" />
                    <path d="M20 30 L34 36" />
                    <path d="M20 40 L10 52" />
                    <path d="M20 40 L34 54" />
                  </svg>
                </div>
              )
            }

            const number = slot.slotIndex + 1 - heroCountBefore(slot.slotIndex)
            const isCurrent = number % 8 === 2

            return (
              <div
                key={slot.id}
                className={`step step-number${isCurrent ? ' is-current' : ''}`}
                style={{ top: `${top}px`, left }}
              >
                <img className="step-image" src={slot.image} alt="" />
                <span className="step-label">{number}</span>
              </div>
            )
          })}
        </div>
      </div>

      <button
        className="dice-button"
        type="button"
        aria-label="Lancer les des"
      >
        <img className="dice-image" src={diceImg} alt="" />
      </button>
    </main>
  )
}

export default App
