// Bursting fireworks for the Extreme Mode champion screen - same CSS-driven
// approach as Confetti (no canvas/images needed), but radial particle
// bursts instead of falling pieces, each burst on a stagger so the screen
// keeps popping rather than firing all at once and going dark.
const FIREWORK_COLORS = ['#ffd166', '#06d6a0', '#e63946', '#48cae4', '#f1faee', '#9d4edd'];

export default function Fireworks({ count = 6 }) {
  const bursts = Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: 10 + Math.random() * 80,
    top: 8 + Math.random() * 55,
    delay: i * 0.5 + Math.random() * 0.3,
    color: FIREWORK_COLORS[i % FIREWORK_COLORS.length],
  }));
  return (
    <div className="pp-fireworks" aria-hidden="true">
      {bursts.map((b) => (
        <span
          key={b.id}
          className="pp-firework-burst"
          style={{ left: `${b.left}%`, top: `${b.top}%`, animationDelay: `${b.delay}s` }}
        >
          {Array.from({ length: 10 }).map((_, j) => (
            <span
              key={j}
              className="pp-firework-spark"
              style={{
                backgroundColor: b.color,
                '--rot': `${j * 36}deg`,
                animationDelay: `${b.delay}s`,
              }}
            />
          ))}
        </span>
      ))}
    </div>
  );
}
