import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { propertyService } from '../services/aiService';
import PropertyCardWithCompare from '../components/PropertyCardWithCompare';
import CompareBar from '../components/CompareBar';
import CompareModal from '../components/CompareModal';
import {
  Home,
  Filter,
  X,
  ChevronDown,
  Loader2,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Tag,
  Users,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { calculateRentConfidence, getBestForLabel } from '../utils/propertyUtils';

const LIMIT = 12;
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];
const PRICE_RANGES = [
  { value: 'all', label: 'Any price' },
  { value: '0-10000', label: 'Under NPR 10k' },
  { value: '10000-20000', label: 'NPR 10k – 20k' },
  { value: '20000-30000', label: 'NPR 20k – 30k' },
  { value: '30000-50000', label: 'NPR 30k – 50k' },
  { value: '50000-100000', label: 'NPR 50k+' },
];
const BED_OPTIONS = [
  { value: 'all', label: 'Any' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
];

const QUICK_BROWSE = [
  { id: 'best-value', label: 'Best value', description: 'Under NPR 15k/mo', icon: Tag, gradient: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30', params: () => ({ min: '', max: '15000', beds: '', verified: '' }) },
  { id: 'family', label: 'Family homes', description: '3+ bedrooms', icon: Users, gradient: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/30', params: () => ({ min: '', max: '', beds: '3', verified: '' }) },
  { id: 'verified', label: 'Verified only', description: 'RentNest verified', icon: ShieldCheck, gradient: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30', params: () => ({ min: '', max: '', beds: '', verified: 'true' }) },
  { id: 'under-20k', label: 'Under 20k', description: 'Budget-friendly', icon: Sparkles, gradient: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30', params: () => ({ min: '', max: '20000', beds: '', verified: '' }) },
];

function getPropertyTags(property) {
  const tags = [];
  if (property.price <= 15000) tags.push('Best Value');
  if (property.bedrooms >= 3) tags.push('Family Home');
  if (property.price <= 18000 && property.bedrooms >= 2) tags.push('Long-Stay Friendly');
  if (property.verified === true) tags.push('Verified');
  return tags.slice(0, 2);
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden animate-pulse">
      <div className="h-52 bg-neutral-800" />
      <div className="p-5 space-y-4">
        <div className="h-5 bg-neutral-800 rounded w-3/4" />
        <div className="h-4 bg-neutral-800 rounded w-1/2" />
        <div className="flex gap-4">
          <div className="h-4 bg-neutral-800 rounded w-12" />
          <div className="h-4 bg-neutral-800 rounded w-12" />
          <div className="h-4 bg-neutral-800 rounded w-16" />
        </div>
        <div className="h-10 bg-neutral-800 rounded-xl" />
      </div>
    </div>
  );
}

const HousePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const minParam = searchParams.get('min') || '';
  const maxParam = searchParams.get('max') || '';
  const bedsParam = searchParams.get('beds') || '';
  const verifiedParam = searchParams.get('verified') === 'true';
  const sortParam = searchParams.get('sort') || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [priceRange, setPriceRange] = useState(
    minParam || maxParam ? `${minParam || '0'}-${maxParam || '100000'}` : 'all'
  );
  const [bedrooms, setBedrooms] = useState(bedsParam || 'all');
  const [verifiedOnly, setVerifiedOnly] = useState(verifiedParam);
  const [sortBy, setSortBy] = useState(sortParam);
  const [showFilters, setShowFilters] = useState(false);

  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [compareProperties, setCompareProperties] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const currentPage = Math.max(1, Math.min(pageParam, pages || 1));

  const apiParams = useMemo(() => {
    const params = { type: 'house', limit: LIMIT, page: currentPage };
    if (minParam) params.minPrice = minParam;
    if (maxParam) params.maxPrice = maxParam;
    if (bedsParam) params.bedrooms = bedsParam;
    if (verifiedParam) params.verified = true;
    params.sortBy = sortBy === 'price-low' ? 'price_asc' : sortBy === 'price-high' ? 'price_desc' : sortBy;
    return params;
  }, [minParam, maxParam, bedsParam, verifiedParam, sortBy, currentPage]);

  // Hydrate compare list from localStorage (e.g. from Property Detail "Add to compare")
  useEffect(() => {
    try {
      const raw = localStorage.getItem('rentnest_compare_ids');
      if (raw) {
        const ids = JSON.parse(raw);
        if (Array.isArray(ids) && ids.length > 0) {
          setCompareProperties(ids.filter((id) => id && typeof id === 'string'));
        }
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await propertyService.getAll(apiParams);
        if (cancelled) return;
        if (response.success) {
          const list = Array.isArray(response.data) ? response.data : response.data?.data || [];
          setProperties(list);
          setTotal(response.total ?? list.length);
          setPages(response.pages ?? 1);
        } else {
          setError(response.message || 'Failed to load properties');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load properties');
          setProperties([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [apiParams]);

  const houses = useMemo(
    () =>
      properties.map((prop) => ({
        ...prop,
        id: prop._id || prop.id,
        rating: prop.rating ?? 4.5,
        confidenceScore: calculateRentConfidence(prop),
        bestFor: getBestForLabel(prop),
        tags: getPropertyTags(prop),
      })),
    [properties]
  );

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-');
      if (min && parseInt(min, 10) > 0) params.set('min', min);
      if (max && parseInt(max, 10) < 100000) params.set('max', max);
    }
    if (bedrooms !== 'all') params.set('beds', bedrooms);
    if (verifiedOnly) params.set('verified', 'true');
    if (sortBy !== 'newest') params.set('sort', sortBy);
    params.set('page', '1');
    setSearchParams(params);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setPriceRange('all');
    setBedrooms('all');
    setVerifiedOnly(false);
    setSortBy('newest');
    setSearchParams({});
    setShowFilters(false);
  };

  const removeFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (key === 'price') {
      params.delete('min');
      params.delete('max');
      setPriceRange('all');
    } else if (key === 'beds') {
      params.delete('beds');
      setBedrooms('all');
    } else if (key === 'verified') {
      params.delete('verified');
      setVerifiedOnly(false);
    } else if (key === 'sort') {
      params.delete('sort');
      setSortBy('newest');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const setPage = (p) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(Math.max(1, p)));
    setSearchParams(params);
  };

  const activeFiltersCount = [
    minParam || maxParam,
    bedsParam,
    verifiedParam,
  ].filter(Boolean).length;

  const applyQuickPreset = (preset) => {
    const p = preset.params();
    const params = new URLSearchParams();
    if (p.min) params.set('min', p.min);
    if (p.max) params.set('max', p.max);
    if (p.beds) params.set('beds', p.beds);
    if (p.verified) params.set('verified', p.verified);
    params.set('page', '1');
    setPriceRange(p.min || p.max ? (p.min || '0') + '-' + (p.max || '100000') : 'all');
    setBedrooms(p.beds || 'all');
    setVerifiedOnly(!!p.verified);
    setSearchParams(params);
    setShowFilters(false);
  };

  const handleToggleCompare = (propertyId) => {
    setCompareProperties((prev) => {
      const next = prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : prev.length < 3
          ? [...prev, propertyId]
          : prev;
      try {
        localStorage.setItem('rentnest_compare_ids', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  const compareProps = useMemo(
    () => houses.filter((h) => compareProperties.includes(h._id || h.id)),
    [houses, compareProperties]
  );

  const stagger = { visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } };
  const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } } };
  const particles = useMemo(() => Array.from({ length: 12 }, (_, i) => ({ id: i, x: Math.random() * 100, y: Math.random() * 100, size: 3 + Math.random() * 5, d: 6 + Math.random() * 8, delay: Math.random() * 3 })), []);

  const heroRef = useRef(null);
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 });
  const handleMouseMove = useCallback((e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseParallax({ x: x * 20, y: y * 20 });
  }, []);
  const handleMouseLeave = useCallback(() => setMouseParallax({ x: 0, y: 0 }), []);

  const orbs = useMemo(() => [
    { x: '10%', y: '20%', w: 280, color: 'violet', dur: 25 },
    { x: '70%', y: '30%', w: 200, color: 'indigo', dur: 30 },
    { x: '50%', y: '60%', w: 240, color: 'purple', dur: 28 },
    { x: '85%', y: '70%', w: 160, color: 'violet', dur: 22 },
    { x: '20%', y: '75%', w: 180, color: 'indigo', dur: 26 },
  ], []);

  return (
    <div className="min-h-screen bg-neutral-950 text-gray-100">
      {/* Premium Animated Header - background only enhanced */}
      <section
        ref={heroRef}
        className="relative py-16 md:py-20 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/95 via-indigo-950/97 to-neutral-950" />

        {/* Animated gradient mesh – living texture */}
        <div
          className="absolute inset-0 hero-gradient-mesh opacity-80"
          style={{ willChange: 'background-position' }}
        />
        {/* Flowing color waves */}
        <div className="absolute inset-0 hero-mesh-wave pointer-events-none" />
        <div className="absolute inset-0 hero-mesh-wave-2 pointer-events-none opacity-90" />
        {/* Soft glowing gradient spots – slow drift */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="hero-mesh-glow top-[10%] left-[15%] w-[400px] h-[400px] bg-indigo-600/20" style={{ animationDelay: '0s' }} />
          <div className="hero-mesh-glow top-[50%] right-[10%] w-[350px] h-[350px] bg-violet-600/18" style={{ animationDelay: '-12s' }} />
          <div className="hero-mesh-glow bottom-[15%] left-[30%] w-[380px] h-[380px] bg-blue-900/25" style={{ animationDelay: '-24s' }} />
          <div className="hero-mesh-glow top-[35%] right-[35%] w-[280px] h-[280px] bg-purple-700/15" style={{ animationDelay: '-8s' }} />
        </div>

        {/* Slow zoom background image - parallax wrapper + zoom */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            transform: `translate3d(${mouseParallax.x * 0.6}px, ${mouseParallax.y * 0.6}px, 0)`,
            transition: 'transform 0.12s ease-out',
            willChange: 'transform',
          }}
        >
          <div
            className="absolute inset-0 -inset-[5%] hero-bg-zoom bg-cover bg-center bg-no-repeat opacity-[0.18]"
            style={{ backgroundImage: `url(https://gharjaggabazar.com/uploads/seller/image/x13_20260218082817.jpg.pagespeed.ic.7ECxkk0mFy.jpg)` }}
          />
        </div>

        {/* Base gradient waves layer */}
        <div className="absolute inset-0 hero-gradient-waves opacity-70" />
        {/* Moving gradient blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="hero-wave-blob top-[15%] left-[15%] w-80 h-80 bg-violet-500/15" />
          <div className="hero-wave-blob top-[55%] right-[20%] w-72 h-72 bg-indigo-500/12" />
          <div className="hero-wave-blob bottom-[20%] left-[35%] w-96 h-72 bg-purple-500/10" />
        </div>

        {/* Floating blurred light orbs - parallax wrapper + float animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {orbs.map((orb, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: orb.x,
                top: orb.y,
                width: orb.w,
                height: orb.w,
                transform: `translate3d(${mouseParallax.x * (0.4 + i * 0.08)}px, ${mouseParallax.y * (0.4 + i * 0.08)}px, 0)`,
                transition: 'transform 0.15s ease-out',
                willChange: 'transform',
              }}
            >
              <div
                className={`absolute inset-0 rounded-full blur-3xl hero-orb-float hero-orb-${orb.color}`}
                style={{ animationDuration: `${orb.dur}s`, animationDelay: `${i * 2}s` }}
              />
            </div>
          ))}
        </div>

        {/* Subtle particles for depth + parallax */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: `translate3d(${mouseParallax.x * 1.2}px, ${mouseParallax.y * 1.2}px, 0)`,
                transition: 'transform 0.2s ease-out',
                willChange: 'transform',
              }}
            >
              <motion.div
                className="rounded-full bg-violet-400/12"
                style={{ width: p.size, height: p.size }}
                animate={{ opacity: [0.1, 0.35, 0.1], scale: [1, 1.2, 1] }}
                transition={{ duration: p.d, repeat: Infinity, delay: p.delay }}
              />
            </div>
          ))}
        </div>

        {/* Gradient overlay for glass feel */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-950/50 to-neutral-950" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-10" initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-500/20 border border-violet-500/30 mb-6">
              <Home className="w-7 h-7 text-violet-400" />
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-white mb-3">
              Houses for Rent
            </motion.h1>
            <motion.p variants={fadeUp} className="text-gray-400 text-lg max-w-xl mx-auto">
              Browse verified rental houses. Filter by price, size & verified status—no location search here.
            </motion.p>
          </motion.div>

          {/* Browse by – stagger animation */}
          <motion.div className="mt-10" initial="hidden" animate="visible" variants={stagger}>
            <motion.p variants={fadeUp} className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4 text-center">
              Browse by
            </motion.p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
              {QUICK_BROWSE.map((item) => {
                const Icon = item.icon;
                const isActive =
                  (item.id === 'best-value' && maxParam === '15000' && !minParam && !bedsParam && !verifiedParam) ||
                  (item.id === 'family' && bedsParam === '3' && !minParam && !maxParam && !verifiedParam) ||
                  (item.id === 'verified' && verifiedParam && !minParam && !maxParam && !bedsParam) ||
                  (item.id === 'under-20k' && maxParam === '20000' && !minParam && !bedsParam && !verifiedParam);
                return (
                  <motion.button
                    key={item.id}
                    variants={fadeUp}
                    type="button"
                    onClick={() => applyQuickPreset(item)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border bg-neutral-900/80 text-left transition-all ${item.gradient} ${item.border} ${isActive ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-neutral-950' : ''}`}
                    whileHover={{ scale: 1.03, boxShadow: '0 12px 28px -8px rgba(124, 58, 237, 0.25)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className={`w-6 h-6 ${isActive ? 'text-violet-400' : 'text-gray-400'}`} />
                    <span className="font-semibold text-white text-sm">{item.label}</span>
                    <span className="text-xs text-gray-500">{item.description}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main content - scroll reveal */}
      <motion.section
        className="relative py-8 md:py-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats strip – House page advanced insight */}
          {!loading && properties.length > 0 && (
            <motion.div
              className="flex flex-wrap items-center gap-x-6 gap-y-1 mb-4 py-2 text-sm text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="font-medium text-white">{total} {total === 1 ? 'listing' : 'listings'}</span>
              <span>
                Avg. rent this set: NPR {Math.round(properties.reduce((s, p) => s + (p.price || 0), 0) / properties.length).toLocaleString()}/mo
              </span>
              {verifiedParam && <span className="text-amber-400/90">Verified only</span>}
            </motion.div>
          )}

          {/* Toolbar: results count, filter button, sort */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              {!loading && (
                <h2 className="text-xl font-semibold text-white">
                  {total > 0 ? (
                    <>{total} {total === 1 ? 'house' : 'houses'} found</>
                  ) : (
                    <>No houses match your filters</>
                  )}
                </h2>
              )}
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 text-gray-300 hover:bg-neutral-800"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-violet-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </motion.button>
              <motion.div className="relative" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    const p = new URLSearchParams(searchParams);
                    if (e.target.value !== 'newest') p.set('sort', e.target.value);
                    else p.delete('sort');
                    p.set('page', '1');
                    setSearchParams(p);
                  }}
                  className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 min-w-[180px]"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </motion.div>
            </div>
          </div>

          {/* Active filter chips */}
          {(minParam || maxParam || bedsParam || verifiedParam) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {(minParam || maxParam) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-gray-300 text-sm">
                  {minParam && maxParam
                    ? `NPR ${minParam}–${maxParam}`
                    : minParam
                      ? `Min ${minParam}`
                      : `Max ${maxParam}`}
                  <button
                    type="button"
                    onClick={() => removeFilter('price')}
                    className="hover:bg-neutral-700 rounded p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {bedsParam && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-gray-300 text-sm">
                  {bedsParam}+ beds
                  <button
                    type="button"
                    onClick={() => removeFilter('beds')}
                    className="hover:bg-neutral-700 rounded p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {verifiedParam && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-gray-300 text-sm">
                  Verified
                  <button
                    type="button"
                    onClick={() => removeFilter('verified')}
                    className="hover:bg-neutral-700 rounded p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm text-violet-400 hover:text-violet-300"
              >
                Clear all
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar filters - desktop */}
            <motion.aside
              className="hidden lg:block lg:col-span-1"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="sticky top-24 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6"
                whileHover={{ boxShadow: '0 20px 40px -12px rgba(0,0,0,0.3)' }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Filter className="w-4 h-4 text-violet-400" />
                    Filters
                  </h3>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="text-sm text-violet-400 hover:text-violet-300"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Price range
                    </label>
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      {PRICE_RANGES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Bedrooms
                    </label>
                    <select
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      {BED_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-600 bg-neutral-800 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="text-sm text-gray-300">Verified listings only</span>
                  </label>
                  <button
                    onClick={applyFilters}
                    className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors"
                  >
                    Apply filters
                  </button>
                </div>
              </motion.div>
            </motion.aside>

            {/* Mobile filter panel */}
            {showFilters && (
              <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
                <div
                  className="absolute inset-0 bg-black/60"
                  onClick={() => setShowFilters(false)}
                />
                <div className="relative w-full max-w-sm bg-neutral-900 border-l border-neutral-800 h-full overflow-y-auto p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-white">Filters</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-2 rounded-lg hover:bg-neutral-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Price range
                      </label>
                      <select
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-gray-200"
                      >
                        {PRICE_RANGES.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Bedrooms
                      </label>
                      <select
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-gray-200"
                      >
                        {BED_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={verifiedOnly}
                        onChange={(e) => setVerifiedOnly(e.target.checked)}
                        className="w-4 h-4 rounded border-neutral-600 bg-neutral-800 text-violet-600"
                      />
                      <span className="text-sm text-gray-300">Verified only</span>
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={resetFilters}
                        className="flex-1 py-3 rounded-xl border border-neutral-700 text-gray-300 hover:bg-neutral-800"
                      >
                        Reset
                      </button>
                      <button
                        onClick={applyFilters}
                        className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <CardSkeleton key={i} />
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-12 text-center">
                  <p className="text-red-400 font-medium mb-2">Unable to load houses</p>
                  <p className="text-gray-400 text-sm mb-6">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium"
                  >
                    Retry
                  </button>
                </div>
              ) : houses.length > 0 ? (
                <>
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.08 }}
                    variants={stagger}
                  >
                    {houses.map((house) => (
                      <motion.div
                        key={house._id || house.id}
                        variants={fadeUp}
                        whileHover={{ y: -8, transition: { duration: 0.2 } }}
                        className="transition-shadow duration-300 rounded-2xl hover:shadow-xl hover:shadow-violet-500/10"
                      >
                        <PropertyCardWithCompare
                          property={house}
                          isSelected={compareProperties.includes(house._id || house.id)}
                          onToggleCompare={handleToggleCompare}
                        />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Pagination */}
                  {pages > 1 && (
                    <motion.div
                      className="mt-10 flex items-center justify-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.button
                        onClick={() => setPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="p-2.5 rounded-xl border border-neutral-700 bg-neutral-900 text-gray-400 hover:text-white hover:bg-neutral-800 disabled:opacity-50 disabled:pointer-events-none"
                        whileHover={{ scale: currentPage > 1 ? 1.03 : 1 }}
                        whileTap={{ scale: currentPage > 1 ? 0.98 : 1 }}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </motion.button>
                      <span className="px-4 py-2 text-sm text-gray-400">
                        Page {currentPage} of {pages}
                      </span>
                      <motion.button
                        onClick={() => setPage(currentPage + 1)}
                        disabled={currentPage >= pages}
                        className="p-2.5 rounded-xl border border-neutral-700 bg-neutral-900 text-gray-400 hover:text-white hover:bg-neutral-800 disabled:opacity-50 disabled:pointer-events-none"
                        whileHover={{ scale: currentPage < pages ? 1.03 : 1 }}
                        whileTap={{ scale: currentPage < pages ? 0.98 : 1 }}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </motion.button>
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.div
                  className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-12 md:p-16 text-center"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="w-20 h-20 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-6">
                    <Home className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No houses found</h3>
                  <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                    Try changing your filters or clear filters to see more listings.
                  </p>
                  <motion.button
                    onClick={resetFilters}
                    className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Clear all filters
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {compareProperties.length > 0 && (
        <CompareBar
          selectedProperties={compareProps}
          onRemove={handleToggleCompare}
          onCompare={() => compareProperties.length >= 2 && setShowCompareModal(true)}
          onClose={() => {
        setCompareProperties([]);
        try { localStorage.setItem('rentnest_compare_ids', '[]'); } catch (_) {}
      }}
        />
      )}

      {showCompareModal && (
        <CompareModal
          properties={compareProps}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </div>
  );
};

export default HousePage;
