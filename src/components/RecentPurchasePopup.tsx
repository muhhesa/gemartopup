"use client";

import { useEffect, useState } from "react";
import catalogData from "@/data/catalog.json";

interface Transaction {
  invoice_id: string;
  target_id: string;
  package_name: string;
  price: number;
  status: string;
  created_at: string;
}

export default function RecentPurchasePopup() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fetch initial data
    const fetchRecent = async () => {
      try {
        const res = await fetch('/api/transactions/recent');
        const result = await res.json();
        if (result.success && result.data.length > 0) {
          // Filter only SUCCESS status
          const successTx = result.data.filter((tx: Transaction) => tx.status === 'SUCCESS');
          if (successTx.length > 0) {
            setTransactions(successTx);
          }
        }
      } catch (err) {
        console.error("Failed to fetch recent transactions for popup");
      }
    };
    
    fetchRecent();
    
    // Refresh data every 2 minutes to get fresh purchases
    const dataInterval = setInterval(fetchRecent, 120000); 
    return () => clearInterval(dataInterval);
  }, []);

  useEffect(() => {
    if (transactions.length === 0) return;

    // Show popup loop
    const showPopup = () => {
      setIsVisible(true);
      
      // Hide after 4 seconds
      setTimeout(() => {
        setIsVisible(false);
        
        // Wait 2 seconds before showing next one
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % transactions.length);
        }, 2000);
      }, 4000);
    };

    // Initial delay before first popup
    const initialDelay = setTimeout(() => {
      showPopup();
    }, 3000);

    return () => clearTimeout(initialDelay);
  }, [currentIndex, transactions]);

  if (transactions.length === 0) return null;

  const tx = transactions[currentIndex];
  
  // Try to find the game icon (using the first letter or game code if available)
  // For simplicity, we just extract a generic icon or use the package name
  const getGameCode = (packageName: string) => {
    const match = packageName.match(/\(([^)]+)\)/);
    return match ? match[1] : "GAME";
  };

  const gameCode = getGameCode(tx.package_name);

  return (
    <div className={`purchase-popup ${isVisible ? 'visible' : ''}`}>
      <div className="popup-icon">
        {gameCode.substring(0, 2).toUpperCase()}
      </div>
      <div className="popup-content">
        <div className="popup-title">
          {tx.target_id} Telah Membeli
        </div>
        <div className="popup-desc">
          {tx.package_name}
        </div>
        <div className="popup-footer">
          <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12" style={{ color: '#1d9bf0', marginRight: '4px' }}>
            <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.74 2.746 1.867 3.447-.077.306-.117.625-.117.953 0 2.21 1.71 4 3.918 4 .596 0 1.16-.134 1.664-.373 1.05 1.135 2.535 1.848 4.168 1.848s3.118-.713 4.168-1.848c.505.24 1.068.373 1.664.373 2.21 0 3.918-1.79 3.918-4 0-.328-.04-.647-.117-.953 1.127-.7 1.867-1.986 1.867-3.448zm-11.58 3.86l-3.96-3.832 1.458-1.36 2.43 2.35 5.518-6.173 1.516 1.353-7 7.72z" />
          </svg>
          Verified by Gemartopup
        </div>
      </div>
    </div>
  );
}
