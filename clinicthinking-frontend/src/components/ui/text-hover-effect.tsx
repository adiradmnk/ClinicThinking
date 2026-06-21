"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";

export const TextHoverEffect = ({ text, duration = 0.3 }: { text: string; duration?: number }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });

  useEffect(() => {
    if (svgRef.current) {
      const svgRect = svgRef.current.getBoundingClientRect();
      setMaskPosition({
        cx: `${((cursor.x - svgRect.left) / svgRect.width) * 100}%`,
        cy: `${((cursor.y - svgRect.top) / svgRect.height) * 100}%`,
      });
    }
  }, [cursor]);

  const textProps = {
    x: "50%",
    y: "50%",
    textAnchor: "middle" as const,
    dominantBaseline: "middle" as const,
    textLength: "480",
    lengthAdjust: "spacingAndGlyphs" as const,
    className: "font-black text-[100px] uppercase fill-transparent stroke-[1.6px]", // stroke dipertebal
  };

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      // viewBox diperbesar agar teks tidak terpotong (dari 80 menjadi 120)
      viewBox="0 0 500 120" 
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className="select-none overflow-visible" // Penting: agar stroke tidak terpotong
    >
      <defs>
        <linearGradient id="textGradient">
          <stop offset="0%" stopColor="#b75341" />
          <stop offset="100%" stopColor="#4cb0e2" />
        </linearGradient>
        <motion.radialGradient id="revealMask" animate={maskPosition} r="30%">
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id="textMask">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#revealMask)" />
        </mask>
      </defs>

      {/* Border Dasar */}
      <text {...textProps} stroke="#d1d5db" className={`${textProps.className} dark:stroke-neutral-700`}>
        {text}
      </text>

      {/* Border Gradien Hover */}
      <text 
        {...textProps} 
        stroke="url(#textGradient)" 
        mask="url(#textMask)"
        style={{ opacity: hovered ? 1 : 0, transition: `opacity ${duration}s` }}
      >
        {text}
      </text>
    </svg>
  );
};