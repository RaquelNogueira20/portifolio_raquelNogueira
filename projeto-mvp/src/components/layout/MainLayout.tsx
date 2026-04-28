import React from 'react';
import { Search, Mail, Info, Home, Menu, X, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user, login, logout, loading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-brand-pink/40 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-dark-pink/80 backdrop-blur-md rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-dark-pink/20 border border-white/30">
              <Search size={24} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-brand-dark-blue">UserSpot</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-brand-dark-pink font-semibold leading-none">Foco em encontrar o usuário exato</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium text-brand-dark-blue hover:text-brand-lilac transition-colors flex items-center gap-2">
              <Home size={16} /> Lar
            </a>
            <a href="#" className="text-sm font-medium text-brand-dark-blue hover:text-brand-lilac transition-colors flex items-center gap-2">
              <Mail size={16} /> Pesquisa OSINT por e-mail
            </a>
            <a href="#" className="text-sm font-medium text-brand-dark-blue hover:text-brand-lilac transition-colors flex items-center gap-2">
              <Info size={16} /> Sobre
            </a>
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-brand-lilac/20 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-white/20">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-brand-dark-blue leading-none">{user.displayName}</span>
                  <button 
                    onClick={logout}
                    className="text-[10px] uppercase font-bold text-brand-lilac hover:text-brand-dark-blue transition-colors tracking-widest mt-1"
                  >
                    Sair
                  </button>
                </div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-10 h-10 rounded-xl border border-white/40 shadow-sm" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-brand-lilac/20 flex items-center justify-center text-brand-lilac border border-white/40">
                    <UserIcon size={20} />
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={login}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-dark-blue text-white rounded-xl text-sm font-bold hover:bg-brand-lilac hover:text-brand-dark-blue transition-all shadow-lg shadow-brand-dark-blue/10"
              >
                <LogIn size={18} />
                Entrar
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-brand-dark-blue"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-0 w-full bg-brand-pink/90 backdrop-blur-xl border-b border-white/20 p-4 md:hidden shadow-xl"
            >
              <nav className="flex flex-col gap-4">
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-lilac/10 text-brand-dark-blue font-medium">
                  <Home size={20} /> Lar
                </a>
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-lilac/10 text-brand-dark-blue font-medium">
                  <Mail size={20} /> Pesquisa OSINT por e-mail
                </a>
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-lilac/10 text-brand-dark-blue font-medium">
                  <Info size={20} /> Sobre
                </a>
                <div className="pt-4 border-t border-white/20">
                  {user ? (
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        {user.photoURL && <img src={user.photoURL} alt="" className="w-10 h-10 rounded-lg" referrerPolicy="no-referrer" />}
                        <span className="font-bold text-brand-dark-blue">{user.displayName}</span>
                      </div>
                      <button onClick={logout} className="p-2 text-brand-lilac"><LogOut size={20} /></button>
                    </div>
                  ) : (
                    <button 
                      onClick={login}
                      className="w-full flex items-center justify-center gap-2 p-4 bg-brand-dark-blue text-white rounded-xl font-bold"
                    >
                      <LogIn size={20} /> Entrar com Google
                    </button>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer (Simple for now) */}
      <footer className="bg-brand-dark-blue/95 backdrop-blur-md text-white py-12 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Search size={20} className="text-brand-dark-pink" />
            <span className="font-bold text-lg">UserSpot</span>
          </div>
          <p className="text-blue-200/60 text-sm">
            © {new Date().getFullYear()} UserSpot App - Inteligência OSINT Avançada.
          </p>
        </div>
      </footer>
    </div>
  );
};
