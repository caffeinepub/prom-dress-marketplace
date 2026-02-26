import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

const BROWN = '#3B1F0E';
const BROWN_HOVER = '#5a2f14';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/browse', label: 'Browse' },
    { to: '/dashboard', label: 'Sell a Dress' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-foreground">
          <img src="/assets/generated/logo-mark.dim_120x120.png" alt="Logo" className="w-8 h-8 rounded-full object-cover" />
          <span className="font-serif">PromDress</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={handleAuth}
            disabled={isLoggingIn}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 text-white"
            style={{ backgroundColor: BROWN }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = BROWN_HOVER)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = BROWN)}
          >
            {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
          </button>
          {!isAuthenticated && (
            <Link
              to="/dashboard"
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors text-white"
              style={{ backgroundColor: BROWN }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = BROWN_HOVER)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = BROWN)}
            >
              <ShoppingBag className="w-4 h-4" />
              Sell a Dress
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg transition-colors text-white"
          style={{ backgroundColor: BROWN }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = BROWN_HOVER)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = BROWN)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border px-4 py-4 flex flex-col gap-3">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={() => { handleAuth(); setMobileMenuOpen(false); }}
            disabled={isLoggingIn}
            className="w-full px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 text-white"
            style={{ backgroundColor: BROWN }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = BROWN_HOVER)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = BROWN)}
          >
            {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
          </button>
        </div>
      )}
    </header>
  );
}
