import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const EXTERIOR_MS = 3000   // full building establishing shot
const INTERIOR_MS = 4000    // living room, bedroom, kitchen
const DETAIL_MS = 2500      // windows, doors, balconies
const TRANSITION_DURATION = 0.9
const FAVORITES_KEY = 'rentnest_gallery_favorites'
const SWIPE_COUNT_KEY = 'rentnest_gallery_swipe_count'

// Unsplash only - avoids OpaqueResponseBlocking from TripAdvisor/Getter/Blogger etc. High-res 1920px.
const SLIDES = [
  { id: 1, src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=90', srcSet: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=90 1920w, https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=2560&q=90 2560w, https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=3840&q=90 3840w', alt: 'Modern apartment in Lazimpat, Kathmandu', duration: 3000, kenBurns: 'zoom-out', region: 'Kathmandu', locationEn: 'Kathmandu', locationNp: 'काठमाडौं', propertyType: 'Apartment', bedrooms: 3, bathrooms: 2, floorArea: '1800 sq.ft', rentRange: 'Rs 25,000–40,000', features: 'Mountain View, Modern, Balcony', gradient: 'brick' },
  { id: 2, src: 'https://images.unsplash.com/photo-1600596542815-ffead6fb8c1f?w=1920&q=90', srcSet: 'https://images.unsplash.com/photo-1600596542815-ffead6fb8c1f?w=1920&q=90 1920w, https://images.unsplash.com/photo-1600596542815-ffead6fb8c1f?w=2560&q=90 2560w, https://images.unsplash.com/photo-1600596542815-ffead6fb8c1f?w=3840&q=90 3840w', alt: 'Traditional Newari house in Patan, Kathmandu', duration: 3000, kenBurns: 'pan-left', region: 'Kathmandu', locationEn: 'Kathmandu', locationNp: 'काठमाडौं', propertyType: 'House', bedrooms: 4, bathrooms: 3, floorArea: '2200 sq.ft', rentRange: 'Rs 45,000–60,000', features: 'Heritage, Courtyard, Wooden Windows', gradient: 'concrete' },
  { id: 3, src: 'https://images.unsplash.com/photo-1600585154340-63a616b5fd14?w=1920&q=90', srcSet: 'https://images.unsplash.com/photo-1600585154340-63a616b5fd14?w=1920&q=90 1920w, https://images.unsplash.com/photo-1600585154340-63a616b5fd14?w=2560&q=90 2560w, https://images.unsplash.com/photo-1600585154340-63a616b5fd14?w=3840&q=90 3840w', alt: 'Modern apartment with lake view, Pokhara', duration: 3000, kenBurns: 'zoom-in', region: 'Pokhara', locationEn: 'Pokhara', locationNp: 'पोखरा', propertyType: 'Apartment', bedrooms: 2, bathrooms: 2, floorArea: '1400 sq.ft', rentRange: 'Rs 18,000–28,000', features: 'Lake View, Balcony, Modern', gradient: 'wood' },
  { id: 4, src: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1920&q=90', srcSet: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1920&q=90 1920w, https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=2560&q=90 2560w, https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=3840&q=90 3840w', alt: 'Traditional Gurung house in Sarangkot, Pokhara', duration: 3000, kenBurns: 'pan-right', region: 'Pokhara', locationEn: 'Pokhara', locationNp: 'पोखरा', propertyType: 'House', bedrooms: 3, bathrooms: 2, floorArea: '1900 sq.ft', rentRange: 'Rs 20,000–35,000', features: 'Mountain View, Stone Architecture, Traditional', gradient: 'stone' },
  { id: 5, src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=90', srcSet: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=90 1920w, https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=2560&q=90 2560w, https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=3840&q=90 3840w', alt: 'Renovated Newari house in Pulchowk, Lalitpur', duration: 3000, kenBurns: 'zoom-out', region: 'Lalitpur', locationEn: 'Lalitpur', locationNp: 'ललितपुर', propertyType: 'House', bedrooms: 3, bathrooms: 2, floorArea: '2000 sq.ft', rentRange: 'Rs 30,000–45,000', features: 'Heritage, Renovated, Courtyard', gradient: 'fusion' },
  { id: 6, src: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1920&q=90', srcSet: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1920&q=90 1920w, https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=2560&q=90 2560w, https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=3840&q=90 3840w', alt: 'Modern apartment in Kupondole, Lalitpur', duration: 3000, kenBurns: 'pan-left', region: 'Lalitpur', locationEn: 'Lalitpur', locationNp: 'ललितपुर', propertyType: 'Apartment', bedrooms: 2, bathrooms: 2, floorArea: '1350 sq.ft', rentRange: 'Rs 15,000–25,000', features: 'City View, Modern, Garden', gradient: 'painted' },
  { id: 7, src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920&q=90', srcSet: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920&q=90 1920w, https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=2560&q=90 2560w, https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=3840&q=90 3840w', alt: 'Modern house in Bharatpur, Chitwan', duration: 3000, kenBurns: 'zoom-in', region: 'Chitwan', locationEn: 'Chitwan', locationNp: 'चितवन', propertyType: 'House', bedrooms: 4, bathrooms: 3, floorArea: '2100 sq.ft', rentRange: 'Rs 35,000–50,000', features: 'Garden, Veranda, Family Home', gradient: 'wood' },
  { id: 8, src: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1920&q=90', srcSet: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1920&q=90 1920w, https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=2560&q=90 2560w, https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=3840&q=90 3840w', alt: 'Apartment near Narayani River, Chitwan', duration: 3000, kenBurns: 'pan-right', region: 'Chitwan', locationEn: 'Chitwan', locationNp: 'चितवन', propertyType: 'Apartment', bedrooms: 3, bathrooms: 2, floorArea: '1650 sq.ft', rentRange: 'Rs 25,000–40,000', features: 'River View, Modern, Balcony', gradient: 'concrete' },
  { id: 9, src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&q=90', srcSet: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&q=90 1920w, https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=2560&q=90 2560w, https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=3840&q=90 3840w', alt: 'Modern flat in Birtamod, Jhapa', duration: 3000, kenBurns: 'zoom-out', region: 'Jhapa', locationEn: 'Jhapa', locationNp: 'झापा', propertyType: 'Flat', bedrooms: 2, bathrooms: 1, floorArea: '1200 sq.ft', rentRange: 'Rs 10,000–18,000', features: 'Urban, Modern, Community', gradient: 'brick' },
  { id: 10, src: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1920&q=90', srcSet: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1920&q=90 1920w, https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=2560&q=90 2560w, https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=3840&q=90 3840w', alt: 'Fusion house with tin roofing, Jhapa', duration: 3000, kenBurns: 'pan-left', region: 'Jhapa', locationEn: 'Jhapa', locationNp: 'झापा', propertyType: 'House', bedrooms: 3, bathrooms: 2, floorArea: '1750 sq.ft', rentRange: 'Rs 15,000–25,000', features: 'Fusion, Family, Garden', gradient: 'stone' },
  { id: 11, src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=90', srcSet: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=90 1920w, https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2560&q=90 2560w, https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=3840&q=90 3840w', alt: 'Traditional stone house with mountain views, Manang', duration: 3500, kenBurns: 'zoom-in', region: 'Manang', locationEn: 'Manang', locationNp: 'मनाङ', propertyType: 'House', bedrooms: 3, bathrooms: 2, floorArea: '1600 sq.ft', rentRange: 'Rs 20,000–35,000', features: 'Mountain View, Stone, Traditional', gradient: 'modern' },
  { id: 12, src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=90', srcSet: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=90 1920w, https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2560&q=90 2560w, https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=3840&q=90 3840w', alt: 'Modern mountain lodge apartment, Manang', duration: 3500, kenBurns: 'pan-right', region: 'Manang', locationEn: 'Manang', locationNp: 'मनाङ', propertyType: 'Apartment', bedrooms: 2, bathrooms: 1, floorArea: '1100 sq.ft', rentRange: 'Rs 15,000–25,000', features: 'Heated Floors, Peak View, Modern', gradient: 'concrete' },
  { id: 13, src: 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=1920&q=90', srcSet: 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=1920&q=90 1920w, https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=2560&q=90 2560w, https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=3840&q=90 3840w', alt: 'Traditional mud-brick house in Kagbeni, Mustang', duration: 3500, kenBurns: 'zoom-out', region: 'Mustang', locationEn: 'Mustang', locationNp: 'मुस्ताङ', propertyType: 'House', bedrooms: 3, bathrooms: 2, floorArea: '1850 sq.ft', rentRange: 'Rs 25,000–40,000', features: 'Mud-brick, Courtyard, Heritage', gradient: 'stone' },
  { id: 14, src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=90', srcSet: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=90 1920w, https://images.unsplash.com/photo-1519681393784-d120267933ba?w=2560&q=90 2560w, https://images.unsplash.com/photo-1519681393784-d120267933ba?w=3840&q=90 3840w', alt: 'Cave-adapted modern villa, Mustang', duration: 3500, kenBurns: 'pan-left', region: 'Mustang', locationEn: 'Mustang', locationNp: 'मुस्ताङ', propertyType: 'Villa', bedrooms: 4, bathrooms: 3, floorArea: '2400 sq.ft', rentRange: 'Rs 45,000–60,000', features: 'Cave Architecture, Luxury, Desert View', gradient: 'painted' },
  { id: 15, src: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1920&q=90', srcSet: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1920&q=90 1920w, https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=2560&q=90 2560w, https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=3840&q=90 3840w', alt: 'Traditional Gurung stone house, Ghandruk', duration: 3500, kenBurns: 'zoom-in', region: 'Ghandruk', locationEn: 'Ghandruk', locationNp: 'घान्द्रुक', propertyType: 'House', bedrooms: 3, bathrooms: 2, floorArea: '1700 sq.ft', rentRange: 'Rs 18,000–30,000', features: 'Stone, Mountain View, Traditional', gradient: 'wood' },
  { id: 16, src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=90', srcSet: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=90 1920w, https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=2560&q=90 2560w, https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=3840&q=90 3840w', alt: 'Renovated village home with mountain garden, Ghandruk', duration: 3500, kenBurns: 'pan-right', region: 'Ghandruk', locationEn: 'Ghandruk', locationNp: 'घान्द्रुक', propertyType: 'House', bedrooms: 2, bathrooms: 1, floorArea: '1400 sq.ft', rentRange: 'Rs 12,000–22,000', features: 'Renovated, Garden, Sunrise View', gradient: 'fusion' },
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
        style={{ animationDuration: `${slide.duration}ms`, backgroundSize: 'cover' }}
      >
        <img
          src={slide.src}
          srcSet={slide.srcSet || undefined}
          sizes="100vw"
          alt={slide.alt}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectFit: 'cover', imageRendering: 'auto' }}
          loading={isActive ? 'eager' : 'lazy'}
          decoding="async"
          fetchpriority={isActive ? 'high' : 'auto'}
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
    brick: 'from-red-950/35 via-amber-950/20 to-transparent',
    concrete: 'from-slate-900/30 via-stone-900/15 to-transparent',
    wood: 'from-amber-950/30 via-yellow-950/15 to-transparent',
    painted: 'from-stone-900/25 via-neutral-900/15 to-transparent',
    stone: 'from-neutral-800/30 via-slate-800/15 to-transparent',
    fusion: 'from-rose-950/20 via-amber-950/20 to-transparent',
    modern: 'from-slate-100/15 via-stone-100/10 to-transparent',
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
  const slideCount = SLIDES.length
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

  const currentSlide = slideCount > 0 ? SLIDES[index] : null
  const durationMs = currentSlide?.duration ?? EXTERIOR_MS
  const nextIndex = slideCount > 0 ? (index + 1) % slideCount : 0
  const prevIndex = slideCount > 0 ? (index - 1 + slideCount) % slideCount : 0
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

  const goTo = useCallback((i) => {
    if (slideCount === 0) return
    const wrapped = ((i % slideCount) + slideCount) % slideCount
    setIndex(wrapped)
    setProgress(0)
    startTimeRef.current = Date.now()
    const count = parseInt(localStorage.getItem(SWIPE_COUNT_KEY) || '0', 10) + 1
    localStorage.setItem(SWIPE_COUNT_KEY, String(count))
    if (count === 100) setShowConfetti(true)
  }, [slideCount])

  const advance = useCallback(() => {
    if (slideCount === 0) return
    goTo((index + 1) % slideCount)
  }, [index, goTo, slideCount])

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

  // Preload next 3 slides at full quality (no downscaling) for smooth transitions
  useEffect(() => {
    if (slideCount === 0) return
    const t = setTimeout(() => {
      ;[nextIndex, (nextIndex + 1) % slideCount, (nextIndex + 2) % slideCount].forEach((i) => {
        const slide = SLIDES[i]
        if (slide?.src) {
          const img = new Image()
          img.referrerPolicy = 'no-referrer'
          img.src = slide.src
        }
      })
    }, 200)
    return () => clearTimeout(t)
  }, [nextIndex, slideCount])

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
  const sameRegionSlides = currentSlide && slideCount > 0 ? SLIDES.filter((s) => s.region === currentSlide.region && s.id !== currentSlide.id).slice(0, 3) : []

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
      {slideCount === 0 && (
        <div className="absolute inset-0 bg-slate-900/95" aria-hidden />
      )}
      {isLoading && slideCount > 0 && (
        <div className="absolute inset-0 bg-slate-900 gallery-skeleton z-30" aria-hidden />
      )}

      <div className="absolute inset-0">
        {slideCount > 0 && SLIDES.map((slide, i) => (
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
      <div className={`absolute inset-0 gallery-glow-mandala gallery-edge-lattice pointer-events-none ${progress >= 75 ? 'gallery-glow-mandala-fast' : ''}`} />

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
            className="absolute inset-x-0 bottom-0 top-1/3 z-30 bg-black/75 backdrop-blur-xl rounded-t-2xl border border-white/10 border-b-0 flex flex-col p-6 overflow-auto gallery-glass-card"
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
            <p className="text-amber-200/95 mt-0.5">{currentSlide.propertyType} · {currentSlide.region}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
              <div className="bg-white/5 rounded-lg px-3 py-2">
                <span className="text-white/60 block">Bedrooms</span>
                <span className="text-white font-medium">{currentSlide.bedrooms}</span>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2">
                <span className="text-white/60 block">Bathrooms</span>
                <span className="text-white font-medium">{currentSlide.bathrooms}</span>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2 col-span-2">
                <span className="text-white/60 block">Floor area</span>
                <span className="text-white font-medium">{currentSlide.floorArea}</span>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-white/60 text-sm">Est. rent</span>
              <p className="text-emerald-300 font-semibold">{currentSlide.rentRange}</p>
            </div>
            <p className="text-white/80 text-sm mt-3">
              <span className="text-white/60">Features: </span>{currentSlide.features}
            </p>
            <p className="text-white/50 text-xs mt-4">Swipe down or tap × to close</p>
            {sameRegionSlides.length > 0 && (
              <div className="mt-4">
                <p className="text-white/80 text-sm font-medium mb-2">More in {currentSlide.region}</p>
                <div className="flex gap-2">
                  {sameRegionSlides.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { const idx = SLIDES.findIndex((x) => x.id === s.id); if (idx >= 0) goTo(idx); setShowDetailsOverlay(false) }}
                      className="shrink-0 w-20 h-14 rounded-lg overflow-hidden border border-white/20 hover:border-white/40"
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

      {/* Thumbnails */}
      {slideCount > 0 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 px-4 overflow-x-auto pb-2 z-20 pointer-events-auto">
          {[nextIndex, (nextIndex + 1) % slideCount, (nextIndex + 2) % slideCount].map((i) => {
            const slide = SLIDES[i]
            if (!slide?.src) return null
            return (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="shrink-0 w-14 h-9 sm:w-16 sm:h-10 rounded-lg overflow-hidden border border-white/25 gallery-thumbnail backdrop-blur-sm gallery-thumb-pattern"
              >
                <img src={slide.src} alt="" className="w-full h-full object-cover opacity-85" loading="lazy" referrerPolicy="no-referrer" />
              </button>
            )
          })}
        </div>
      )}

      {/* Prayer-wheel / marble progress – 5 segments */}
      {slideCount > 0 && (
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-48 sm:w-64 z-20 pointer-events-auto flex gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => {
          const segmentStart = i * 20
          const segmentEnd = (i + 1) * 20
          const fill = Math.min(100, Math.max(0, (progress - segmentStart) / (segmentEnd - segmentStart) * 100))
          const colors = ['#78716c', '#a8a29e', '#d6d3d1', '#e7e5e4', '#fafaf9']
          return (
            <div key={i} className="flex-1 h-2 rounded-full overflow-hidden gallery-glass gallery-progress-marble border border-white/15">
              <motion.div
                className="h-full rounded-full"
                style={{ width: `${fill}%`, backgroundColor: colors[i] }}
                transition={{ duration: 0.12, ease: 'linear' }}
              />
            </div>
          )
        })}
      </div>
      )}
    </div>
  )
}
