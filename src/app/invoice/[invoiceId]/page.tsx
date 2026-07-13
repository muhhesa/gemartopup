"use client";

import Link from "next/link";
import "./invoice.css";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";

export default function InvoicePage() {
  const params = useParams();
  const invoiceId = params.invoiceId as string;
  const { t } = useLanguage();
  
  const [timeLeft, setTimeLeft] = useState(86400); // 24 hours
  // Available statuses: AWAITING_PAYMENT, PROCESS, PENDING, SUCCESS, FAILED, EXPIRED
  const [status, setStatus] = useState("AWAITING_PAYMENT");
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [isSimMinimized, setIsSimMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const ADMIN_WHATSAPP = "628115234943"; 
  
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  }; 

  useEffect(() => {
    // Ubah judul dokumen untuk nama file PDF yang rapi saat diunduh
    document.title = `INVOICE_${invoiceId}_GEMARTOPUP`;

    const fetchInvoiceData = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('invoice_id', invoiceId)
          .single();
        
        if (data) {
          setInvoiceData({
            targetId: data.target_id,
            nickname: data.nickname,
            packageName: data.package_name,
            paymentMethod: data.payment_method,
            price: Number(data.price),
            fee: Number(data.fee),
            total: Number(data.total)
          });
          setStatus(data.status);
        } else {
          // Fallback
          const savedData = localStorage.getItem("gemartopup_pending_order");
          if (savedData) setInvoiceData(JSON.parse(savedData));
        }
      } catch (err) {
        const savedData = localStorage.getItem("gemartopup_pending_order");
        if (savedData) setInvoiceData(JSON.parse(savedData));
      }
    };
    
    fetchInvoiceData();

    const pollInterval = setInterval(() => {
      fetchInvoiceData();
    }, 5000);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Only auto-expire if we don't have real DB status or if it's strictly awaiting
          setStatus((currentStatus) => currentStatus === "AWAITING_PAYMENT" ? "EXPIRED" : currentStatus);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(timer);
      clearInterval(pollInterval);
    };
  }, [invoiceId]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusLabel = (s: string) => {
    if (s === "AWAITING_PAYMENT") return t("status.awaiting");
    if (s === "PROCESS") return t("status.process");
    if (s === "PENDING") return t("status.pending");
    if (s === "SUCCESS") return t("status.success");
    if (s === "FAILED") return t("status.failed");
    if (s === "EXPIRED") return t("status.exp");
    return s;
  };

  const handleDownloadInvoice = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    let message = "";
    if (status === "AWAITING_PAYMENT") {
      message = `Halo Admin Gemartopup,%0A%0ASaya sudah melakukan pembayaran untuk pesanan:%0A*ID Invoice:* ${invoiceId}%0A*Item:* ${invoiceData?.packageName}%0A*Total:* IDR ${invoiceData?.total.toLocaleString('id-ID')}%0A%0ABerikut saya lampirkan bukti transfernya:`;
    } else {
      message = `Halo Admin Gemartopup,%0A%0ASaya ingin konfirmasi pesanan:%0A*ID Invoice:* ${invoiceId}%0A*Status:* ${getStatusLabel(status)}%0A*Item:* ${invoiceData?.packageName}%0A*Total:* IDR ${invoiceData?.total.toLocaleString('id-ID')}%0A%0AMohon bantuannya, terima kasih!`;
    }
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${message}`, "_blank");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Berhasil disalin: " + text);
  };

  if (!invoiceData) return <div className="container" style={{ color: 'var(--primary)' }}>Loading data...</div>;

  return (
    <div className="container" style={{ position: 'relative' }}>
      
      {/* PANEL SIMULASI ADMIN (DEVELOPMENT ONLY) */}
      <div 
        className={`sim-panel no-print ${isSimMinimized ? 'minimized' : ''}`}
        style={{ transform: `translate(${position.x}px, ${position.y}px)`, touchAction: 'none' }}
      >
        <div 
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isSimMinimized ? 'none' : '1px solid var(--border-color)', paddingBottom: isSimMinimized ? 0 : '4px', marginBottom: isSimMinimized ? 0 : '8px', cursor: isDragging ? 'grabbing' : 'grab' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <h4 style={{ margin: 0, borderBottom: 'none', paddingBottom: 0, pointerEvents: 'none' }}>PANEL SIMULASI</h4>
          <button style={{ border: 'none', padding: '2px 8px', background: 'transparent' }} onClick={() => setIsSimMinimized(!isSimMinimized)}>
            {isSimMinimized ? 'Buka 🔼' : 'Tutup 🔽'}
          </button>
        </div>
        {!isSimMinimized && (
          <>
            <button onClick={() => setStatus("AWAITING_PAYMENT")}>1. RESET (BELUM BAYAR)</button>
            <button onClick={() => setStatus("PROCESS")}>2. UBAH KE PROSES</button>
            <button onClick={() => setStatus("PENDING")} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>3. UBAH KE PENDING</button>
            <button onClick={() => setStatus("SUCCESS")} style={{ color: 'var(--success)', borderColor: 'var(--success)' }}>4. UBAH KE SUKSES</button>
            <button onClick={() => setStatus("FAILED")} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>5. UBAH KE BATAL</button>
          </>
        )}
      </div>

      <div className="invoice-container">
        <div className="terminal-box" id="print-area">
          <div className="invoice-header">
            <h2>{t("inv.title")}</h2>
            <div className={`status-badge ${status.toLowerCase()}`}>{getStatusLabel(status)}</div>
          </div>
          
          <div className="invoice-details">
            <div className="detail-row">
              <span className="label">{t("inv.invoiceid")}:</span>
              <span className="value highlight">{invoiceId}</span>
            </div>
            <div className="detail-row">
              <span className="label">{t("inv.time")}:</span>
              <span className="value">{new Date().toISOString()}</span>
            </div>
            
            <div className="divider"></div>
            
            <div className="detail-row">
              <span className="label">{t("inv.target")}:</span>
              <span className="value">{invoiceData.targetId} - {invoiceData.nickname}</span>
            </div>
            <div className="detail-row">
              <span className="label">{t("inv.package")}:</span>
              <span className="value">{invoiceData.packageName}</span>
            </div>
            <div className="detail-row">
              <span className="label">{t("inv.paymethod")}:</span>
              <span className="value">{invoiceData.paymentMethod}</span>
            </div>
            
            <div className="divider"></div>
            
            <div className="total-amount-box" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--text-dim)' }}>
                <span>{t("inv.price")}:</span>
                <span>IDR {invoiceData.price.toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', color: 'var(--text-dim)' }}>
                <span>{t("inv.fee")}:</span>
                <span>IDR {invoiceData.fee.toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '16px' }}>
                <span className="amount-label" style={{ margin: 0, alignSelf: 'center' }}>{t("inv.amount")}:</span>
                <span className="amount-value" style={{ fontSize: '24px' }}>IDR {invoiceData.total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {status === "AWAITING_PAYMENT" && (
              <div className="payment-instructions" style={{ textAlign: 'left', width: '100%' }}>
                <div className="timer-box" style={{ marginBottom: '24px' }}>
                  <span className="timer-label">{t("inv.window")}:</span>
                  <span className="timer-value blink-fast">{formatTime(timeLeft)}</span>
                </div>
                
                <h3 style={{ color: 'var(--primary)', marginBottom: '16px', textAlign: 'center', fontSize: '14px', letterSpacing: '1px' }}>TRANSFER PEMBAYARAN KE:</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px', width: '100%' }}>
                  {invoiceData?.paymentMethod === 'OVO / GOPAY / DANA' && (
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '500', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px', fontSize: '13px' }}>OVO / GOPAY / DANA</div>
                      <div style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '1.5px', color: '#fff', marginBottom: '4px' }}>08115234943</div>
                      <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)' }}>a.n. Muh Heri Sahar</div>
                    </div>
                    <button 
                      onClick={() => handleCopy("08115234943")}
                      style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', outline: 'none' }}
                    >
                      SALIN
                    </button>
                  </div>
                  )}

                  {invoiceData?.paymentMethod === 'Bank BRI' && (
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '500', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px', fontSize: '13px' }}>Bank BRI</div>
                      <div style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '1.5px', color: '#fff', marginBottom: '4px' }}>034001087436509</div>
                      <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)' }}>a.n. Muh Heri Sahar</div>
                    </div>
                    <button 
                      onClick={() => handleCopy("034001087436509")}
                      style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', outline: 'none' }}
                    >
                      SALIN
                    </button>
                  </div>
                  )}

                  {invoiceData?.paymentMethod === 'Bank BCA' && (
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '500', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px', fontSize: '13px' }}>Bank BCA</div>
                      <div style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '1.5px', color: '#fff', marginBottom: '4px' }}>7894308207</div>
                      <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)' }}>a.n. Muh Heri Sahar</div>
                    </div>
                    <button 
                      onClick={() => handleCopy("7894308207")}
                      style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', outline: 'none' }}
                    >
                      SALIN
                    </button>
                  </div>
                  )}
                </div>
                
                <button 
                  className="btn-primary w-full no-print" 
                  onClick={handleWhatsApp}
                  style={{ marginTop: '8px', padding: '16px', fontWeight: 'bold', fontSize: '13px', background: 'var(--success)', color: '#000', borderColor: 'var(--success)' }}
                >
                  SAYA SUDAH BAYAR - KONFIRMASI VIA WA
                </button>
              </div>
            )}

            {status === "PROCESS" && (
              <div className="status-box process">
                <div className="status-icon">⚙</div>
                <h3>{t("status.process")}</h3>
                <p>Pembayaran diterima. Sistem sedang mengirimkan pesanan Anda...</p>
              </div>
            )}

            {status === "PENDING" && (
              <div className="status-box pending">
                <div className="status-icon">!</div>
                <h3>{t("status.pending")}</h3>
                <p>Server sedang padat. Pesanan Anda aman dan akan segera diproses. Silakan hubungi CS jika butuh bantuan.</p>
              </div>
            )}

            {status === "SUCCESS" && (
              <div className="status-box success">
                <div className="status-icon">✓</div>
                <h3>{t("status.success")}</h3>
                <p>Pesanan telah berhasil dikirim ke akun Anda!</p>
              </div>
            )}

            {status === "FAILED" && (
              <div className="status-box failed">
                <div className="status-icon">✕</div>
                <h3>{t("status.failed")}</h3>
                <p>Pesanan dibatalkan (Stok habis atau kesalahan server). Silakan hubungi CS untuk pengembalian dana.</p>
              </div>
            )}

            {status === "EXPIRED" && (
              <div className="status-box failed">
                <div className="status-icon">✕</div>
                <h3>{t("status.exp")}</h3>
                <p>{t("inv.expired.desc")}</p>
              </div>
            )}

            {/* Aksi Tambahan untuk status non-Awaiting */}
            {status !== "AWAITING_PAYMENT" && (
              <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '32px' }}>
                <Link href="/" className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>
                  {t("inv.home")}
                </Link>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={handleDownloadInvoice} className="btn-primary" style={{ flex: 1, fontSize: '12px', padding: '12px' }}>
                    {t("inv.download")}
                  </button>
                  <button onClick={handleWhatsApp} className="btn-primary" style={{ flex: 1, fontSize: '12px', padding: '12px', background: 'var(--success)', color: '#000', borderColor: 'var(--success)' }}>
                    {t("inv.wa")}
                  </button>
                </div>
              </div>
            )}
            
            {/* Invoice Footer / Website Link */}
            <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '12px', color: 'var(--text-dim)', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <a href="https://gemartopup.vercel.app" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>gemartopup.vercel.app</a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
