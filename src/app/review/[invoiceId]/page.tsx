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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [voucherCode, setVoucherCode] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Sumber kebenaran status "sudah review" adalah data dari server
    // (kolom has_reviewed di tabel orders), bukan localStorage — localStorage
    // gampang dihapus/diakalin dan tidak sinkron antar device.
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoice/${invoiceId}`);
        const result = await res.json();
        if (result.success) {
          const data = result.data;
          setInvoiceData({
            targetId: data.target_id,
            nickname: data.nickname,
            packageName: data.package_name,
            paymentMethod: data.payment_method,
            price: Number(data.price),
            fee: Number(data.fee),
            total: Number(data.total),
            gameId: data.game_id || invoiceId.split('-')[1]?.toLowerCase() || "general"
          });
          if (data.has_reviewed) {
            setIsReviewSubmitted(true);
          }
        } else {
          setError(result.error || "Data pesanan tidak ditemukan.");
        }
      } catch (err) {
        setError("Gagal menghubungi server.");
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        setSubmitError(result.message || "Gagal mengirim ulasan.");
        return;
      }

      setVoucherCode(result.voucherCode || null);
      setIsReviewSubmitted(true);
    } catch (err) {
      setSubmitError("Gagal menghubungi server. Coba lagi sebentar.");
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="terminal-box" style={{ border: '1px solid rgba(255, 145, 0, 0.2)', padding: '32px' }}>
        {!isReviewSubmitted ? (
          <>
            <h2 style={{ margin: '0 0 24px 0', color: 'var(--primary-color)', textAlign: 'center', fontSize: '18px', letterSpacing: '1px' }}>RATING DAN ULASAN</h2>
            
            <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>ID INVOICE:</span>
                <span style={{ fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--primary-color)' }}>{invoiceId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>LAYANAN:</span>
                <span style={{ fontWeight: '600' }}>{invoiceData.packageName}</span>
              </div>
            </div>
            
            <p style={{ textAlign: 'center', marginBottom: '24px', fontSize: '14px', color: 'var(--text-dim)' }}>Bagaimana pengalaman Anda berbelanja layanan ini?</p>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <svg 
                  key={star}
                  onClick={() => setReviewRating(star)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  width="48" 
                  height="48" 
                  fill={star <= reviewRating ? "var(--primary-color)" : "transparent"} 
                  stroke={star <= reviewRating ? "var(--primary-color)" : "rgba(255, 255, 255, 0.2)"}
                  strokeWidth="1.5"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              ))}
            </div>
            
            <textarea 
              className="input-field"
              style={{ width: '100%', minHeight: '120px', marginBottom: '24px', padding: '16px', background: 'rgba(0,0,0,0.5)', resize: 'none' }}
              placeholder="Ceritakan pengalaman Anda di sini (opsional)..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            ></textarea>
            
            {submitError && (
              <p style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{submitError}</p>
            )}

            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '16px', fontSize: '14px', letterSpacing: '1px', opacity: isSubmitting ? 0.6 : 1 }}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'MENGIRIM...' : 'KIRIM ULASAN SEKARANG'}
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" width="40" height="40" fill="var(--success)">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
            </div>
            <h2 style={{ color: 'var(--success)', marginBottom: '16px', letterSpacing: '1px' }}>ULASAN TERKIRIM</h2>
            <p style={{ marginBottom: voucherCode ? '20px' : '32px', color: 'var(--text-dim)', fontSize: '14px', lineHeight: '1.6' }}>
              Terima kasih! Ulasan Anda sangat berarti bagi kami dan telah berhasil dipublikasikan untuk membantu calon pembeli lainnya.
            </p>
            {voucherCode && (
              <div style={{ padding: '16px', background: 'rgba(255, 145, 0, 0.06)', border: '1px dashed var(--primary-color)', borderRadius: '4px', marginBottom: '32px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '8px' }}>KODE VOUCHER UNTUK PEMBELIAN BERIKUTNYA:</p>
                <p style={{ fontWeight: 'bold', fontFamily: 'monospace', fontSize: '18px', color: 'var(--primary-color)', letterSpacing: '1px' }}>{voucherCode}</p>
              </div>
            )}
            <Link href="/" className="btn-secondary" style={{ display: 'inline-block', padding: '12px 32px' }}>
              KEMBALI KE BERANDA
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
