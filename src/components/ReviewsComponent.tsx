"use client";

import React, { useState, useEffect } from "react";
import catalogData from "@/data/catalog.json";
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
  
  const gId = (gameId || "").toLowerCase();
  
  // Find category from catalog
  const gameInfo = catalogData.games.find(g => g.id === gId);
  const category = gameInfo ? gameInfo.category : 'game';
  
  let comments = ["Sangat puas", "Harga murah", "Proses cepat", "Mantap", "Gampang banget", "Top up langganan di sini"];
  
  if (category === 'pulsa') {
    comments = ["Pulsa langsung masuk", "Kuota murah banget", "Koneksi jadi lancar", "Proses isi ulang kilat", "Mantap buat ngenet", "Nomor langsung aktif paketnya", "Token valid", "Listrik aman"];
  } else if (category === 'voucher') {
    comments = ["Kode voucher langsung muncul", "Valid dan bisa diredeem", "Langsung bisa dipakai", "Aman dan terpercaya", "Transfer kilat banget", "Voucher resmi mantap", "Bebas admin"];
  } else {
    // Game category
    if (gId === 'mlbb') {
      comments = ["Diamond mendarat dengan selamat bos", "Mantap buat gacha skin recall", "Proses kilat, siap push rank mythic", "Harga DM termurah sejagat", "Auto sultan beli starlight", "Langsung masuk gak pake lama"];
    } else if (gId === 'valo' || gId === 'valorant') {
      comments = ["VP langsung masuk", "Mantap buat beli battlepass", "Gacha bundle Night Market aman", "Proses secepat kilat", "Vandal skin baru here we go", "Terpercaya bang"];
    } else if (gId === 'ff' || gId === 'freefire') {
      comments = ["DM langsung masuk ngab", "Siap spin bundle incaran", "Booyah auto dapet", "Harga miring banget", "Buat beli pass FF mantap", "Gak nyesel topup di sini"];
    } else if (gId === 'genshin' || gId === 'genshinimpact') {
      comments = ["Genesis crystal masuk aman", "Siap gacha waifu/husbando", "Beli welkin super cepet", "Pity udah dekat, topup kilat bantu banget", "Murah meriah", "Topup paling aman buat akun Genshin"];
    } else if (gId === 'pubg') {
      comments = ["UC langsung masuk", "Mantap buat Royale Pass", "Gacha X-Suit auto hoki", "Proses aman tanpa banned", "Terpercaya", "Selalu langganan UC di sini"];
    } else if (gId === 'call-of-duty-mobile' || gId === 'codm') {
      comments = ["CP langsung masuk bos", "Gacha mythic aman", "Mantap buat beli Battle Pass", "Proses kilat", "Selalu topup CODM di sini", "Aman 100% legal"];
    } else {
      // Generic game comments
      comments = ["Item/Cash langsung masuk", "Mantap buat gacha", "Proses kilat banget", "Harga termurah sejagat", "Langsung masuk gak pake lama", "Terpercaya buat topup game", "Sangat recommended bos"];
    }
  }

  const dates = ["18 Jul 2026", "13 Jul 2026", "11 Jul 2026", "01 Jul 2026", "29 Jun 2026", "15 Jun 2026", "02 Jun 2026"];
  
  // Realistic usernames
  const usernames = [
    "rizky", "fajar", "andi", "budi", "dewi", "sari", "agus", "bayu", "citra", "dinda",
    "fauzi", "akmal", "putri", "gilang", "nanda", "dimas", "ayu", "ratna", "bintang", "cahya"
  ];
  
  const reviews: Review[] = [];
  // generate 5 reviews
  for (let i = 0; i < 5; i++) {
    const product = products[i % products.length];
    
    // Generate realistic masked username like r***y or fa***r
    const baseName = usernames[(i * 3 + (gId.length)) % usernames.length];
    const mockName = `${baseName.substring(0, 2)}***${baseName.substring(baseName.length - 1)}`;

    reviews.push({
      id: `mock-${i}`,
      name: mockName,
      item: product.name,
      date: dates[(i + gId.length) % dates.length],
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

    if (!gameId) {
      setReviews(mockReviews);
      return;
    }

    // Ulasan asli sekarang datang dari Supabase (lewat /api/reviews), bukan
    // localStorage lagi — supaya konsisten buat semua pengunjung, bukan cuma
    // yang submit dari browser yang sama.
    let cancelled = false;
    fetch(`/api/reviews?gameId=${encodeURIComponent(gameId)}`)
      .then((res) => res.json())
      .then((result) => {
        if (cancelled) return;
        const realReviews: Review[] = (result?.data || []).map((r: any) => ({
          id: r.id,
          name: r.display_name,
          item: '',
          date: new Date(r.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
          rating: r.rating,
          comment: r.comment || 'Sangat puas dengan layanannya',
        }));
        setReviews([...realReviews, ...mockReviews]);
      })
      .catch(() => {
        if (!cancelled) setReviews(mockReviews);
      });

    return () => {
      cancelled = true;
    };
  }, [gameId, products]);

  // Use a mathematically correct and realistic baseline distribution without 1, 2, or 3 stars
  // 40*5 + 10*4 = 200 + 40 = 240. 240 / 50 = 4.8.
  // Satisfied (4 and 5 stars) = 50 / 50 = 100%.
  const baseReviewsCount = 50; 
  const base5StarCount = 40;
  const base4StarCount = 10;
  const base3StarCount = 0;
  const base2StarCount = 0;
  const base1StarCount = 0;
  
  // Count real reviews added by user
  const realReviews = reviews.filter(r => !r.id.startsWith('mock-')); // Mock reviews have id mock-0, mock-1, etc.
  const totalReviews = baseReviewsCount + realReviews.length;
  
  // Tally real ratings
  const realRatings = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  realReviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      realRatings[r.rating as keyof typeof realRatings]++;
    }
  });

  const count5 = base5StarCount + realRatings[5];
  const count4 = base4StarCount + realRatings[4];
  const count3 = base3StarCount + realRatings[3];
  const count2 = base2StarCount + realRatings[2];
  const count1 = base1StarCount + realRatings[1];

  // Calculate average rating consistently from exact bar counts
  const totalScore = (count5 * 5) + (count4 * 4) + (count3 * 3) + (count2 * 2) + (count1 * 1);
  const averageRating = totalReviews > 0 ? (totalScore / totalReviews).toFixed(1) : "0.0";
  const satisfactionRate = totalReviews > 0 ? Math.round(((count5 + count4) / totalReviews) * 100) : 0;
  
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
