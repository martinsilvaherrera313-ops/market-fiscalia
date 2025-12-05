import React, { useState, useEffect } from 'react';
import './ScrollButton.css';

const ScrollButton = () => {
  const [showScroll, setShowScroll] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const checkScrollPosition = () => {
      // Mostrar botones si hay contenido scrolleable
      const hasScroll = document.documentElement.scrollHeight > window.innerHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      
      setShowScroll(hasScroll && scrollTop > 200);
      setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 100);
    };

    checkScrollPosition();
    window.addEventListener('scroll', checkScrollPosition);
    window.addEventListener('resize', checkScrollPosition);
    
    return () => {
      window.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {showScroll && (
        <div className="scroll-buttons">
          <button 
            className="scroll-btn scroll-top" 
            onClick={scrollToTop}
            title="Ir arriba"
            aria-label="Ir arriba"
          >
            ↑
          </button>
          {!isAtBottom && (
            <button 
              className="scroll-btn scroll-bottom" 
              onClick={scrollToBottom}
              title="Ir abajo"
              aria-label="Ir abajo"
            >
              ↓
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default ScrollButton;
