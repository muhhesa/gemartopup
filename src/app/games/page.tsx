"use client";

import Link from "next/link";
import "../home.css";
import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";

import catalogData from "@/data/catalog.json";
const GAMES = catalogData.games;

const POPULAR_GAME_IDS = ['mlbb', 'ff', 'pubg', 'valo', 'point-blank', 'pulsa-telkomsel'];
const TRENDING_GAME_IDS = ['mlbb', 'ff', 'pubg', 'valo', 'point-blank'];

const popularGames = POPULAR_GAME_IDS.map(id => GAMES.find(g => g.id === id)).filter(Boolean) as typeof GAMES;
const trendingGames = TRENDING_GAME_IDS.map(id => GAMES.find(g => g.id === id)).filter(Boolean) as typeof GAMES;

export default function GamesPage() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredGames = activeCategory === "all" 
    ? GAMES 
    : GAMES.filter(g => g.category === activeCategory);

  return (
    <div className="container" style={{ marginTop: '20px' }}>
      <div className="popular-section" style={{ marginBottom: '40px' }}>
        <div className="popular-header">
          <h2>{t("home.popular")}</h2>
        </div>
        <div className="game-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {popularGames.map((game) => (
            <Link href={`/order/${game.id}`} key={`pop-${game.id}`} className="game-card" style={{ position: 'relative' }}>
              <div className="popular-badge">HOT</div>
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
            {trendingGames.map(game => (
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
