import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { propertyService } from '../services/aiService';
import PropertyCardWithCompare from '../components/PropertyCardWithCompare';
import CompareBar from '../components/CompareBar';
import CompareModal from '../components/CompareModal';
import {
  Home,
  Search,
  MapPin,
  Filter,
  X,
  ChevronDown,
  Loader2,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
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

  const locationParam = searchParams.get('location') || '';
  const minParam = searchParams.get('min') || '';
  const maxParam = searchParams.get('max') || '';
  const bedsParam = searchParams.get('beds') || '';
  const verifiedParam = searchParams.get('verified') === 'true';
  const sortParam = searchParams.get('sort') || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [locationInput, setLocationInput] = useState(locationParam);
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
    if (locationParam.trim()) params.location = locationParam.trim();
    if (minParam) params.minPrice = minParam;
    if (maxParam) params.maxPrice = maxParam;
    if (bedsParam) params.bedrooms = bedsParam;
    if (verifiedParam) params.verified = true;
    params.sortBy = sortBy === 'price-low' ? 'price_asc' : sortBy === 'price-high' ? 'price_desc' : sortBy;
    return params;
  }, [locationParam, minParam, maxParam, bedsParam, verifiedParam, sortBy, currentPage]);

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
    if (locationInput.trim()) params.set('location', locationInput.trim());
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
    setLocationInput('');
    setPriceRange('all');
    setBedrooms('all');
    setVerifiedOnly(false);
    setSortBy('newest');
    setSearchParams({});
    setShowFilters(false);
  };

  const removeFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (key === 'location') {
      params.delete('location');
      setLocationInput('');
    } else if (key === 'price') {
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
    locationParam,
    minParam || maxParam,
    bedsParam,
    verifiedParam,
  ].filter(Boolean).length;

  const handleToggleCompare = (propertyId) => {
    setCompareProperties((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : prev.length < 3
          ? [...prev, propertyId]
          : prev
    );
  };

  const compareProps = useMemo(
    () => houses.filter((h) => compareProperties.includes(h._id || h.id)),
    [houses, compareProperties]
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-gray-100">
      {/* Hero */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/80 via-neutral-950 to-neutral-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.25),transparent)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-500/20 border border-violet-500/30 mb-6">
              <Home className="w-7 h-7 text-violet-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Houses for Rent
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Find verified rental houses across Nepal. Filter by location, price, and size.
            </p>
          </div>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                  placeholder="Location (e.g. Kathmandu, Pokhara)"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={applyFilters}
                className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="relative py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Toolbar: results count, filter button, sort */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              {!loading && (
                <h2 className="text-xl font-semibold text-white">
                  {total > 0 ? (
                    <>
                      {total} {total === 1 ? 'house' : 'houses'} found
                      {locationParam && (
                        <span className="text-gray-400 font-normal"> in {locationParam}</span>
                      )}
                    </>
                  ) : (
                    <>No houses match your filters</>
                  )}
                </h2>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 text-gray-300 hover:bg-neutral-800"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-violet-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              <div className="relative">
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
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {(locationParam || minParam || maxParam || bedsParam || verifiedParam) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {locationParam && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-300 text-sm">
                  {locationParam}
                  <button
                    type="button"
                    onClick={() => removeFilter('location')}
                    className="hover:bg-violet-500/30 rounded p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
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
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6">
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
                      Location
                    </label>
                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      placeholder="City or area"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
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
              </div>
            </aside>

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
                        Location
                      </label>
                      <input
                        type="text"
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        placeholder="City or area"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-gray-500"
                      />
                    </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {houses.map((house) => (
                      <PropertyCardWithCompare
                        key={house._id || house.id}
                        property={house}
                        isSelected={compareProperties.includes(house._id || house.id)}
                        onToggleCompare={handleToggleCompare}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pages > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="p-2.5 rounded-xl border border-neutral-700 bg-neutral-900 text-gray-400 hover:text-white hover:bg-neutral-800 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="px-4 py-2 text-sm text-gray-400">
                        Page {currentPage} of {pages}
                      </span>
                      <button
                        onClick={() => setPage(currentPage + 1)}
                        disabled={currentPage >= pages}
                        className="p-2.5 rounded-xl border border-neutral-700 bg-neutral-900 text-gray-400 hover:text-white hover:bg-neutral-800 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-12 md:p-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-6">
                    <Home className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No houses found</h3>
                  <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                    Try changing your filters or search in a different location.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {compareProperties.length > 0 && (
        <CompareBar
          selectedProperties={compareProps}
          onRemove={handleToggleCompare}
          onCompare={() => compareProperties.length >= 2 && setShowCompareModal(true)}
          onClose={() => setCompareProperties([])}
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
