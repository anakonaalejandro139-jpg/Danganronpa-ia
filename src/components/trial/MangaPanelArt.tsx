import React from 'react';

interface MangaPanelArtProps {
  panelId: string;
}

/**
 * Renders high-contrast Danganronpa V3 black/white/cyan/magenta manga panel illustrations
 * for every single Closing Argument panel across all 7 chapters.
 */
export const MangaPanelArt: React.FC<MangaPanelArtProps> = ({ panelId }) => {
  const renderScene = () => {
    switch (panelId) {
      // --- CAPÍTULO 1 ---
      case 'p1_c1':
        return (
          <g>
            {/* Dark figure handing envelope in exam hall */}
            <rect x="18" y="20" width="60" height="75" fill="#e4e4e7" stroke="#09090b" strokeWidth="2.5" />
            <circle cx="150" cy="46" r="14" fill="#18181b" />
            <path d="M128 100 L138 62 L162 62 L174 100 Z" fill="#18181b" />
            <rect x="86" y="45" width="38" height="24" rx="2" fill="#f43f5e" stroke="#09090b" strokeWidth="2" transform="rotate(-12 105 57)" />
            <text x="95" y="61" fontSize="9" fontWeight="bold" fill="#fff">SECRETO</text>
          </g>
        );
      case 'p2_c1':
        return (
          <g>
            {/* Flying tejo disc with explosion sparks */}
            <line x1="15" y1="75" x2="120" y2="42" stroke="#06b6d4" strokeWidth="4" strokeDasharray="6 4" />
            <ellipse cx="140" cy="38" rx="18" ry="8" fill="#f59e0b" stroke="#09090b" strokeWidth="2.5" transform="rotate(-15 140 38)" />
            <polygon points="155,20 165,36 184,32 168,45 178,62 158,52 146,66 150,48 134,42 150,36" fill="#f43f5e" stroke="#09090b" strokeWidth="2" />
            <text x="16" y="26" fontSize="14" fontWeight="900" fill="#09090b">¡CRASH!</text>
          </g>
        );
      case 'p3_c1':
        return (
          <g>
            {/* Air vent escape */}
            <rect x="45" y="14" width="110" height="32" fill="#27272a" stroke="#09090b" strokeWidth="2.5" />
            <line x1="55" y1="22" x2="145" y2="22" stroke="#71717a" strokeWidth="2" />
            <line x1="55" y1="30" x2="145" y2="30" stroke="#71717a" strokeWidth="2" />
            <path d="M85 46 L72 95 M115 46 L128 95" stroke="#09090b" strokeWidth="4" strokeLinecap="round" />
            <circle cx="100" cy="86" r="10" fill="#06b6d4" opacity="0.6" />
          </g>
        );
      case 'p4_c1':
        return (
          <g>
            <circle cx="100" cy="52" r="24" fill="#a1a1aa" stroke="#09090b" strokeWidth="2.5" />
            <line x1="72" y1="26" x2="128" y2="82" stroke="#e11d48" strokeWidth="5" />
          </g>
        );

      // --- CAPÍTULO 2 ---
      case 'p1_c2':
        return (
          <g>
            {/* Flask & thermal capsule */}
            <polygon points="80,25 120,25 135,88 65,88" fill="#14b8a6" opacity="0.35" stroke="#09090b" strokeWidth="2.5" />
            <circle cx="100" cy="65" r="10" fill="#e11d48" stroke="#09090b" strokeWidth="2" />
            <text x="20" y="34" fontSize="11" fontWeight="900" fill="#09090b">CN⁻ + 85°C</text>
          </g>
        );
      case 'p2_c2':
        return (
          <g>
            {/* Gloved hand & alcohol wipe */}
            <path d="M55 85 C50 55 72 35 95 45 L112 30 L124 44 L106 62 L115 88 Z" fill="#18181b" stroke="#09090b" strokeWidth="2" />
            <circle cx="90" cy="58" r="11" fill="#3b82f6" opacity="0.7" />
            <rect x="132" y="38" width="26" height="44" rx="4" fill="#e0f2fe" stroke="#09090b" strokeWidth="2" />
          </g>
        );
      case 'p3_c2':
        return (
          <g>
            {/* Colombian greca steaming coffee cup */}
            <rect x="42" y="18" width="44" height="68" rx="4" fill="#71717a" stroke="#09090b" strokeWidth="2.5" />
            <rect x="112" y="54" width="38" height="30" rx="4" fill="#fef3c7" stroke="#09090b" strokeWidth="2.5" />
            <path d="M86 42 Q125 42 130 56" fill="none" stroke="#f43f5e" strokeWidth="4" />
            <text x="115" y="42" fontSize="10" fontWeight="900" fill="#e11d48">85°C</text>
          </g>
        );
      case 'p4_c2':
        return (
          <g>
            {/* Sealed steel window */}
            <rect x="50" y="18" width="100" height="64" fill="#18181b" stroke="#09090b" strokeWidth="3" />
            <line x1="50" y1="50" x2="150" y2="50" stroke="#71717a" strokeWidth="3" />
            <line x1="100" y1="18" x2="100" y2="82" stroke="#71717a" strokeWidth="3" />
            <line x1="55" y1="22" x2="145" y2="78" stroke="#e11d48" strokeWidth="4" />
          </g>
        );

      // --- CAPÍTULO 3 (DOBLE CRIMEN) ---
      case 'p1_c3':
        return (
          <g>
            {/* Library RFID USB breach */}
            <rect x="30" y="25" width="58" height="58" fill="#18181b" stroke="#06b6d4" strokeWidth="2.5" />
            <rect x="108" y="42" width="48" height="22" rx="3" fill="#06b6d4" stroke="#09090b" strokeWidth="2" />
            <text x="38" y="58" fontSize="11" fontWeight="900" fill="#06b6d4">12:10</text>
          </g>
        );
      case 'p2_c3':
        return (
          <g>
            {/* Auditorium speaker playing accordion decoy */}
            <rect x="36" y="28" width="44" height="54" rx="4" fill="#27272a" stroke="#09090b" strokeWidth="2.5" />
            <circle cx="58" cy="60" r="13" fill="#52525b" stroke="#06b6d4" strokeWidth="2" />
            <path d="M92 42 Q108 55 92 68 M104 34 Q124 55 104 76" fill="none" stroke="#ec4899" strokeWidth="3.5" />
            <text x="128" y="58" fontSize="22" fill="#ec4899">♫</text>
          </g>
        );
      case 'p3_c3':
        return (
          <g>
            {/* Router reset */}
            <rect x="52" y="50" width="96" height="30" rx="4" fill="#18181b" stroke="#09090b" strokeWidth="2.5" />
            <line x1="72" y1="50" x2="66" y2="20" stroke="#09090b" strokeWidth="3" />
            <line x1="128" y1="50" x2="134" y2="20" stroke="#09090b" strokeWidth="3" />
            <circle cx="76" cy="65" r="4" fill="#f43f5e" />
            <circle cx="96" cy="65" r="4" fill="#f43f5e" />
            <text x="110" y="68" fontSize="9" fontWeight="bold" fill="#fff">RESET</text>
          </g>
        );

      // --- CAPÍTULO 4 ---
      case 'p1_c4':
        return (
          <g>
            <line x1="100" y1="10" x2="100" y2="55" stroke="#09090b" strokeWidth="3" strokeDasharray="4 3" />
            <circle cx="100" cy="68" r="18" fill="#6366f1" stroke="#09090b" strokeWidth="2.5" />
            <text x="20" y="34" fontSize="11" fontWeight="900" fill="#09090b">θ = 42°</text>
          </g>
        );
      case 'p2_c4':
        return (
          <g>
            <rect x="42" y="24" width="116" height="58" rx="6" fill="#27272a" stroke="#09090b" strokeWidth="2.5" />
            <path d="M62 72 Q72 44 82 72 M98 72 Q108 44 118 72" fill="none" stroke="#f97316" strokeWidth="4" />
            <text x="128" y="55" fontSize="14" fontWeight="900" fill="#f97316">HOT!</text>
          </g>
        );
      case 'p3_c4':
        return (
          <g>
            <path d="M55 20 Q100 80 148 56" fill="none" stroke="#e11d48" strokeWidth="4" strokeDasharray="5 3" />
            <circle cx="148" cy="56" r="14" fill="#18181b" />
            <polygon points="154,36 164,50 180,46 168,60 174,76 156,66 142,74 148,58" fill="#fbbf24" stroke="#09090b" strokeWidth="1.5" />
          </g>
        );

      // --- CAPÍTULO 5 ---
      case 'p1_c5':
        return (
          <g>
            <rect x="40" y="25" width="120" height="58" fill="#18181b" stroke="#09090b" strokeWidth="2.5" />
            <circle cx="75" cy="54" r="13" fill="#22c55e" stroke="#fff" strokeWidth="2" />
            <circle cx="125" cy="54" r="13" fill="#ef4444" stroke="#fff" strokeWidth="2" />
            <path d="M88 45 Q100 28 112 45" fill="none" stroke="#facc15" strokeWidth="3" />
          </g>
        );
      case 'p2_c5':
        return (
          <g>
            <line x1="25" y1="68" x2="145" y2="36" stroke="#10b981" strokeWidth="4" />
            <polygon points="145,36 130,34 134,46" fill="#09090b" />
            <text x="26" y="34" fontSize="11" fontWeight="900" fill="#10b981">CURARE</text>
          </g>
        );
      case 'p3_c5':
        return (
          <g>
            <rect x="38" y="16" width="124" height="28" fill="#3f3f46" stroke="#09090b" strokeWidth="3" />
            <path d="M100 44 L100 66" stroke="#e11d48" strokeWidth="6" />
            <polygon points="90,62 110,62 100,76" fill="#e11d48" />
            <rect x="38" y="78" width="124" height="14" fill="#18181b" />
          </g>
        );

      // --- CAPÍTULO 6 ---
      case 'p1_c6':
        return (
          <g>
            <rect x="44" y="22" width="112" height="62" rx="4" fill="#0f172a" stroke="#06b6d4" strokeWidth="2.5" />
            <text x="58" y="56" fontSize="13" fontWeight="bold" fill="#22d3ee">10110 · LIVE</text>
          </g>
        );
      case 'p2_c6':
        return (
          <g>
            <circle cx="72" cy="54" r="20" fill="#27272a" stroke="#09090b" strokeWidth="2.5" />
            <circle cx="72" cy="54" r="10" fill="#38bdf8" />
            <polyline points="105,24 128,48 112,54 142,84" fill="none" stroke="#facc15" strokeWidth="4" />
          </g>
        );
      case 'p3_c6':
        return (
          <g>
            <rect x="74" y="24" width="48" height="60" rx="4" fill="#f97316" stroke="#09090b" strokeWidth="2.5" />
            <rect x="84" y="32" width="28" height="16" fill="#fef3c7" />
            <text x="86" y="72" fontSize="12" fontWeight="900" fill="#09090b">SD</text>
          </g>
        );

      // --- CAPÍTULO 7 ---
      case 'p1_c7':
        return (
          <g>
            <rect x="42" y="22" width="116" height="66" fill="#18181b" stroke="#e11d48" strokeWidth="2.5" />
            <circle cx="100" cy="55" r="20" fill="#fff" />
            <path d="M100 35 A20 20 0 0 1 100 75 Z" fill="#09090b" />
            <circle cx="108" cy="52" r="3" fill="#e11d48" />
          </g>
        );
      case 'p2_c7':
        return (
          <g>
            <line x1="100" y1="16" x2="64" y2="76" stroke="#e11d48" strokeWidth="3" />
            <line x1="100" y1="16" x2="100" y2="76" stroke="#e11d48" strokeWidth="3" />
            <line x1="100" y1="16" x2="136" y2="76" stroke="#e11d48" strokeWidth="3" />
            <circle cx="100" cy="20" r="10" fill="#09090b" stroke="#f43f5e" strokeWidth="2" />
          </g>
        );
      case 'p3_c7':
        return (
          <g>
            <rect x="35" y="24" width="130" height="60" fill="#09090b" stroke="#22d3ee" strokeWidth="2.5" />
            <text x="50" y="56" fontSize="14" fontWeight="900" fill="#22d3ee">FIN: 000/500</text>
            <line x1="35" y1="84" x2="165" y2="24" stroke="#facc15" strokeWidth="3" />
          </g>
        );

      default:
        return (
          <g>
            <rect x="45" y="22" width="110" height="60" fill="#e4e4e7" stroke="#09090b" strokeWidth="2.5" />
            <text x="72" y="56" fontSize="14" fontWeight="900" fill="#09090b">VIÑETA</text>
          </g>
        );
    }
  };

  return (
    <div className="w-full h-24 rounded-md overflow-hidden border-2 border-zinc-900 bg-zinc-50 relative">
      <svg viewBox="0 0 200 100" className="w-full h-full">
        {/* Manga speedlines / screentone background */}
        <defs>
          <pattern id={`tone-${panelId}`} width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#d4d4d8" />
          </pattern>
        </defs>
        <rect width="200" height="100" fill={`url(#tone-${panelId})`} />
        <line x1="0" y1="0" x2="40" y2="28" stroke="#a1a1aa" strokeWidth="1" />
        <line x1="200" y1="0" x2="160" y2="28" stroke="#a1a1aa" strokeWidth="1" />
        <line x1="0" y1="100" x2="40" y2="72" stroke="#a1a1aa" strokeWidth="1" />
        <line x1="200" y1="100" x2="160" y2="72" stroke="#a1a1aa" strokeWidth="1" />
        {renderScene()}
      </svg>
    </div>
  );
};
