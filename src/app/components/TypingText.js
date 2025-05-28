// src/components/TypingText.js
import React, { useState, useEffect } from 'react';

const TypingText = ({ text, delay = 50 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedText(text.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, delay);
      return () => clearTimeout(timeoutId);
    }
  }, [text, currentIndex, delay]);

  // If text changes (e.g., new chunks arrive), reset the animation
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]); // Reset when the full text prop changes

  return <span>{displayedText}</span>;
};

export default TypingText;