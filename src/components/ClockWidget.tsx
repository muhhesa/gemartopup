"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function ClockWidget() {
  const [time, setTime] = useState<Date | null>(null);
  const { lang } = useLanguage();

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return <div className="clock-widget terminal-box" style={{ width: '200px', height: '100px' }}></div>;

  const formatTime = (d: Date) => {
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    const ss = d.getSeconds().toString().padStart(2, '0');
    return `${hh}.${mm}.${ss}`;
  };

  const formatDate = (d: Date) => {
    const daysId = ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"];
    const daysEn = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    
    const monthsId = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];
    const monthsEn = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    const days = lang === 'id' ? daysId : daysEn;
    const months = lang === 'id' ? monthsId : monthsEn;

    const dayName = days[d.getDay()];
    const date = d.getDate().toString().padStart(2, '0');
    const monthName = months[d.getMonth()];
    const year = d.getFullYear();

    return `${dayName}, ${date} ${monthName} ${year}`;
  };

  return (
    <div className="clock-widget terminal-box">
      <div className="clock-time">
        {formatTime(time)}
      </div>
      <div className="clock-date">
        {formatDate(time)}
      </div>
    </div>
  );
}
