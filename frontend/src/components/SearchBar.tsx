import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ActiveFilters } from './FilterChips';

const SIZES = ['0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const COLORS = ['Red', 'Blue', 'Green', 'Black', 'White', 'Pink', 'Purple', 'Gold', 'Silver', 'Champagne', 'Ivory', 'Navy', 'Burgundy', 'Coral', 'Teal'];

interface SearchBarProps {
  initialFilters?: ActiveFilters;
  onSearch: (filters: ActiveFilters) => void;
}

export default function SearchBar({ initialFilters = {}, onSearch }: SearchBarProps) {
  const [keyword, setKeyword] = useState(initialFilters.keyword ?? '');
  const [showFilters, setShowFilters] = useState(false);
  const [size, setSize] = useState(initialFilters.size ?? '');
  const [color, setColor] = useState(initialFilters.color ?? '');
  const [condition, setCondition] = useState(initialFilters.condition ?? '');
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice?.toString() ?? '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice?.toString() ?? '');

  const handleSearch = () => {
    const filters: ActiveFilters = {};
    if (keyword.trim()) filters.keyword = keyword.trim();
    if (size) filters.size = size;
    if (color) filters.color = color;
    if (condition) filters.condition = condition;
    if (minPrice) filters.minPrice = Number(minPrice);
    if (maxPrice) filters.maxPrice = Number(maxPrice);
    onSearch(filters);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const clearFilters = () => {
    setSize('');
    setColor('');
    setCondition('');
    setMinPrice('');
    setMaxPrice('');
  };

  const hasFilters = size || color || condition || minPrice || maxPrice;

  return (
    <div className="w-full">
      {/* Main search row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search dresses by title or description…"
            className="pl-10 border-rose-gold-200 focus:ring-rose-gold-400 font-sans bg-white/80"
          />
          {keyword && (
            <button
              onClick={() => setKeyword('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className={`border-rose-gold-200 font-sans gap-2 ${hasFilters ? 'bg-rose-gold-50 text-rose-gold-600 border-rose-gold-300' : ''}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {hasFilters && (
            <span className="bg-rose-gold-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              !
            </span>
          )}
        </Button>
        <Button
          onClick={handleSearch}
          className="bg-rose-gold-500 hover:bg-rose-gold-600 text-white font-sans"
        >
          Search
        </Button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mt-3 p-4 bg-white/80 border border-rose-gold-100 rounded-xl shadow-xs animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="font-sans text-xs font-medium text-muted-foreground uppercase tracking-wide">Size</Label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger className="border-rose-gold-200 font-sans text-sm h-9">
                  <SelectValue placeholder="Any size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any size</SelectItem>
                  {SIZES.map((s) => (
                    <SelectItem key={s} value={s}>Size {s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="font-sans text-xs font-medium text-muted-foreground uppercase tracking-wide">Color</Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger className="border-rose-gold-200 font-sans text-sm h-9">
                  <SelectValue placeholder="Any color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any color</SelectItem>
                  {COLORS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="font-sans text-xs font-medium text-muted-foreground uppercase tracking-wide">Condition</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger className="border-rose-gold-200 font-sans text-sm h-9">
                  <SelectValue placeholder="Any condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any condition</SelectItem>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="font-sans text-xs font-medium text-muted-foreground uppercase tracking-wide">Price Range</Label>
              <div className="flex gap-1 items-center">
                <Input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="border-rose-gold-200 font-sans text-sm h-9 w-full"
                  min={0}
                />
                <span className="text-muted-foreground text-xs">–</span>
                <Input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="border-rose-gold-200 font-sans text-sm h-9 w-full"
                  min={0}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={clearFilters}
              className="text-xs font-sans text-muted-foreground hover:text-rose-gold-600 underline transition-colors"
            >
              Clear filters
            </button>
            <Button
              onClick={() => { handleSearch(); setShowFilters(false); }}
              size="sm"
              className="bg-rose-gold-500 hover:bg-rose-gold-600 text-white font-sans"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
