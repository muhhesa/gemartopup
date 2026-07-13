"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function TrackPage() {
  const [invoiceId, setInvoiceId] = useState("");
  const router = useRouter();
  const { t } = useLanguage();

  const handleTrack = () => {
    if (!invoiceId) {
      alert(t("track.alert"));
      return;
    }
    router.push(`/invoice/${invoiceId}`);
  };

  return (
    <div className="container">
      <div className="terminal-box" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="section-header">
          <h2>{t("track.title")}</h2>
        </div>
        
        <p style={{ color: 'var(--text-dim)', marginBottom: '24px', fontSize: '14px' }}>
          {t("track.desc")}
        </p>

        <div className="input-group" style={{ flexDirection: 'column', gap: '16px' }}>
          <div className="form-control">
            <label>{t("track.invoice")}</label>
            <input 
              type="text" 
              className="input-field" 
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            />
          </div>
          <button 
            className="btn-primary" 
            onClick={handleTrack}
            disabled={!invoiceId}
          >
            {t("track.button")}
          </button>
        </div>
      </div>
    </div>
  );
}
