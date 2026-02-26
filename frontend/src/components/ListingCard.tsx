import { Link } from '@tanstack/react-router';
import type { DressListing } from '../backend';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Tag } from 'lucide-react';

interface ListingCardProps {
  listing: DressListing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const photoUrl = listing.photos.length > 0
    ? listing.photos[0].getDirectURL()
    : '/assets/generated/listing-placeholder.dim_400x500.png';

  const priceDisplay = `$${(Number(listing.price) / 100).toFixed(2)}`;

  const conditionColor: Record<string, string> = {
    'New': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Like New': 'bg-sky-100 text-sky-700 border-sky-200',
    'Good': 'bg-amber-100 text-amber-700 border-amber-200',
    'Fair': 'bg-orange-100 text-orange-700 border-orange-200',
  };

  return (
    <Link
      to="/listing/$id"
      params={{ id: listing.id.toString() }}
      className="group block"
    >
      <article className="bg-card rounded-xl overflow-hidden border border-rose-gold-100 shadow-xs hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
        {/* Photo */}
        <div className="relative aspect-[4/5] overflow-hidden bg-champagne-100">
          <img
            src={photoUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/generated/listing-placeholder.dim_400x500.png';
            }}
          />
          {listing.isFeatured && (
            <div className="absolute top-2 left-2">
              <span className="flex items-center gap-1 bg-rose-gold-500 text-white text-xs font-sans font-medium px-2 py-1 rounded-full shadow-rose">
                <Sparkles className="w-3 h-3" />
                Featured
              </span>
            </div>
          )}
          {!listing.isAvailable && (
            <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
              <span className="bg-white/90 text-foreground font-serif text-lg font-semibold px-4 py-2 rounded-lg">
                Sold
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-serif text-base font-semibold text-foreground line-clamp-1 mb-1 group-hover:text-rose-gold-600 transition-colors">
            {listing.title}
          </h3>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs font-sans px-2 py-0.5 rounded-full border ${conditionColor[listing.condition] ?? 'bg-muted text-muted-foreground border-border'}`}>
              {listing.condition}
            </span>
            <span className="text-xs font-sans text-muted-foreground">
              Size {listing.size}
            </span>
            {listing.color && (
              <span className="text-xs font-sans text-muted-foreground capitalize">
                · {listing.color}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="font-serif text-xl font-semibold text-rose-gold-600">
              {priceDisplay}
            </span>
            <Tag className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </article>
    </Link>
  );
}
