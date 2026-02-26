import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ExternalBlob } from '../backend';

const BROWN = '#3B1F0E';
const BROWN_HOVER = '#5a2f14';

interface Props {
  photos: ExternalBlob[];
  title: string;
}

export default function PhotoGallery({ photos, title }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevHovered, setPrevHovered] = useState(false);
  const [nextHovered, setNextHovered] = useState(false);

  const hasPhotos = photos.length > 0;
  const currentPhoto = hasPhotos ? photos[currentIndex] : null;
  const photoUrl = currentPhoto
    ? currentPhoto.getDirectURL()
    : '/assets/generated/listing-placeholder.dim_400x500.png';

  const prev = () => setCurrentIndex(i => (i - 1 + photos.length) % photos.length);
  const next = () => setCurrentIndex(i => (i + 1) % photos.length);

  return (
    <div className="flex flex-col gap-3">
      {/* Main Photo */}
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted">
        <img
          src={photoUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors text-white"
              style={{ backgroundColor: prevHovered ? BROWN_HOVER : BROWN }}
              onMouseEnter={() => setPrevHovered(true)}
              onMouseLeave={() => setPrevHovered(false)}
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors text-white"
              style={{ backgroundColor: nextHovered ? BROWN_HOVER : BROWN }}
              onMouseEnter={() => setNextHovered(true)}
              onMouseLeave={() => setNextHovered(false)}
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        {photos.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-white w-4' : 'bg-white/60'}`}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === currentIndex ? 'border-[#3B1F0E]' : 'border-transparent'
              }`}
            >
              <img
                src={photo.getDirectURL()}
                alt={`${title} ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
