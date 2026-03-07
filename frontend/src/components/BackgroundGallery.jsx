import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SLIDE_COUNT = 14
const EXTERIOR_MS = 3000
const INTERIOR_MS = 2000
const TRANSITION_DURATION = 0.9

const SLIDES = [
  // KATHMANDU VALLEY (1–3)
  { id: 1, src: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Luxury villa in Budhanilkantha with Shivapuri mountain views, Newari architecture fusion', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-tr', gradient: 'kathmandu', locationEn: 'Budhanilkantha', locationNp: 'बुढानीलकण्ठ', region: 'Kathmandu Valley', altitude: '1,400m', propertyType: 'Villa', attractions: 'Shivapuri National Park, Budhanilkantha Temple' },
  { id: 2, src: 'https://images.pexels.com/photos/509246/pexels-photo-509246.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Traditional Newari house in Patan Durbar Square area with carved wooden windows', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-tl', gradient: 'kathmandu', locationEn: 'Patan', locationNp: 'ललितपुर', region: 'Kathmandu Valley', altitude: '1,320m', propertyType: 'Traditional Newari House', attractions: 'Patan Durbar Square, Golden Temple' },
  { id: 3, src: 'https://images.pexels.com/photos/1438831/pexels-photo-1438831.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Premium apartment in Lazimpat with city views and Swayambhunath Stupa', duration: INTERIOR_MS, type: 'interior', kenBurns: 'zoom-pan-bl', gradient: 'kathmandu', locationEn: 'Lazimpat', locationNp: 'लाजिम्पाट', region: 'Kathmandu Valley', altitude: '1,350m', propertyType: 'Apartment', attractions: 'Swayambhunath, Thamel, embassies' },
  // POKHARA (4–6)
  { id: 4, src: 'https://images.pexels.com/photos/509246/pexels-photo-509246.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Lakeside villa with Fewa Lake view and Machhapuchhre mountain reflection', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-br', gradient: 'pokhara', locationEn: 'Lakeside', locationNp: 'फेवा तट', region: 'Pokhara', altitude: '827m', propertyType: 'Lakeside Villa', attractions: 'Fewa Lake, World Peace Pagoda, boating' },
  { id: 5, src: 'https://images.pexels.com/photos/2661882/pexels-photo-2661882.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Modern apartment in Lakeside with panoramic Annapurna range and rooftop terrace', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-center', gradient: 'pokhara', locationEn: 'Lakeside', locationNp: 'लेकसाइड', region: 'Pokhara', altitude: '827m', propertyType: 'Apartment', attractions: 'Annapurna sunrise, Davis Falls' },
  { id: 6, src: 'https://images.pexels.com/photos/2692594/pexels-photo-2692594.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Traditional Gurung house in Sarangkot with Himalayan sunrise views', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-tr', gradient: 'pokhara', locationEn: 'Sarangkot', locationNp: 'साराङकोट', region: 'Pokhara', altitude: '1,600m', propertyType: 'Gurung House', attractions: 'Paragliding, mountain sunrise' },
  // CHITWAN (7–8)
  { id: 7, src: 'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Jungle safari resort villa with Tharu architecture and forest views', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-bl', gradient: 'chitwan', locationEn: 'Sauraha', locationNp: 'सौराहा', region: 'Chitwan', altitude: '415m', propertyType: 'Safari Resort Villa', attractions: 'Chitwan National Park, wildlife safari' },
  { id: 8, src: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Eco apartment near Narayani River with jungle views', duration: INTERIOR_MS, type: 'interior', kenBurns: 'zoom-pan-tl', gradient: 'chitwan', locationEn: 'Narayani Riverside', locationNp: 'नारायणी नदी किनार', region: 'Chitwan', altitude: '200m', propertyType: 'Eco Apartment', attractions: 'River rafting, bird watching' },
  // MANANG (9–10)
  { id: 9, src: 'https://images.pexels.com/photos/2661882/pexels-photo-2661882.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Mountain lodge in Upper Manang with Annapurna II views', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-tr', gradient: 'manang', locationEn: 'Upper Manang', locationNp: 'मनाङ', region: 'Manang', altitude: '3,540m', propertyType: 'Mountain Lodge', attractions: 'Annapurna Circuit, Tilicho Lake' },
  { id: 10, src: 'https://images.pexels.com/photos/1438831/pexels-photo-1438831.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Manang village accommodation with yak wool interiors and prayer flags', duration: INTERIOR_MS, type: 'interior', kenBurns: 'zoom-pan-br', gradient: 'manang', locationEn: 'Manang Village', locationNp: 'मनाङ गाउँ', region: 'Manang', altitude: '3,500m', propertyType: 'Mountain Lodge', attractions: 'Gangapurna Lake, ice lake trek' },
  // MUSTANG (11–12)
  { id: 11, src: 'https://images.pexels.com/photos/509246/pexels-photo-509246.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Cave-adapted villa in Kagbeni with Kali Gandaki gorge views', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-tl', gradient: 'mustang', locationEn: 'Kagbeni', locationNp: 'कागबेनी', region: 'Mustang', altitude: '2,804m', propertyType: 'Cave Villa', attractions: 'Kali Gandaki, Upper Mustang trek' },
  { id: 12, src: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Desert lodge in Lo Manthang with traditional Mustangi architecture', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-bl', gradient: 'mustang', locationEn: 'Lo Manthang', locationNp: 'लो मन्थाङ', region: 'Mustang', altitude: '3,810m', propertyType: 'Desert Lodge', attractions: 'Tibetan plateau, walled city' },
  // GHANDRUK (13–14)
  { id: 13, src: 'https://images.pexels.com/photos/2661882/pexels-photo-2661882.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Traditional Gurung stone house in Ghandruk with Annapurna South views', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-center', gradient: 'ghandruk', locationEn: 'Ghandruk', locationNp: 'घान्द्रुक', region: 'Ghandruk', altitude: '1,940m', propertyType: 'Traditional Stone House', attractions: 'Annapurna South, Gurung museum' },
  { id: 14, src: 'https://images.pexels.com/photos/2692594/pexels-photo-2692594.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Village homestay with Machhapuchhre sunrise and rhododendron forest', duration: EXTERIOR_MS, type: 'exterior', kenBurns: 'zoom-pan-tr', gradient: 'ghandruk', locationEn: 'Ghandruk Village', locationNp: 'घान्द्रुक गाउँ', region: 'Ghandruk', altitude: '1,950m', propertyType: 'Homestay', attractions: 'Rhododendron trek, Poon Hill' },
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
    pokhara: 'from-sky-950/25 via-emerald-950/20 to-transparent',
    chitwan: 'from-emerald-950/30 via-amber-950/20 to-transparent',
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
      <div className="absolute inset-0 gallery-glow-mandala pointer-events-none" />

      {cursor.x > 0 && cursor.y > 0 && (
        <div
          className="absolute w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none gallery-sheen-nepal"
          style={{ left: cursor.x, top: cursor.y }}
        />
      )}

      {/* Metadata: Location, altitude, property type */}
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
            <p className="text-white/80 text-xs sm:text-sm mt-0.5">{currentSlide.region} · {currentSlide.altitude}</p>
            <p className="text-amber-200/90 text-xs sm:text-sm mt-1">{currentSlide.propertyType}</p>
            <p className="text-white/60 text-xs mt-2 truncate max-w-xs" title={currentSlide.attractions}>
              {currentSlide.attractions}
            </p>
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

      {/* Prayer flag colored progress bar */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-44 sm:w-56 h-2 rounded-full overflow-hidden z-20 pointer-events-auto gallery-progress-track gallery-progress-prayer-flags backdrop-blur-sm">
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
