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

const generateMockReviews = (products: any[]): Review[] => {
  if (!products || products.length === 0) return [];
  
  // Use a predictable seed based on products to ensure same products = same reviews
  const comments = ["Sangat puas", "Harga murah", "Proses cepat", "Mantap", "Gampang banget", "Auto sultan", "Top up langganan di sini"];
  const dates = ["18 Jul 2026", "13 Jul 2026", "11 Jul 2026", "01 Jul 2026", "29 Jun 2026", "15 Jun 2026", "02 Jun 2026"];
  const names = ["6281****72795", "Jo****nid", "6285****41314", "Ah****oy", "De****s", "6282****99999", "Ri****ki"];
  
  const reviews: Review[] = [];
  // generate 5 reviews
  for (let i = 0; i < 5; i++) {
    const product = products[i % products.length];
    reviews.push({
      id: `rev${i}`,
      name: names[i % names.length],
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
    const mockReviews = products && products.length > 0 ? generateMockReviews(products) : [];
    
    if (gameId) {
      const savedReviews = JSON.parse(localStorage.getItem(`gemartopup_reviews_${gameId}`) || "[]");
      // combine real reviews with mock reviews
      setReviews([...savedReviews, ...mockReviews]);
    } else {
      setReviews(mockReviews);
    }
  }, [gameId, products]);
  
  return (
    <section className="terminal-box mb-4 reviews-section">
      <div className="reviews-header">
        <h2 style={{ margin: 0, fontSize: '16px', color: 'var(--primary-color)' }}>RATING DAN ULASAN</h2>
      </div>

      <div className="reviews-summary">
        <div className="rating-score">
          <span className="star-icon">⭐</span>
          <span className="score-big">4.8</span>
          <span className="score-small">/ 5.0</span>
        </div>
        <div className="rating-text">
          <strong>96% pembeli merasa puas dengan produk ini.</strong>
          <br />
          Dari 46 Ulasan.
        </div>
      </div>

      <div className="rating-bars">
        {[
          { stars: 5, count: 44, width: "95%" },
          { stars: 4, count: 0, width: "0%" },
          { stars: 3, count: 0, width: "0%" },
          { stars: 2, count: 0, width: "0%" },
          { stars: 1, count: 0, width: "0%" }
        ].map((bar) => (
          <div className="rating-bar-row" key={bar.stars}>
            <span className="bar-label">{bar.stars} ⭐</span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: bar.width }}></div>
            </div>
            <span className="bar-count">{bar.count}</span>
          </div>
        ))}
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
