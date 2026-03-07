import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SLIDE_COUNT = 24
const SUNRISE_SUNSET_MS = 4000
const DAY_MS = 2500
const NIGHT_MS = 3500
const TRANSITION_DURATION = 0.9
const FAVORITES_KEY = 'rentnest_gallery_favorites'
const SWIPE_COUNT_KEY = 'rentnest_gallery_swipe_count'

// Geographic journey: Terai → Valley → Lakeside → Mountains → Trans-Himalayan
const SLIDES = [
  // JHAPA (1–3)
  { id: 1, src: 'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'House for rent in Jhapa', duration: DAY_MS, mood: 'day', kenBurns: 'zoom-pan-tr', gradient: 'jhapa', locationEn: 'Jhapa', locationNp: 'झापा', region: 'Jhapa', propertyType: 'House' },
  { id: 2, src: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Apartment in Jhapa', duration: SUNRISE_SUNSET_MS, mood: 'sunrise_sunset', kenBurns: 'zoom-pan-tl', gradient: 'jhapa', locationEn: 'Jhapa', locationNp: 'झापा', region: 'Jhapa', propertyType: 'Apartment' },
  { id: 3, src: 'https://images.pexels.com/photos/509246/pexels-photo-509246.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Flat in Jhapa', duration: DAY_MS, mood: 'day', kenBurns: 'zoom-pan-br', gradient: 'jhapa', locationEn: 'Jhapa', locationNp: 'झापा', region: 'Jhapa', propertyType: 'Flat' },
  // CHITWAN (4–6)
  { id: 4, src: 'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'House in Chitwan near national park', duration: DAY_MS, mood: 'day', kenBurns: 'zoom-pan-bl', gradient: 'chitwan', locationEn: 'Chitwan', locationNp: 'चितवन', region: 'Chitwan', propertyType: 'House' },
  { id: 5, src: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Apartment in Chitwan', duration: DAY_MS, mood: 'day', kenBurns: 'zoom-pan-tl', gradient: 'chitwan', locationEn: 'Chitwan', locationNp: 'चितवन', region: 'Chitwan', propertyType: 'Apartment' },
  { id: 6, src: 'https://images.pexels.com/photos/2661882/pexels-photo-2661882.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'House in Chitwan', duration: SUNRISE_SUNSET_MS, mood: 'sunrise_sunset', kenBurns: 'zoom-pan-tr', gradient: 'chitwan', locationEn: 'Chitwan', locationNp: 'चितवन', region: 'Chitwan', propertyType: 'House' },
  // KATHMANDU (7–9)
  { id: 7, src: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'House in Kathmandu', duration: DAY_MS, mood: 'day', kenBurns: 'zoom-pan-tr', gradient: 'kathmandu', locationEn: 'Kathmandu', locationNp: 'काठमाडौँ', region: 'Kathmandu', propertyType: 'House' },
  { id: 8, src: 'https://images.pexels.com/photos/1438831/pexels-photo-1438831.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Apartment in Kathmandu', duration: DAY_MS, mood: 'day', kenBurns: 'zoom-pan-bl', gradient: 'kathmandu', locationEn: 'Kathmandu', locationNp: 'काठमाडौँ', region: 'Kathmandu', propertyType: 'Apartment' },
  { id: 9, src: 'https://images.pexels.com/photos/2692594/pexels-photo-2692594.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Flat in Kathmandu', duration: NIGHT_MS, mood: 'night', kenBurns: 'zoom-pan-center', gradient: 'kathmandu', locationEn: 'Kathmandu', locationNp: 'काठमाडौँ', region: 'Kathmandu', propertyType: 'Flat' },
  // LALITPUR (10–12)
  { id: 10, src: 'https://images.pexels.com/photos/509246/pexels-photo-509246.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Flat in Lalitpur', duration: DAY_MS, mood: 'day', kenBurns: 'zoom-pan-tl', gradient: 'lalitpur', locationEn: 'Lalitpur', locationNp: 'ललितपुर', region: 'Lalitpur', propertyType: 'Flat' },
  { id: 11, src: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'House in Lalitpur', duration: SUNRISE_SUNSET_MS, mood: 'sunrise_sunset', kenBurns: 'zoom-pan-br', gradient: 'lalitpur', locationEn: 'Lalitpur', locationNp: 'ललितपुर', region: 'Lalitpur', propertyType: 'House' },
  { id: 12, src: 'https://images.pexels.com/photos/1438831/pexels-photo-1438831.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Apartment in Lalitpur', duration: DAY_MS, mood: 'day', kenBurns: 'zoom-pan-tr', gradient: 'lalitpur', locationEn: 'Lalitpur', locationNp: 'ललितपुर', region: 'Lalitpur', propertyType: 'Apartment' },
  // POKHARA (13–15) – slide 13 uses user-provided image
  { id: 13, src: 'https://www.realtynepal.com/uploads/2026/03/viber_image_2026-03-01_14-29-13-750-360x245.jpg', alt: 'Rental property in Pokhara', duration: SUNRISE_SUNSET_MS, mood: 'sunrise_sunset', kenBurns: 'zoom-pan-br', gradient: 'pokhara', locationEn: 'Pokhara', locationNp: 'पोखरा', region: 'Pokhara', propertyType: 'House' },
  { id: 14, src: 'https://images.pexels.com/photos/2661882/pexels-photo-2661882.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'House in Pokhara', duration: DAY_MS, mood: 'day', kenBurns: 'zoom-pan-center', gradient: 'pokhara', locationEn: 'Pokhara', locationNp: 'पोखरा', region: 'Pokhara', propertyType: 'House' },
  { id: 15, src: 'https://images.pexels.com/photos/2692594/pexels-photo-2692594.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Apartment in Pokhara', duration: DAY_MS, mood: 'day', kenBurns: 'zoom-pan-tr', gradient: 'pokhara', locationEn: 'Pokhara', locationNp: 'पोखरा', region: 'Pokhara', propertyType: 'Apartment' },
  // GHANDRUK (16–18)
  { id: 16, src: 'https://images.pexels.com/photos/2692594/pexels-photo-2692594.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'House in Ghandruk', duration: SUNRISE_SUNSET_MS, mood: 'sunrise_sunset', kenBurns: 'zoom-pan-center', gradient: 'ghandruk', locationEn: 'Ghandruk', locationNp: 'घान्द्रुक', region: 'Ghandruk', propertyType: 'House' },
  { id: 17, src: 'https://images.pexels.com/photos/2661882/pexels-photo-2661882.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Traditional house in Ghandruk', duration: DAY_MS, mood: 'day', kenBurns: 'zoom-pan-tl', gradient: 'ghandruk', locationEn: 'Ghandruk', locationNp: 'घान्द्रुक', region: 'Ghandruk', propertyType: 'House' },
  { id: 18, src: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Homestay in Ghandruk', duration: DAY_MS, mood: 'day', kenBurns: 'zoom-pan-br', gradient: 'ghandruk', locationEn: 'Ghandruk', locationNp: 'घान्द्रुक', region: 'Ghandruk', propertyType: 'House' },
  // MANANG (19–21)
  { id: 19, src: 'https://images.pexels.com/photos/2661882/pexels-photo-2661882.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Lodge in Manang', duration: SUNRISE_SUNSET_MS, mood: 'sunrise_sunset', kenBurns: 'zoom-pan-tr', gradient: 'manang', locationEn: 'Manang', locationNp: 'मनाङ', region: 'Manang', propertyType: 'House' },
  { id: 20, src: 'https://images.pexels.com/photos/1438831/pexels-photo-1438831.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Mountain lodge in Manang', duration: DAY_MS, mood: 'day', kenBurns: 'zoom-pan-br', gradient: 'manang', locationEn: 'Manang', locationNp: 'मनाङ', region: 'Manang', propertyType: 'Apartment' },
  { id: 21, src: 'https://images.pexels.com/photos/2692594/pexels-photo-2692594.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Accommodation in Manang', duration: NIGHT_MS, mood: 'night', kenBurns: 'zoom-pan-bl', gradient: 'manang', locationEn: 'Manang', locationNp: 'मनाङ', region: 'Manang', propertyType: 'House' },
  // MUSTANG (22–24)
  { id: 22, src: 'https://images.pexels.com/photos/509246/pexels-photo-509246.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'House in Mustang', duration: SUNRISE_SUNSET_MS, mood: 'sunrise_sunset', kenBurns: 'zoom-pan-tl', gradient: 'mustang', locationEn: 'Mustang', locationNp: 'मुस्ताङ', region: 'Mustang', propertyType: 'House' },
  { id: 23, src: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Lodge in Mustang', duration: DAY_MS, mood: 'day', kenBurns: 'zoom-pan-bl', gradient: 'mustang', locationEn: 'Mustang', locationNp: 'मुस्ताङ', region: 'Mustang', propertyType: 'House' },
  { id: 24, src: 'https://images.pexels.com/photos/2661882/pexels-photo-2661882.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Desert lodge in Mustang', duration: NIGHT_MS, mood: 'night', kenBurns: 'zoom-pan-center', gradient: 'mustang', locationEn: 'Mustang', locationNp: 'मुस्ताङ', region: 'Mustang', propertyType: 'House' },
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

function getFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setFavorites(ids) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids))
  } catch {}
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
  const [showDetailsOverlay, setShowDetailsOverlay] = useState(false)
  const [favorites, setFavoritesState] = useState(getFavorites)
  const [showConfetti, setShowConfetti] = useState(false)
  useEffect(() => {
    if (!showConfetti) return
    const t = setTimeout(() => setShowConfetti(false), 3500)
    return () => clearTimeout(t)
  }, [showConfetti])
  const [voiceActive, setVoiceActive] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [cursor, setCursor] = useState({ x: -999, y: -999 })
  const dragStartX = useRef(0)
  const dragStartY = useRef(0)
  const totalDragX = useRef(0)
  const totalDragY = useRef(0)
  const velocityRef = useRef(0)
  const lastTimeRef = useRef(0)
  const lastTapRef = useRef(0)
  const autoAdvanceRef = useRef(null)
  const progressRef = useRef(null)
  const startTimeRef = useRef(Date.now())
  const prevProgressRef = useRef(0)
  const recognitionRef = useRef(null)
  const indexRef = useRef(index)
  indexRef.current = index

  const currentSlide = SLIDES[index]
  const durationMs = currentSlide?.duration ?? DAY_MS
  const nextIndex = (index + 1) % SLIDE_COUNT
  const prevIndex = (index - 1 + SLIDE_COUNT) % SLIDE_COUNT
  const isFavorited = currentSlide && favorites.includes(currentSlide.id)

  // Haptic at 50% and 100% progress
  useEffect(() => {
    if (progress >= 50 && prevProgressRef.current < 50 && navigator.vibrate) {
      navigator.vibrate(10)
    }
    if (progress >= 99 && prevProgressRef.current < 99 && navigator.vibrate) {
      navigator.vibrate([10, 30, 10])
    }
    prevProgressRef.current = progress
  }, [progress])

  // Voice recognition (Nepali + English)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.lang = 'en-NP'
    recognition.interimResults = false
    recognition.maxAlternatives = 2
    recognition.onresult = (e) => {
      const transcript = (e.results[e.results.length - 1][0].transcript || '').toLowerCase()
      const n = transcript.trim()
      const next = /next|अर्को|arkho|aglo|अर्को तस्वीर/i.test(n)
      const prev = /previous|back|पछिल्लो|pachillo|agillo/i.test(n)
      const pause = /pause|stop|रोक्नुहोस्|roknu|rok/i.test(n)
      const cur = indexRef.current
      if (next) { goTo((cur + 1) % SLIDE_COUNT); setVoiceActive(true); setTimeout(() => setVoiceActive(false), 800) }
      if (prev) { goTo((cur - 1 + SLIDE_COUNT) % SLIDE_COUNT); setVoiceActive(true); setTimeout(() => setVoiceActive(false), 800) }
      if (pause) { setShowDetailsOverlay(true); setVoiceActive(true); setTimeout(() => setVoiceActive(false), 800) }
    }
    recognition.onerror = () => {}
    recognitionRef.current = recognition
    return () => { try { recognition.stop() } catch {} }
  }, [index])

  const startVoice = useCallback(() => {
    if (!recognitionRef.current) return
    try {
      recognitionRef.current.start()
      setVoiceActive(true)
    } catch {}
  }, [])

  const goTo = useCallback((i) => {
    const wrapped = ((i % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT
    setIndex(wrapped)
    setProgress(0)
    startTimeRef.current = Date.now()
    const count = parseInt(localStorage.getItem(SWIPE_COUNT_KEY) || '0', 10) + 1
    localStorage.setItem(SWIPE_COUNT_KEY, String(count))
    if (count === 100) setShowConfetti(true)
  }, [])

  const advance = useCallback(() => {
    goTo((index + 1) % SLIDE_COUNT)
  }, [index, goTo])

  const toggleFavorite = useCallback(() => {
    if (!currentSlide) return
    const next = favorites.includes(currentSlide.id)
      ? favorites.filter((id) => id !== currentSlide.id)
      : [...favorites, currentSlide.id]
    setFavoritesState(next)
    setFavorites(next)
  }, [currentSlide, favorites])

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
    const t = setTimeout(() => {
      ;[nextIndex, (nextIndex + 1) % SLIDE_COUNT, (nextIndex + 2) % SLIDE_COUNT].forEach((i) => {
        const img = new Image()
        img.referrerPolicy = 'no-referrer'
        img.src = SLIDES[i].src
      })
    }, 200)
    return () => clearTimeout(t)
  }, [nextIndex])

  useEffect(() => {
    if (autoAdvanceRef.current) clearInterval(autoAdvanceRef.current)
    if (progressRef.current) cancelAnimationFrame(progressRef.current)
    const shouldAdvance = !isHovered && !isDragging && isActive && !showDetailsOverlay
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
  }, [isHovered, isDragging, isActive, showDetailsOverlay, index, advance, durationMs])

  const handleLoad = useCallback((i) => {
    if (i === 0) setIsLoading(false)
  }, [])

  const handlePointerDown = useCallback((e) => {
    setIsDragging(true)
    setIsHovered(true)
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0
    const y = e.clientY ?? e.touches?.[0]?.clientY ?? 0
    dragStartX.current = x
    dragStartY.current = y
    totalDragX.current = 0
    totalDragY.current = 0
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
    const dy = clientY - dragStartY.current
    velocityRef.current = dx / dt
    totalDragX.current += dx
    totalDragY.current += dy
    lastTimeRef.current = now
    dragStartX.current = clientX
    dragStartY.current = clientY
  }, [isDragging])

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return
    const dx = totalDragX.current
    const dy = totalDragY.current
    const velocity = velocityRef.current
    const threshold = 50
    const velocityThreshold = 400
    const swipeUpThreshold = -60
    const swipeDownThreshold = 60

    if (dy < swipeUpThreshold && Math.abs(dy) > Math.abs(dx)) {
      setShowDetailsOverlay(true)
    } else if (dy > swipeDownThreshold && Math.abs(dy) > Math.abs(dx)) {
      setShowDetailsOverlay(false)
    } else {
      let newIndex = index
      if (Math.abs(velocity) > velocityThreshold) {
        newIndex = velocity > 0 ? prevIndex : nextIndex
      } else if (dx > threshold) {
        newIndex = prevIndex
      } else if (dx < -threshold) {
        newIndex = nextIndex
      }
      if (newIndex !== index) goTo(newIndex)
    }
    setIsDragging(false)
    setIsHovered(false)
  }, [isDragging, index, prevIndex, nextIndex, goTo])

  const handleDoubleTap = useCallback((e) => {
    const now = Date.now()
    if (now - lastTapRef.current < 400) {
      e.preventDefault()
      toggleFavorite()
    }
    lastTapRef.current = now
  }, [toggleFavorite])

  // Touch double-tap (mobile)
  const touchTapCount = useRef(0)
  const touchTapTimer = useRef(null)
  const handleTouchEnd = useCallback((e) => {
    touchTapCount.current += 1
    if (touchTapTimer.current) clearTimeout(touchTapTimer.current)
    touchTapTimer.current = setTimeout(() => { touchTapCount.current = 0 }, 400)
    if (touchTapCount.current >= 2) {
      touchTapCount.current = 0
      if (touchTapTimer.current) { clearTimeout(touchTapTimer.current); touchTapTimer.current = null }
      toggleFavorite()
    }
  }, [toggleFavorite])

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
  const sameRegionSlides = currentSlide ? SLIDES.filter((s) => s.region === currentSlide.region && s.id !== currentSlide.id).slice(0, 3) : []

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none touch-pan-y"
      onMouseEnter={() => !isDragging && setIsHovered(true)}
      onMouseLeave={() => { !isDragging && setIsHovered(false); handlePointerLeave() }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onDoubleClick={handleDoubleTap}
      onClick={(e) => e.detail === 2 && handleDoubleTap(e)}
      onTouchEnd={handleTouchEnd}
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

      {/* Confetti at 100 swipes */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-50 gallery-confetti"
            aria-hidden
          />
        )}
      </AnimatePresence>

      {/* Swipe-up details overlay */}
      <AnimatePresence>
        {showDetailsOverlay && currentSlide && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-x-0 bottom-0 top-1/3 z-30 bg-black/70 backdrop-blur-xl rounded-t-2xl border border-white/10 border-b-0 flex flex-col p-6 overflow-auto"
          >
            <button
              onClick={() => setShowDetailsOverlay(false)}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
              aria-label="Close"
            >
              ×
            </button>
            <p className="text-white font-semibold text-xl">
              {currentSlide.locationEn} · {currentSlide.locationNp}
            </p>
            <p className="text-amber-200/90 mt-1">{currentSlide.propertyType}</p>
            <p className="text-white/70 text-sm mt-3">Swipe down or tap × to close</p>
            {sameRegionSlides.length > 0 && (
              <div className="mt-4">
                <p className="text-white/80 text-sm font-medium mb-2">More in {currentSlide.region}</p>
                <div className="flex gap-2">
                  {sameRegionSlides.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { goTo(SLIDES.findIndex((x) => x.id === s.id)); setShowDetailsOverlay(false) }}
                      className="shrink-0 w-20 h-14 rounded-lg overflow-hidden border border-white/20"
                    >
                      <img src={s.src} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metadata + favorite */}
      <AnimatePresence mode="wait">
        {currentSlide && !showDetailsOverlay && (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="absolute left-4 sm:left-8 bottom-24 sm:bottom-28 z-20 max-w-sm flex items-center gap-3"
          >
            <div className="pointer-events-none">
              <p className="text-white/95 font-semibold text-base sm:text-lg tracking-wide">
                {currentSlide.locationEn} <span className="text-white/70 font-normal">· {currentSlide.locationNp}</span>
              </p>
              <p className="text-amber-200/90 text-sm mt-1">{currentSlide.propertyType}</p>
            </div>
            <button
              type="button"
              onClick={toggleFavorite}
              className="shrink-0 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-lg hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label={isFavorited ? 'Unfavorite' : 'Favorite'}
            >
              {isFavorited ? '❤️' : '🤍'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice indicator */}
      {voiceActive && (
        <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Voice
        </div>
      )}

      {/* Thumbnails */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 px-4 overflow-x-auto pb-2 z-20 pointer-events-auto">
        {[nextIndex, (nextIndex + 1) % SLIDE_COUNT, (nextIndex + 2) % SLIDE_COUNT].map((i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="shrink-0 w-14 h-9 sm:w-16 sm:h-10 rounded-lg overflow-hidden border border-white/25 gallery-thumbnail backdrop-blur-sm gallery-thumb-pattern"
          >
            <img src={SLIDES[i].src} alt="" className="w-full h-full object-cover opacity-85" loading="lazy" referrerPolicy="no-referrer" />
          </button>
        ))}
      </div>

      {/* Prayer-wheel style progress (5 segments) */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-48 sm:w-64 z-20 pointer-events-auto flex gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => {
          const segmentStart = i * 20
          const segmentEnd = (i + 1) * 20
          const fill = Math.min(100, Math.max(0, (progress - segmentStart) / (segmentEnd - segmentStart) * 100))
          const colors = ['#2563eb', '#f8fafc', '#ef4444', '#22c55e', '#eab308']
          return (
            <div key={i} className="flex-1 h-2 rounded-full overflow-hidden gallery-glass border border-white/15">
              <motion.div
                className="h-full rounded-full gallery-progress-fill-nepal"
                style={{ width: `${fill}%`, backgroundColor: colors[i] }}
                transition={{ duration: 0.12, ease: 'linear' }}
              />
            </div>
          )
        })}
      </div>

      {/* Dot indicators (compact for 24) */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1 z-20 pointer-events-auto flex-wrap justify-center max-w-full px-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1 rounded-full transition-all duration-300 ${i === index ? 'w-4 bg-white' : 'w-1 bg-white/50 hover:bg-white/70'}`}
            aria-label={`${SLIDES[i].locationEn} ${i + 1}`}
            aria-current={i === index ? 'true' : undefined}
          />
        ))}
      </div>

      {/* Voice button */}
      <button
        type="button"
        onClick={startVoice}
        className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-xs flex items-center gap-2"
        aria-label="Voice commands"
      >
        🎤 Say &quot;next&quot;, &quot;previous&quot;, &quot;pause&quot;
      </button>
    </div>
  )
}
