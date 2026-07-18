"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "id" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  id: {
    "nav.home": "BERANDA",
    "nav.track": "PERIKSA PESANAN",
    "status.online": "ONLINE",
    "home.welcome": "SELAMAT DATANG DI GEMARTOPUP",
    "home.subtitle1": "PUSAT LAYANAN TOP-UP GAME & VOUCHER INSTAN 24/7. HARGA KOMPETITIF, 100% AMAN DAN LEGAL.",
    "home.subtitle2": "TRANSAKSI LEBIH MUDAH DENGAN BERBAGAI PILIHAN PEMBAYARAN LENGKAP.",
    "home.market": "DAFTAR LAYANAN",
    "home.popular": "PALING BANYAK DICARI",
    "home.live": "STATUS REALTIME",
    "home.status": "STATUS",
    "home.active": "AKTIF",
    "home.maintenance": "GANGGUAN",
    "cat.all": "SEMUA LAYANAN",
    "cat.game": "GAME",
    "cat.voucher": "VOUCHER",
    "cat.pulsa": "PULSA & TOKEN",
    
    "order.return": "< KEMBALI KE AWAL",
    "order.target": "LAYANAN",
    "order.sysready": "SISTEM AKTIF",
    "order.step1": "01. MASUKKAN DATA PENGGUNA",
    "order.userid": "ID PENGGUNA",
    "order.zoneid": "ID ZONA",
    "order.check": "CEK NICKNAME",
    "order.found": "AKUN DITEMUKAN:",
    "order.step2": "02. PILIH PAKET",
    "order.step3": "03. PILIH PEMBAYARAN",
    "order.summary": "RINGKASAN PESANAN",
    "order.item": "BARANG",
    "order.price": "HARGA",
    "order.fee": "BIAYA ADMIN",
    "order.total": "TOTAL",
    "order.execute": "EKSEKUSI PESANAN",
    "order.alert": "MOHON ISI SEMUA DATA YANG DIBUTUHKAN",
    "order.alert_check": "MOHON CEK NICKNAME TERLEBIH DAHULU",
    "badge.bestseller": "TERLARIS",
    "badge.promo": "PROMO",
    
    "track.title": "PERIKSA PESANAN",
    "track.desc": "MASUKKAN ID INVOICE ANDA DI BAWAH UNTUK MEMERIKSA STATUS PESANAN SECARA REAL-TIME.",
    "track.invoice": "ID INVOICE",
    "track.button": "EKSEKUSI PENCARIAN",
    "track.alert": "MOHON MASUKKAN ID INVOICE YANG VALID",
    
    "inv.title": "INVOICE TRANSAKSI",
    "inv.invoiceid": "ID INVOICE",
    "inv.time": "WAKTU",
    "inv.target": "TARGET ID",
    "inv.package": "PAKET",
    "inv.paymethod": "METODE PEMBAYARAN",
    "inv.price": "HARGA ITEM",
    "inv.fee": "BIAYA ADMIN",
    "inv.amount": "TOTAL TAGIHAN",
    "inv.window": "BATAS WAKTU PEMBAYARAN",
    "inv.scan": "SCAN UNTUK MEMBAYAR",
    "inv.sim": "SIMULASIKAN PEMBAYARAN",
    "inv.received": "PEMBAYARAN DITERIMA",
    "inv.processing": "TRANSAKSI SEDANG DIPROSES OLEH SISTEM...",
    "inv.home": "KEMBALI KE BERANDA",
    "inv.expired": "TRANSAKSI KADALUARSA",
    "inv.expired.desc": "BATAS WAKTU PEMBAYARAN TELAH HABIS. SILAKAN BUAT PESANAN BARU.",
    "inv.new": "BUAT PESANAN BARU",
    "inv.download": "UNDUH INVOICE",
    "inv.wa": "KIRIM KE WHATSAPP",
    "inv.cs": "BANTUAN CS",
    
    "status.awaiting": "MENUNGGU PEMBAYARAN",
    "status.process": "SEDANG DIPROSES",
    "status.pending": "TERTUNDA (PENDING)",
    "status.success": "TERKIRIM (SUKSES)",
    "status.failed": "BATAL (GAGAL)",
    "status.exp": "KADALUARSA",
    
    "footer.desc": "Seller top up game, voucher, pulsa, token pln dengan harga merakyat, aman dan terpercaya. 100% LEGAL Dengan Layanan 24/7 Non stop dan transaksi lebih mudah dengan berbagai pilihan pembayaran lengkap.",
    "footer.help": "Butuh Bantuan",
    "footer.nav": "NAVIGASI",
    "footer.fast": "AKSES CEPAT",
    "footer.terms": "KETENTUAN",
    "footer.support": "Dukungan Pelanggan",
    "footer.faq": "FAQ",
    "footer.tos": "Syarat & Ketentuan Layanan",
    "footer.privacy": "Kebijakan Privasi",
    "footer.follow": "IKUTI KAMI",
    "footer.registered": "TERDAFTAR DI",
    "footer.rights": "GEMARTOPUP TERMINAL V1.0",
    "footer.secure": "KONEKSI AMAN TERBENTUK"
  },
  en: {
    "nav.home": "HOME",
    "nav.track": "CHECK ORDER",
    "status.online": "ONLINE",
    "home.welcome": "WELCOME TO GEMARTOPUP",
    "home.subtitle1": "INSTANT 24/7 GAME & VOUCHER TOP-UP CENTER. COMPETITIVE PRICES, 100% SECURE AND LEGAL.",
    "home.subtitle2": "SEAMLESS TRANSACTIONS WITH COMPREHENSIVE PAYMENT OPTIONS.",
    "home.market": "SERVICE LIST",
    "home.popular": "MOST SEARCHED",
    "home.live": "REALTIME STATUS",
    "home.status": "STATUS",
    "home.active": "ACTIVE",
    "home.maintenance": "MAINTENANCE",
    "cat.all": "ALL SERVICES",
    "cat.game": "GAME",
    "cat.voucher": "VOUCHER",
    "cat.pulsa": "CREDIT & TOKEN",
    
    "order.return": "< BACK TO START",
    "order.target": "SERVICE",
    "order.sysready": "SYSTEM ACTIVE",
    "order.step1": "01. INPUT USER DATA",
    "order.userid": "USER ID",
    "order.zoneid": "ZONE ID",
    "order.check": "CHECK ID",
    "order.found": "ACCOUNT FOUND:",
    "order.step2": "02. SELECT PACKAGE",
    "order.step3": "03. SELECT PAYMENT",
    "order.summary": "ORDER SUMMARY",
    "order.item": "ITEM",
    "order.price": "PRICE",
    "order.fee": "FEE",
    "order.total": "TOTAL",
    "order.execute": "EXECUTE ORDER",
    "order.alert": "PLEASE FILL ALL REQUIRED FIELDS",
    "order.alert_check": "PLEASE CHECK ID FIRST",
    "badge.bestseller": "BESTSELLER",
    "badge.promo": "PROMO",
    
    "track.title": "CHECK ORDER",
    "track.desc": "ENTER YOUR INVOICE ID BELOW TO CHECK THE STATUS OF YOUR ORDER IN REAL-TIME.",
    "track.invoice": "INVOICE ID",
    "track.button": "EXECUTE QUERY",
    "track.alert": "PLEASE ENTER A VALID INVOICE ID",
    
    "inv.title": "TRANSACTION INVOICE",
    "inv.invoiceid": "INVOICE ID",
    "inv.time": "TIMESTAMP",
    "inv.target": "TARGET ID",
    "inv.package": "PACKAGE",
    "inv.paymethod": "PAYMENT METHOD",
    "inv.price": "ITEM PRICE",
    "inv.fee": "ADMIN FEE",
    "inv.amount": "TOTAL DUE",
    "inv.window": "PAYMENT WINDOW",
    "inv.scan": "SCAN TO PAY",
    "inv.sim": "SIMULATE PAYMENT",
    "inv.received": "PAYMENT RECEIVED",
    "inv.processing": "TRANSACTION IS BEING PROCESSED BY THE SYSTEM...",
    "inv.home": "RETURN TO HOME",
    "inv.expired": "TRANSACTION EXPIRED",
    "inv.expired.desc": "THE PAYMENT WINDOW HAS LAPSED. PLEASE CREATE A NEW ORDER.",
    "inv.new": "CREATE NEW ORDER",
    "inv.download": "DOWNLOAD INVOICE",
    "inv.wa": "SEND TO WHATSAPP",
    "inv.cs": "CS SUPPORT",
    
    "status.awaiting": "AWAITING PAYMENT",
    "status.process": "PROCESSING",
    "status.pending": "PENDING",
    "status.success": "DELIVERED (SUCCESS)",
    "status.failed": "FAILED (CANCELED)",
    "status.exp": "EXPIRED",
    
    "footer.desc": "Game top-up seller, vouchers, credit, PLN tokens at affordable prices, safe and trusted. 100% LEGAL with 24/7 non-stop service and easier transactions with various complete payment options.",
    "footer.help": "Need Help",
    "footer.nav": "NAVIGATION",
    "footer.fast": "QUICK ACCESS",
    "footer.terms": "TERMS",
    "footer.support": "Customer Support",
    "footer.faq": "FAQ",
    "footer.tos": "Terms of Service",
    "footer.privacy": "Privacy Policy",
    "footer.follow": "FOLLOW US",
    "footer.registered": "REGISTERED AT",
    "footer.rights": "GEMARTOPUP TERMINAL V1.0",
    "footer.secure": "SECURE CONNECTION ESTABLISHED"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("id");

  useEffect(() => {
    const saved = localStorage.getItem("gemartopup_lang") as Language;
    if (saved === "en" || saved === "id") setLang(saved);
  }, []);

  const changeLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("gemartopup_lang", newLang);
  };

  const t = (key: string) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
