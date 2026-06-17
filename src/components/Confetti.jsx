const CONFETTI_COLORS = ['#ffd166', '#06d6a0', '#e63946', '#48cae4', '#ffffff', '#f3722c'];

export default function Confetti({ count = 24 }) {
  const pieces = Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.2,
    duration: 1.6 + Math.random() * 1.4,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    rotate: Math.random() * 360,
    size: 6 + Math.random() * 6,
  }));
  return (
    <div className="pp-confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="pp-confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size * 0.4}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
