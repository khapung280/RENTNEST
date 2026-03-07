import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SLIDE_COUNT = 21
const EXTERIOR_MS = 3000   // full building establishing shot
const INTERIOR_MS = 4000    // living room, bedroom, kitchen
const DETAIL_MS = 2500      // windows, doors, balconies
const TRANSITION_DURATION = 0.9
const FAVORITES_KEY = 'rentnest_gallery_favorites'
const SWIPE_COUNT_KEY = 'rentnest_gallery_swipe_count'

// 21 slides: BUILDINGS ONLY. Sequencing: Modern → Traditional → Contemporary → Fusion.
const SLIDES = [
  // KATHMANDU – Urban Living (1–3)
  { id: 1, src: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Modern apartment complex in Lazimpat with floor-to-ceiling windows and rooftop terrace', duration: EXTERIOR_MS, shotType: 'exterior', kenBurns: 'zoom-pan-tr', gradient: 'concrete', locationEn: 'Lazimpat', locationNp: 'लाजिम्पाट', region: 'Kathmandu', propertyType: 'Apartment', bedrooms: 3, bathrooms: 2, floorArea: '1,800 sq ft', rentRange: 'Rs 45,000 – 65,000', features: 'Rooftop terrace, floor-to-ceiling windows, parking' },
  { id: 2, src: 'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Traditional Newari-style house in Patan with carved wooden windows and brick architecture', duration: EXTERIOR_MS, shotType: 'exterior', kenBurns: 'zoom-pan-tl', gradient: 'brick', locationEn: 'Patan', locationNp: 'ललितपुर', region: 'Kathmandu', propertyType: 'House', bedrooms: 4, bathrooms: 3, floorArea: '2,200 sq ft', rentRange: 'Rs 55,000 – 80,000', features: 'Courtyard, carved windows, heritage' },
  { id: 3, src: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Luxury flat in Budhanilkantha with large balconies and mountain-view windows', duration: INTERIOR_MS, shotType: 'interior', kenBurns: 'zoom-pan-bl', gradient: 'modern', locationEn: 'Budhanilkantha', locationNp: 'बुढानीलकण्ठ', region: 'Kathmandu', propertyType: 'Flat', bedrooms: 3, bathrooms: 2, floorArea: '1,600 sq ft', rentRange: 'Rs 50,000 – 70,000', features: 'Balcony, mountain view, modern kitchen' },
  // POKHARA – Lakeside Properties (4–6)
  { id: 4, src: 'https://www.realtynepal.com/uploads/2026/03/viber_image_2026-03-01_14-29-13-750-360x245.jpg', alt: 'Modern apartment in Pokhara with lake-facing balconies', duration: EXTERIOR_MS, shotType: 'exterior', kenBurns: 'zoom-pan-br', gradient: 'concrete', locationEn: 'Pokhara Lakeside', locationNp: 'पोखरा', region: 'Pokhara', propertyType: 'Apartment', bedrooms: 2, bathrooms: 2, floorArea: '1,200 sq ft', rentRange: 'Rs 35,000 – 50,000', features: 'Lake view, balcony, parking' },
  { id: 5, src: 'https://images.pexels.com/photos/164522/pexels-photo-164522.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Traditional Gurung-style house in Sarangkot with stone foundation and wooden upper stories', duration: EXTERIOR_MS, shotType: 'exterior', kenBurns: 'zoom-pan-center', gradient: 'wood', locationEn: 'Sarangkot', locationNp: 'साराङकोट', region: 'Pokhara', propertyType: 'House', bedrooms: 3, bathrooms: 2, floorArea: '1,800 sq ft', rentRange: 'Rs 40,000 – 60,000', features: 'Mountain view, garden, traditional' },
  { id: 6, src: 'https://images.pexels.com/photos/1438834/pexels-photo-1438834.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Luxury villa in Lakeside with private garden and modern Nepali fusion architecture', duration: EXTERIOR_MS, shotType: 'exterior', kenBurns: 'zoom-pan-tr', gradient: 'fusion', locationEn: 'Lakeside', locationNp: 'लेकसाइड', region: 'Pokhara', propertyType: 'House', bedrooms: 4, bathrooms: 3, floorArea: '2,500 sq ft', rentRange: 'Rs 70,000 – 1,00,000', features: 'Garden, outdoor seating, parking' },
  // CHITWAN – Terai Modern (7–8)
  { id: 7, src: 'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Modern house in Bharatpur with large veranda and tropical-modern architecture', duration: EXTERIOR_MS, shotType: 'exterior', kenBurns: 'zoom-pan-bl', gradient: 'fusion', locationEn: 'Bharatpur', locationNp: 'भरतपुर', region: 'Chitwan', propertyType: 'House', bedrooms: 3, bathrooms: 2, floorArea: '2,000 sq ft', rentRange: 'Rs 25,000 – 40,000', features: 'Veranda, garden, parking' },
  { id: 8, src: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Contemporary apartment complex near Narayani River with river-facing balconies', duration: INTERIOR_MS, shotType: 'interior', kenBurns: 'zoom-pan-tl', gradient: 'concrete', locationEn: 'Narayani Riverside', locationNp: 'नारायणी किनार', region: 'Chitwan', propertyType: 'Apartment', bedrooms: 2, bathrooms: 2, floorArea: '1,400 sq ft', rentRange: 'Rs 28,000 – 42,000', features: 'River view, balcony, modern' },
  // JHAPA – Eastern Nepal (9–10)
  { id: 9, src: 'https://images.pexels.com/photos/3219585/pexels-photo-3219585.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Modern flat in Birtamod with contemporary design and large windows', duration: EXTERIOR_MS, shotType: 'exterior', kenBurns: 'zoom-pan-tr', gradient: 'concrete', locationEn: 'Birtamod', locationNp: 'बिर्तामोड', region: 'Jhapa', propertyType: 'Flat', bedrooms: 2, bathrooms: 1, floorArea: '1,100 sq ft', rentRange: 'Rs 18,000 – 28,000', features: 'Large windows, parking' },
  { id: 10, src: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Traditional-modern fusion house with painted exterior and family home architecture', duration: EXTERIOR_MS, shotType: 'exterior', kenBurns: 'zoom-pan-bl', gradient: 'painted', locationEn: 'Jhapa', locationNp: 'झापा', region: 'Jhapa', propertyType: 'House', bedrooms: 4, bathrooms: 2, floorArea: '2,200 sq ft', rentRange: 'Rs 22,000 – 35,000', features: 'Garden, parking' },
  // MANANG – Himalayan Architecture (11–12)
  { id: 11, src: 'https://images.pexels.com/photos/2661882/pexels-photo-2661882.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Traditional stone house in Manang with modern interior and large windows framing peaks', duration: EXTERIOR_MS, shotType: 'exterior', kenBurns: 'zoom-pan-tr', gradient: 'stone', locationEn: 'Manang', locationNp: 'मनाङ', region: 'Manang', propertyType: 'House', bedrooms: 2, bathrooms: 1, floorArea: '1,200 sq ft', rentRange: 'Rs 15,000 – 25,000', features: 'Mountain view, heated' },
  { id: 12, src: 'https://images.pexels.com/photos/1438831/pexels-photo-1438831.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Modern mountain lodge-style apartment with floor-to-ceiling mountain views', duration: INTERIOR_MS, shotType: 'interior', kenBurns: 'zoom-pan-br', gradient: 'wood', locationEn: 'Manang Village', locationNp: 'मनाङ', region: 'Manang', propertyType: 'Apartment', bedrooms: 2, bathrooms: 1, floorArea: '900 sq ft', rentRange: 'Rs 12,000 – 20,000', features: 'Mountain view, heated floors' },
  // MUSTANG – Trans-Himalayan (13–14)
  { id: 13, src: 'https://images.pexels.com/photos/3581369/pexels-photo-3581369.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Traditional Mustangi mud-brick house with courtyard and modern amenities', duration: EXTERIOR_MS, shotType: 'exterior', kenBurns: 'zoom-pan-tl', gradient: 'brick', locationEn: 'Lo Manthang', locationNp: 'लो मन्थाङ', region: 'Mustang', propertyType: 'House', bedrooms: 2, bathrooms: 1, floorArea: '1,000 sq ft', rentRange: 'Rs 20,000 – 35,000', features: 'Courtyard, traditional' },
  { id: 14, src: 'https://images.pexels.com/photos/3582200/pexels-photo-3582200.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Cave-adapted modern villa in Kagbeni with fusion architecture', duration: EXTERIOR_MS, shotType: 'exterior', kenBurns: 'zoom-pan-bl', gradient: 'fusion', locationEn: 'Kagbeni', locationNp: 'कागबेनी', region: 'Mustang', propertyType: 'House', bedrooms: 2, bathrooms: 2, floorArea: '1,300 sq ft', rentRange: 'Rs 35,000 – 55,000', features: 'Luxury interior, traditional exterior' },
  // GHANDRUK – Village Architecture (15–16)
  { id: 15, src: 'https://images.pexels.com/photos/2692594/pexels-photo-2692594.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Traditional Gurung stone house with mountain-view terraces and slate roofing', duration: EXTERIOR_MS, shotType: 'exterior', kenBurns: 'zoom-pan-center', gradient: 'stone', locationEn: 'Ghandruk', locationNp: 'घान्द्रुक', region: 'Ghandruk', propertyType: 'House', bedrooms: 3, bathrooms: 2, floorArea: '1,600 sq ft', rentRange: 'Rs 25,000 – 40,000', features: 'Terrace, mountain view' },
  { id: 16, src: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Renovated village home with contemporary interiors and traditional exterior', duration: INTERIOR_MS, shotType: 'interior', kenBurns: 'zoom-pan-tr', gradient: 'fusion', locationEn: 'Ghandruk', locationNp: 'घान्द्रुक', region: 'Ghandruk', propertyType: 'House', bedrooms: 3, bathrooms: 2, floorArea: '1,500 sq ft', rentRange: 'Rs 30,000 – 45,000', features: 'Garden, modern kitchen' },
  // LALITPUR – Heritage Modern (17–21)
  { id: 17, src: 'https://images.pexels.com/photos/509246/pexels-photo-509246.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Renovated Newari house in Pulchowk with preserved wooden carvings', duration: EXTERIOR_MS, shotType: 'exterior', kenBurns: 'zoom-pan-tl', gradient: 'brick', locationEn: 'Pulchowk', locationNp: 'पुल्चोक', region: 'Lalitpur', propertyType: 'House', bedrooms: 4, bathrooms: 3, floorArea: '2,400 sq ft', rentRange: 'Rs 60,000 – 90,000', features: 'Wooden carvings, heritage' },
  { id: 18, src: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Modern apartment in Kupondole with city views and balcony gardens', duration: EXTERIOR_MS, shotType: 'exterior', kenBurns: 'zoom-pan-br', gradient: 'concrete', locationEn: 'Kupondole', locationNp: 'कुपोन्डोल', region: 'Lalitpur', propertyType: 'Apartment', bedrooms: 3, bathrooms: 2, floorArea: '1,700 sq ft', rentRange: 'Rs 48,000 – 68,000', features: 'City view, balcony' },
  { id: 19, src: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Traditional courtyard house (bahal) converted to modern flats', duration: INTERIOR_MS, shotType: 'interior', kenBurns: 'zoom-pan-bl', gradient: 'brick', locationEn: 'Lalitpur', locationNp: 'ललितपुर', region: 'Lalitpur', propertyType: 'Flat', bedrooms: 2, bathrooms: 2, floorArea: '1,300 sq ft', rentRange: 'Rs 42,000 – 58,000', features: 'Courtyard, heritage' },
  { id: 20, src: 'https://images.pexels.com/photos/1438833/pexels-photo-1438833.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Luxury townhouse in Sanepa with modern architecture and rooftop terrace', duration: EXTERIOR_MS, shotType: 'exterior', kenBurns: 'zoom-pan-tr', gradient: 'concrete', locationEn: 'Sanepa', locationNp: 'सानेपा', region: 'Lalitpur', propertyType: 'House', bedrooms: 4, bathrooms: 3, floorArea: '2,600 sq ft', rentRange: 'Rs 75,000 – 1,10,000', features: 'Rooftop terrace, garden, parking' },
  { id: 21, src: 'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Mixed-use building with ground floor retail and upper floor apartments', duration: EXTERIOR_MS, shotType: 'exterior', kenBurns: 'zoom-pan-center', gradient: 'concrete', locationEn: 'Lalitpur', locationNp: 'ललितपुर', region: 'Lalitpur', propertyType: 'Apartment', bedrooms: 2, bathrooms: 2, floorArea: '1,400 sq ft', rentRange: 'Rs 38,000 – 52,000', features: 'Urban, commercial below' },
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
  const durationMs = currentSlide?.duration ?? EXTERIOR_MS
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
                      onClick={() => { goTo(SLIDES.findIndex((x) => x.id === s.id)); setShowDetailsOverlay(false) }}
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

      {/* Prayer-wheel / marble progress – 5 segments */}
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
