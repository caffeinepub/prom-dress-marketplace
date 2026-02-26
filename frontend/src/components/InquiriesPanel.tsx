import { useGetMessages } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, User } from 'lucide-react';

interface InquiriesPanelProps {
  listingId: bigint;
}

export default function InquiriesPanel({ listingId }: InquiriesPanelProps) {
  const { data: messages, isLoading, error } = useGetMessages(listingId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm font-sans text-muted-foreground italic p-4 bg-muted/30 rounded-xl">
        Unable to load messages for this listing.
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm font-sans">No inquiries yet for this listing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((msg, i) => (
        <div key={i} className="bg-ivory-100 border border-rose-gold-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-rose-gold-100 flex items-center justify-center">
              <User className="w-4 h-4 text-rose-gold-500" />
            </div>
            <span className="text-xs font-sans text-muted-foreground">
              {msg.buyerId.toString().slice(0, 12)}…
            </span>
          </div>
          <p className="text-sm font-sans text-foreground/80 leading-relaxed">
            {msg.message}
          </p>
        </div>
      ))}
    </div>
  );
}
