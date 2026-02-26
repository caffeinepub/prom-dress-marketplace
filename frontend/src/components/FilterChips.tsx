import { X } from 'lucide-react';

export interface ActiveFilters {
  keyword?: string;
  size?: string;
  color?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface FilterChipsProps {
  filters: ActiveFilters;
  onRemove: (key: keyof ActiveFilters) => void;
  onClearAll: () => void;
}

export default function FilterChips({ filters, onRemove, onClearAll }: FilterChipsProps) {
  const chips: { key: keyof ActiveFilters; label: string }[] = [];

  if (filters.keyword) chips.push({ key: 'keyword', label: `"${filters.keyword}"` });
  if (filters.size) chips.push({ key: 'size', label: `Size: ${filters.size}` });
  if (filters.color) chips.push({ key: 'color', label: `Color: ${filters.color}` });
  if (filters.condition) chips.push({ key: 'condition', label: `Condition: ${filters.condition}` });
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const min = filters.minPrice ?? 0;
    const max = filters.maxPrice ?? 9999;
    chips.push({ key: 'minPrice', label: `$${min}–$${max}` });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-sans text-muted-foreground">Filters:</span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={() => onRemove(chip.key)}
          className="flex items-center gap-1 bg-rose-gold-100 text-rose-gold-700 border border-rose-gold-200 text-xs font-sans px-3 py-1 rounded-full hover:bg-rose-gold-200 transition-colors"
        >
          {chip.label}
          <X className="w-3 h-3" />
        </button>
      ))}
      <button
        onClick={onClearAll}
        className="text-xs font-sans text-muted-foreground hover:text-rose-gold-600 underline transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}
