import { useEffect, useRef, useState } from 'react';
import { VisualBackgroundType } from '../types';

interface VisualizationBackgroundProps {
  type: VisualBackgroundType;
  intensity?: number; // 1 to 5
  saturation?: number;
  brightness?: number;
  blur?: number;
}

export default function VisualizationBackground({
  type,
  intensity = 3,
  saturation = 100,
  brightness = 100,
  blur = 0
}: VisualizationBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width = 800;
    let height = canvas.height = 600;

    // Set up particles depending on type
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      alpha: number;
      color: string;
      rotation?: number;
      rotSpeed?: number;
      pulseSpeed?: number;
      pulseState?: number;
    }

    let particles: Particle[] = [];

    const initParticles = () => {
      particles = [];
      const count = intensity * 15;

      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        
        if (type === 'sparkling-sky') {
          // Gilded glittering stars
          particles.push({
            x,
            y,
            size: Math.random() * 2.5 + 1,
            speedX: (Math.random() - 0.5) * 0.15,
            speedY: (Math.random() - 0.5) * 0.15,
            alpha: Math.random() * 0.7 + 0.3,
            color: Math.random() > 0.4 ? '#FCD34D' : '#FDE68A', // Gold, champagne gold
            pulseSpeed: Math.random() * 0.02 + 0.01,
            pulseState: Math.random() * Math.PI
          });
        } else if (type === 'royal-garden') {
          // Falling rose / sakura petals
          particles.push({
            x,
            y: Math.random() * -height, // start above
            size: Math.random() * 8 + 6,
            speedX: Math.random() * 0.5 + 0.2,
            speedY: Math.random() * 0.8 + 0.5,
            alpha: Math.random() * 0.6 + 0.4,
            color: Math.random() > 0.5 ? '#FBCFE8' : '#F472B6', // Pastel pinks
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.02
          });
        } else if (type === 'glowing-crystal') {
          // Mystical shimmering diamonds
          particles.push({
            x,
            y,
            size: Math.random() * 4 + 2,
            speedX: (Math.random() - 0.5) * 0.1,
            speedY: (Math.random() - 0.5) * 0.1,
            alpha: Math.random() * 0.5 + 0.3,
            color: Math.random() > 0.5 ? '#E0F2FE' : '#F472B6', // Crystal blue and soft pink
            pulseSpeed: Math.random() * 0.015 + 0.005,
            pulseState: Math.random() * Math.PI
          });
        } else if (type === 'dreamy-cloud') {
          // Fluffy warm glowing clouds or huge floating light dust
          particles.push({
            x,
            y,
            size: Math.random() * 80 + 50,
            speedX: (Math.random() - 0.5) * 0.08,
            speedY: (Math.random() - 0.5) * 0.04,
            alpha: Math.random() * 0.15 + 0.05,
            color: Math.random() > 0.5 ? '#FFE4E6' : '#FEF3C7', // Warm peach & honey gold
          });
        }
      }
    };

    const drawBackground = () => {
      // Draw rich princess luxurious gradients
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      if (type === 'sparkling-sky') {
        // High-contrast cozy midnight princess navy/violet/rose gold
        grad.addColorStop(0, '#1E1B4B'); // deep midnight indigo
        grad.addColorStop(0.5, '#311042'); // dark purple rose
        grad.addColorStop(1, '#4C1D95'); // royal violet
      } else if (type === 'royal-garden') {
        // Soft princess ivory rose
        grad.addColorStop(0, '#FFF1F2'); // rose water
        grad.addColorStop(0.6, '#FFE4E6'); // cream pink
        grad.addColorStop(1, '#FFEDD5'); // pale apricot warmth
      } else if (type === 'glowing-crystal') {
        // Iridescent fantasy glow
        grad.addColorStop(0, '#FAF5FF'); // pale lavender
        grad.addColorStop(0.5, '#FCE7F3'); // soft powder rose
        grad.addColorStop(1, '#E0F2FE'); // diamond sky blue
      } else if (type === 'dreamy-cloud') {
        // Sunset palace peach cloud
        grad.addColorStop(0, '#FFF7ED'); // cream honey
        grad.addColorStop(0.5, '#FFE4E6'); // rose petal pink
        grad.addColorStop(1, '#F3E8FF'); // velvet lavender
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    };

    const updateAndDrawParticles = () => {
      particles.forEach((p) => {
        // Update positions
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap or respawn depending on type
        if (type === 'royal-garden') {
          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x > width) p.x = 0;
          if (p.rotation !== undefined && p.rotSpeed !== undefined) {
            p.rotation += p.rotSpeed;
          }
        } else {
          // bounce or wrap for stars/crystals
          if (p.x < 0 || p.x > width) p.speedX *= -1;
          if (p.y < 0 || p.y > height) p.speedY *= -1;
        }

        // Pulse alpha
        if (p.pulseSpeed !== undefined && p.pulseState !== undefined) {
          p.pulseState += p.pulseSpeed;
          p.alpha = Math.max(0.1, Math.min(1.0, Math.sin(p.pulseState) * 0.4 + 0.6));
        }

        // Draw particle
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (type === 'sparkling-sky') {
          // Draw standard 4-point star sparkles
          ctx.translate(p.x, p.y);
          ctx.beginPath();
          for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.lineTo(0, p.size * 2.5);
            ctx.lineTo(p.size * 0.3, p.size * 0.3);
          }
          ctx.closePath();
          ctx.shadowBlur = p.size * 4;
          ctx.shadowColor = '#FBBF24';
          ctx.fill();
        } else if (type === 'royal-garden') {
          // Draw floating blossom petals
          ctx.translate(p.x, p.y);
          if (p.rotation !== undefined) ctx.rotate(p.rotation);
          ctx.beginPath();
          // Beautiful ellipse petal
          ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fill();
          
          // Tiny petal highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.beginPath();
          ctx.ellipse(-p.size * 0.2, -p.size * 0.1, p.size * 0.4, p.size * 0.2, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (type === 'glowing-crystal') {
          // Draw sparkling diamond rhombuses
          ctx.translate(p.x, p.y);
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 1.5);
          ctx.lineTo(p.size, 0);
          ctx.lineTo(0, p.size * 1.5);
          ctx.lineTo(-p.size, 0);
          ctx.closePath();
          ctx.shadowBlur = p.size * 3;
          ctx.shadowColor = '#38BDF8';
          ctx.fill();
        } else if (type === 'dreamy-cloud') {
          // Large soft ambient light circles
          ctx.beginPath();
          const radialGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          radialGrad.addColorStop(0, p.color);
          radialGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = radialGrad;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      drawBackground();
      updateAndDrawParticles();
      animationId = requestAnimationFrame(animate);
    };

    // Use ResizeObserver for accurate sizing
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: boxWidth, height: boxHeight } = entry.contentRect;
        width = canvas.width = boxWidth || 800;
        height = canvas.height = boxHeight || 600;
        initParticles();
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Fallback resize
    width = canvas.width = containerRef.current?.clientWidth || window.innerWidth;
    height = canvas.height = containerRef.current?.clientHeight || window.innerHeight;
    initParticles();
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [type, intensity]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full overflow-hidden select-none -z-10"
      id="visualization-canvas-container"
    >
      <canvas
        ref={canvasRef}
        style={{
          filter: `saturate(${saturation}%) brightness(${brightness}%) blur(${blur}px)`,
          transform: blur > 0 ? `scale(${1 + (blur * 0.012)})` : 'none',
        }}
        className="block w-full h-full pointer-events-none transition-all duration-300 ease-in-out"
        id="visualization-canvas"
      />
    </div>
  );
}
