"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const invoiceId = params.invoiceId as string;

  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [isReviewSubmitted, setIsReviewSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Try to get invoice data from localStorage
    const savedData = localStorage.getItem("gemartopup_pending_order");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setInvoiceData(parsed);
      } catch (e) {
        setError("Gagal memuat data pesanan.");
      }
    } else {
      setError("Data pesanan tidak ditemukan.");
    }
  }, []);

  const handleSubmit = () => {
    const gameId = invoiceData?.gameId;
    if (!gameId) {
      setError("Data game tidak ditemukan.");
      return;
    }

    const reviews = JSON.parse(localStorage.getItem(`gemartopup_reviews_${gameId}`) || "[]");
    const newReview = {
      id: `rev-${Date.now()}`,
      name: "628" + Math.floor(1000000 + Math.random() * 9000000) + "***",
      item: invoiceData.packageName,
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      rating: reviewRating,
      comment: reviewComment || "Sangat puas dengan layanannya"
    };

    reviews.unshift(newReview);
    localStorage.setItem(`gemartopup_reviews_${gameId}`, JSON.stringify(reviews));
    setIsReviewSubmitted(true);
  };

  if (error) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div className="terminal-box">
          <h2 style={{ color: 'var(--danger)' }}>{error}</h2>
          <p style={{ marginBottom: '20px' }}>Pastikan Anda membuka tautan ulasan yang valid.</p>
          <Link href="/" className="btn-primary">Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  if (!invoiceData) {
    return <div className="container" style={{ padding: '40px 20px' }}>Loading...</div>;
  }

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
      <div className="terminal-box" style={{ border: '1px solid var(--primary-color)' }}>
        {!isReviewSubmitted ? (
          <>
            <h2 style={{ margin: '0 0 16px 0', color: 'var(--primary-color)', textAlign: 'center' }}>BERIKAN ULASAN</h2>
            <div style={{ padding: '16px', background: '#111', borderRadius: '4px', marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>INVOICE:</div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{invoiceId}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>LAYANAN:</div>
              <div style={{ fontWeight: 'bold' }}>{invoiceData.packageName}</div>
            </div>
            
            <p style={{ textAlign: 'center', marginBottom: '16px' }}>Bagaimana pengalaman Anda membeli layanan ini?</p>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <svg 
                  key={star}
                  onClick={() => setReviewRating(star)}
                  style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  width="40" 
                  height="40" 
                  fill={star <= reviewRating ? "var(--primary-color)" : "transparent"} 
                  stroke={star <= reviewRating ? "var(--primary-color)" : "#555"}
                  strokeWidth="2"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              ))}
            </div>
            
            <textarea 
              className="input-field"
              style={{ width: '100%', minHeight: '100px', marginBottom: '24px', padding: '16px' }}
              placeholder="Ceritakan pengalaman Anda di sini (opsional)..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            ></textarea>
            
            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '16px', fontSize: '16px' }}
              onClick={handleSubmit}
            >
              KIRIM ULASAN
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ color: 'var(--success)', marginBottom: '16px' }}>TERIMA KASIH!</h2>
            <p style={{ marginBottom: '24px', color: 'var(--text-dim)' }}>
              Ulasan Anda sangat berarti bagi kami dan pembeli lainnya.
            </p>
            <Link href="/" className="btn-primary" style={{ display: 'inline-block', padding: '12px 24px' }}>
              Kembali ke Beranda
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
