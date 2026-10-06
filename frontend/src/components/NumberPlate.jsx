import React from 'react';

// Styled vehicle registration plate.
const NumberPlate = ({ value, size = 'md' }) => {
  const sizes = {
    sm: 'text-xs px-2.5 py-1 border-2',
    md: 'text-lg px-4 py-1.5 border-2',
    lg: 'text-2xl px-5 py-2 border-[3px]',
  };
  return (
    <span
      className={`inline-block rounded-md bg-gradient-to-b from-amber-50 to-amber-200 text-slate-900 border-slate-900/80 font-mono font-extrabold tracking-[0.18em] shadow-md shadow-black/40 ${sizes[size]}`}
    >
      {value}
    </span>
  );
};

export default NumberPlate;
