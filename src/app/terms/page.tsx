"use client";

import Link from "next/link";
import "../content.css";
import { useLanguage } from "@/context/LanguageContext";

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <div className="container">
      <div className="content-page">
        <Link href="/" className="back-nav">&lt; {t("order.return")}</Link>

        <div className="page-header">
          <h1>{t("terms.title")}</h1>
          <p>{t("terms.desc")}</p>
        </div>

        <div className="content-section">
          <h2>1. {t("terms.s1_title")}</h2>
          <p>{t("terms.s1_p1")}</p>
          <p>{t("terms.s1_p2")}</p>
        </div>

        <div className="content-section">
          <h2>2. {t("terms.s2_title")}</h2>
          <ul>
            <li>{t("terms.s2_l1")}</li>
            <li>{t("terms.s2_l2")}</li>
            <li>{t("terms.s2_l3")}</li>
            <li>{t("terms.s2_l4")}</li>
          </ul>
        </div>

        <div className="content-section">
          <h2>3. {t("terms.s3_title")}</h2>
          <p>{t("terms.s3_p1")}</p>
          <ul>
            <li>{t("terms.s3_l1")}</li>
            <li>{t("terms.s3_l2")}</li>
            <li>{t("terms.s3_l3")}</li>
          </ul>
        </div>

        <div className="content-section">
          <h2>4. {t("terms.s4_title")}</h2>
          <p>{t("terms.s4_p1")}</p>
          <ul>
            <li>{t("terms.s4_l1")}</li>
            <li>{t("terms.s4_l2")}</li>
            <li>{t("terms.s4_l3")}</li>
          </ul>
        </div>

        <div className="content-section">
          <h2>5. {t("terms.s5_title")}</h2>
          <p>{t("terms.s5_p1")}</p>
          <ul>
            <li>{t("terms.s5_l1")}</li>
            <li>{t("terms.s5_l2")}</li>
            <li>{t("terms.s5_l3")}</li>
          </ul>
        </div>

        <div className="content-section">
          <h2>6. {t("terms.s6_title")}</h2>
          <p>{t("terms.s6_p1")}</p>
        </div>

        <div className="content-section">
          <h2>7. {t("terms.s7_title")}</h2>
          <p>{t("terms.s7_p1")}</p>
        </div>

        <div className="update-stamp">
          {t("terms.updated")}
        </div>
      </div>
    </div>
  );
}
