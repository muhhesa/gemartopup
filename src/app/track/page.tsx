"use client";

import { useState, useEffect } from "react";
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

  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch('/api/transactions/recent');
        const result = await res.json();
        if (result.success) {
          setRecentTransactions(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch recent transactions");
      }
    };
    
    fetchRecent();
    const interval = setInterval(fetchRecent, 10000); // refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

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

      <div className="terminal-box" style={{ maxWidth: '900px', margin: '40px auto 0' }}>
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '8px' }}>
          <h2>Transaksi Terkini</h2>
        </div>
        <p style={{ color: 'var(--text-dim)', textAlign: 'center', marginBottom: '24px', fontSize: '13px' }}>
          Berikut adalah pesanan terbaru yang masuk secara real-time.
        </p>

        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Nomor Invoice</th>
                <th>Layanan</th>
                <th>Harga</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx, idx) => (
                <tr key={idx}>
                  <td>
                    {new Date(tx.created_at).toLocaleString('id-ID', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit', second: '2-digit'
                    }).replace(/\./g, ':')}
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>{tx.invoice_id}</td>
                  <td>{tx.package_name}</td>
                  <td>IDR {tx.price.toLocaleString('id-ID')}</td>
                  <td>
                    <span className={`status-badge-small ${tx.status.toLowerCase()}`}>
                      {tx.status === 'SUCCESS' ? 'Sukses' : 
                       tx.status === 'AWAITING_PAYMENT' ? 'Unpaid' : 
                       tx.status === 'PROCESS' ? 'Proses' : 
                       tx.status === 'FAILED' || tx.status === 'EXPIRED' ? 'Gagal' : tx.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>Belum ada transaksi</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
