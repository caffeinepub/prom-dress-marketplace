import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useUpdateListing } from '../hooks/useQueries';
import { DressListing, ExternalBlob } from '../backend';

const BROWN = '#3B1F0E';
const BROWN_HOVER = '#5a2f14';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '0', '2', '4', '6', '8', '10', '12', '14', '16'];
const COLORS = ['Red', 'Blue', 'Green', 'Pink', 'Purple', 'Black', 'White', 'Gold', 'Silver', 'Navy', 'Burgundy', 'Champagne'];
const CONDITIONS = ['New with tags', 'Like new', 'Good', 'Fair'];

interface Props {
  listing: DressListing;
  onSuccess: () => void;
  onCancel: () => void;
}

function BrownBtn({ children, onClick, disabled = false, className = '', type = 'button' }: {
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

export default function EditListingForm({ listing, onSuccess, onCancel }: Props) {
  const updateListing = useUpdateListing();

  const [form, setForm] = useState({
    title: listing.title,
    description: listing.description,
    price: (Number(listing.price) / 100).toString(),
    size: listing.size,
    condition: listing.condition,
    color: listing.color,
    isAvailable: listing.isAvailable,
  });
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [keepExistingPhotos, setKeepExistingPhotos] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) errs.price = 'Valid price required';
    if (!form.size) errs.size = 'Size is required';
    if (!form.condition) errs.condition = 'Condition is required';
    if (!form.color) errs.color = 'Color is required';
    return errs;
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewPhotos(prev => [...prev, ...files].slice(0, 5));
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    try {
      const progress = new Array(newPhotos.length).fill(0);
      setUploadProgress(progress);

      const newPhotoBlobs: ExternalBlob[] = await Promise.all(
        newPhotos.map(async (file, idx) => {
          const bytes = new Uint8Array(await file.arrayBuffer());
          return ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
            setUploadProgress(prev => { const next = [...prev]; next[idx] = pct; return next; });
          });
        })
      );

      const photos = keepExistingPhotos
        ? [...listing.photos, ...newPhotoBlobs]
        : newPhotoBlobs;

      await updateListing.mutateAsync({
        listingId: listing.id,
        title: form.title.trim(),
        description: form.description.trim(),
        price: BigInt(Math.round(Number(form.price) * 100)),
        size: form.size,
        condition: form.condition,
        color: form.color,
        photos,
        isAvailable: form.isAvailable,
      });
      onSuccess();
    } catch (err) {
      console.error('Failed to update listing:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
        <input
          type="text"
          value={form.title}
          onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Price ($) *</label>
        <input
          type="number"
          value={form.price}
          onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
          min="0"
          step="0.01"
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {errors.price && <p className="text-xs text-destructive mt-1">{errors.price}</p>}
      </div>

      {/* Size, Color, Condition */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Size *</label>
          <select
            value={form.size}
            onChange={e => setForm(p => ({ ...p, size: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.size && <p className="text-xs text-destructive mt-1">{errors.size}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Color *</label>
          <select
            value={form.color}
            onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.color && <p className="text-xs text-destructive mt-1">{errors.color}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Condition *</label>
          <select
            value={form.condition}
            onChange={e => setForm(p => ({ ...p, condition: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.condition && <p className="text-xs text-destructive mt-1">{errors.condition}</p>}
        </div>
      </div>

      {/* Availability */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isAvailable"
          checked={form.isAvailable}
          onChange={e => setForm(p => ({ ...p, isAvailable: e.target.checked }))}
          className="rounded border-input"
        />
        <label htmlFor="isAvailable" className="text-sm text-foreground">Mark as Available</label>
      </div>

      {/* Existing Photos */}
      {listing.photos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="keepPhotos"
              checked={keepExistingPhotos}
              onChange={e => setKeepExistingPhotos(e.target.checked)}
              className="rounded border-input"
            />
            <label htmlFor="keepPhotos" className="text-sm text-foreground">Keep existing photos</label>
          </div>
          {keepExistingPhotos && (
            <div className="flex gap-2 flex-wrap">
              {listing.photos.map((photo, i) => (
                <img
                  key={i}
                  src={photo.getDirectURL()}
                  alt={`Existing photo ${i + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border border-border"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Photos */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Add New Photos</label>
        <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
          <Upload className="w-5 h-5 text-muted-foreground mb-1" />
          <span className="text-xs text-muted-foreground">Click to upload</span>
          <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
        </label>
        {newPhotos.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {newPhotos.map((file, i) => (
              <div key={i} className="relative w-16 h-16">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`New photo ${i + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                {uploadProgress[i] !== undefined && uploadProgress[i] < 100 && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">{uploadProgress[i]}%</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeNewPhoto(i)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-lg font-semibold text-sm border border-border text-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <BrownBtn
          type="submit"
          disabled={updateListing.isPending}
          className="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          {updateListing.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : 'Save Changes'}
        </BrownBtn>
      </div>
    </form>
  );
}
