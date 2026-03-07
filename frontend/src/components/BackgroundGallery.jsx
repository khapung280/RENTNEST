import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

const SLIDE_COUNT = 12
const EXTERIOR_MS = 3000
const INTERIOR_MS = 2000
const TRANSITION_DURATION = 0.9

const SLIDES = [
  { id: 1, src: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Ultra-luxury modern villa with infinity pool and sunset lighting', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-tr', gradient: 'warm' },
  { id: 2, src: 'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Luxury villa exterior with manicured lawn and architectural details', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-tl', gradient: 'warm' },
  { id: 3, src: 'https://images.pexels.com/photos/1438834/pexels-photo-1438834.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Drone shot of modern villa with pool and garden', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-br', gradient: 'warm' },
  { id: 4, src: 'https://images.pexels.com/photos/1438831/pexels-photo-1438831.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Premium Nepal property with Himalayan mountain views', duration: INTERIOR_MS, type: 'interior', kenBurns: 'zoom-pan-bl', gradient: 'cool' },
  { id: 5, src: 'https://images.pexels.com/photos/164522/pexels-photo-164522.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Traditional-modern fusion architecture in Nepal', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-tr', gradient: 'warm' },
  { id: 6, src: 'https://images.pexels.com/photos/1438833/pexels-photo-1438833.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Mountain view house with panoramic windows', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-center', gradient: 'cool' },
  { id: 7, src: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Designer living room with floor-to-ceiling windows and natural light', duration: INTERIOR_MS, type: 'interior', kenBurns: 'zoom-pan-tl', gradient: 'neutral' },
  { id: 8, src: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Stylish kitchen with marble countertops and smart home features', duration: INTERIOR_MS, type: 'interior', kenBurns: 'zoom-pan-tr', gradient: 'neutral' },
  { id: 9, src: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Designer bedroom with natural light studies', duration: INTERIOR_MS, type: 'interior', kenBurns: 'zoom-pan-bl', gradient: 'warm' },
  { id: 10, src: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Urban penthouse with city lights and night skyline', duration: INTERIOR_MS, type: 'interior', kenBurns: 'zoom-pan-br', gradient: 'cool' },
  { id: 11, src: 'https://images.pexels.com/photos/1457844/pexels-photo-1457844.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Luxury bathroom with freestanding tub and natural stone', duration: INTERIOR_MS, type: 'interior', kenBurns: 'zoom-pan-center', gradient: 'neutral' },
  { id: 12, src: 'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'City penthouse with long exposure night photography', duration: INTERIOR_MS, type: 'interior', kenBurns: 'zoom-pan-tl', gradient: 'cool' },
]

function ImageSlide({ slide, isActive, onLoad, prefersReducedMotion }) {
  const kenBurnsClass = prefersReducedMotion ? '' : `gallery-ken-burns gallery-ken-burns-${slide.kenBurns}`

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      initial={false}
      animate={{
        opacity: isActive ? 1 : 0,
        scale: isActive ? (prefersReducedMotion ? 1 : 1.03) : 1,
      }}
      transition={{ duration: TRANSITION_DURATION * 0.7, ease: [0.4, 0, 0.6, 1] }}
    >
      <div
        className={`absolute inset-[-4%] w-[108%] h-[108%] ${kenBurnsClass}`}
        style={{ animationDuration: `${slide.duration}ms` }}
      >
        <img
          src={slide.src}
          alt={slide.alt}
          className="absolute inset-0 w-full h-full object-cover"
          loading={isActive ? 'eager' : 'lazy'}
          onLoad={onLoad}
          draggable={false}
          referrerPolicy="no-referrer"
        />
      </div>
    </motion.div>
  )
}

function getGradientOverlay(gradient) {
  if (gradient === 'warm') return 'from-amber-950/25 via-transparent to-transparent'
  if (gradient === 'cool') return 'from-blue-950/20 via-transparent to-transparent'
  return 'from-stone-950/15 via-transparent to-transparent'
}

export default function BackgroundGallery() {
  const containerRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [tabVisible, setTabVisible] = useState(true)
  const [inView, setInView] = useState(true)
  const isActive = tabVisible && inView
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [cursor, setCursor] = useState({ x: -999, y: -999 })
  const dragStartX = useRef(0)
  const totalDragX = useRef(0)
  const velocityRef = useRef(0)
  const lastTimeRef = useRef(0)
  const autoAdvanceRef = useRef(null)
  const progressRef = useRef(null)
  const startTimeRef = useRef(Date.now())

  const currentSlide = SLIDES[index]
  const durationMs = currentSlide?.duration ?? INTERIOR_MS
  const nextIndex = (index + 1) % SLIDE_COUNT
  const prevIndex = (index - 1 + SLIDE_COUNT) % SLIDE_COUNT

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const onVisibility = () => setTabVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05 }
    )
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      const img = new Image()
      img.referrerPolicy = 'no-referrer'
      img.src = SLIDES[nextIndex].src
    }, 150)
    return () => clearTimeout(timer)
  }, [nextIndex])

  const advance = useCallback(() => {
    setIndex((prev) => (prev + 1) % SLIDE_COUNT)
    setProgress(0)
    startTimeRef.current = Date.now()
  }, [])

  useEffect(() => {
    if (autoAdvanceRef.current) clearInterval(autoAdvanceRef.current)
    if (progressRef.current) cancelAnimationFrame(progressRef.current)

    const shouldAdvance = !isHovered && !isDragging && isActive

    if (shouldAdvance) {
      autoAdvanceRef.current = setInterval(advance, durationMs)
    }

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current
      const p = Math.min(100, (elapsed / durationMs) * 100)
      setProgress(p)
      progressRef.current = requestAnimationFrame(updateProgress)
    }
    progressRef.current = requestAnimationFrame(updateProgress)

    return () => {
      if (autoAdvanceRef.current) clearInterval(autoAdvanceRef.current)
      if (progressRef.current) cancelAnimationFrame(progressRef.current)
    }
  }, [isHovered, isDragging, isActive, index, advance, durationMs])

  const handleLoad = useCallback((i) => {
    if (i === 0) setIsLoading(false)
  }, [])

  const goTo = useCallback((i) => {
    const wrapped = ((i % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT
    setIndex(wrapped)
    setProgress(0)
    startTimeRef.current = Date.now()
  }, [])

  const handlePointerDown = useCallback((e) => {
    setIsDragging(true)
    setIsHovered(true)
    dragStartX.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0
    totalDragX.current = 0
    velocityRef.current = 0
    lastTimeRef.current = performance.now()
  }, [])

  const handlePointerMove = useCallback((e) => {
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setCursor({ x: clientX - rect.left, y: clientY - rect.top })
    }
    if (!isDragging) return
    const now = performance.now()
    const dt = (now - lastTimeRef.current) / 1000 || 0.016
    const dx = clientX - dragStartX.current
    velocityRef.current = dx / dt
    totalDragX.current = dx
    lastTimeRef.current = now
    dragStartX.current = clientX
  }, [isDragging])

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return
    const dx = totalDragX.current
    const velocity = velocityRef.current
    const threshold = 50
    const velocityThreshold = 400

    let newIndex = index
    if (Math.abs(velocity) > velocityThreshold) {
      newIndex = velocity > 0 ? prevIndex : nextIndex
    } else if (dx > threshold) {
      newIndex = prevIndex
    } else if (dx < -threshold) {
      newIndex = nextIndex
    }

    if (newIndex !== index) goTo(newIndex)
    setIsDragging(false)
    setIsHovered(false)
  }, [isDragging, index, prevIndex, nextIndex, goTo])

  const handlePointerLeave = useCallback(() => {
    setCursor({ x: -999, y: -999 })
  }, [])

  useEffect(() => {
    const onMove = (e) => handlePointerMove(e)
    const onUp = () => handlePointerUp()
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [handlePointerMove, handlePointerUp])

  const gradientOverlay = currentSlide ? getGradientOverlay(currentSlide.gradient) : 'from-stone-950/20'

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none touch-pan-y"
      onMouseEnter={() => !isDragging && setIsHovered(true)}
      onMouseLeave={() => { !isDragging && setIsHovered(false); handlePointerLeave() }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      style={{ touchAction: 'pan-y pinch-zoom', cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-slate-900 gallery-skeleton z-30" aria-hidden />
      )}

      <div className="absolute inset-0">
        {SLIDES.map((slide, i) => (
          <ImageSlide
            key={slide.id}
            slide={slide}
            isActive={i === index}
            onLoad={() => handleLoad(i)}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </div>

      <div className={`absolute inset-0 bg-gradient-to-b ${gradientOverlay} pointer-events-none`} />
      <div className="absolute inset-0 gallery-overlay-edges pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/25 pointer-events-none" />
      <div className={`absolute inset-0 gallery-grain ${isDragging ? 'gallery-grain-active' : ''} pointer-events-none`} />
      <div className="absolute inset-0 gallery-vignette pointer-events-none" />
      <div className="absolute inset-0 gallery-glow-edge pointer-events-none" />

      {cursor.x > 0 && cursor.y > 0 && (
        <div
          className="absolute w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none gallery-sheen"
          style={{
            left: cursor.x,
            top: cursor.y,
          }}
        />
      )}

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1 px-4 overflow-x-auto pb-2 z-20 pointer-events-auto">
        {[nextIndex, (nextIndex + 1) % SLIDE_COUNT, (nextIndex + 2) % SLIDE_COUNT].map((i, j) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="shrink-0 w-16 h-10 rounded-lg overflow-hidden border border-white/20 gallery-thumbnail backdrop-blur-sm"
          >
            <img
              src={SLIDES[i].src}
              alt={SLIDES[i].alt}
              className="w-full h-full object-cover opacity-80"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </button>
        ))}
      </div>

      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-40 h-1.5 bg-white/10 rounded-full overflow-hidden z-20 pointer-events-auto gallery-progress-track backdrop-blur-sm">
        <motion.div
          className="h-full rounded-full gallery-progress-fill"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.15, ease: 'linear' }}
        />
      </div>

      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 pointer-events-auto">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1 rounded-full transition-all duration-300 ${i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/70'}`}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index ? 'true' : undefined}
          />
        ))}
      </div>
    </div>
  )
}
