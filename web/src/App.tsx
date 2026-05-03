import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, EventDetails, Login, Register, Clubs, CreateClub, ClubDetails, CreateEvent, EditEvent, EditClub } from './pages';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LogOut, Map as MapIcon, Menu, X, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function Navbar() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'tr' ? 'en' : 'tr';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="bg-forest-green text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link to="/" className="text-xl md:text-2xl font-black tracking-tight hover:text-sand transition flex items-center shrink-0">
            <MapIcon className="w-6 h-6 md:w-8 md:h-8 mr-2 text-sand" />
            <span>{t('navbar.title')}</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:block">
            <ul className="flex items-center space-x-8">
              <li><Link to="/" className="font-bold hover:text-sand transition text-sm uppercase tracking-wider">{t('common.home')}</Link></li>
              <li><Link to="/clubs" className="font-bold hover:text-sand transition text-sm uppercase tracking-wider">{t('common.clubs')}</Link></li>
              
              <li>
                <button 
                  onClick={toggleLanguage}
                  className="bg-transparent hover:bg-sand text-white hover:text-forest-green px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center border-2 border-white/30 hover:border-sand shadow-sm uppercase tracking-widest"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {i18n.language.substring(0, 2).toUpperCase()}
                </button>
              </li>

              {user ? (
                <li className="flex items-center space-x-6 border-l pl-8 border-white border-opacity-10">
                  <div className="flex items-center space-x-3 bg-white bg-opacity-5 px-4 py-2 rounded-2xl border border-white border-opacity-5">
                    <div className="w-8 h-8 rounded-full bg-sand text-forest-green flex items-center justify-center font-black text-xs shadow-inner">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <span className="font-bold text-sm text-sand">{user.name}</span>
                  </div>
                  <button 
                    onClick={logout}
                    className="bg-sand hover:bg-opacity-90 p-2.5 rounded-xl transition text-forest-green shadow-lg flex items-center group"
                    title={t('common.logout')}
                  >
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition" />
                  </button>
                </li>
              ) : (
                <li className="flex items-center space-x-6 pl-8">
                  <Link to="/login" className="font-bold hover:text-sand transition text-sm uppercase tracking-wider">{t('common.login')}</Link>
                  <Link to="/register" className="bg-sand text-forest-green px-6 py-2.5 rounded-xl font-black text-sm hover:bg-opacity-90 transition shadow-xl uppercase tracking-wider">
                    {t('common.register')}
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-sand hover:bg-white hover:bg-opacity-10 rounded-xl transition-all"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden pb-8 pt-4 border-t border-white border-opacity-10 animate-in fade-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col space-y-6">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold hover:text-sand transition px-2">{t('common.home')}</Link>
              <Link to="/clubs" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold hover:text-sand transition px-2">{t('common.clubs')}</Link>
              
              <div className="flex items-center justify-between px-2 pt-4 border-t border-white border-opacity-10">
                <span className="text-sm font-bold opacity-60 uppercase tracking-widest">{t('common.language')}</span>
                <button 
                  onClick={toggleLanguage}
                  className="bg-white bg-opacity-10 text-white px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center border border-white border-opacity-20 uppercase tracking-widest"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {i18n.language === 'tr' ? 'TURKISH' : 'ENGLISH'}
                </button>
              </div>

              {user ? (
                <div className="pt-4 space-y-4">
                  <div className="flex items-center space-x-4 bg-white bg-opacity-5 p-4 rounded-2xl border border-white border-opacity-5 mx-2">
                    <div className="w-10 h-10 rounded-full bg-sand text-forest-green flex items-center justify-center font-black text-sm shadow-inner">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-sand leading-none mb-1">{user.name}</span>
                      <span className="text-xs opacity-60 uppercase tracking-widest">{user.email}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full bg-sand text-forest-green p-4 rounded-2xl font-black transition shadow-xl flex items-center justify-center space-x-3 uppercase tracking-wider"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{t('common.logout')}</span>
                  </button>
                </div>
              ) : (
                <div className="pt-4 grid grid-cols-2 gap-4 px-2">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center p-4 border border-white border-opacity-20 rounded-2xl font-black hover:bg-white hover:bg-opacity-10 transition text-sm uppercase tracking-wider"
                  >
                    {t('common.login')}
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center p-4 bg-sand text-forest-green rounded-2xl font-black hover:bg-opacity-90 transition shadow-xl text-sm uppercase tracking-wider"
                  >
                    {t('common.register')}
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function App() {
  const { t } = useTranslation();
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />

          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/event/:id" element={<EventDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/clubs" element={<Clubs />} />
              <Route path="/clubs/new" element={<CreateClub />} />
              <Route path="/clubs/:id" element={<ClubDetails />} />
              <Route path="/clubs/:id/events/new" element={<CreateEvent />} />
              <Route path="/event/:id/edit" element={<EditEvent />} />
          <Route path="/clubs/:id/edit" element={<EditClub />} />
            </Routes>
          </main>

          <footer className="bg-gray-900 text-gray-400 py-10 text-center border-t border-gray-800">
            <div className="container mx-auto px-4">
              <p className="text-white font-bold mb-2">{t('navbar.title')}</p>
              <p className="text-sm mb-4">{t('home.subtitle')}</p>
              <div className="flex justify-center space-x-6 mb-6">
                <Link to="/clubs" className="hover:text-white transition">{t('common.clubs')}</Link>
                <Link to="/" className="hover:text-white transition">{t('common.home')}</Link>
              </div>
              <p className="text-xs">&copy; {new Date().getFullYear()} {t('navbar.title')}. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
