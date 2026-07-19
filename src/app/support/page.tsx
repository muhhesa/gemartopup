"use client";

import Link from "next/link";
import "../content.css";
import { useLanguage } from "@/context/LanguageContext";

export default function SupportPage() {
  const { t } = useLanguage();

  return (
    <div className="container">
      <div className="content-page">
        <Link href="/" className="back-nav">&lt; {t("order.return")}</Link>

        <div className="page-header">
          <h1>{t("support.title")}</h1>
          <p>{t("support.desc")}</p>
        </div>

        <div className="contact-cards">
          <a href="https://wa.me/628115234943" target="_blank" rel="noreferrer" className="contact-card">
            <div className="card-label">WHATSAPP</div>
            <div className="card-value">08115234943</div>
            <div className="card-desc">{t("support.wa_desc")}</div>
          </a>

          <a href="mailto:gemartopup@gmail.com" className="contact-card">
            <div className="card-label">EMAIL</div>
            <div className="card-value">gemartopup@gmail.com</div>
            <div className="card-desc">{t("support.email_desc")}</div>
          </a>

          <a href="https://www.instagram.com/gemartopup/" target="_blank" rel="noreferrer" className="contact-card">
            <div className="card-label">INSTAGRAM</div>
            <div className="card-value">@gemartopup</div>
            <div className="card-desc">{t("support.ig_desc")}</div>
          </a>
        </div>

        <div className="content-section">
          <h2>{t("support.hours_title")}</h2>
          <p>{t("support.hours_desc")}</p>
        </div>

        <div className="content-section">
          <h2>{t("support.response_title")}</h2>
          <p>{t("support.response_desc")}</p>
        </div>

        <div className="content-section">
          <h2>{t("support.complaint_title")}</h2>
          <ol>
            <li>{t("support.complaint_1")}</li>
            <li>{t("support.complaint_2")}</li>
            <li>{t("support.complaint_3")}</li>
            <li>{t("support.complaint_4")}</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
