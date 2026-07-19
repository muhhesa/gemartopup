"use client";

import React from "react";
import "./ReviewsComponent.css";

interface Review {
  id: string;
  name: string;
  item: string;
  date: string;
  rating: number;
  comment: string;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: "rev1",
    name: "6281****72795",
    item: "Weekly Diamond Pass (Global)",
    date: "18 Jul 2026",
    rating: 5,
    comment: "Sangat puas"
  },
  {
    id: "rev2",
    name: "Jo****nid",
    item: "15 (15+0) Diamond",
    date: "13 Jul 2026",
    rating: 5,
    comment: "Harga murah"
  },
  {
    id: "rev3",
    name: "6285****41314",
    item: "Weekly Diamond Pass 5x",
    date: "11 Jul 2026",
    rating: 5,
    comment: "Proses cepat"
  },
  {
    id: "rev4",
    name: "Jo****nid",
    item: "50 (45+5) Diamond",
    date: "01 Jul 2026",
    rating: 5,
    comment: "Proses cepat"
  },
  {
    id: "rev5",
    name: "Jo****nid",
    item: "1.050 (937+113) Diamonds (Global)",
    date: "29 Jun 2026",
    rating: 5,
    comment: "Proses cepat"
  }
];

export default function ReviewsComponent() {
  return (
    <section className="terminal-box mb-4 reviews-section">
      <div className="reviews-header">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
        <h2 className="step-title" style={{ margin: 0 }}>Rating dan Ulasan</h2>
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
        {MOCK_REVIEWS.map((review) => (
          <div className="review-card" key={review.id}>
            <div className="review-top">
              <div className="reviewer-name">{review.name}</div>
              <div className="review-stars">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    viewBox="0 0 24 24" 
                    width="14" 
                    height="14" 
                    fill={i < review.rating ? "var(--primary-color)" : "transparent"} 
                    stroke={i < review.rating ? "var(--primary-color)" : "#555"}
                    strokeWidth="2"
                    style={{ marginRight: '2px' }}
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
            </div>
            <div className="review-meta">
              <span className="review-item">{review.item}</span>
              <span className="review-date">{review.date}</span>
            </div>
            <div className="review-comment">
              {review.comment}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
