"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import "./admin.css";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Hardcoded for now. In a real app, use environment variables or proper auth.
  const ADMIN_PASSWORD = "bos";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      fetchOrders();
    } else {
      alert("Password salah!");
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      console.error("Error fetching orders:", err.message);
      alert("Gagal memuat data pesanan.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (invoiceId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("invoice_id", invoiceId);

      if (error) throw error;
      
      // Update local state
      setOrders(orders.map(o => o.invoice_id === invoiceId ? { ...o, status: newStatus } : o));
    } catch (err: any) {
      console.error("Error updating status:", err.message);
      alert("Gagal mengubah status pesanan.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-container">
        <div className="login-container">
          <form className="login-box" onSubmit={handleLogin}>
            <h2>Admin Gemartopup</h2>
            <input 
              type="password" 
              placeholder="Masukkan Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">LOGIN</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Dashboard Pesanan</h1>
        <button className="refresh-btn" onClick={fetchOrders} disabled={loading}>
          {loading ? "Memuat..." : "Refresh"}
        </button>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Invoice</th>
              <th>Target ID</th>
              <th>Item</th>
              <th>Total</th>
              <th>Metode</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "24px" }}>
                  Belum ada pesanan.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    {new Date(order.created_at).toLocaleString('id-ID', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>
                    <a href={`/invoice/${order.invoice_id}`} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                      {order.invoice_id}
                    </a>
                  </td>
                  <td>
                    {order.target_id} {order.nickname ? `(${order.nickname})` : ''}
                  </td>
                  <td>{order.package_name}</td>
                  <td>Rp {Number(order.total).toLocaleString('id-ID')}</td>
                  <td>{order.payment_method}</td>
                  <td>
                    <select 
                      className={`status-select ${order.status.toLowerCase()}`}
                      value={order.status}
                      onChange={(e) => updateStatus(order.invoice_id, e.target.value)}
                    >
                      <option value="AWAITING_PAYMENT">Menunggu Pembayaran</option>
                      <option value="PROCESS">Proses</option>
                      <option value="PENDING">Pending (Gangguan)</option>
                      <option value="SUCCESS">Sukses</option>
                      <option value="FAILED">Gagal / Batal</option>
                      <option value="EXPIRED">Expired</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
