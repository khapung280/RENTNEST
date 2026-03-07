import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

const SLIDE_COUNT = 7
const AUTO_ADVANCE_MS = 2000
const TRANSITION_DURATION = 0.8

const SLIDES = [
  { id: 1, src: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Modern luxury house exterior with warm evening lighting' },
  { id: 2, src: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Spacious living room with floor-to-ceiling windows' },
  { id: 3, src: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Stylish kitchen with marble countertops' },
  { id: 4, src: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Cozy bedroom with city view' },
  { id: 5, src: 'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Modern apartment building exterior' },
  { id: 6, src: 'https://images.pexels.com/photos/1438834/pexels-photo-1438834.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Mountain view house with traditional-modern fusion' },
  { id: 7, src: 'https://images.pexels.com/photos/1457844/pexels-photo-1457844.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Luxury bathroom with spa-like atmosphere' },
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
        referrerPolicy="no-referrer"
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
  const prevIndex = (index - 1 + SLIDE_COUNT) % SLIDE_COUNT

  useEffect(() => {
    const timer = setTimeout(() => {
      const img = new Image()
      img.referrerPolicy = 'no-referrer'
      img.src = SLIDES[nextIndex].src
    }, 100)
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
    if (dx > threshold) goTo(prevIndex)
    else if (dx < -threshold) goTo(nextIndex)
    setIsDragging(false)
    setIsHovered(false)
  }, [isDragging, prevIndex, nextIndex, goTo])

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
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
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

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
    </div>
  )
}
