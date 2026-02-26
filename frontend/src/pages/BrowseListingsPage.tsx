import { useState, useEffect } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useGetAllListings } from '../hooks/useQueries';
import ListingCard from '../components/ListingCard';
import { DressListing } from '../backend';

const BROWN = '#3B1F0E';
const BROWN_HOVER = '#5a2f14';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '0', '2', '4', '6', '8', '10', '12', '14', '16'];
const COLORS = ['Red', 'Blue', 'Green', 'Pink', 'Purple', 'Black', 'White', 'Gold', 'Silver', 'Navy', 'Burgundy', 'Champagne'];
const CONDITIONS = ['New with tags', 'Like new', 'Good', 'Fair'];

interface Filters {
  search: string;
  sizes: string[];
  colors: string[];
  conditions: string[];
  minPrice: string;
  maxPrice: string;
}

function BrownBtn({ children, onClick, className = '', disabled = false, style = {} }: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{ backgroundColor: hovered ? BROWN_HOVER : BROWN, color: '#fff', ...style }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

export default function BrowseListingsPage() {
  const searchParams = useSearch({ from: '/browse' }) as { search?: string };
  const navigate = useNavigate();
  const { data: allListings = [], isLoading } = useGetAllListings();

  const [filters, setFilters] = useState<Filters>({
    search: searchParams.search || '',
    sizes: [],
    colors: [],
    conditions: [],
    minPrice: '',
    maxPrice: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    if (searchParams.search) {
      setFilters(prev => ({ ...prev, search: searchParams.search || '' }));
    }
  }, [searchParams.search]);

  const filteredListings = allListings.filter((listing: DressListing) => {
    if (!listing.isAvailable) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!listing.title.toLowerCase().includes(q) &&
          !listing.description.toLowerCase().includes(q) &&
          !listing.color.toLowerCase().includes(q) &&
          !listing.size.toLowerCase().includes(q)) return false;
    }
    if (filters.sizes.length > 0 && !filters.sizes.includes(listing.size)) return false;
    if (filters.colors.length > 0 && !filters.colors.includes(listing.color)) return false;
    if (filters.conditions.length > 0 && !filters.conditions.includes(listing.condition)) return false;
    if (filters.minPrice && Number(listing.price) / 100 < parseFloat(filters.minPrice)) return false;
    if (filters.maxPrice && Number(listing.price) / 100 > parseFloat(filters.maxPrice)) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleFilter = (type: 'sizes' | 'colors' | 'conditions', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value],
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', sizes: [], colors: [], conditions: [], minPrice: '', maxPrice: '' });
    setCurrentPage(1);
  };

  const activeFilterCount = filters.sizes.length + filters.colors.length + filters.conditions.length +
    (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground mb-4">Browse Dresses</h1>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, color, size..."
                value={filters.search}
                onChange={e => { setFilters(prev => ({ ...prev, search: e.target.value })); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <BrownBtn
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-white/20 text-white text-xs rounded-full px-1.5 py-0.5">
                  {activeFilterCount}
                </span>
              )}
            </BrownBtn>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Filters</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" /> Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Size */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Size</h4>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(size => (
                    <button
                      key={size}
                      onClick={() => toggleFilter('sizes', size)}
                      className="px-3 py-1 rounded-full text-sm border transition-colors"
                      style={filters.sizes.includes(size)
                        ? { backgroundColor: BROWN, color: '#fff', borderColor: BROWN }
                        : { backgroundColor: 'transparent', borderColor: '#d1d5db' }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              {/* Color */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Color</h4>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => toggleFilter('colors', color)}
                      className="px-3 py-1 rounded-full text-sm border transition-colors"
                      style={filters.colors.includes(color)
                        ? { backgroundColor: BROWN, color: '#fff', borderColor: BROWN }
                        : { backgroundColor: 'transparent', borderColor: '#d1d5db' }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
              {/* Condition */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Condition</h4>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map(cond => (
                    <button
                      key={cond}
                      onClick={() => toggleFilter('conditions', cond)}
                      className="px-3 py-1 rounded-full text-sm border transition-colors"
                      style={filters.conditions.includes(cond)
                        ? { backgroundColor: BROWN, color: '#fff', borderColor: BROWN }
                        : { backgroundColor: 'transparent', borderColor: '#d1d5db' }}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>
              {/* Price */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Price Range ($)</h4>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={e => { setFilters(prev => ({ ...prev, minPrice: e.target.value })); setCurrentPage(1); }}
                    className="w-full px-3 py-1.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <span className="text-muted-foreground">–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={e => { setFilters(prev => ({ ...prev, maxPrice: e.target.value })); setCurrentPage(1); }}
                    className="w-full px-3 py-1.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.sizes.map(s => (
              <span key={s} className="flex items-center gap-1 px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: BROWN }}>
                Size: {s}
                <button onClick={() => toggleFilter('sizes', s)} className="ml-1 hover:opacity-75"><X className="w-3 h-3" /></button>
              </span>
            ))}
            {filters.colors.map(c => (
              <span key={c} className="flex items-center gap-1 px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: BROWN }}>
                {c}
                <button onClick={() => toggleFilter('colors', c)} className="ml-1 hover:opacity-75"><X className="w-3 h-3" /></button>
              </span>
            ))}
            {filters.conditions.map(c => (
              <span key={c} className="flex items-center gap-1 px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: BROWN }}>
                {c}
                <button onClick={() => toggleFilter('conditions', c)} className="ml-1 hover:opacity-75"><X className="w-3 h-3" /></button>
              </span>
            ))}
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-sm border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" /> Clear all
            </button>
          </div>
        )}

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Loading...' : `${filteredListings.length} dress${filteredListings.length !== 1 ? 'es' : ''} found`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden border border-border animate-pulse">
                <div className="aspect-[3/4] bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : paginatedListings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No dresses found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="mt-4 px-6 py-2 rounded-lg font-medium text-white transition-colors"
              style={{ backgroundColor: BROWN }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = BROWN_HOVER)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = BROWN)}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedListings.map((listing: DressListing) => (
                <ListingCard key={listing.id.toString()} listing={listing} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-40"
                  style={{ backgroundColor: BROWN }}
                  onMouseEnter={e => { if (currentPage !== 1) e.currentTarget.style.backgroundColor = BROWN_HOVER; }}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = BROWN)}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className="w-9 h-9 rounded-lg text-sm font-medium transition-colors"
                    style={page === currentPage
                      ? { backgroundColor: BROWN, color: '#fff' }
                      : { backgroundColor: 'transparent', color: 'inherit', border: '1px solid #d1d5db' }}
                    onMouseEnter={e => { if (page !== currentPage) e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                    onMouseLeave={e => { if (page !== currentPage) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-40"
                  style={{ backgroundColor: BROWN }}
                  onMouseEnter={e => { if (currentPage !== totalPages) e.currentTarget.style.backgroundColor = BROWN_HOVER; }}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = BROWN)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
