"use client";
import React, { useEffect, useState, useRef } from 'react';

const WelcomeAnimation = ({ text }: { text: string }) => {
  const letters = text.split('');
  const [eatenIndex, setEatenIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [cartX, setCartX] = useState(-40);
  const [showCart, setShowCart] = useState(false);
  const [cartScaleX, setCartScaleX] = useState(1);

  useEffect(() => {
    // Immediately reset state when text changes
    setEatenIndex(-1);
    setCartX(-40);
    setShowCart(false);
    
    let current = 0;
    let direction = 1;
    let interval: NodeJS.Timeout;
    
    const startCycle = () => {
      current = 0;
      direction = 1;
      setEatenIndex(-1);
      setCartX(0); // Start at 0 instead of -40 to avoid overlapping the cursor block
      setCartScaleX(1);
      setShowCart(true);
      
      interval = setInterval(() => {
        if (direction === 1) {
          // Eating (moving right)
          if (current < letters.length) {
            const letterEl = letterRefs.current[current];
            if (letterEl && containerRef.current) {
              const cRect = containerRef.current.getBoundingClientRect();
              const lRect = letterEl.getBoundingClientRect();
              setCartX(lRect.left - cRect.left + (lRect.width / 2));
            }
            setEatenIndex(current);
            current++;
          } else {
            // Reached the end, flip cart and go back
            direction = -1;
            current = letters.length - 1;
            setCartScaleX(-1);
          }
        } else {
          // Dispensing (moving left)
          if (current >= 0) {
            const letterEl = letterRefs.current[current];
            if (letterEl && containerRef.current) {
              const cRect = containerRef.current.getBoundingClientRect();
              const lRect = letterEl.getBoundingClientRect();
              setCartX(lRect.left - cRect.left + (lRect.width / 2));
            }
            setEatenIndex(current - 1);
            current--;
          } else {
            // Reached the start, stop at 0 and fade out
            setCartX(0);
            setTimeout(() => setShowCart(false), 300);
            clearInterval(interval);
            
            // Wait before restarting
            setTimeout(startCycle, 2500);
          }
        }
      }, 150);
    };

    const initialTimeout = setTimeout(startCycle, 1500);
    
    return () => {
      clearTimeout(initialTimeout);
      if (interval) clearInterval(interval);
    };
  }, [text]);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', whiteSpace: 'pre' }}>
      <div 
        style={{
          position: 'absolute',
          bottom: '-4px', 
          left: '0px',
          transform: `translateX(${cartX - 16}px) scaleX(${cartScaleX})`,
          transition: 'transform 0.15s linear, opacity 0.5s ease',
          zIndex: 10,
          opacity: showCart ? 1 : 0,
          pointerEvents: 'none'
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--primary-color)">
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </div>
      
      {letters.map((char, i) => (
        <span 
          key={`${text}-${i}`}
          ref={el => { letterRefs.current[i] = el; }}
          style={{
            display: 'inline-block',
            opacity: eatenIndex >= i ? 0 : 1,
            transform: eatenIndex >= i ? 'translateY(10px) scale(0)' : 'translateY(0) scale(1)',
            transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            color: 'inherit'
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  );
};

export default WelcomeAnimation;
