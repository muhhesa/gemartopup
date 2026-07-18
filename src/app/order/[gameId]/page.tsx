"use client";

import { useState } from "react";
import Link from "next/link";
import "./order.css";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";

import catalogData from "@/data/catalog.json";
import { getConfig } from "@/data/catalogConfig";

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

  const [nickname, setNickname] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);

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
       if (gameId === 'valorant') {
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

    const invoiceId = `INV-${game.code}-${Math.floor(Math.random() * 1000000)}`;
    
    const targetId = getTargetIdString();
    const packageName = `${selectedNominalData?.name} (${game.name})`;
    const paymentMethod = selectedPaymentData?.name;
    const price = selectedNominalData?.price || 0;
    const fee = selectedPaymentData?.fee || 0;

    const orderData = {
      invoice_id: invoiceId,
      target_id: targetId,
      nickname: config.needsNicknameCheck ? nickname : null,
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
      
      // Trigger Telegram notification
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoiceId,
            targetId,
            nickname: orderData.nickname,
            packageName,
            paymentMethod,
            price,
            total: totalPrice
          })
        });
      } catch (notifyErr) {
        console.error('Failed to send notification:', notifyErr);
      }
      
      localStorage.setItem("gemartopup_pending_order", JSON.stringify({
        targetId, nickname: orderData.nickname, packageName, paymentMethod, price, fee, total: totalPrice, timestamp: Date.now()
      }));

      // Send Telegram Notification silently
      fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId,
          targetId,
          nickname: orderData.nickname,
          packageName,
          paymentMethod,
          total: totalPrice
        })
      }).catch(err => console.error("Failed to send telegram notification:", err));
      
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
                <span>{selectedNominalData ? selectedNominalData.name : "-"}</span>
              </div>
              <div className="summary-row">
                <span>{t("order.target")}:</span>
                <span>{isFieldsComplete() ? getTargetIdString() : "-"}</span>
              </div>
              <div className="summary-row">
                <span>Nickname:</span>
                <span>{config.needsNicknameCheck ? (nickname || "-") : "Tidak Perlu"}</span>
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
    </div>
  );
}
