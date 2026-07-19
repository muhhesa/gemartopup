"use client";

import Link from "next/link";
import "../content.css";
import { useLanguage } from "@/context/LanguageContext";

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <div className="container">
      <div className="content-page">
        <Link href="/" className="back-nav">&lt; {t("order.return")}</Link>

        <div className="page-header">
          <h1>{t("privacy.title")}</h1>
          <p>{t("privacy.desc")}</p>
        </div>

        <div className="content-section">
          <h2>1. {t("privacy.s1_title")}</h2>
          <p>{t("privacy.s1_p1")}</p>
          <ul>
            <li>{t("privacy.s1_l1")}</li>
            <li>{t("privacy.s1_l2")}</li>
            <li>{t("privacy.s1_l3")}</li>
            <li>{t("privacy.s1_l4")}</li>
          </ul>
        </div>

        <div className="content-section">
          <h2>2. {t("privacy.s2_title")}</h2>
          <p>{t("privacy.s2_p1")}</p>
          <ul>
            <li>{t("privacy.s2_l1")}</li>
            <li>{t("privacy.s2_l2")}</li>
            <li>{t("privacy.s2_l3")}</li>
            <li>{t("privacy.s2_l4")}</li>
          </ul>
        </div>

        <div className="content-section">
          <h2>3. {t("privacy.s3_title")}</h2>
          <p>{t("privacy.s3_p1")}</p>
        </div>

        <div className="content-section">
          <h2>4. {t("privacy.s4_title")}</h2>
          <p>{t("privacy.s4_p1")}</p>
          <ul>
            <li>{t("privacy.s4_l1")}</li>
            <li>{t("privacy.s4_l2")}</li>
          </ul>
        </div>

        <div className="content-section">
          <h2>5. {t("privacy.s5_title")}</h2>
          <p>{t("privacy.s5_p1")}</p>
        </div>

        <div className="content-section">
          <h2>6. {t("privacy.s6_title")}</h2>
          <p>{t("privacy.s6_p1")}</p>
          <ul>
            <li>{t("privacy.s6_l1")}</li>
            <li>{t("privacy.s6_l2")}</li>
            <li>{t("privacy.s6_l3")}</li>
          </ul>
        </div>

        <div className="content-section">
          <h2>7. {t("privacy.s7_title")}</h2>
          <p>{t("privacy.s7_p1")}</p>
        </div>

        <div className="update-stamp">
          {t("privacy.updated")}
        </div>
      </div>
    </div>
  );
}
