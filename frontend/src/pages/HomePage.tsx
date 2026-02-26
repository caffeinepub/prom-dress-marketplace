import { Link } from '@tanstack/react-router';
import { Search, ArrowRight, Star, ShoppingBag, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useState } from 'react';
import { useGetAllListings, useGetFeaturedListings } from '../hooks/useQueries';
import ListingCard from '../components/ListingCard';

const BROWN = '#3B1F0E';
const BROWN_HOVER = '#5a2f14';
const CREAM = '#FFFDF7';

function BrownButton({ children, className = '', onClick, type = 'button', style = {}, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type={type as 'button' | 'submit' | 'reset'}
      className={className}
      style={{ backgroundColor: hovered ? BROWN_HOVER : BROWN, color: '#fff', border: 'none', ...style }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

function BrownLink({ children, className = '', to, style = {} }: { children: React.ReactNode; className?: string; to: string; style?: React.CSSProperties }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      className={className}
      style={{ backgroundColor: hovered ? BROWN_HOVER : BROWN, color: '#fff', ...style }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </Link>
  );
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data: allListings = [] } = useGetAllListings();
  const { data: featuredListings = [] } = useGetFeaturedListings();

  const recentListings = [...allListings]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 4);

  const heroSlides = [
    {
      image: '/assets/generated/hero-banner-prom.dim_1200x800.jpg',
      title: 'Find Your Dream\nProm Dress',
      subtitle: 'Discover beautiful pre-loved prom dresses at a fraction of the price',
    },
    {
      image: '/assets/generated/hero-banner.dim_1200x800.jpg',
      title: 'Sell Your Dress\nAfter Prom',
      subtitle: 'Give your dress a second life and earn money for your next adventure',
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/browse?search=${encodeURIComponent(searchQuery)}`;
    } else {
      window.location.href = '/browse';
    }
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM }}>
      {/* Hero Section */}
      <section className="relative h-[520px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <img
              src={slide.image}
              alt="Hero"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 whitespace-pre-line drop-shadow-lg">
            {heroSlides[currentSlide].title}
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl drop-shadow">
            {heroSlides[currentSlide].subtitle}
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex w-full max-w-lg gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search dresses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 bg-white/95 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <BrownButton
              type="submit"
              className="px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Search
            </BrownButton>
          </form>

          {/* Browse CTA */}
          <div className="mt-6">
            <BrownLink
              to="/browse"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Browse Dresses <ArrowRight className="w-5 h-5" />
            </BrownLink>
          </div>
        </div>

        {/* Carousel Controls */}
        <BrownButton
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full opacity-80 hover:opacity-100 transition-opacity"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </BrownButton>
        <BrownButton
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full opacity-80 hover:opacity-100 transition-opacity"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </BrownButton>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? 'bg-white w-6' : 'bg-white/50'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b border-border" style={{ backgroundColor: CREAM }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 text-center max-w-sm mx-auto">
            {[
              { icon: ShoppingBag, label: 'Dresses Listed', value: allListings.length.toString() },
              { icon: Star, label: 'Featured Picks', value: featuredListings.length.toString() },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <Icon className="w-8 h-8 text-primary" />
                <div className="text-3xl font-bold text-foreground">{value}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      {featuredListings.length > 0 && (
        <section className="py-16" style={{ backgroundColor: CREAM }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Featured Dresses</h2>
                <p className="text-muted-foreground mt-1">Hand-picked selections just for you</p>
              </div>
              <Link
                to="/browse"
                className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredListings.slice(0, 4).map((listing) => (
                <ListingCard key={listing.id.toString()} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Browse CTA */}
            <div className="bg-card rounded-2xl p-8 flex flex-col items-start gap-4 shadow-sm border border-border">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: BROWN }}>
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Browse All Dresses</h3>
              <p className="text-muted-foreground">
                Explore hundreds of beautiful prom dresses at affordable prices. Filter by size, color, and condition.
              </p>
              <BrownLink
                to="/browse"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Browsing <ArrowRight className="w-4 h-4" />
              </BrownLink>
            </div>

            {/* Sell CTA */}
            <div className="bg-card rounded-2xl p-8 flex flex-col items-start gap-4 shadow-sm border border-border">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: BROWN }}>
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Sell Your Dress</h3>
              <p className="text-muted-foreground">
                Give your prom dress a second life. List it for free and connect with buyers looking for their perfect dress.
              </p>
              <BrownLink
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Selling <ArrowRight className="w-4 h-4" />
              </BrownLink>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      {recentListings.length > 0 && (
        <section className="py-16" style={{ backgroundColor: CREAM }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Recently Added</h2>
                <p className="text-muted-foreground mt-1">Fresh arrivals just listed</p>
              </div>
              <Link
                to="/browse"
                className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recentListings.map((listing) => (
                <ListingCard key={listing.id.toString()} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA Banner */}
      <section className="py-20 text-white" style={{ backgroundColor: BROWN }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Find Your Perfect Dress?</h2>
          <p className="text-lg text-white/80 mb-8">
            Join thousands of prom-goers who found their dream dress at an amazing price.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/browse"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg bg-white transition-colors hover:bg-gray-100"
              style={{ color: BROWN }}
            >
              Browse Dresses <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-white text-white transition-colors hover:bg-white/10"
            >
              List Your Dress
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>
            © {new Date().getFullYear()} PromDress Marketplace. Built with{' '}
            <span className="text-red-500">♥</span> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'unknown-app')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
