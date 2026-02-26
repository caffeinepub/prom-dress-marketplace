import { useParams, Link } from '@tanstack/react-router';
import { ArrowLeft, Tag, Ruler, Sparkles, Star, MessageCircle, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useGetListing, useSendMessage, useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import PhotoGallery from '../components/PhotoGallery';

const BROWN = '#3B1F0E';
const BROWN_HOVER = '#5a2f14';

function BrownButton({ children, onClick, disabled = false, className = '', type = 'button' }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type={type}
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

export default function ListingDetailPage() {
  const { id } = useParams({ from: '/listing/$id' });
  const { identity } = useInternetIdentity();
  const { data: listing, isLoading } = useGetListing(BigInt(id));
  const { data: userProfile } = useGetCallerUserProfile();
  const sendMessage = useSendMessage();

  const [message, setMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  const isAuthenticated = !!identity;
  const isOwnListing = listing && identity
    ? listing.sellerId.toString() === identity.getPrincipal().toString()
    : false;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !listing) return;
    try {
      await sendMessage.mutateAsync({
        sellerId: listing.sellerId,
        listingId: listing.id,
        message: message.trim(),
      });
      setMessageSent(true);
      setMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: BROWN }} />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground text-lg">Listing not found.</p>
        <Link to="/browse" className="text-primary hover:underline">Back to Browse</Link>
      </div>
    );
  }

  const priceDisplay = `$${(Number(listing.price) / 100).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back */}
        <Link
          to="/browse"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Browse
        </Link>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Gallery */}
          <PhotoGallery photos={listing.photos} title={listing.title} />

          {/* Details */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-bold text-foreground">{listing.title}</h1>
                {listing.isFeatured && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: BROWN }}>
                    <Star className="w-3 h-3" /> Featured
                  </span>
                )}
              </div>
              <div className="text-3xl font-bold mt-2" style={{ color: BROWN }}>{priceDisplay}</div>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2">
              {listing.isAvailable ? (
                <><CheckCircle className="w-5 h-5 text-green-500" /><span className="text-green-600 font-medium">Available</span></>
              ) : (
                <><XCircle className="w-5 h-5 text-red-500" /><span className="text-red-600 font-medium">Sold</span></>
              )}
            </div>

            {/* Attributes */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted rounded-xl p-4 text-center">
                <Ruler className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <div className="text-xs text-muted-foreground">Size</div>
                <div className="font-semibold text-foreground">{listing.size}</div>
              </div>
              <div className="bg-muted rounded-xl p-4 text-center">
                <Tag className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <div className="text-xs text-muted-foreground">Color</div>
                <div className="font-semibold text-foreground">{listing.color}</div>
              </div>
              <div className="bg-muted rounded-xl p-4 text-center">
                <Sparkles className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <div className="text-xs text-muted-foreground">Condition</div>
                <div className="font-semibold text-foreground">{listing.condition}</div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
            </div>

            {/* Inquiry Form */}
            {!isOwnListing && listing.isAvailable && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" /> Contact Seller
                </h3>
                {!isAuthenticated ? (
                  <p className="text-muted-foreground text-sm">
                    Please <button onClick={() => {}} className="underline font-medium" style={{ color: BROWN }}>log in</button> to contact the seller.
                  </p>
                ) : messageSent ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>Message sent! The seller will be in touch.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Hi, I'm interested in this dress..."
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                    <BrownButton
                      type="submit"
                      disabled={!message.trim() || sendMessage.isPending}
                      className="w-full py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
                    >
                      {sendMessage.isPending ? 'Sending...' : 'Send Message'}
                    </BrownButton>
                  </form>
                )}
              </div>
            )}

            {isOwnListing && (
              <Link to="/dashboard">
                <BrownButton className="w-full py-2.5 rounded-lg font-semibold text-sm transition-colors">
                  Manage This Listing
                </BrownButton>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
