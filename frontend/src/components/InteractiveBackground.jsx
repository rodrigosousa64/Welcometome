import React, { useEffect, useRef } from 'react';

export default function InteractiveBackground() {
  const blobRef = useRef(null);
  
  // Track mouse and blob coordinates
  const mouseX = useRef(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const mouseY = useRef(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);
  
  const blobX = useRef(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const blobY = useRef(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);

  useEffect(() => {
    // Center initially
    mouseX.current = window.innerWidth / 2;
    mouseY.current = window.innerHeight / 2;
    blobX.current = window.innerWidth / 2;
    blobY.current = window.innerHeight / 2;

    const handlePointerMove = (e) => {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;
    };
    
    window.addEventListener('pointermove', handlePointerMove);
    
    let animationFrameId;
    
    const animate = () => {
      // Lerp (Linear Interpolation) for smooth following effect
      // 0.05 is the interpolation factor (lower is smoother/slower)
      blobX.current += (mouseX.current - blobX.current) * 0.05;
      blobY.current += (mouseY.current - blobY.current) * 0.05;
      
      if (blobRef.current) {
        blobRef.current.style.transform = `translate3d(calc(${blobX.current}px - 50%), calc(${blobY.current}px - 50%), 0)`;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="interactive-bg-container">
      <div className="interactive-blob" ref={blobRef}></div>
    </div>
  );
}
