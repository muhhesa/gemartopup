"use client";

import React, { useState, useEffect } from "react";
import "./ReviewsComponent.css";

interface Review {
  id: string;
  name: string;
  item: string;
  date: string;
  rating: number;
  comment: string;
}

const generateMockReviews = (products: any[], gameId?: string): Review[] => {
  if (!products || products.length === 0) return [];
  
  // Use a predictable seed based on products to ensure same products = same reviews
  const comments = ["Sangat puas", "Harga murah", "Proses cepat", "Mantap", "Gampang banget", "Auto sultan", "Top up langganan di sini"];
  const dates = ["18 Jul 2026", "13 Jul 2026", "11 Jul 2026", "01 Jul 2026", "29 Jun 2026", "15 Jun 2026", "02 Jun 2026"];
  
  const pulsaIds = ['telkomsel', 'axis', 'xl', 'indosat', 'tri', 'smartfren', 'pulsa'];
  const isPulsa = pulsaIds.includes(gameId?.toLowerCase() || "");
  
  const reviews: Review[] = [];
  // generate 5 reviews
  for (let i = 0; i < 5; i++) {
    const product = products[i % products.length];
    
    // Generate smart mock name
    let mockName = "";
    if (isPulsa) {
      let prefix = "081";
      if (gameId === 'telkomsel') prefix = "0812";
      else if (gameId === 'axis') prefix = "0838";
      else if (gameId === 'xl') prefix = "0878";
      else if (gameId === 'indosat') prefix = "0857";
      else if (gameId === 'tri') prefix = "0896";
      else if (gameId === 'smartfren') prefix = "0881";
      const suffix = Math.floor(1000 + (i * 999) % 9000);
      mockName = `${prefix}****${suffix}`;
    } else {
      // For games
      if (i % 2 === 0) {
        // ID format
        mockName = `${Math.floor(100 + (i * 123) % 900)}****${Math.floor(10 + (i * 12) % 90)}`;
      } else {
        // Nickname format
        const nicks = ["Jo", "Al", "Ri", "De", "Ze", "Ki"];
        mockName = `${nicks[i % nicks.length]}****${nicks[(i+1) % nicks.length].toLowerCase()}`;
      }
    }

    reviews.push({
      id: `rev${i}`,
      name: mockName,
      item: product.name,
      date: dates[i % dates.length],
      rating: 5,
      comment: comments[i % comments.length]
    });
  }
  return reviews;
};

export default function ReviewsComponent({ gameId, products }: { gameId?: string, products?: any[] }) {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const mockReviews = products && products.length > 0 ? generateMockReviews(products, gameId) : [];
    
    if (gameId) {
      const savedReviews = JSON.parse(localStorage.getItem(`gemartopup_reviews_${gameId}`) || "[]");
      setReviews([...savedReviews, ...mockReviews]);
    } else {
      setReviews(mockReviews);
    }
  }, [gameId, products]);

  // Calculate dynamic stats matching the original UI exactly
  const baseReviewsCount = 46; 
  const baseAverage = 4.8;
  const baseSatisfaction = 96;

  const base5StarCount = 44;
  const base4StarCount = 0;
  const base3StarCount = 0;
  const base2StarCount = 0;
  const base1StarCount = 0;
  
  // Count real reviews added by user
  const realReviews = reviews.filter(r => !r.id.startsWith('rev')); // Mock reviews have id rev0, rev1, etc.
  const totalReviews = baseReviewsCount + realReviews.length;
  
  // Tally real ratings
  const realRatings = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let realScore = 0;
  let realSatisfied = 0;

  realReviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      realRatings[r.rating as keyof typeof realRatings]++;
      realScore += r.rating;
      if (r.rating >= 4) {
        realSatisfied += 1;
      }
    }
  });

  const count5 = base5StarCount + realRatings[5];
  const count4 = base4StarCount + realRatings[4];
  const count3 = base3StarCount + realRatings[3];
  const count2 = base2StarCount + realRatings[2];
  const count1 = base1StarCount + realRatings[1];

  // Calculate average rating decoupled from the exact bar counts to preserve the fake 4.8 baseline
  const totalScore = (baseAverage * baseReviewsCount) + realScore;
  const averageRating = (totalScore / totalReviews).toFixed(1);
  
  const totalSatisfied = ((baseSatisfaction / 100) * baseReviewsCount) + realSatisfied;
  const satisfactionRate = Math.round((totalSatisfied / totalReviews) * 100);
  
  return (
    <section className="terminal-box mb-4 reviews-section">
      <div className="reviews-header">
        <h2 style={{ margin: 0, fontSize: '16px', color: 'var(--primary-color)' }}>RATING DAN ULASAN</h2>
      </div>

      <div className="reviews-summary">
        <div className="rating-score">
          <span className="star-icon">⭐</span>
          <span className="score-big">{averageRating}</span>
          <span className="score-small">/ 5.0</span>
        </div>
        <div className="rating-text">
          <strong>{satisfactionRate}% pembeli merasa puas dengan produk ini.</strong>
          <br />
          Dari {totalReviews} Ulasan.
        </div>
      </div>

      <div className="rating-bars">
        {[
          { stars: 5, count: count5 },
          { stars: 4, count: count4 },
          { stars: 3, count: count3 },
          { stars: 2, count: count2 },
          { stars: 1, count: count1 }
        ].map((bar) => {
          const widthPercent = totalReviews > 0 ? (bar.count / totalReviews) * 100 : 0;
          return (
            <div className="rating-bar-row" key={bar.stars}>
              <span className="bar-label">{bar.stars} ⭐</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${widthPercent}%` }}></div>
              </div>
              <span className="bar-count">{bar.count}</span>
            </div>
          );
        })}
      </div>

      <div className="reviews-prompt">
        Apakah kamu menyukai produk ini? Beri tahu kami dan calon pembeli lainnya tentang pengalamanmu.
      </div>

      <div className="reviews-list">
        {reviews.length > 0 ? reviews.map(rev => (
          <div className="review-card" key={rev.id}>
            <div className="review-top">
              <div className="reviewer-name">{rev.name}</div>
              <div className="review-stars">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    viewBox="0 0 24 24" 
                    width="14" 
                    height="14" 
                    fill={i < rev.rating ? "var(--primary-color)" : "transparent"} 
                    stroke={i < rev.rating ? "var(--primary-color)" : "#555"}
                    strokeWidth="2"
                    style={{ marginRight: '2px' }}
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
            </div>
            <div className="review-meta">
              <span className="review-item">{rev.item}</span>
              <span className="review-date">{rev.date}</span>
            </div>
            <p className="review-comment">{rev.comment}</p>
          </div>
        )) : (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '14px' }}>
            Belum ada ulasan untuk layanan ini.
          </div>
        )}
      </div>
    </section>
  );
}
