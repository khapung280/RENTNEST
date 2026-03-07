import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

const SLIDE_COUNT = 7
const AUTO_ADVANCE_MS = 2000
const TRANSITION_DURATION = 0.8

const SLIDES = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80&fit=crop',
    alt: 'Modern luxury house exterior with warm evening lighting',
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80&fit=crop',
    alt: 'Spacious living room with floor-to-ceiling windows',
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=80&fit=crop',
    alt: 'Stylish kitchen with marble countertops',
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1920&q=80&fit=crop',
    alt: 'Cozy bedroom with city view',
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80&fit=crop',
    alt: 'Modern apartment building exterior',
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1920&q=80&fit=crop',
    alt: 'Mountain view house with traditional-modern fusion',
  },
  {
    id: 7,
    src: 'https://images.unsplash.com/photo-1552321554-5faefe818699?w=1920&q=80&fit=crop',
    alt: 'Luxury bathroom with spa-like atmosphere',
  },
]

function ImageSlide({ slide, isActive, onLoad }) {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      initial={false}
      animate={{
        opacity: isActive ? 1 : 0,
        scale: isActive ? 1.02 : 1,
      }}
      transition={{ duration: TRANSITION_DURATION * 0.6, ease: [0.4, 0, 0.6, 1] }}
    >
      <img
        src={slide.src}
        alt={slide.alt}
        className="absolute inset-0 w-full h-full object-cover"
        loading={isActive ? 'eager' : 'lazy'}
        onLoad={onLoad}
        draggable={false}
        fetchPriority={isActive ? 'high' : 'low'}
      />
    </motion.div>
  )
}

export default function BackgroundGallery() {
  const containerRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loaded, setLoaded] = useState(new Set([0]))
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const totalDragX = useRef(0)
  const autoAdvanceRef = useRef(null)
  const progressRef = useRef(null)
  const startTimeRef = useRef(Date.now())

  const nextIndex = (index + 1) % SLIDE_COUNT

  useEffect(() => {
    const img = new Image()
    img.src = SLIDES[nextIndex].src
  }, [nextIndex])

  const advance = useCallback(() => {
    setIndex((prev) => (prev + 1) % SLIDE_COUNT)
    setProgress(0)
    startTimeRef.current = Date.now()
  }, [])

  useEffect(() => {
    if (autoAdvanceRef.current) clearInterval(autoAdvanceRef.current)
    if (progressRef.current) cancelAnimationFrame(progressRef.current)

    if (!isHovered && !isDragging) {
      autoAdvanceRef.current = setInterval(advance, AUTO_ADVANCE_MS)
    }

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current
      const p = Math.min(100, (elapsed / AUTO_ADVANCE_MS) * 100)
      setProgress(p)
      progressRef.current = requestAnimationFrame(updateProgress)
    }
    progressRef.current = requestAnimationFrame(updateProgress)

    return () => {
      if (autoAdvanceRef.current) clearInterval(autoAdvanceRef.current)
      if (progressRef.current) cancelAnimationFrame(progressRef.current)
    }
  }, [isHovered, isDragging, index, advance])

  const handleLoad = useCallback((i) => {
    setLoaded((prev) => new Set([...prev, i]))
    if (i === 0) setIsLoading(false)
  }, [])

  const goTo = useCallback((i) => {
    setIndex(i)
    setProgress(0)
    startTimeRef.current = Date.now()
  }, [])

  const handlePointerDown = useCallback((e) => {
    setIsDragging(true)
    setIsHovered(true)
    dragStartX.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0
    totalDragX.current = 0
  }, [])

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0
    totalDragX.current = clientX - dragStartX.current
  }, [isDragging])

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return
    const dx = totalDragX.current
    const threshold = 60
    if (dx > threshold) goTo((index - 1 + SLIDE_COUNT) % SLIDE_COUNT)
    else if (dx < -threshold) goTo((index + 1) % SLIDE_COUNT)
    setIsDragging(false)
    setIsHovered(false)
  }, [isDragging, index, goTo])

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

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none touch-pan-y"
      onMouseEnter={() => !isDragging && setIsHovered(true)}
      onMouseLeave={() => !isDragging && setIsHovered(false)}
      onPointerDown={handlePointerDown}
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
          />
        ))}
      </div>

      <div className="absolute inset-0 gallery-overlay-edges pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 gallery-grain pointer-events-none" />
      <div className="absolute inset-0 gallery-glow-edge pointer-events-none" />

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 right-auto w-32 h-1 bg-white/20 rounded-full overflow-hidden z-20 pointer-events-auto">
        <motion.div
          className="h-full bg-white/90 rounded-full"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 pointer-events-auto mt-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/70'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
    </div>
  )
}
