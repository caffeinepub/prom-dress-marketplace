export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'prom-dress-market'
  );

  return (
    <footer className="bg-rose-gold-900 text-ivory-100 py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-serif text-xl font-semibold text-champagne-200 mb-3">
              Prom Dress Market
            </h3>
            <p className="text-sm text-ivory-200/70 font-sans leading-relaxed">
              The premier marketplace for buying, selling, and advertising prom dresses. Find your perfect gown or give yours a new home.
            </p>
          </div>
          <div>
            <h4 className="font-serif text-base font-semibold text-champagne-200 mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm font-sans text-ivory-200/70">
              <li><a href="/" className="hover:text-champagne-200 transition-colors">Home</a></li>
              <li><a href="/browse" className="hover:text-champagne-200 transition-colors">Browse Dresses</a></li>
              <li><a href="/dashboard" className="hover:text-champagne-200 transition-colors">Sell a Dress</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-base font-semibold text-champagne-200 mb-3">About</h4>
            <p className="text-sm text-ivory-200/70 font-sans leading-relaxed">
              A decentralized marketplace built on the Internet Computer. Your listings are secure, permanent, and always accessible.
            </p>
          </div>
        </div>
        <div className="border-t border-rose-gold-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ivory-200/50 font-sans">
          <span>© {year} Prom Dress Market. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Built with{' '}
            <span className="text-rose-gold-300">♥</span>{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-champagne-300 hover:text-champagne-200 transition-colors"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
