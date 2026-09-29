import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wheat, BookOpen, Settings, Menu, X, TrendingUp } from 'lucide-react';
import fondoBg from '../img/fondo.png';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/ingredients', icon: Wheat, label: 'Ingredientes' },
    { to: '/prices', icon: TrendingUp, label: 'Actualizar Precios' },
    { to: '/recipes', icon: BookOpen, label: 'Recetas' },
    { to: '/settings', icon: Settings, label: 'Configuración' },
  ];

  return (
    <div className="min-h-screen flex bg-espresso-900 relative">
      {/* Background Image & Gradient Overlay */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-30"
        style={{ backgroundImage: `url(${fondoBg})`, backgroundSize: 'auto 80%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
      />
      <div className="fixed inset-0 z-0 pointer-events-none bg-black/40 mix-blend-overlay" />
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 glass border-r border-espresso-600 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="h-16 flex items-center px-6 border-b border-espresso-600/50">
          <span className="text-2xl mr-2">🍪</span>
          <h1 className="text-xl font-display font-bold text-cream-100 tracking-wide">CookiCost</h1>
          <button className="ml-auto lg:hidden text-cream-200 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-espresso-600 text-gold-400 font-medium shadow-md'
                    : 'text-cream-200 hover:bg-espresso-700/50 hover:text-cream-100'
                }`
              }
            >
              <item.icon size={20} className="shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Mobile header */}
        <header className="lg:hidden h-16 glass flex items-center px-4 border-b border-espresso-600/50 sticky top-0 z-30">
          <button 
            className="p-2 -ml-2 text-cream-200 hover:text-white rounded-lg focus:outline-none"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          <span className="text-xl ml-2">🍪</span>
          <h1 className="ml-2 text-lg font-display font-bold">CookiCost</h1>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
