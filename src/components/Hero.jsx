import { useEffect, useRef } from 'react'
import { FaBook, FaBox, FaGlasses, FaGuitar } from 'react-icons/fa'
import {
  GiBilledCap,
  GiClothes,
  GiConverseShoe,
  GiDress,
  GiHandBag,
  GiLipstick,
  GiMatryoshkaDolls,
  GiPearlNecklace,
  GiTeapot,
} from 'react-icons/gi'
import { IoGameController } from 'react-icons/io5'
import { MdToys } from 'react-icons/md'
import { TbHanger } from 'react-icons/tb'

// x/y: centro dell'icona in % rispetto al blocco del titolo
// size: in em rispetto al font del titolo; rot: rotazione iniziale in gradi
const ITEMS = [
  { Icon: GiClothes, color: 'text-peach', x: -2, y: 14, size: 0.42, rot: -12 },
  { Icon: TbHanger, color: 'text-pistachio-500', x: 40, y: -4, size: 0.38, rot: 18 },
  { Icon: GiBilledCap, color: 'text-pistachio-300', x: 72, y: 2, size: 0.3, rot: -8 },
  { Icon: GiTeapot, color: 'text-butter', x: 104, y: 8, size: 0.32, rot: 6 },
  { Icon: GiPearlNecklace, color: 'text-butter', x: 14, y: 40, size: 0.26, rot: 0 },
  { Icon: IoGameController, color: 'text-sky', x: 58, y: 44, size: 0.34, rot: -20 },
  { Icon: FaBox, color: 'text-butter', x: 86, y: 30, size: 0.3, rot: 8 },
  { Icon: FaGuitar, color: 'text-pistachio-400', x: 122, y: 34, size: 0.46, rot: -25 },
  { Icon: MdToys, color: 'text-lavender', x: 34, y: 52, size: 0.28, rot: 14 },
  { Icon: GiMatryoshkaDolls, color: 'text-blush', x: 104, y: 60, size: 0.4, rot: -10 },
  { Icon: GiConverseShoe, color: 'text-pistachio-300', x: 0, y: 84, size: 0.34, rot: 10 },
  { Icon: GiDress, color: 'text-blush', x: 28, y: 96, size: 0.36, rot: -6 },
  { Icon: GiLipstick, color: 'text-peach', x: 52, y: 74, size: 0.22, rot: 30 },
  { Icon: FaGlasses, color: 'text-lavender', x: 68, y: 100, size: 0.3, rot: -8 },
  { Icon: GiHandBag, color: 'text-peach', x: 92, y: 92, size: 0.34, rot: 12 },
  { Icon: FaBook, color: 'text-sky', x: 124, y: 82, size: 0.3, rot: 15 },
]

const clamp01 = (n) => Math.min(1, Math.max(0, n))

// Quanto bisogna scorrere (in frazioni di altezza dello schermo) perché le icone escano del tutto:
// più alto = transizione più lenta
const SCROLL_RANGE = 0.85

// Ammorbidimento (secondi, circa il tempo per raggiungere lo scroll). Le icone seguono lo scroll come una
// molla smorzata: tengono conto della velocità che hanno già, quindi anche con uno scroll a scatti
// (rotella, trackpad) accelerano e frenano in modo continuo, senza le ripartenze di una transizione CSS.
const SMOOTH_TIME = 0.22

// Molla smorzata criticamente (smooth damp): restituisce la nuova posizione e la nuova velocità
const smoothDamp = (current, target, velocity, dt) => {
  const omega = 2 / SMOOTH_TIME
  const x = omega * dt
  const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x)
  const change = current - target
  const temp = (velocity + omega * change) * dt
  return [target + (change + temp) * decay, (velocity - omega * temp) * decay]
}

function Hero() {
  const iconRefs = useRef([])

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let radii = []
    let frame = 0
    let current = 0
    let velocity = 0
    let lastTime = 0

    const measure = () => {
      radii = iconRefs.current.map((el) => el.offsetWidth / 2)
    }

    const targetProgress = () => clamp01(window.scrollY / (window.innerHeight * SCROLL_RANGE))

    const render = (p) => {
      const travel = window.innerWidth
      iconRefs.current.forEach((el, i) => {
        const { x, rot } = ITEMS[i]
        if (reduceMotion) {
          el.style.opacity = String(1 - p)
          el.style.transform = `rotate(${rot}deg)`
          return
        }
        // rotola: la rotazione segue la distanza percorsa (arco = raggio * angolo)
        const dx = (x < 50 ? -1 : 1) * p * travel
        const angle = rot + (dx / radii[i]) * (180 / Math.PI)
        el.style.transform = `translate3d(${dx}px, 0, 0) rotate(${angle}deg)`
      })
    }

    const tick = (time) => {
      const target = targetProgress()
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 1 / 60
      lastTime = time
      if (reduceMotion) current = target
      else [current, velocity] = smoothDamp(current, target, velocity, dt)
      if (Math.abs(target - current) < 0.0005 && Math.abs(velocity) < 0.001) {
        current = target
        velocity = 0
      }
      render(current)
      // il loop gira solo finché le icone non hanno raggiunto lo scroll
      frame = current === target ? 0 : requestAnimationFrame(tick)
      if (!frame) lastTime = 0
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(tick)
    }
    const onResize = () => {
      measure()
      render(current)
    }

    measure()
    current = targetProgress()
    render(current)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <section className="relative flex min-h-svh items-center overflow-x-clip bg-cream px-4 sm:px-10 lg:px-20">
      <div className="relative font-display text-[clamp(4.5rem,25vw,13rem)] leading-[0.85] font-extrabold tracking-tight">
        <h1 className="text-pistachio-900">
          Swap
          <br />
          Carpi
        </h1>

        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {ITEMS.map(({ Icon, color, x, y, size, rot }, i) => (
            <span
              key={i}
              ref={(el) => (iconRefs.current[i] = el)}
              className={`sticker absolute -translate-x-1/2 -translate-y-1/2 will-change-transform ${color}`}
              style={{ left: `${x}%`, top: `${y}%`, fontSize: `${size}em`, transform: `rotate(${rot}deg)` }}
            >
              <Icon className="block" />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero
