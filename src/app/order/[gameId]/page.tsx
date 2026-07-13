"use client";

import { useState } from "react";
import Link from "next/link";
import "./order.css";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";

const GAME_DETAILS: Record<string, any> = {
  ml: { name: "MOBILE LEGENDS", code: "MLBB", hasZone: true, zoneName: "ZONE ID" },
  ff: { name: "FREE FIRE", code: "FF", hasZone: false },
  pubg: { name: "PUBG MOBILE", code: "PUBGM", hasZone: false },
  valo: { name: "VALORANT", code: "VALO", hasZone: false },
  genshin: { name: "GENSHIN IMPACT", code: "GI", hasZone: true, zoneName: "SERVER" },
  hsr: { name: "HONKAI: STAR RAIL", code: "HSR", hasZone: true, zoneName: "SERVER" },
  gplay: { name: "GOOGLE PLAY ID", code: "GPLAY", hasZone: false },
  garena: { name: "GARENA SHELL", code: "GSHELL", hasZone: false },
  tsel: { name: "TELKOMSEL PULSA", code: "TSEL", hasZone: false },
  pln: { name: "TOKEN PLN", code: "PLN", hasZone: false },
};

const getNominals = (gameId: string) => {
  if (gameId === "pln") {
    return [
      { id: 1, name: "Token 20.000", price: 21500, badge: null },
      { id: 2, name: "Token 50.000", price: 51500, badge: "promo" },
      { id: 3, name: "Token 100.000", price: 101500, badge: "bestseller" },
    ];
  }
  if (gameId === "tsel") {
    return [
      { id: 1, name: "Pulsa 10.000", price: 11500, badge: null },
      { id: 2, name: "Pulsa 50.000", price: 50500, badge: "promo" },
      { id: 3, name: "Pulsa 100.000", price: 99500, badge: "bestseller" },
    ];
  }
  if (gameId === "gplay") {
    return [
      { id: 1, name: "Voucher 50.000", price: 55000, badge: null },
      { id: 2, name: "Voucher 100.000", price: 110000, badge: "bestseller" },
    ];
  }
  
  // Default (Games)
  return [
    { id: 1, name: "86 Diamonds", price: 15500, badge: null },
    { id: 2, name: "172 Diamonds", price: 30000, badge: "promo" },
    { id: 3, name: "257 Diamonds", price: 44500, badge: null },
    { id: 4, name: "344 Diamonds", price: 58500, badge: "bestseller" },
    { id: 5, name: "706 Diamonds", price: 117500, badge: null },
    { id: 6, name: "878 Diamonds", price: 146000, badge: null },
  ];
};

const PAYMENTS = [
  { id: "qris", name: "QRIS", type: "E-Wallet/Bank", fee: 0 },
  { id: "dana", name: "DANA", type: "E-Wallet", fee: 1000 },
  { id: "bca", name: "BCA Virtual Account", type: "Bank Transfer", fee: 4000 },
];

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const gameId = params.gameId as string;
  
  const game = GAME_DETAILS[gameId] || GAME_DETAILS["ml"];
  
  const [userId, setUserId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [selectedNominal, setSelectedNominal] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const [nickname, setNickname] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);

  const nominalsList = getNominals(gameId as string);
  const selectedNominalData = nominalsList.find(n => n.id === selectedNominal);
  const selectedPaymentData = PAYMENTS.find(p => p.id === selectedPayment);
  
  const totalPrice = (selectedNominalData?.price || 0) + (selectedPaymentData?.fee || 0);

  const handleCheckNickname = () => {
    if (!userId || (game.hasZone && !zoneId)) {
      alert(t("order.alert"));
      return;
    }
    
    setIsChecking(true);
    setCheckError(null);
    setNickname(null);

    // Simulate API call and validation
    setTimeout(() => {
      if (userId.length < 5) {
        setCheckError("AKUN TIDAK DITEMUKAN / INVALID ID");
      } else {
        setNickname(`PLAYER_${userId.substring(0,4)}`);
      }
      setIsChecking(false);
    }, 1000);
  };

  const handleCheckoutClick = () => {
    if (!userId || !selectedNominal || !selectedPayment || (game.hasZone && !zoneId)) {
      alert(t("order.alert"));
      return;
    }
    if (checkError || !nickname) {
      alert("AKUN TIDAK DITEMUKAN ATAU BELUM DICEK. TIDAK DAPAT MELANJUTKAN PESANAN!");
      return;
    }
    // Tampilkan modal konfirmasi
    setShowModal(true);
  };

  const handleConfirmOrder = async () => {
    const invoiceId = `INV-${game.code}-${Math.floor(Math.random() * 1000000)}`;
    
    const targetId = game.hasZone ? `${userId} (${zoneId})` : userId;
    const packageName = `${selectedNominalData?.name} (${game.name})`;
    const paymentMethod = selectedPaymentData?.name;
    const price = selectedNominalData?.price || 0;
    const fee = selectedPaymentData?.fee || 0;

    const orderData = {
      invoice_id: invoiceId,
      target_id: targetId,
      nickname: nickname,
      package_name: packageName,
      payment_method: paymentMethod,
      price: price,
      fee: fee,
      total: totalPrice,
      status: 'AWAITING_PAYMENT'
    };
    
    try {
      const { error } = await supabase.from('orders').insert([orderData]);
      
      if (error) {
        console.error("Supabase Error:", error);
        alert("Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.");
        return;
      }
      
      // Fallback local storage for immediate reading
      localStorage.setItem("gemartopup_pending_order", JSON.stringify({
        targetId, nickname, packageName, paymentMethod, price, fee, total: totalPrice
      }));
      
      router.push(`/invoice/${invoiceId}`);
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
        <div className="order-main">
          <section className="terminal-box mb-4">
            <h2 className="step-title">{t("order.step1")}</h2>
            <div className="input-group">
              <div className="form-control">
                <label>{t("order.userid")}</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={userId}
                  onChange={(e) => { setUserId(e.target.value); setNickname(null); setCheckError(null); }}
                />
              </div>
              {game.hasZone && (
                <div className="form-control">
                  <label>{t("order.zoneid")}</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={zoneId}
                    onChange={(e) => { setZoneId(e.target.value); setNickname(null); setCheckError(null); }}
                  />
                </div>
              )}
              
              <div className="form-control" style={{ display: 'flex', alignItems: 'flex-end' }}>
                 <button 
                  className="btn-primary" 
                  style={{ height: '48px', width: '100%' }}
                  onClick={handleCheckNickname}
                  disabled={isChecking || !userId || (game.hasZone && !zoneId)}
                 >
                   {isChecking ? "..." : t("order.check")}
                 </button>
              </div>
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

          <section className="terminal-box">
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
        </div>

        <aside className="order-sidebar">
          <div className="terminal-box sticky-sidebar">
            <h2 className="step-title">{t("order.summary")}</h2>
            
            <div className="summary-details">
              <div className="summary-row">
                <span>{t("order.item")}:</span>
                <span>{selectedNominalData ? selectedNominalData.name : '---'}</span>
              </div>
              <div className="summary-row">
                <span>{t("order.price")}:</span>
                <span>{selectedNominalData ? `IDR ${selectedNominalData.price.toLocaleString('id-ID')}` : '---'}</span>
              </div>
              <div className="summary-row">
                <span>{t("order.fee")}:</span>
                <span>{selectedPaymentData ? `IDR ${selectedPaymentData.fee.toLocaleString('id-ID')}` : '---'}</span>
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-total">
                <span>{t("order.total")}:</span>
                <span className="total-price">
                  IDR {totalPrice.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <button 
              className="btn-primary w-full mt-4" 
              onClick={handleCheckoutClick}
            >
              {t("order.execute")}
            </button>
          </div>
        </aside>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="terminal-box" style={{ width: '90%', maxWidth: '400px' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '16px', borderBottom: '1px dashed var(--primary)', paddingBottom: '8px' }}>
              KONFIRMASI PESANAN
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>ID Tujuan:</span>
                <span>{game.hasZone ? `${userId} (${zoneId})` : userId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Nickname:</span>
                <span style={{ color: 'var(--success)' }}>{nickname}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Item:</span>
                <span>{selectedNominalData?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Pembayaran:</span>
                <span>{selectedPaymentData?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)' }}>
                <span style={{ color: 'var(--text-dim)' }}>Total:</span>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>IDR {totalPrice.toLocaleString('id-ID')}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-primary" style={{ flex: 1, background: 'transparent', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => setShowModal(false)}>
                BATAL
              </button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleConfirmOrder}>
                YAKIN & LANJUT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
