import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SLIDE_COUNT = 14
const EXTERIOR_MS = 3000
const INTERIOR_MS = 2000
const TRANSITION_DURATION = 0.9

const SLIDES = [
  // KATHMANDU (1)
  { id: 1, src: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Premium house for rent in Kathmandu with mountain views', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-tr', gradient: 'kathmandu', locationEn: 'Kathmandu', locationNp: 'काठमाडौँ', region: 'Kathmandu', propertyType: 'House' },
  // LALITPUR (2)
  { id: 2, src: 'https://images.pexels.com/photos/509246/pexels-photo-509246.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Flat for rent in Lalitpur, Patan area with traditional architecture', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-tl', gradient: 'lalitpur', locationEn: 'Lalitpur', locationNp: 'ललितपुर', region: 'Lalitpur', propertyType: 'Flat' },
  // KATHMANDU (3)
  { id: 3, src: 'https://images.pexels.com/photos/1438831/pexels-photo-1438831.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Apartment for rent in Kathmandu with city views', duration: INTERIOR_MS, type: 'interior', kenBurns: 'zoom-pan-bl', gradient: 'kathmandu', locationEn: 'Kathmandu', locationNp: 'काठमाडौँ', region: 'Kathmandu', propertyType: 'Apartment' },
  // POKHARA (4) – user-provided image
  { id: 4, src: 'https://www.realtynepal.com/uploads/2026/03/viber_image_2026-03-01_14-29-13-750-360x245.jpg', alt: 'Rental property in Pokhara, Nepal', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-br', gradient: 'pokhara', locationEn: 'Pokhara', locationNp: 'पोखरा', region: 'Pokhara', propertyType: 'House' },
  // POKHARA (5–6)
  { id: 5, src: 'https://images.pexels.com/photos/2661882/pexels-photo-2661882.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'House for rent in Pokhara with Annapurna views', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-center', gradient: 'pokhara', locationEn: 'Pokhara', locationNp: 'पोखरा', region: 'Pokhara', propertyType: 'House' },
  { id: 6, src: 'https://images.pexels.com/photos/2692594/pexels-photo-2692594.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Rental property in Pokhara Lakeside area', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-tr', gradient: 'pokhara', locationEn: 'Pokhara', locationNp: 'पोखरा', region: 'Pokhara', propertyType: 'Apartment' },
  // CHITWAN (7–8)
  { id: 7, src: 'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'House for rent in Chitwan near national park', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-bl', gradient: 'chitwan', locationEn: 'Chitwan', locationNp: 'चितवन', region: 'Chitwan', propertyType: 'House' },
  { id: 8, src: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Apartment for rent in Chitwan with jungle views', duration: INTERIOR_MS, type: 'interior', kenBurns: 'zoom-pan-tl', gradient: 'chitwan', locationEn: 'Chitwan', locationNp: 'चितवन', region: 'Chitwan', propertyType: 'Apartment' },
  // JHAPA (9)
  { id: 9, src: 'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'House for rent in Jhapa, eastern Nepal', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-tr', gradient: 'jhapa', locationEn: 'Jhapa', locationNp: 'झापा', region: 'Jhapa', propertyType: 'House' },
  // MANANG (10–11)
  { id: 10, src: 'https://images.pexels.com/photos/2661882/pexels-photo-2661882.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Lodge for rent in Manang with mountain views', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-tr', gradient: 'manang', locationEn: 'Manang', locationNp: 'मनाङ', region: 'Manang', propertyType: 'House' },
  { id: 11, src: 'https://images.pexels.com/photos/1438831/pexels-photo-1438831.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Mountain accommodation in Manang', duration: INTERIOR_MS, type: 'interior', kenBurns: 'zoom-pan-br', gradient: 'manang', locationEn: 'Manang', locationNp: 'मनाङ', region: 'Manang', propertyType: 'Apartment' },
  // MUSTANG (12–13)
  { id: 12, src: 'https://images.pexels.com/photos/509246/pexels-photo-509246.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'House for rent in Mustang with desert mountain views', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-tl', gradient: 'mustang', locationEn: 'Mustang', locationNp: 'मुस्ताङ', region: 'Mustang', propertyType: 'House' },
  { id: 13, src: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Lodge for rent in Upper Mustang', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-bl', gradient: 'mustang', locationEn: 'Mustang', locationNp: 'मुस्ताङ', region: 'Mustang', propertyType: 'House' },
  // GHANDRUK (14)
  { id: 14, src: 'https://images.pexels.com/photos/2692594/pexels-photo-2692594.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Traditional house for rent in Ghandruk village', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-center', gradient: 'ghandruk', locationEn: 'Ghandruk', locationNp: 'घान्द्रुक', region: 'Ghandruk', propertyType: 'House' },
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
  const map = {
    kathmandu: 'from-amber-950/35 via-rose-950/15 to-transparent',
    lalitpur: 'from-rose-950/30 via-amber-950/20 to-transparent',
    pokhara: 'from-sky-950/25 via-emerald-950/20 to-transparent',
    chitwan: 'from-emerald-950/30 via-amber-950/20 to-transparent',
    jhapa: 'from-emerald-950/28 via-teal-950/15 to-transparent',
    manang: 'from-slate-100/20 via-sky-100/15 to-transparent',
    mustang: 'from-amber-900/40 via-orange-950/25 to-transparent',
    ghandruk: 'from-rose-950/20 via-violet-950/15 to-transparent',
  }
  return map[gradient] || 'from-stone-950/25 via-transparent to-transparent'
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
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05 }
    )
    observer.observe(el)
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
    totalDragX.current += dx
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
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/30 pointer-events-none" />
      <div className={`absolute inset-0 gallery-grain ${isDragging ? 'gallery-grain-active' : ''} pointer-events-none`} />
      <div className="absolute inset-0 gallery-vignette pointer-events-none" />
      <div className={`absolute inset-0 gallery-glow-mandala pointer-events-none ${progress >= 75 ? 'gallery-glow-mandala-fast' : ''}`} />

      {cursor.x > 0 && cursor.y > 0 && (
        <>
          <div className="absolute w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none gallery-sheen-nepal" style={{ left: cursor.x, top: cursor.y }} />
          <div className="absolute w-64 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none gallery-ripple" style={{ left: cursor.x, top: cursor.y, animationDelay: '0.1s' }} />
          <div className="absolute w-80 h-80 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none gallery-ripple gallery-ripple-2" style={{ left: cursor.x, top: cursor.y, animationDelay: '0.25s' }} />
        </>
      )}

      {/* Metadata: Location (Nepali/English), property type */}
      <AnimatePresence mode="wait">
        {currentSlide && (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="absolute left-4 sm:left-8 bottom-24 sm:bottom-28 text-left z-20 pointer-events-none max-w-sm"
          >
            <p className="text-white/95 font-semibold text-base sm:text-lg tracking-wide">
              {currentSlide.locationEn} <span className="text-white/70 font-normal">· {currentSlide.locationNp}</span>
            </p>
            <p className="text-amber-200/90 text-sm mt-1">{currentSlide.propertyType}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thumbnails - upcoming Nepal destinations */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 px-4 overflow-x-auto pb-2 z-20 pointer-events-auto">
        {[nextIndex, (nextIndex + 1) % SLIDE_COUNT, (nextIndex + 2) % SLIDE_COUNT].map((i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="shrink-0 w-16 h-10 rounded-lg overflow-hidden border border-white/25 gallery-thumbnail backdrop-blur-sm gallery-thumb-pattern"
          >
            <img
              src={SLIDES[i].src}
              alt={SLIDES[i].alt}
              className="w-full h-full object-cover opacity-85"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </button>
        ))}
      </div>

      {/* Prayer flag progress bar – glass morphism */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-44 sm:w-56 h-2 rounded-full overflow-hidden z-20 pointer-events-auto gallery-progress-track gallery-progress-prayer-flags gallery-glass">
        <motion.div
          className="h-full rounded-full gallery-progress-fill-nepal"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.15, ease: 'linear' }}
        />
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 pointer-events-auto flex-wrap justify-center max-w-full px-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1 rounded-full transition-all duration-300 ${i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/70'}`}
            aria-label={`Go to ${SLIDES[i].locationEn} - slide ${i + 1}`}
            aria-current={i === index ? 'true' : undefined}
          />
        ))}
      </div>
    </div>
  )
}
