"use client";

import Link from "next/link";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import catalogData from "@/data/catalog.json";
import RecentPurchasePopup from "./RecentPurchasePopup";

function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { t } = useLanguage();
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-close" onClick={onClose}>X</div>
        <div className="logo" style={{ padding: '0 24px' }}>
          <span className="logo-icon blink">█</span>
          <span className="logo-text">GEMARTOPUP</span>
        </div>
        <div className="sidebar-links">
          <Link href="/" className="sidebar-link" onClick={onClose}>
            {t("nav.home")}
          </Link>
          <Link href="/games" className="sidebar-link" onClick={onClose}>
            {t("home.market")}
          </Link>
          <Link href="/track" className="sidebar-link" onClick={onClose}>
            {t("nav.track")}
          </Link>
        </div>
      </aside>
    </>
  );
}

function HeaderContent({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { lang, setLang, t } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('header-search')?.focus();
      }
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const searchResults = catalogData.games.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="main-header">
      <div className="container header-content">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="hamburger-btn" onClick={toggleSidebar}>☰</span>
          <Link href="/" className="logo">
            <span className="logo-icon blink">█</span>
            <span className="logo-text">GEMARTOPUP</span>
          </Link>
        </div>
        
        <div className="header-search-container" ref={searchRef} style={{ position: 'relative' }}>
          <svg className="header-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            id="header-search" 
            className="header-search-input" 
            placeholder="Cari game favoritmu..." 
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
          />
          <div className="header-search-shortcut">CTRL K</div>
          
          {showResults && searchQuery.length > 0 && (
            <div className="search-dropdown" style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '12px',
              backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px',
              padding: '8px', zIndex: 1000, maxHeight: '400px', overflowY: 'auto',
              boxShadow: '0 10px 25px rgba(0,0,0,0.8)'
            }}>
              {searchResults.length > 0 ? (
                searchResults.map(game => (
                  <div key={game.id} 
                       style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', borderRadius: '8px', transition: 'background-color 0.2s' }}
                       onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#222'}
                       onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                       onClick={() => {
                         setShowResults(false);
                         setSearchQuery("");
                         router.push(`/order/${game.id}`);
                       }}>
                    <img src={`/img/${game.id}.jpg`} alt={game.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} 
                         onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=GAME' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px', color: '#fff', lineHeight: '1.2' }}>{game.name}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{game.category}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '14px' }}>
                  Tidak ada layanan dengan kata kunci tersebut.
                </div>
              )}
            </div>
          )}
        </div>

        <nav className="nav-links">
          <div className="lang-toggle" style={{display: 'flex', gap: '8px', cursor: 'pointer', color: 'var(--text-dim)', fontSize: '12px'}}>
            <span 
              onClick={() => setLang('id')} 
              style={{ color: lang === 'id' ? 'var(--primary-color)' : 'inherit' }}
            >ID</span>
            <span>|</span>
            <span 
              onClick={() => setLang('en')}
              style={{ color: lang === 'en' ? 'var(--primary-color)' : 'inherit' }}
            >EN</span>
          </div>
          <div className="status-indicator">
            <span className="dot"></span>
            {t("status.online")}
          </div>
        </nav>
      </div>
    </header>
  );
}

function FooterContent() {
  const { t } = useLanguage();
  return (
    <footer className="main-footer">
      <div className="container footer-top">
        <div className="footer-col brand-col">
          <Link href="/" className="logo">
            <span className="logo-icon blink">█</span>
            <span className="logo-text">GEMARTOPUP</span>
          </Link>
          <p className="footer-desc">
            {t("footer.desc")}
          </p>
          <div className="footer-contact">
            <h4 style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px', fontWeight: 600, color: '#fff', borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '16px' }}>{t("footer.help")}</h4>
            <div className="contact-item" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '13px', color: '#ccc', marginBottom: '8px' }}>
               gemartopup@gmail.com
            </div>
            <div className="contact-item" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '13px', color: '#ccc' }}>
               08115234943
            </div>
          </div>
        </div>
        
        <div className="footer-col links-col">
          <h4>{t("footer.nav")}</h4>
          <Link href="/">{t("nav.home")}</Link>
          <Link href="/games">{t("home.market")}</Link>
        </div>
        
        <div className="footer-col links-col">
          <h4>{t("footer.fast")}</h4>
          <Link href="/track">{t("nav.track")}</Link>
        </div>
        
        <div className="footer-col links-col">
          <h4>{t("footer.terms")}</h4>
          <Link href="/support">{t("footer.support")}</Link>
          <Link href="/faq">{t("footer.faq")}</Link>
          <Link href="/terms">{t("footer.tos")}</Link>
          <Link href="/privacy">{t("footer.privacy")}</Link>
        </div>
        
        <div className="footer-col action-col">
          <h4>{t("footer.follow")}</h4>
          <div className="links-col" style={{ marginBottom: '24px' }}>
            <a href="https://www.instagram.com/gemartopup/" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://www.tiktok.com/@itzmechannel" target="_blank" rel="noreferrer">Tiktok</a>
            <a href="https://wa.me/628115234943" target="_blank" rel="noreferrer">Whatsapp</a>
          </div>
        </div>
      </div>
      
      <div className="container footer-line">
        <span>(C) {new Date().getFullYear()} {t("footer.rights")}</span>
        <span>{t("footer.secure")}</span>
      </div>
    </footer>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isInvoicePage = pathname?.startsWith('/invoice/');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <LanguageProvider>
      <div className="app-layout">
        {!isInvoicePage && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}
        <div className="main-wrapper">
          {!isInvoicePage && <HeaderContent toggleSidebar={() => setIsSidebarOpen(true)} />}
          <main className="main-content">
            {children}
          </main>
          {!isInvoicePage && <FooterContent />}
          <a href="https://wa.me/628115234943" target="_blank" rel="noreferrer" className="wa-fab no-print" title="Chat Admin via WhatsApp">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
          </a>
          {!isInvoicePage && <RecentPurchasePopup />}
        </div>
      </div>
    </LanguageProvider>
  );
}
