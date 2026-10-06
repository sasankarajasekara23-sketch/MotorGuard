import React from 'react';
import BmwCar from './BmwCar';

// Animated night-drive backdrop: scrolling skyline, a road with moving lane
// markings and cars with headlights. Pure SVG/CSS (see index.css, ".scene-*").

const TILE = 600;

const FAR_BUILDINGS = [[0, 50, 70], [50, 40, 110], [90, 60, 85], [150, 45, 130], [195, 55, 95], [250, 40, 120], [290, 65, 80], [355, 45, 105], [400, 55, 140], [455, 40, 90], [495, 60, 115], [555, 45, 75]];
const NEAR_BUILDINGS = [[0, 70, 60], [70, 45, 95], [115, 80, 70], [195, 50, 120], [245, 60, 85], [305, 45, 100], [350, 75, 65], [425, 50, 110], [475, 65, 90], [540, 60, 75]];

const skyline = (buildings, fill, windowFill, height = 160) => {
  let svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${TILE}' height='${height}' viewBox='0 0 ${TILE} ${height}'>`;
  buildings.forEach(([x, w, h], i) => {
    svg += `<rect x='${x}' y='${height - h}' width='${w}' height='${h}' fill='${fill}'/>`;
    for (let wy = height - h + 10; wy < height - 8; wy += 14) {
      for (let wx = x + 8; wx < x + w - 8; wx += 12) {
        if ((wx * 7 + wy * 13 + i) % 5 < 2) svg += `<rect x='${wx}' y='${wy}' width='4' height='6' fill='${windowFill}'/>`;
      }
    }
  });
  return `url("data:image/svg+xml,${encodeURIComponent(`${svg}</svg>`)}")`;
};

const FAR_IMAGE = skyline(FAR_BUILDINGS, '#0f1b36', 'rgba(147,197,253,0.35)');
const NEAR_IMAGE = skyline(NEAR_BUILDINGS, '#0a1226', 'rgba(250,204,21,0.55)');

const STARS = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 37) % 100,
  top: (i * 53) % 52,
  size: i % 3 === 0 ? 2 : 1,
  delay: (i * 0.37) % 4,
}));

const Car = ({ uid, variant = 'sedan', body = '#3b82f6', trim = '#1e40af' }) => {
  const suv = variant === 'suv';
  const bodyPath = suv
    ? 'M6 56 L6 42 Q6 34 14 32 L40 28 L56 8 L150 8 Q172 8 180 28 L194 32 Q202 34 202 44 L202 56 Z'
    : 'M6 54 L6 44 Q6 38 14 36 L52 32 Q66 12 92 12 L132 12 Q154 12 168 32 L190 36 Q200 38 200 46 L200 54 Z';
  const windows = suv
    ? ['M62 28 L72 14 L100 14 L100 28 Z', 'M106 14 L148 14 Q164 15 172 28 L106 28 Z']
    : ['M70 32 Q78 19 94 19 L108 19 L108 33 Z', 'M114 19 L130 19 Q146 20 156 33 L114 33 Z'];
  const front = suv ? 202 : 200;

  return (
    <svg viewBox="0 0 340 80" className="scene-car-svg" aria-hidden="true">
      <defs>
        <linearGradient id={`beam-${uid}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fde68a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${front},42 340,20 340,68 ${front},50`} fill={`url(#beam-${uid})`} />
      <ellipse cx="104" cy="70" rx="96" ry="4" fill="rgba(0,0,0,0.45)" />
      <path d={bodyPath} fill={body} />
      <path d={bodyPath} fill={trim} opacity="0.35" transform="translate(0 6)" />
      {windows.map(d => <path key={d} d={d} fill="#0b1220" opacity="0.85" />)}
      <rect x="6" y="40" width="196" height="2" fill="rgba(255,255,255,0.18)" />
      <rect x={front - 6} y="42" width="9" height="6" rx="2.5" fill="#fde68a" />
      <rect x="4" y="43" width="5" height="6" rx="2" fill="#ef4444" />
      {[52, 152].map(cx => (
        <g key={cx}>
          <circle cx={cx} cy="57" r="13" fill="#0b1220" stroke="#475569" strokeWidth="2" />
          <g className="scene-wheel">
            <circle cx={cx} cy="57" r="6" fill="#94a3b8" />
            <path d={`M${cx - 6} 57 H${cx + 6} M${cx} 51 V63`} stroke="#0b1220" strokeWidth="2" />
          </g>
        </g>
      ))}
    </svg>
  );
};

const DrivingScene = ({ compact = false }) => (
  <div className={`scene-root ${compact ? 'scene-compact' : ''}`} aria-hidden="true">
    <div className="scene-sky">
      {STARS.map((s, i) => (
        <span
          key={i}
          className="scene-star"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
        />
      ))}
    </div>

    <div className="scene-skyline" style={{ backgroundImage: FAR_IMAGE, animationDuration: '120s', opacity: 0.8 }} />
    <div className="scene-skyline scene-skyline-near" style={{ backgroundImage: NEAR_IMAGE, animationDuration: '70s' }} />

    <div className="scene-road">
      <div className="scene-road-line" />
      {!compact && (
        <div className="scene-car scene-car-right" style={{ animationDuration: '16s', animationDelay: '-4s' }}>
          <Car uid="a" body="#3b82f6" trim="#1e3a8a" />
        </div>
      )}
      <div className="scene-car scene-car-right scene-car-far" style={{ animationDuration: '24s', animationDelay: '-15s' }}>
        <Car uid="b" variant="suv" body="#a855f7" trim="#581c87" />
      </div>
      <div className="scene-car scene-car-right scene-car-bmw" style={{ animationDuration: compact ? '9s' : '12s', animationDelay: '-3s' }}>
        <BmwCar uid={compact ? 'bmw-c' : 'bmw'} />
      </div>
      {!compact && (
        <>
          <div className="scene-car scene-car-left" style={{ animationDuration: '13s', animationDelay: '-2s' }}>
            <Car uid="c" body="#10b981" trim="#064e3b" />
          </div>
          <div className="scene-car scene-car-left scene-car-far" style={{ animationDuration: '21s', animationDelay: '-11s' }}>
            <Car uid="d" variant="suv" body="#f59e0b" trim="#78350f" />
          </div>
        </>
      )}
    </div>
  </div>
);

export default DrivingScene;
