"use client";

import Link from "next/link";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import { useState } from "react";
import { usePathname } from "next/navigation";

function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { t } = useLanguage();
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-close" onClick={onClose}>X</div>
        <div className="logo" style={{ padding: '0 24px', display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="Logo" style={{ height: '32px', marginRight: '12px', borderRadius: '4px' }} />
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

  return (
    <header className="main-header">
      <div className="container header-content">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="hamburger-btn" onClick={toggleSidebar}>☰</span>
          <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="Logo" style={{ height: '32px', marginRight: '8px', borderRadius: '4px' }} />
            <span className="logo-text">GEMARTOPUP</span>
          </Link>
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
          <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="Logo" style={{ height: '32px', marginRight: '8px', borderRadius: '4px' }} />
            <span className="logo-text">GEMARTOPUP</span>
          </Link>
          <p className="footer-desc">
            {t("footer.desc")}
          </p>
          <div className="footer-contact">
            <h4>{t("footer.help")}</h4>
            <div className="contact-item">
               <span>✉️</span> gemartopup@gmail.com
            </div>
            <div className="contact-item">
               <span>📱</span> 08115234943
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
          <Link href="#">{t("footer.support")}</Link>
          <Link href="#">{t("footer.faq")}</Link>
          <Link href="#">{t("footer.tos")}</Link>
          <Link href="#">{t("footer.privacy")}</Link>
        </div>
        
        <div className="footer-col action-col">
          <h4>{t("footer.follow")}</h4>
          <div className="links-col" style={{ marginBottom: '24px' }}>
            <Link href="#">Instagram</Link>
            <Link href="#">Tiktok</Link>
            <Link href="#">Whatsapp</Link>
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
        </div>
      </div>
    </LanguageProvider>
  );
}
