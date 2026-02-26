import { useState } from 'react';
import { Edit, Trash2, Star, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { DressListing } from '../backend';
import { useDeleteListing, usePromoteListing, useGetMessages } from '../hooks/useQueries';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const BROWN = '#3B1F0E';
const BROWN_HOVER = '#5a2f14';

interface Props {
  listing: DressListing;
  onEdit: () => void;
}

function BrownBtn({ children, onClick, disabled = false, className = '' }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{ backgroundColor: disabled ? '#9ca3af' : hovered ? BROWN_HOVER : BROWN, color: '#fff' }}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

export default function ListingManagementCard({ listing, onEdit }: Props) {
  const deleteListing = useDeleteListing();
  const promoteListing = usePromoteListing();
  const [showMessages, setShowMessages] = useState(false);
  // Use undefined instead of null to satisfy the hook's type signature
  const { data: messages = [] } = useGetMessages(showMessages ? listing.id : undefined);

  const firstPhoto = listing.photos[0];
  const photoUrl = firstPhoto ? firstPhoto.getDirectURL() : '/assets/generated/listing-placeholder.dim_400x500.png';
  const priceDisplay = `$${(Number(listing.price) / 100).toFixed(2)}`;

  const handleDelete = async () => {
    try {
      await deleteListing.mutateAsync(listing.id);
    } catch (err) {
      console.error('Failed to delete listing:', err);
    }
  };

  const handlePromote = async () => {
    try {
      await promoteListing.mutateAsync(listing.id);
    } catch (err) {
      console.error('Failed to promote listing:', err);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Photo */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img src={photoUrl} alt={listing.title} className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2 flex gap-1">
          {listing.isFeatured && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: BROWN }}>
              <Star className="w-3 h-3" /> Featured
            </span>
          )}
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${listing.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {listing.isAvailable ? 'Available' : 'Sold'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground truncate">{listing.title}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="font-bold" style={{ color: BROWN }}>{priceDisplay}</span>
          <span className="text-xs text-muted-foreground">{listing.size} · {listing.color}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <BrownBtn
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Edit className="w-3.5 h-3.5" /> Edit
          </BrownBtn>

          {!listing.isFeatured && (
            <BrownBtn
              onClick={handlePromote}
              disabled={promoteListing.isPending}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              <Star className="w-3.5 h-3.5" /> {promoteListing.isPending ? '...' : 'Feature'}
            </BrownBtn>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-red-600 hover:bg-red-700 text-white">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{listing.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="text-white"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  {deleteListing.isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Messages Toggle */}
        <button
          onClick={() => setShowMessages(!showMessages)}
          className="w-full mt-2 flex items-center justify-center gap-1 py-1.5 rounded-lg text-sm font-medium transition-colors border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Messages
          {showMessages ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {/* Messages Panel */}
        {showMessages && (
          <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">No messages yet</p>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className="bg-muted rounded-lg p-2">
                  <p className="text-xs text-muted-foreground mb-1">
                    {msg.buyerId.toString().slice(0, 12)}...
                  </p>
                  <p className="text-sm text-foreground">{msg.message}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
