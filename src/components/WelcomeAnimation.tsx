"use client";
import React, { useEffect, useState, useRef } from 'react';

const WelcomeAnimation = ({ text }: { text: string }) => {
  const letters = text.split('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [cartX, setCartX] = useState(-40);
  const [showCart, setShowCart] = useState(true);

  useEffect(() => {
    let current = 0;
    setCartX(-40);
    setActiveIndex(-1);
    setShowCart(true);
    
    // Slight delay before starting animation
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (current < letters.length) {
          const letterEl = letterRefs.current[current];
          if (letterEl && containerRef.current) {
            const cRect = containerRef.current.getBoundingClientRect();
            const lRect = letterEl.getBoundingClientRect();
            // Move cart to center of current letter
            setCartX(lRect.left - cRect.left + (lRect.width / 2));
          }
          setActiveIndex(current);
          current++;
        } else {
          // Drive off screen
          if (containerRef.current) {
            setCartX(containerRef.current.getBoundingClientRect().width + 60);
          }
          setTimeout(() => setShowCart(false), 500);
          clearInterval(interval);
        }
      }, 100); // Animation speed
      
      return () => clearInterval(interval);
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [text]); // Re-run if text changes (e.g. language swap)

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', whiteSpace: 'pre' }}>
      {showCart && (
        <div 
          style={{
            position: 'absolute',
            bottom: '-4px', // align cart nicely
            left: '0px',
            transform: `translateX(${cartX - 16}px)`, // 32px width / 2
            transition: 'transform 0.1s linear, opacity 0.5s ease',
            zIndex: 10,
            opacity: showCart ? 1 : 0,
            pointerEvents: 'none'
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--primary)">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </div>
      )}
      
      {letters.map((char, i) => (
        <span 
          key={i}
          ref={el => { letterRefs.current[i] = el; }}
          style={{
            display: 'inline-block',
            opacity: activeIndex >= i ? 1 : 0,
            transform: activeIndex >= i ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.8)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            color: 'inherit'
          }}
        >
          {char}
        </span>
      ))}
    </div>
  );
};

export default WelcomeAnimation;
