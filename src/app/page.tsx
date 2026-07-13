"use client";

import Link from "next/link";
import "./home.css";
import { useLanguage } from "@/context/LanguageContext";
import ClockWidget from "@/components/ClockWidget";
import { useState } from "react";

const GAMES = [
  // GAMES
  { id: "ml", name: "MOBILE LEGENDS", code: "MLBB", status: "ACTIVE", category: "game", hasZone: true },
  { id: "ff", name: "FREE FIRE", code: "FF", status: "ACTIVE", category: "game", hasZone: false },
  { id: "pubg", name: "PUBG MOBILE", code: "PUBGM", status: "ACTIVE", category: "game", hasZone: false },
  { id: "valo", name: "VALORANT", code: "VALO", status: "MAINTENANCE", category: "game", hasZone: false },
  { id: "genshin", name: "GENSHIN IMPACT", code: "GI", status: "ACTIVE", category: "game", hasZone: true },
  { id: "hsr", name: "HONKAI: STAR RAIL", code: "HSR", status: "ACTIVE", category: "game", hasZone: true },
  
  // VOUCHER
  { id: "gplay", name: "GOOGLE PLAY ID", code: "GPLAY", status: "ACTIVE", category: "voucher", hasZone: false },
  { id: "garena", name: "GARENA SHELL", code: "GSHELL", status: "ACTIVE", category: "voucher", hasZone: false },
  
  // PULSA & TOKEN
  { id: "tsel", name: "TELKOMSEL PULSA", code: "TSEL", status: "ACTIVE", category: "pulsa", hasZone: false },
  { id: "pln", name: "TOKEN PLN", code: "PLN", status: "ACTIVE", category: "pulsa", hasZone: false },
];

export default function Home() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredGames = activeCategory === "all" 
    ? GAMES 
    : GAMES.filter(g => g.category === activeCategory);

  return (
    <div className="container">
      <div className="hero-container">
        <div className="hero-section terminal-box" style={{ flex: 1, marginBottom: 0 }}>
          <h1 className="hero-title">
            <span className="cursor-block">█</span> {t("home.welcome")}
          </h1>
          <p className="hero-subtitle">
            {t("home.subtitle1")}
            <br />
            {t("home.subtitle2")}
          </p>
        </div>
        
        <ClockWidget />
      </div>

      <div className="popular-section" style={{ marginBottom: '40px' }}>
        <div className="popular-header">
          <h2>{t("home.popular")}</h2>
        </div>
        <div className="game-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {GAMES.slice(0, 4).map((game) => (
            <Link href={`/order/${game.id}`} key={`pop-${game.id}`} className="game-card" style={{ position: 'relative' }}>
              <div className="popular-badge">HOT</div>
              <div className="game-card-inner">
                <div className="game-code">{game.code}</div>
                <div className="game-name">{game.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="market-overview">
        <div className="section-header">
          <h2>{t("home.market")}</h2>
          <span className="live-data-badge">{t("home.live")}</span>
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          <button 
            className={`btn-category ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            {t("cat.all")}
          </button>
          <button 
            className={`btn-category ${activeCategory === 'game' ? 'active' : ''}`}
            onClick={() => setActiveCategory('game')}
          >
            {t("cat.game")}
          </button>
          <button 
            className={`btn-category ${activeCategory === 'voucher' ? 'active' : ''}`}
            onClick={() => setActiveCategory('voucher')}
          >
            {t("cat.voucher")}
          </button>
          <button 
            className={`btn-category ${activeCategory === 'pulsa' ? 'active' : ''}`}
            onClick={() => setActiveCategory('pulsa')}
          >
            {t("cat.pulsa")}
          </button>
        </div>

        <div className="home-layout">
          <div className="home-main-col">
            <div className="game-grid">
          {filteredGames.map((game) => (
            <Link 
              href={`/order/${game.id}`} 
              key={game.id} 
              className={`game-card ${game.status === 'MAINTENANCE' ? 'disabled' : ''}`}
            >
              <div className="game-card-inner">
                <div className="game-code">{game.code}</div>
                <div className="game-name">{game.name}</div>
                <div className="game-status">
                  {t("home.status")}: <span className={game.status === 'ACTIVE' ? 'status-active' : 'status-maintenance'}>
                    {game.status === 'ACTIVE' ? t("home.active") : t("home.maintenance")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
            </div>
          </div>
          
          <aside className="trending-sidebar">
          <div className="trending-header">TRENDING</div>
          <div className="trending-list">
            {GAMES.slice(0, 5).map(game => (
              <Link href={`/order/${game.id}`} key={`trend-${game.id}`} className="trending-item">
                <div className="trending-icon">{game.name.charAt(0)}</div>
                <div>
                  <div className="trending-name">{game.name}</div>
                  <div className="trending-code">{game.code}</div>
                </div>
              </Link>
            ))}
          </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
