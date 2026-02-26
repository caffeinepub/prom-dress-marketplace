import { useState } from 'react';
import { Plus, BarChart3, Package, MessageSquare, Star } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetSellerListings } from '../hooks/useQueries';
import ListingManagementCard from '../components/ListingManagementCard';
import CreateListingForm from '../components/CreateListingForm';
import EditListingForm from '../components/EditListingForm';
import { DressListing } from '../backend';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const BROWN = '#3B1F0E';
const BROWN_HOVER = '#5a2f14';

export default function SellerDashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  // Use undefined instead of null to satisfy the hook's type signature
  const principal = identity?.getPrincipal();
  const { data: myListings = [], isLoading } = useGetSellerListings(principal);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingListing, setEditingListing] = useState<DressListing | null>(null);

  const isAuthenticated = !!identity;

  const stats = {
    total: myListings.length,
    available: myListings.filter((l: DressListing) => l.isAvailable).length,
    featured: myListings.filter((l: DressListing) => l.isFeatured).length,
    sold: myListings.filter((l: DressListing) => !l.isAvailable).length,
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <Package className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold text-foreground">Seller Dashboard</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Please log in to access your seller dashboard and manage your listings.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {userProfile ? `${userProfile.name}'s Dashboard` : 'Seller Dashboard'}
              </h1>
              <p className="text-muted-foreground mt-1">Manage your dress listings</p>
            </div>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white transition-colors"
              style={{ backgroundColor: BROWN }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = BROWN_HOVER)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = BROWN)}
            >
              <Plus className="w-5 h-5" />
              New Listing
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Package, label: 'Total Listings', value: stats.total, color: BROWN },
            { icon: BarChart3, label: 'Available', value: stats.available, color: '#16a34a' },
            { icon: Star, label: 'Featured', value: stats.featured, color: '#d97706' },
            { icon: MessageSquare, label: 'Sold', value: stats.sold, color: '#6b7280' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Listings */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border animate-pulse">
                <div className="aspect-[3/4] bg-muted rounded-t-xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : myListings.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No listings yet</h3>
            <p className="text-muted-foreground mb-6">Create your first listing to start selling.</p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white transition-colors"
              style={{ backgroundColor: BROWN }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = BROWN_HOVER)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = BROWN)}
            >
              <Plus className="w-4 h-4" /> Create Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myListings.map((listing: DressListing) => (
              <ListingManagementCard
                key={listing.id.toString()}
                listing={listing}
                onEdit={() => setEditingListing(listing)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Listing</DialogTitle>
          </DialogHeader>
          <CreateListingForm onSuccess={() => setShowCreateDialog(false)} onCancel={() => setShowCreateDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingListing} onOpenChange={open => { if (!open) setEditingListing(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Listing</DialogTitle>
          </DialogHeader>
          {editingListing && (
            <EditListingForm
              listing={editingListing}
              onSuccess={() => setEditingListing(null)}
              onCancel={() => setEditingListing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
