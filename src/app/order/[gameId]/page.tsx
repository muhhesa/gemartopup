"use client";

import { useState } from "react";
import Link from "next/link";
import "./order.css";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

import catalogData from "@/data/catalog.json";
import { getConfig } from "@/data/catalogConfig";
import ReviewsComponent from "@/components/ReviewsComponent";

// Build game details map
const GAME_DETAILS: Record<string, any> = {};
catalogData.games.forEach((g: any) => {
  GAME_DETAILS[g.id] = g;
});

const getNominals = (gameId: string): any[] => {
  return (catalogData.products as any)[gameId] || [];
};

const PAYMENTS = [
  { id: "ewallet", name: "OVO / GOPAY / DANA", type: "E-Wallet", fee: 0 },
  { id: "bri", name: "Bank BRI", type: "Bank Transfer", fee: 0 },
  { id: "bca", name: "Bank BCA", type: "Bank Transfer", fee: 0 },
];

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const gameId = params.gameId as string;
  
  const game = GAME_DETAILS[gameId] || GAME_DETAILS["mlbb"] || catalogData.games[0];
  const config = getConfig(gameId, game.category);
  
  // State for dynamic fields
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  
  const [selectedNominal, setSelectedNominal] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [whatsapp, setWhatsapp] = useState<string>("");

  const [nickname, setNickname] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const nominalsList = getNominals(gameId as string);
  const selectedNominalData = nominalsList.find(n => n.id === selectedNominal);
  const selectedPaymentData = PAYMENTS.find(p => p.id === selectedPayment);
  
  const totalPrice = (selectedNominalData?.price || 0) + (selectedPaymentData?.fee || 0);

  const handleFieldChange = (fieldId: string, value: string, type: string) => {
    if (type === 'number') {
      value = value.replace(/[^0-9]/g, '');
    }
    setFieldValues(prev => ({ ...prev, [fieldId]: value }));
    setNickname(null);
    setCheckError(null);
  };

  const isFieldsComplete = () => {
    for (const field of config.fields) {
      if (field.required && !fieldValues[field.id]) {
        return false;
      }
    }
    return true;
  };

  const getTargetIdString = () => {
    if (config.fields.length === 1) return fieldValues[config.fields[0].id] || "";
    if (config.fields.length === 2) {
       if (gameId === 'valo') {
         return `${fieldValues[config.fields[0].id]}#${fieldValues[config.fields[1].id]}`;
       }
       return `${fieldValues[config.fields[0].id]} (${fieldValues[config.fields[1].id]})`;
    }
    return Object.values(fieldValues).join(" ");
  };

  const handleCheckNickname = () => {
    if (!isFieldsComplete()) {
      alert(t("order.alert"));
      return;
    }
    
    setIsChecking(true);
    setCheckError(null);
    setNickname(null);

    // Simulate API call and validation
    setTimeout(() => {
      const primaryVal = fieldValues[config.fields[0].id] || "";
      if (primaryVal.length < 5 && config.fields[0].type !== 'email') {
        setCheckError("AKUN TIDAK DITEMUKAN / INVALID ID");
      } else {
        setNickname(`PLAYER_${primaryVal.substring(0,4)}`);
      }
      setIsChecking(false);
    }, 1000);
  };

  const handleConfirmOrder = async () => {
    if (!isFieldsComplete() || !selectedNominal || !selectedPayment) {
      alert(t("order.alert"));
      return;
    }
    if (config.needsNicknameCheck && (checkError || !nickname)) {
      alert("AKUN TIDAK DITEMUKAN ATAU BELUM DICEK. TIDAK DAPAT MELANJUTKAN PESANAN!");
      return;
    }
    if (!whatsapp || whatsapp.length < 9) {
      alert("No WhatsApp wajib diisi dengan benar (min. 9 angka)!");
      return;
    }

    const targetId = getTargetIdString();
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          nominalId: selectedNominal,
          paymentId: selectedPayment,
          targetId,
          whatsapp,
          nickname: config.needsNicknameCheck ? nickname : null
        })
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Terjadi kesalahan saat memproses pesanan.");
        return;
      }
      
      // Save for immediate display on invoice page
      localStorage.setItem("gemartopup_pending_order", JSON.stringify({
        invoiceId: result.invoiceId,
        gameId,
        targetId, 
        nickname: result.orderData.nickname, 
        packageName: result.orderData.package_name, 
        paymentMethod: result.orderData.payment_method, 
        price: result.orderData.price, 
        fee: result.orderData.fee, 
        total: result.orderData.total, 
        timestamp: Date.now()
      }));

      router.push(`/invoice/${result.invoiceId}`);
    } catch (err) {
      console.error(err);
      alert("Sistem sedang sibuk. Coba lagi.");
    }
  };

  return (
    <div className="container" style={{ position: 'relative' }}>
      <div className="breadcrumb">
        <Link href="/" className="back-link">{t("order.return")}</Link>
      </div>

      <div className="order-header terminal-box">
        <h1>{t("order.target")}: {game.name}</h1>
        <div className="sys-status">{t("order.sysready")}</div>
      </div>

      <div className="order-grid">
        <aside className="order-left-sidebar">
          <ReviewsComponent gameId={gameId} products={nominalsList} />
        </aside>

        <div className="order-main">
          <section className="terminal-box mb-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px dashed rgba(255, 145, 0, 0.2)', paddingBottom: '8px' }}>
              <h2 className="step-title" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>{t("order.step1")}</h2>
              <button 
                className="btn-secondary" 
                style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '4px' }}
                onClick={() => setIsGuideOpen(true)}
              >
                ? Petunjuk
              </button>
            </div>
            <div className="input-group">
              {config.fields.map((field) => (
                <div className="form-control" key={field.id}>
                  <label>{field.labelId} {field.required ? '*' : ''}</label>
                  {field.type === 'dropdown' && field.options ? (
                    <select 
                      className="input-field"
                      value={fieldValues[field.id] || ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value, field.type)}
                      style={{ 
                        background: '#0a0a0a', 
                        color: 'var(--primary-color)',
                        border: '1px solid var(--border-color)' 
                      }}
                    >
                      <option value="">-- Pilih --</option>
                      {field.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type={field.type === 'email' ? 'email' : 'text'} 
                      className="input-field" 
                      placeholder={field.placeholder || ""}
                      value={fieldValues[field.id] || ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value, field.type)}
                    />
                  )}
                </div>
              ))}
              
              {config.needsNicknameCheck && (
                <div className="form-control" style={{ display: 'flex', alignItems: 'flex-end' }}>
                   <button 
                    className="btn-primary" 
                    style={{ height: '48px', width: '100%' }}
                    onClick={handleCheckNickname}
                    disabled={isChecking || !isFieldsComplete()}
                   >
                     {isChecking ? "..." : t("order.check")}
                   </button>
                </div>
              )}
            </div>
            
            {nickname && (
              <div style={{ marginTop: '16px', padding: '12px', border: '1px dashed var(--success)', color: 'var(--success)', fontWeight: 600 }}>
                {t("order.found")} {nickname}
              </div>
            )}
            {checkError && (
              <div style={{ marginTop: '16px', padding: '12px', border: '1px dashed var(--danger)', color: 'var(--danger)', fontWeight: 600 }}>
                {checkError}
              </div>
            )}
          </section>

          <section className="terminal-box mb-4">
            <h2 className="step-title">{t("order.step2")}</h2>
            <div className="nominal-grid">
              {nominalsList.map((nom) => (
                <div 
                  key={nom.id} 
                  className={`nominal-card ${selectedNominal === nom.id ? 'active' : ''}`}
                  onClick={() => setSelectedNominal(nom.id)}
                  style={{ position: 'relative' }}
                >
                  {nom.badge && (
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '10px',
                      background: nom.badge === 'promo' ? 'var(--danger)' : 'var(--success)',
                      color: '#000',
                      padding: '2px 8px',
                      fontSize: '10px',
                      fontWeight: 800,
                      borderRadius: '2px',
                      letterSpacing: '1px'
                    }}>
                      {t(`badge.${nom.badge}`)}
                    </div>
                  )}
                  <div className="nom-name">{nom.name}</div>
                  <div className="nom-price">IDR {nom.price.toLocaleString('id-ID')}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="terminal-box mb-4">
            <h2 className="step-title">{t("order.step3")}</h2>
            <div className="payment-list">
              {PAYMENTS.map((pay) => (
                <div 
                  key={pay.id} 
                  className={`payment-card ${selectedPayment === pay.id ? 'active' : ''}`}
                  onClick={() => setSelectedPayment(pay.id)}
                >
                  <div className="pay-name">{pay.name}</div>
                  <div className="pay-type">{pay.type} {pay.fee > 0 && `(+ Rp ${pay.fee.toLocaleString('id-ID')})`}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="terminal-box mb-4">
            <h2 className="step-title">04. DETAIL KONTAK</h2>
            <div className="form-control" style={{ marginTop: '16px' }}>
              <label>No. WhatsApp <span style={{ color: 'var(--danger)' }}>*</span></label>
              <div style={{ display: 'flex' }}>
                <div style={{ 
                  background: '#333', 
                  padding: '0 16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  borderTopLeftRadius: '4px', 
                  borderBottomLeftRadius: '4px',
                  border: '1px solid var(--border-color)',
                  borderRight: 'none',
                  fontSize: '16px'
                }}>ID</div>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="6281xxxxxxxxx"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9]/g, ''))}
                  style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                />
              </div>
              <div style={{ fontSize: '11px', fontStyle: 'italic', color: 'var(--text-dim)', marginTop: '4px' }}>
                *Contoh: 62821xxxxxxxxx (No WhatsApp wajib diisi)
              </div>
              <div style={{ 
                marginTop: '12px', 
                padding: '10px 14px', 
                background: 'rgba(29, 155, 240, 0.1)', 
                border: '1px solid rgba(29, 155, 240, 0.3)',
                borderRadius: '6px',
                color: '#1d9bf0',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
                Informasi: Bukti transaksi akan kami kirim ke WhatsApp yang kamu isi di atas.
              </div>
            </div>
          </section>
        </div>

        <aside className="order-sidebar">
          <div className="terminal-box sticky-sidebar">
            <h2 className="step-title">{t("order.summary")}</h2>
            
            <div className="summary-details" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
              <div className="summary-row">
                <span>{t("order.item")}:</span>
                <span>{selectedNominalData ? selectedNominalData.name : "-"}</span>
              </div>
              <div className="summary-row">
                <span>{t("order.target")}:</span>
                <span style={{ textAlign: 'right' }}>
                  {isFieldsComplete() ? getTargetIdString() : "-"}
                  {nickname ? <><br/><span style={{ fontSize: '11px', color: 'var(--primary-color)' }}>({nickname})</span></> : ""}
                </span>
              </div>
              <div className="summary-row">
                <span>Payment:</span>
                <span>{selectedPaymentData ? selectedPaymentData.name : "-"}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row" style={{ fontWeight: 'bold' }}>
                <span>Subtotal:</span>
                <span>IDR {selectedNominalData ? selectedNominalData.price.toLocaleString('id-ID') : 0}</span>
              </div>
              <div className="summary-row">
                <span>Fee:</span>
                <span>IDR {selectedPaymentData ? selectedPaymentData.fee.toLocaleString('id-ID') : 0}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total-row">
                <span>Total:</span>
                <span>IDR {totalPrice.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <button 
              className="btn-primary mt-4" 
              style={{ width: '100%', height: '56px', fontSize: '16px' }}
              onClick={handleConfirmOrder}
              disabled={!isFieldsComplete() || !selectedNominal || !selectedPayment || (config.needsNicknameCheck && !nickname)}
            >
              BAYAR SEKARANG
            </button>
          </div>
        </aside>
      </div>

      {isGuideOpen && (
        <div className="modal-overlay" onClick={() => setIsGuideOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid #333', paddingBottom: '12px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', margin: 0, color: '#fff' }}>Petunjuk Pengisian</h2>
              <button className="close-btn" onClick={() => setIsGuideOpen(false)} style={{ color: '#888' }}>&times;</button>
            </div>
            
            <div style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.5' }}>
              <p style={{ marginBottom: '16px' }}>Ikuti langkah berikut dengan benar untuk menemukan data akun kamu.</p>
              
              {/* Dynamic guide based on fields */}
              <div style={{ padding: '16px', backgroundColor: '#222', borderRadius: '4px', border: '1px solid #333', marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '8px' }}>Format:</div>
                <div>
                  {config.fields.map((f) => f.labelId).join(gameId === 'valo' ? '#' : ' ')}
                </div>
                
                <div style={{ fontWeight: 'bold', color: 'var(--primary-color)', marginTop: '16px', marginBottom: '8px' }}>Contoh:</div>
                <div>
                  {gameId === 'valo' ? 'kuropedia#123' : 
                   gameId === 'mlbb' ? '12345678 (1234)' :
                   gameId.includes('honkai') || gameId === 'genshin' ? '800123456 (Asia)' :
                   'ourastore123'}
                </div>
              </div>
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%' }}
              onClick={() => setIsGuideOpen(false)}
            >
              Mengerti & Lanjutkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
