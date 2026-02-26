import { useState } from 'react';
import { User, Loader2 } from 'lucide-react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const BROWN = '#3B1F0E';
const BROWN_HOVER = '#5a2f14';

interface Props {
  open: boolean;
  onComplete: () => void;
}

export default function ProfileSetupModal({ open, onComplete }: Props) {
  const saveProfile = useSaveCallerUserProfile();
  const [name, setName] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [bio, setBio] = useState('');
  const [hovered, setHovered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await saveProfile.mutateAsync({ name: name.trim(), role, bio: bio.trim() });
      onComplete();
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md" onInteractOutside={e => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: BROWN }}>
              <User className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-xl">Welcome! Set Up Your Profile</DialogTitle>
          </div>
          <DialogDescription>
            Tell us a bit about yourself to get started on PromDress Marketplace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Your Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              {(['buyer', 'seller'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className="py-3 rounded-lg border-2 text-sm font-medium capitalize transition-colors"
                  style={role === r
                    ? { backgroundColor: BROWN, color: '#fff', borderColor: BROWN }
                    : { backgroundColor: 'transparent', borderColor: '#d1d5db', color: 'inherit' }}
                >
                  {r === 'buyer' ? '🛍️ Buyer' : '👗 Seller'}
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Bio (optional)</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell sellers/buyers about yourself..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim() || saveProfile.isPending}
            className="w-full py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: hovered && !saveProfile.isPending ? BROWN_HOVER : BROWN }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {saveProfile.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : 'Get Started'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
