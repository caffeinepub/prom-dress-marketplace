import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSendMessage } from '../hooks/useQueries';
import type { DressListing } from '../backend';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface InquiryFormProps {
  listing: DressListing;
}

export default function InquiryForm({ listing }: InquiryFormProps) {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const sendMessage = useSendMessage();
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const isAuthenticated = !!identity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      await sendMessage.mutateAsync({
        sellerId: listing.sellerId,
        listingId: listing.id,
        message: message.trim(),
      });
      setSent(true);
      setMessage('');
      toast.success('Message sent to seller! 💌');
    } catch {
      toast.error('Failed to send message. Please try again.');
    }
  };

  if (sent) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
        <MessageCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
        <h3 className="font-serif text-lg font-semibold text-emerald-700 mb-1">Message Sent!</h3>
        <p className="text-sm font-sans text-emerald-600">
          The seller will be in touch with you soon.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-3 text-xs font-sans text-emerald-600 underline hover:text-emerald-700"
        >
          Send another message
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-champagne-100 border border-rose-gold-200 rounded-xl p-6 text-center">
        <Lock className="w-8 h-8 text-rose-gold-400 mx-auto mb-2" />
        <h3 className="font-serif text-lg font-semibold text-rose-gold-700 mb-1">
          Sign in to Contact Seller
        </h3>
        <p className="text-sm font-sans text-muted-foreground mb-4">
          Create a free account to message the seller and inquire about this dress.
        </p>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          className="bg-rose-gold-500 hover:bg-rose-gold-600 text-white font-sans"
        >
          {isLoggingIn ? 'Signing in…' : 'Sign In to Message'}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-ivory-100 border border-rose-gold-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-rose-gold-500" />
        <h3 className="font-serif text-lg font-semibold text-rose-gold-700">
          Contact Seller
        </h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label className="font-sans text-sm font-medium text-foreground/80">
            Your Message
          </Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hi! I'm interested in this dress. Is it still available? Could you tell me more about…"
            className="border-rose-gold-200 font-sans resize-none"
            rows={4}
            required
          />
        </div>
        <Button
          type="submit"
          disabled={!message.trim() || sendMessage.isPending}
          className="w-full bg-rose-gold-500 hover:bg-rose-gold-600 text-white font-sans"
        >
          {sendMessage.isPending ? 'Sending…' : 'Send Message 💌'}
        </Button>
      </form>
    </div>
  );
}
