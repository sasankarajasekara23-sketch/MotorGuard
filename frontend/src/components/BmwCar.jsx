import React from 'react';

// A BMW sports coupe (side view, facing right): twin kidney grille, slim
// headlights, fastback roofline, M-livery stripes, roundel badges, LED tail
// lights and underglow. Drawn from scratch as SVG.
const Roundel = ({ cx, cy, r }) => {
  const inner = r * 0.78;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#0b1220" stroke="#cbd5e1" strokeWidth={r * 0.12} />
      <circle cx={cx} cy={cy} r={inner} fill="#f8fafc" />
      <path d={`M${cx} ${cy} L${cx} ${cy - inner} A${inner} ${inner} 0 0 0 ${cx - inner} ${cy} Z`} fill="#1c69d4" />
      <path d={`M${cx} ${cy} L${cx} ${cy + inner} A${inner} ${inner} 0 0 0 ${cx + inner} ${cy} Z`} fill="#1c69d4" />
    </g>
  );
};

const BmwCar = ({ uid = 'bmw' }) => {
  const body = 'M12 72 L9 58 Q9 49 20 47 L76 42 Q108 15 154 12 L200 12 Q236 14 256 38 L294 46 Q308 49 310 60 L310 72 Z';

  return (
    <svg viewBox="0 -26 420 136" className="scene-car-svg" role="img" aria-label="Animated BMW sports coupe">
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfdbfe" />
          <stop offset="0.3" stopColor="#2563eb" />
          <stop offset="1" stopColor="#172554" />
        </linearGradient>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#334155" />
          <stop offset="0.5" stopColor="#0b1220" />
          <stop offset="1" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id={`${uid}-beam`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fef3c7" stopOpacity="0.7" />
          <stop offset="1" stopColor="#fef3c7" stopOpacity="0" />
        </linearGradient>
      </defs>

      <polygon points="306,50 420,24 420,88 306,58" fill={`url(#${uid}-beam)`} />
      <ellipse className="scene-underglow" cx="160" cy="95" rx="152" ry="7" fill="rgba(96,165,250,0.6)" />
      <ellipse cx="160" cy="94" rx="150" ry="4" fill="rgba(0,0,0,0.5)" />

      <path d={body} fill={`url(#${uid}-body)`} />
      <path d="M30 53 Q150 44 300 53" stroke="#ffffff" strokeOpacity="0.28" strokeWidth="1.5" fill="none" />
      <path d="M44 69 L272 69 L272 72 L44 72 Z" fill="rgba(2,6,23,0.55)" />

      {/* M-livery stripes */}
      <path d="M108 60.5 H224" stroke="#38bdf8" strokeWidth="2" />
      <path d="M108 63.5 H224" stroke="#1d4ed8" strokeWidth="2" />
      <path d="M108 66.5 H224" stroke="#ef4444" strokeWidth="2" />

      {/* Roundel badges (front fender + trunk) */}
      <Roundel cx={285} cy={56} r={5} />
      <Roundel cx={30} cy={56} r={4.2} />

      <path d="M204 16 Q232 17 249 37 L204 37 Z" fill={`url(#${uid}-glass)`} />
      <path d="M112 37 Q126 19 156 16 L198 16 L198 37 Z" fill={`url(#${uid}-glass)`} />
      <path d="M108 38 L252 38" stroke="#e2e8f0" strokeOpacity="0.55" strokeWidth="1.5" />
      <path d="M111 38 Q119 30 126 20" stroke="#e2e8f0" strokeOpacity="0.5" strokeWidth="1.3" fill="none" />
      <path d="M200 38 L200 69" stroke="#020617" strokeOpacity="0.4" strokeWidth="1.2" />
      <rect x="172" y="45" width="14" height="2.5" rx="1.2" fill="#e2e8f0" opacity="0.6" />
      <rect x="214" y="45" width="14" height="2.5" rx="1.2" fill="#e2e8f0" opacity="0.6" />
      <path d="M238 39 L252 39 L250 45 L240 45 Z" fill="#1e3a8a" />

      <path className="scene-headlight" d="M268 46 L301 50 L301 54 L273 52 Z" fill="#fef9c3" />
      <g>
        <rect x="299" y="56" width="5" height="10" rx="2.5" fill="#0b1220" stroke="#cbd5e1" strokeWidth="0.8" />
        <rect x="305" y="56" width="5" height="10" rx="2.5" fill="#0b1220" stroke="#cbd5e1" strokeWidth="0.8" />
      </g>
      <rect x="290" y="67" width="20" height="4" rx="2" fill="#0b1220" />

      <path className="scene-taillight" d="M11 50 L27 48 L27 52 L12 55 Z" fill="#ef4444" />
      <circle cx="15" cy="69" r="2.2" fill="none" stroke="#cbd5e1" strokeWidth="1" />

      {[82, 250].map(cx => (
        <g key={cx}>
          <circle cx={cx} cy="72" r="22" fill="#050912" />
          <circle cx={cx} cy="72" r="19" fill="#0b1220" stroke="#1e293b" strokeWidth="1" />
          <circle cx={cx} cy="72" r="14" fill="#cbd5e1" />
          <circle cx={cx} cy="72" r="11" fill="#475569" />
          <g className="scene-wheel">
            <path
              d={`M${cx - 10} 72 H${cx + 10} M${cx} 62 V82 M${cx - 7} 65 L${cx + 7} 79 M${cx - 7} 79 L${cx + 7} 65`}
              stroke="#e2e8f0"
              strokeWidth="2"
            />
            <circle cx={cx} cy="72" r="3.2" fill="#0b1220" />
          </g>
        </g>
      ))}

      {/* Floating nameplate that travels with the car */}
      <g transform="translate(112 -22)">
        <rect width="76" height="22" rx="11" fill="#0b1220" stroke="#60a5fa" strokeOpacity="0.7" />
        <Roundel cx={13} cy={11} r={7.5} />
        <text x="27" y="15.5" fill="#f8fafc" fontSize="12.5" fontWeight="800" letterSpacing="2" fontFamily="Inter, sans-serif">BMW</text>
      </g>
    </svg>
  );
};

export default BmwCar;
