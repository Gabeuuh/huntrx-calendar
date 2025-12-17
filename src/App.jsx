import { useEffect, useRef } from 'react'
import cloudImg from './assets/Nuage.png'
import caseBleu from './assets/Case/Case-bleu.png'
import caseGrise from './assets/Case/Case-grise.png'
import caseJaune from './assets/Case/Case-jaune.png'
import caseRose from './assets/Case/Case-rose.png'
import './App.css'

const SLOT_SPACING = 160
const TOP_OFFSET = 140

const fixedSlots = [
  {
    id: 'slot-4',
    type: 'number',
    number: 4,
    image: caseRose,
    left: '58%',
  },
  {
    id: 'slot-3',
    type: 'number',
    number: 3,
    image: caseBleu,
    left: '30%',
  },
  {
    id: 'slot-hero',
    type: 'hero',
    left: '58%',
  },
  {
    id: 'slot-2',
    type: 'number',
    number: 2,
    image: caseJaune,
    isCurrent: true,
    left: '56%',
  },
  {
    id: 'slot-1',
    type: 'number',
    number: 1,
    image: caseGrise,
    left: '50%',
  },
]

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
  const slots = fixedSlots
  const scrollRef = useRef(null)
  const trackRef = useRef(null)
  const bounceTimer = useRef(null)
  const touchStartY = useRef(0)
  const isTouching = useRef(false)

  useEffect(() => {
    const container = scrollRef.current
    const track = trackRef.current
    if (!container || !track) return

    const setBounce = (value, immediate) => {
      if (immediate) {
        track.classList.add('is-dragging')
      } else {
        track.classList.remove('is-dragging')
      }
      track.style.setProperty('--bounce', `${value}px`)
    }

    const settleBounce = () => {
      if (bounceTimer.current) {
        clearTimeout(bounceTimer.current)
      }
      bounceTimer.current = setTimeout(() => {
        setBounce(0, false)
      }, 120)
    }

    const onWheel = (event) => {
      if (event.deltaY >= 0) return
      event.preventDefault()
      const amount = Math.min(32, Math.max(0, -event.deltaY * 0.25))
      setBounce(amount, false)
      settleBounce()
    }

    const onTouchStart = (event) => {
      if (event.touches.length !== 1) return
      isTouching.current = true
      touchStartY.current = event.touches[0].clientY
      setBounce(0, true)
    }

    const onTouchMove = (event) => {
      if (!isTouching.current) return
      const delta = event.touches[0].clientY - touchStartY.current
      if (delta <= 0) return
      event.preventDefault()
      const amount = Math.min(36, delta * 0.35)
      setBounce(amount, true)
    }

    const onTouchEnd = () => {
      if (!isTouching.current) return
      isTouching.current = false
      setBounce(0, false)
    }

    container.addEventListener('wheel', onWheel, { passive: false })
    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchmove', onTouchMove, { passive: false })
    container.addEventListener('touchend', onTouchEnd)
    container.addEventListener('touchcancel', onTouchEnd)

    return () => {
      container.removeEventListener('wheel', onWheel)
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchmove', onTouchMove)
      container.removeEventListener('touchend', onTouchEnd)
      container.removeEventListener('touchcancel', onTouchEnd)
      if (bounceTimer.current) {
        clearTimeout(bounceTimer.current)
      }
    }
  }, [])

  const trackHeight = TOP_OFFSET + slots.length * SLOT_SPACING
  const pathData = buildPath(trackHeight)

  return (
    <main className="screen">
      <div className="ambient" aria-hidden="true" />
      <img className="cloud" src={cloudImg} alt="" aria-hidden="true" />
      <div className="scroll" ref={scrollRef}>
        <div
          className="track"
          ref={trackRef}
          style={{ height: `${trackHeight}px` }}
        >
          <svg
            className="path"
            viewBox={`0 0 260 ${trackHeight}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d={pathData} />
          </svg>

          {slots.map((slot, index) => {
            const top = TOP_OFFSET + index * SLOT_SPACING
            const left = slot.left ?? (index % 2 === 0 ? '58%' : '30%')

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

            return (
              <div
                key={slot.id}
                className={`step step-number${slot.isCurrent ? ' is-current' : ''}`}
                style={{ top: `${top}px`, left }}
              >
                <img className="step-image" src={slot.image} alt="" />
                <span className="step-label">{slot.number}</span>
              </div>
            )
          })}
        </div>
      </div>

    </main>
  )
}

export default App
