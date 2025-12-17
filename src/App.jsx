import { useEffect, useRef, useState } from 'react'
import cloudImg from './assets/Nuage.png'
import backgroundImg from './assets/monde1/background.png'
import case1Disabled from './assets/monde1/Case1-disable.png'
import case1Focus from './assets/monde1/Case1-focus.png'
import case1Normal from './assets/monde1/Case1-normal.png'
import case2Disabled from './assets/monde1/Case2-disable.png'
import case2Focus from './assets/monde1/Case2-focus.png'
import case2Normal from './assets/monde1/Case2-normal.png'
import case3Disabled from './assets/monde1/Case3-disable.png'
import case3Focus from './assets/monde1/Case3-focus.png'
import case3Normal from './assets/monde1/Case3-normal.png'
import case4Disabled from './assets/monde1/Case4-disable.png'
import case4Focus from './assets/monde1/Case4-focus.png'
import case4Normal from './assets/monde1/Case4-normal.png'
import './App.css'

const TOTAL_DAYS = 4
const DEFAULT_DAY = 2
const BOARD_WIDTH = 440
const BOARD_HEIGHT = 956

const dayImages = {
  1: {
    disabled: case1Disabled,
    focus: case1Focus,
    normal: case1Normal,
  },
  2: {
    disabled: case2Disabled,
    focus: case2Focus,
    normal: case2Normal,
  },
  3: {
    disabled: case3Disabled,
    focus: case3Focus,
    normal: case3Normal,
  },
  4: {
    disabled: case4Disabled,
    focus: case4Focus,
    normal: case4Normal,
  },
}

const slots = [
  {
    id: 'day-4',
    type: 'day',
    number: 4,
    x: 285,
    y: 350,
  },
  {
    id: 'day-3',
    type: 'day',
    number: 3,
    x: 146,
    y: 530,
  },
  {
    id: 'day-2',
    type: 'day',
    number: 2,
    x: 325,
    y: 675,
  },
  {
    id: 'day-1',
    type: 'day',
    number: 1,
    x: 265,
    y: 880,
  },
]

const clampDay = (value) => Math.min(TOTAL_DAYS, Math.max(1, value))

const getCurrentDay = () => {
  if (typeof window === 'undefined') return DEFAULT_DAY
  const params = new URLSearchParams(window.location.search)
  const fromQuery = Number(params.get('day'))
  if (Number.isFinite(fromQuery) && fromQuery > 0) {
    return clampDay(fromQuery)
  }
  return DEFAULT_DAY
}

function App() {
  const scrollRef = useRef(null)
  const trackRef = useRef(null)
  const bounceTimer = useRef(null)
  const touchStartY = useRef(0)
  const isTouching = useRef(false)
  const currentDay = getCurrentDay()
  const [layout, setLayout] = useState({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  })

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const updateScale = () => {
      const scale = Math.max(
        container.clientWidth / BOARD_WIDTH,
        container.clientHeight / BOARD_HEIGHT,
      )
      const offsetX = (container.clientWidth - BOARD_WIDTH * scale) / 2
      const offsetY = (container.clientHeight - BOARD_HEIGHT * scale) / 2
      setLayout((prev) => {
        if (
          Math.abs(prev.scale - scale) < 0.0005 &&
          Math.abs(prev.offsetX - offsetX) < 0.5 &&
          Math.abs(prev.offsetY - offsetY) < 0.5
        ) {
          return prev
        }
        return { scale, offsetX, offsetY }
      })
    }

    updateScale()

    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(updateScale)
      observer.observe(container)
      return () => observer.disconnect()
    }

    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

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

  const resolveState = (day) => {
    if (day < currentDay) return 'disabled'
    if (day === currentDay) return 'focus'
    return 'normal'
  }

  return (
    <main className="screen">
      <div className="ambient" aria-hidden="true" />
      <img className="cloud" src={cloudImg} alt="" aria-hidden="true" />
      <div className="scroll" ref={scrollRef}>
        <div className="track">
          <div
            className="board"
            ref={trackRef}
            style={{ backgroundImage: `url(${backgroundImg})` }}
          >
            {slots.map((slot) => {
              const state = resolveState(slot.number)
              const left = layout.offsetX + slot.x * layout.scale
              const top = layout.offsetY + slot.y * layout.scale
              return (
                <div
                  key={slot.id}
                  className={`slot slot-day slot-${state}`}
                  style={{ top: `${top}px`, left: `${left}px` }}
                >
                  <img
                    className="slot-image"
                    src={dayImages[slot.number][state]}
                    alt={`Jour ${slot.number}`}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>

    </main>
  )
}

export default App
