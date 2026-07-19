"use client";

import Link from "next/link";
import "../content.css";
import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";

const FAQ_ITEMS_ID = [
  {
    q: "Bagaimana cara melakukan top-up di Gemartopup?",
    a: "Pilih layanan/game yang diinginkan dari halaman utama, masukkan User ID dan Zone ID (jika diperlukan), pilih nominal dan metode pembayaran, lalu klik 'Eksekusi Pesanan'. Anda akan diarahkan ke halaman Invoice untuk melakukan pembayaran."
  },
  {
    q: "Metode pembayaran apa saja yang tersedia?",
    a: "Saat ini kami menerima pembayaran melalui transfer bank (BRI & BCA), serta e-wallet (OVO, GoPay, DANA). QRIS akan segera hadir."
  },
  {
    q: "Berapa lama proses top-up setelah pembayaran?",
    a: "Setelah pembayaran dikonfirmasi oleh admin, proses top-up biasanya memakan waktu 1-15 menit tergantung ketersediaan layanan. Pada jam sibuk, proses mungkin memerlukan waktu lebih lama."
  },
  {
    q: "Bagaimana cara mengecek status pesanan saya?",
    a: "Anda bisa mengecek status pesanan melalui halaman 'Periksa Pesanan' di menu navigasi. Masukkan ID Invoice yang Anda terima saat melakukan pemesanan."
  },
  {
    q: "Apakah saya bisa membatalkan pesanan?",
    a: "Pesanan yang sudah dibayar dan diproses tidak dapat dibatalkan. Jika terjadi kesalahan (misalnya salah memasukkan ID), segera hubungi admin melalui WhatsApp untuk penyelesaian."
  },
  {
    q: "Apa yang harus dilakukan jika top-up tidak masuk?",
    a: "Pastikan User ID dan Zone ID yang Anda masukkan sudah benar. Jika sudah benar namun belum masuk setelah 30 menit, segera hubungi admin melalui WhatsApp dengan menyertakan bukti transfer dan ID Invoice Anda."
  },
  {
    q: "Apakah Gemartopup aman dan terpercaya?",
    a: "Ya, Gemartopup adalah layanan top-up resmi dan 100% legal. Semua transaksi diproses melalui channel resmi dan data pelanggan kami lindungi dengan enkripsi."
  },
  {
    q: "Apakah ada batas waktu untuk melakukan pembayaran?",
    a: "Ya, setiap pesanan memiliki batas waktu pembayaran 24 jam. Jika melebihi batas waktu, pesanan akan otomatis kadaluarsa dan Anda perlu membuat pesanan baru."
  },
  {
    q: "Apakah ada biaya tambahan selain harga yang tertera?",
    a: "Biaya admin sudah ditampilkan secara transparan di halaman pemesanan sebelum Anda mengonfirmasi. Tidak ada biaya tersembunyi."
  },
  {
    q: "Bagaimana jika saya salah transfer nominal?",
    a: "Hubungi admin melalui WhatsApp dengan menyertakan bukti transfer. Jika nominal yang ditransfer kurang, Anda diminta melunasi sisa pembayaran. Jika lebih, kelebihan akan dikembalikan."
  }
];

const FAQ_ITEMS_EN = [
  {
    q: "How do I top-up on Gemartopup?",
    a: "Select the desired service/game from the main page, enter your User ID and Zone ID (if required), choose the amount and payment method, then click 'Execute Order'. You will be redirected to the Invoice page to make payment."
  },
  {
    q: "What payment methods are available?",
    a: "We currently accept payments via bank transfer (BRI & BCA), and e-wallets (OVO, GoPay, DANA). QRIS will be available soon."
  },
  {
    q: "How long does the top-up process take after payment?",
    a: "After payment is confirmed by the admin, the top-up process usually takes 1-15 minutes depending on service availability. During peak hours, it may take longer."
  },
  {
    q: "How can I check my order status?",
    a: "You can check your order status through the 'Check Order' page in the navigation menu. Enter the Invoice ID you received when placing your order."
  },
  {
    q: "Can I cancel my order?",
    a: "Orders that have been paid and processed cannot be canceled. If an error occurs (e.g., wrong ID entered), immediately contact the admin via WhatsApp for resolution."
  },
  {
    q: "What should I do if the top-up hasn't arrived?",
    a: "Make sure the User ID and Zone ID you entered are correct. If correct but still not received after 30 minutes, contact admin via WhatsApp with your transfer proof and Invoice ID."
  },
  {
    q: "Is Gemartopup safe and trustworthy?",
    a: "Yes, Gemartopup is an official and 100% legal top-up service. All transactions are processed through official channels and customer data is protected with encryption."
  },
  {
    q: "Is there a time limit for making payment?",
    a: "Yes, each order has a 24-hour payment deadline. If it exceeds the time limit, the order will automatically expire and you need to create a new one."
  },
  {
    q: "Are there any additional fees besides the listed price?",
    a: "Admin fees are transparently displayed on the order page before you confirm. There are no hidden fees."
  },
  {
    q: "What if I transfer the wrong amount?",
    a: "Contact admin via WhatsApp with your transfer proof. If the amount transferred is less, you will be asked to pay the remaining balance. If more, the excess will be refunded."
  }
];

export default function FAQPage() {
  const { lang, t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const faqItems = lang === "id" ? FAQ_ITEMS_ID : FAQ_ITEMS_EN;

  return (
    <div className="container">
      <div className="content-page">
        <Link href="/" className="back-nav">&lt; {t("order.return")}</Link>

        <div className="page-header">
          <h1>{t("faq.title")}</h1>
          <p>{t("faq.desc")}</p>
        </div>

        <div className="content-section">
          {faqItems.map((item, idx) => (
            <div key={idx} className="faq-item">
              <button 
                className="faq-question"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                <span>{item.q}</span>
                <span className={`faq-toggle ${openIndex === idx ? 'open' : ''}`}>+</span>
              </button>
              {openIndex === idx && (
                <div className="faq-answer">{item.a}</div>
              )}
            </div>
          ))}
        </div>

        <div className="content-section">
          <h2>{t("faq.more_title")}</h2>
          <p>
            {t("faq.more_desc")}{" "}
            <a href="https://wa.me/628115234943" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color, #00e5ff)' }}>
              WhatsApp
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
