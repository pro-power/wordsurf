import React, { useEffect, useRef } from 'react';

const WaterWave = ({ 
  height = 120, 
  waveHeight = 20, 
  waveCount = 3,
  fillColor = 'rgba(59, 130, 246, 0.6)',
  animationDuration = 7
}) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // Set canvas width to parent width
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = height;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Wave parameters
    const waves = Array(waveCount).fill().map((_, i) => ({
      frequency: 0.01 + (i * 0.005),  // waves per pixel
      amplitude: waveHeight - (i * 4), // wave height in pixels
      offset: 0,                      // starting position
      speed: 0.05 + (i * 0.02)        // pixels per frame
    }));
    
    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw waves from back to front
      waves.forEach((wave, index) => {
        // Increase offset for animation
        wave.offset += wave.speed;
        if (wave.offset > 1000) wave.offset = 0;
        
        // Begin path for wave
        ctx.beginPath();
        
        // Start at bottom left
        ctx.moveTo(0, canvas.height);
        
        // Draw wave path
        for (let x = 0; x <= canvas.width; x += 10) {
          const y = Math.sin((x * wave.frequency) + wave.offset) * wave.amplitude;
          // Position from middle of canvas height
          const yPos = (canvas.height / 2) + y;
          ctx.lineTo(x, yPos);
        }
        
        // Complete the path to bottom right and back to start
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        
        // Set color with decreasing opacity for each successive wave
        const alpha = 0.6 - (index * 0.15);
        const color = fillColor.replace(/[d\.]+\)$/, `${alpha})`);
        ctx.fillStyle = color;
        ctx.fill();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Clean up
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [height, waveHeight, waveCount, fillColor, animationDuration]);
  
  return (
    <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
      <canvas
        ref={canvasRef}
        className="absolute bottom-0 left-0 w-full"
        style={{ height: `${height}px` }}
      />
    </div>
  );
};

export default WaterWave;