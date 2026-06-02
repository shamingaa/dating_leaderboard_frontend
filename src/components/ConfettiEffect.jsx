import { useState, useEffect } from 'react';
import ReactConfetti from 'react-confetti';

export default function ConfettiEffect({ active }) {
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const onResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (active) {
      setRunning(true);
      const t = setTimeout(() => setRunning(false), 5000);
      return () => clearTimeout(t);
    }
  }, [active]);

  if (!running) return null;

  return (
    <ReactConfetti
      width={dimensions.width}
      height={dimensions.height}
      recycle={false}
      numberOfPieces={300}
      gravity={0.2}
      colors={['#DC2626', '#FECACA', '#D97706', '#0f0f0f', '#e4e4e4', '#EF4444']}
      style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }}
    />
  );
}
