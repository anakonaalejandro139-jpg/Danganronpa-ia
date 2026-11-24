import React, { useId } from 'react';
import { CharacterId, Expression, MonokumaPose } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { GAME_IMAGES } from '../assets/images';

interface CharacterSpriteProps {
  characterId: CharacterId;
  expression?: Expression;
  monokumaPose?: MonokumaPose;
  dead?: boolean;
  /** 0 = normal, 1..5 = V3 Argument Armament progressive clothing rip & item removal */
  damageStage?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  flip?: boolean;
  isSpeaking?: boolean;
  animateEnter?: boolean;
}

const SIZE_MAP = {
  sm: 'w-20 h-24',
  md: 'w-36 h-44',
  lg: 'w-56 h-72',
  xl: 'w-72 h-96',
};

export const MONOKUMA_V3_IMAGE = GAME_IMAGES.monokumaV3;

/** Characteristic items that disappear round-by-round during Argument Armament (5 rounds) */
export const CHARACTERISTIC_DISAPPEAR_LIST: Record<
  string,
  [string, string, string, string, string]
> = {
  sebastian: [
    'Ruana Boyacense',
    'Insignia del ICFES',
    'Solapa de la chaqueta',
    'Manga del uniforme',
    'Cinturón de atleta',
  ],
  santiago: [
    'Bata de Química Forense',
    'Insignia del ICFES',
    'Cuello de la guayabera',
    'Bolsillo de reactivos',
    'Puños del uniforme',
  ],
  andres: [
    'Gafas de Ingeniero',
    'Insignia del ICFES',
    'Cuello de la chaqueta',
    'Manga derecha',
    'Credencial RFID',
  ],
  juanpablo: [
    'Gafas de Cálculo',
    'Insignia del ICFES',
    'Corbata geométrica',
    'Solapa izquierda',
    'Puño de camisa',
  ],
  camila: [
    'Flor del Valle en el cabello',
    'Insignia del ICFES',
    'Chaqueta botánica',
    'Manga del uniforme',
    'Broche de laboratorio',
  ],
  sofia: [
    'Cámara DSLR de Prensa',
    'Insignia del ICFES',
    'Chaleco de reportera',
    'Manga izquierda',
    'Correa de credenciales',
  ],
  laura: [
    'Corbata Cifrada Roja',
    'Insignia del ICFES',
    'Abrigo de Administrador',
    'Hombrera derecha',
    'Sello Maestro 000',
  ],
  monokuma: [
    'Mazo del Juicio V3',
    'Corbatín Rojo',
    'Carcasa Blanca Izquierda',
    'Blindaje Abdominal',
    'Ojo Rojo Cibernético',
  ],
};

function adjustHexColor(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return hex;
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export const CharacterSprite: React.FC<CharacterSpriteProps> = ({
  characterId,
  expression = 'neutral',
  monokumaPose = 'normal',
  dead = false,
  damageStage = 0,
  className = '',
  size = 'lg',
  flip = false,
  isSpeaking = false,
  animateEnter = false,
}) => {
  const uid = useId().replace(/:/g, '');

  if (characterId === 'narrador') {
    return null;
  }

  // Monokuma uses his iconic Danganronpa V3 sprite + V3 pose cues & seamless glow blending
  if (characterId === 'monokuma') {
    const poseTransform =
      monokumaPose === 'puhuhu'
        ? 'animate-dr-monokuma-giggle'
        : monokumaPose === 'angry'
        ? 'scale-105 -translate-y-1'
        : monokumaPose === 'shocked'
        ? 'scale-95 rotate-[3deg]'
        : monokumaPose === 'gavel'
        ? 'scale-105 -rotate-1'
        : isSpeaking
        ? 'animate-dr-sprite-talk'
        : 'animate-dr-sprite-breathe';

    return (
      <div
        className={`relative select-none flex items-end justify-center ${
          SIZE_MAP[size]
        } ${animateEnter ? 'animate-dr-sprite-enter' : ''} ${className}`}
      >
        {/* V3 Split Ambient Backlight */}
        <div
          className="absolute inset-2 rounded-full blur-2xl opacity-55 pointer-events-none"
          style={{
            background:
              monokumaPose === 'angry'
                ? 'radial-gradient(circle, rgba(225,29,72,0.55) 0%, transparent 72%)'
                : monokumaPose === 'shocked'
                ? 'radial-gradient(circle, rgba(34,211,238,0.5) 0%, transparent 72%)'
                : 'linear-gradient(120deg, rgba(244,244,245,0.22) 0%, rgba(225,29,72,0.35) 100%)',
          }}
        />

        <div
          className={`relative w-full h-full flex items-center justify-center transition-transform duration-200 ${poseTransform}`}
        >
          <img
            src={MONOKUMA_V3_IMAGE}
            alt={`Monokuma V3 (${monokumaPose})`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain rounded-2xl drop-shadow-[0_14px_26px_rgba(0,0,0,0.9)]"
            style={{
              WebkitMaskImage:
                'radial-gradient(ellipse 84% 88% at 50% 50%, black 66%, transparent 100%)',
              maskImage:
                'radial-gradient(ellipse 84% 88% at 50% 50%, black 66%, transparent 100%)',
            }}
          />

          {monokumaPose === 'puhuhu' && (
            <div className="absolute top-3 right-2 px-2.5 py-0.5 bg-rose-600 text-white font-display font-extrabold text-xs tracking-wider uppercase -rotate-6 shadow-[0_4px_14px_rgba(225,29,72,0.75)] border border-rose-200/70">
              Puhuhu...
            </div>
          )}
          {monokumaPose === 'angry' && (
            <div className="absolute inset-0 pointer-events-none">
              <svg
                viewBox="0 0 40 40"
                className="w-7 h-7 absolute top-2 left-2 drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]"
              >
                <path
                  d="M8 18 Q16 18 16 10 M24 8 Q24 16 32 16 M10 26 Q18 24 18 32 M32 24 Q24 24 24 32"
                  fill="none"
                  stroke="#fb7185"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
          {monokumaPose === 'shocked' && (
            <div className="absolute top-3 left-2 px-2.5 py-0.5 bg-cyan-400 text-zinc-950 font-display font-extrabold text-xs tracking-wider uppercase rotate-6 shadow-[0_4px_14px_rgba(34,211,238,0.8)] border border-white">
              ¡¿Qué?!
            </div>
          )}
          {monokumaPose === 'gavel' && (
            <div className="absolute bottom-3 right-1 bg-amber-400 text-zinc-950 font-display font-extrabold text-xs px-2.5 py-1 shadow-lg border-2 border-zinc-950 -rotate-3">
              ¡ORDEN EN EL ICFES!
            </div>
          )}
          {damageStage > 0 && (
            <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
              <div
                className="w-full h-full border-2 border-amber-400/80 rounded-2xl"
                style={{
                  background: `repeating-linear-gradient(135deg, rgba(244,63,94,${Math.min(
                    0.38,
                    damageStage * 0.08
                  )}) 0px, transparent 10px, rgba(34,211,238,0.16) 18px)`,
                }}
              />
              <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-zinc-950/90 text-amber-300 font-mono-tabular text-[10px] font-bold rounded border border-amber-400/60">
                DAÑO {damageStage}/5
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const char = CHARACTERS[characterId];
  if (!char) return null;
  const { visual } = char;

  const skinBase = visual.skin;
  const skinShade = adjustHexColor(skinBase, -26);
  const skinDeep = adjustHexColor(skinBase, -46);
  const hairBase = visual.hairColor;
  const hairShade = adjustHexColor(hairBase, -24);
  const hairHighlight = adjustHexColor(hairBase, 42);
  const outfitBase = visual.outfitPrimary;
  const outfitShade = adjustHexColor(outfitBase, -26);
  const outfitLight = adjustHexColor(outfitBase, 22);
  const shirtBase = visual.outfitSecondary;
  const shirtShade = adjustHexColor(shirtBase, -22);
  const irisDark = adjustHexColor(char.signatureColor, -55);
  const irisGlow = adjustHexColor(char.signatureColor, 48);

  const skinGradId = `skin-${uid}`;
  const hairGradId = `hair-${uid}`;
  const hairBackGradId = `hair-back-${uid}`;
  const outfitGradId = `outfit-${uid}`;
  const shirtGradId = `shirt-${uid}`;
  const irisGradId = `iris-${uid}`;
  const auraGradId = `aura-${uid}`;

  const renderHairBack = () => {
    switch (visual.hairStyle) {
      case 'long_straight':
        return (
          <g>
            <path
              d="M58 68 C48 112 44 176 46 232 C62 238 74 226 78 210 L162 210 C166 226 178 238 194 232 C196 176 192 112 182 68 Z"
              fill={`url(#${hairBackGradId})`}
              stroke="#141417"
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
            <path
              d="M62 128 L58 214 M178 128 L182 214"
              stroke={hairShade}
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.7"
            />
          </g>
        );
      case 'wavy':
        return (
          <g>
            <path
              d="M54 68 C38 106 52 140 40 182 C36 202 48 224 68 228 L172 228 C192 224 204 202 200 182 C188 140 202 106 186 68 Z"
              fill={`url(#${hairBackGradId})`}
              stroke="#141417"
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
            <path
              d="M54 114 C44 140 58 164 48 194 M186 114 C196 140 182 164 192 194"
              fill="none"
              stroke={hairHighlight}
              strokeWidth="2.2"
              opacity="0.35"
              strokeLinecap="round"
            />
          </g>
        );
      case 'ponytail':
        return (
          <g>
            <path
              d="M162 64 C202 68 218 118 202 182 C192 168 184 152 178 136 C176 154 172 172 162 182 C164 138 160 100 154 78 Z"
              fill={`url(#${hairBackGradId})`}
              stroke="#141417"
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
            <ellipse
              cx="164"
              cy="68"
              rx="8"
              ry="6"
              fill={visual.accent}
              stroke="#141417"
              strokeWidth="2.2"
            />
          </g>
        );
      case 'braids':
        return (
          <g fill={`url(#${hairBackGradId})`} stroke="#141417" strokeWidth="3">
            {/* Left braid */}
            <path d="M52 102 C44 114 44 128 52 138 C44 150 44 164 52 174 C45 186 46 200 56 212 L68 206 C74 192 74 178 68 168 C74 156 74 142 68 132 C74 118 72 106 66 96 Z" />
            {/* Right braid */}
            <path d="M188 102 C196 114 196 128 188 138 C196 150 196 164 188 174 C195 186 194 200 184 212 L172 206 C166 192 166 178 172 168 C166 156 166 142 172 132 C166 118 168 106 174 96 Z" />
            <circle cx="58" cy="206" r="5" fill={visual.accent} />
            <circle cx="182" cy="206" r="5" fill={visual.accent} />
          </g>
        );
      case 'bun':
        return (
          <g>
            <circle
              cx="120"
              cy="30"
              r="25"
              fill={`url(#${hairBackGradId})`}
              stroke="#141417"
              strokeWidth="3.2"
            />
            <path
              d="M104 20 Q120 12 136 20"
              fill="none"
              stroke={hairHighlight}
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.45"
            />
            <path
              d="M98 44 Q120 50 142 44"
              fill="none"
              stroke={visual.accent}
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
        );
      case 'bob':
        return (
          <path
            d="M58 68 C50 108 48 144 64 156 L176 156 C192 144 190 108 182 68 Z"
            fill={`url(#${hairBackGradId})`}
            stroke="#141417"
            strokeWidth="3.2"
          />
        );
      case 'curly':
        return (
          <path
            d="M52 72 C34 84 36 112 46 126 C36 142 44 170 64 176 L176 176 C196 170 204 142 194 126 C204 112 206 84 188 72 Z"
            fill={`url(#${hairBackGradId})`}
            stroke="#141417"
            strokeWidth="3.2"
          />
        );
      default:
        return (
          <path
            d="M64 68 C58 98 58 122 68 134 L172 134 C182 122 182 98 176 68 Z"
            fill={`url(#${hairBackGradId})`}
            stroke="#141417"
            strokeWidth="3"
          />
        );
    }
  };

  const renderHairFront = () => {
    const dY = damageStage >= 3 ? 3 : 0;
    const isMateo = characterId === 'mateo';

    let bangPath = '';
    switch (visual.hairStyle) {
      case 'spiky':
        bangPath = `M64 ${88 + dY} C58 50 82 28 120 28 C158 28 182 50 176 ${88 + dY} L168 112 L162 72 L148 92 L134 58 L120 88 L104 58 L90 92 L78 72 L72 112 Z`;
        break;
      case 'curly':
        bangPath = `M58 ${92 + dY} C48 52 76 24 120 26 C164 24 192 52 182 ${92 + dY} C174 74 160 72 152 84 C142 66 126 68 120 84 C112 66 96 68 88 84 C78 72 66 74 58 ${92 + dY} Z`;
        break;
      case 'slick':
        bangPath = `M64 ${86 + dY} C62 44 88 28 124 28 C160 28 178 48 176 ${86 + dY} C166 56 138 50 104 62 C86 68 74 76 64 ${86 + dY} Z`;
        break;
      case 'undercut':
        bangPath = `M66 ${86 + dY} C66 42 92 26 128 26 C164 26 180 48 174 ${86 + dY} L160 62 L136 58 L112 72 L88 60 L72 86 Z`;
        break;
      case 'messy':
        bangPath = `M60 ${90 + dY} C56 48 80 26 120 26 C160 26 184 48 180 ${90 + dY} L168 106 L160 72 L144 88 L128 60 L114 90 L98 62 L82 88 L72 106 Z`;
        break;
      case 'short_part':
        bangPath = `M64 ${88 + dY} C64 46 86 28 120 28 C154 28 176 46 176 ${88 + dY} L166 72 L144 64 L112 82 L88 64 L72 88 Z`;
        break;
      default:
        bangPath = `M62 ${92 + dY} C62 46 86 28 120 28 C154 28 178 46 178 ${92 + dY} L170 124 L162 82 C146 66 132 62 120 82 C108 62 94 66 78 82 L70 124 Z`;
        break;
    }

    return (
      <g>
        <path
          d={bangPath}
          fill={`url(#${hairGradId})`}
          stroke="#141417"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        {/* Danganronpa Anime Hair Specular Shine Band */}
        <path
          d="M78 52 Q100 40 120 46 Q142 40 162 52 Q140 48 120 53 Q100 48 78 52 Z"
          fill={hairHighlight}
          opacity="0.38"
        />
        {/* Iconic Protagonist Ahoge for Mateo */}
        {isMateo && (
          <path
            d="M118 30 C112 8 136 2 146 14 C132 14 126 22 126 30 Z"
            fill={hairBase}
            stroke="#141417"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
        )}
      </g>
    );
  };

  const renderEyes = () => {
    if (dead) {
      return (
        <g stroke="#18181b" strokeWidth="4" strokeLinecap="round">
          <line x1="84" y1="96" x2="102" y2="112" />
          <line x1="102" y1="96" x2="84" y2="112" />
          <line x1="138" y1="96" x2="156" y2="112" />
          <line x1="156" y1="96" x2="138" y2="112" />
        </g>
      );
    }

    const browOffset =
      expression === 'angry'
        ? 4
        : expression === 'worried'
        ? -2
        : expression === 'shocked'
        ? -6
        : expression === 'happy'
        ? -3
        : 0;

    const eyeRy = expression === 'shocked' || damageStage >= 4 ? 12.5 : 10.5;
    const irisR = expression === 'shocked' || damageStage >= 4 ? 6.5 : 8.6;
    const pupilR = expression === 'shocked' || damageStage >= 4 ? 2.6 : 3.8;

    return (
      <g>
        {/* Left & Right Eyebrows */}
        <path
          d={
            expression === 'angry' || expression === 'pointing'
              ? 'M80 84 Q94 86 106 93'
              : expression === 'worried'
              ? 'M80 92 Q92 84 106 83'
              : `M80 ${86 + browOffset} Q93 ${80 + browOffset} 106 ${86 + browOffset}`
          }
          stroke="#18181b"
          strokeWidth="3.2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={
            expression === 'angry' || expression === 'pointing'
              ? 'M160 84 Q146 86 134 93'
              : expression === 'worried'
              ? 'M160 92 Q148 84 134 83'
              : `M134 ${86 + browOffset} Q147 ${80 + browOffset} 160 ${86 + browOffset}`
          }
          stroke="#18181b"
          strokeWidth="3.2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Upper Eyelid Fold Lines */}
        <path
          d="M82 91 Q94 87 105 92"
          stroke={skinDeep}
          strokeWidth="1.5"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M135 92 Q146 87 158 91"
          stroke={skinDeep}
          strokeWidth="1.5"
          fill="none"
          opacity="0.7"
        />

        {/* Left Eye Sclera + Eyelid Shadow + Detailed Iris */}
        <ellipse
          cx="94"
          cy="104"
          rx="12.5"
          ry={eyeRy}
          fill="#ffffff"
          stroke="#141417"
          strokeWidth="2.4"
        />
        <path
          d={`M82 ${104 - eyeRy + 4} Q94 ${104 - eyeRy - 1} 106 ${104 - eyeRy + 4} L106 ${104 - eyeRy + 7} Q94 ${104 - eyeRy + 3} 82 ${104 - eyeRy + 7} Z`}
          fill="#cbd5e1"
          opacity="0.55"
        />
        <circle cx="95" cy="105" r={irisR} fill={`url(#${irisGradId})`} stroke="#141417" strokeWidth="1.4" />
        {/* Danganronpa Concentric Truth Ring */}
        <circle cx="95" cy="105" r={irisR * 0.68} fill="none" stroke={irisGlow} strokeWidth="0.9" opacity="0.65" />
        <circle cx="95" cy="105" r={pupilR} fill="#09090b" />
        <circle cx="91" cy="100.5" r="2.6" fill="#ffffff" />
        <circle cx="98.5" cy="108.5" r="1.4" fill="#ffffff" opacity="0.9" />
        {/* Sculpted Upper Lash */}
        <path
          d="M79 101 Q94 90 107 100"
          fill="none"
          stroke="#141417"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Right Eye Sclera + Eyelid Shadow + Detailed Iris */}
        <ellipse
          cx="146"
          cy="104"
          rx="12.5"
          ry={eyeRy}
          fill="#ffffff"
          stroke="#141417"
          strokeWidth="2.4"
        />
        <path
          d={`M134 ${104 - eyeRy + 4} Q146 ${104 - eyeRy - 1} 158 ${104 - eyeRy + 4} L158 ${104 - eyeRy + 7} Q146 ${104 - eyeRy + 3} 134 ${104 - eyeRy + 7} Z`}
          fill="#cbd5e1"
          opacity="0.55"
        />
        <circle cx="145" cy="105" r={irisR} fill={`url(#${irisGradId})`} stroke="#141417" strokeWidth="1.4" />
        <circle cx="145" cy="105" r={irisR * 0.68} fill="none" stroke={irisGlow} strokeWidth="0.9" opacity="0.65" />
        <circle cx="145" cy="105" r={pupilR} fill="#09090b" />
        <circle cx="141" cy="100.5" r="2.6" fill="#ffffff" />
        <circle cx="148.5" cy="108.5" r="1.4" fill="#ffffff" opacity="0.9" />
        {/* Sculpted Upper Lash */}
        <path
          d="M133 100 Q146 90 161 101"
          fill="none"
          stroke="#141417"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
    );
  };

  const renderMouth = () => {
    if (dead) {
      return (
        <path
          d="M108 134 L132 134"
          stroke="#18181b"
          strokeWidth="3"
          strokeLinecap="round"
        />
      );
    }
    switch (expression) {
      case 'happy':
        return (
          <g>
            <path
              d="M106 128 Q120 144 134 128 Z"
              fill="#991b1b"
              stroke="#141417"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            <path
              d="M111 135 Q120 131 129 135 Q120 141 111 135 Z"
              fill="#fb7185"
            />
            <path d="M109 129 L131 129" stroke="#ffffff" strokeWidth="2" />
          </g>
        );
      case 'shocked':
        return (
          <g>
            <ellipse
              cx="120"
              cy="133"
              rx="8"
              ry="10"
              fill="#7f1d1d"
              stroke="#141417"
              strokeWidth="2.5"
            />
            <ellipse cx="120" cy="138" rx="4.5" ry="3" fill="#fb7185" />
          </g>
        );
      case 'angry':
      case 'pointing':
        return (
          <g>
            <path
              d="M104 135 Q120 124 136 135 L132 140 Q120 137 108 140 Z"
              fill="#ffffff"
              stroke="#141417"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            <line
              x1="108"
              y1="135.5"
              x2="132"
              y2="135.5"
              stroke="#52525b"
              strokeWidth="1.2"
            />
          </g>
        );
      case 'worried':
        return (
          <path
            d="M107 136 Q114 130 120 133 Q126 130 133 136"
            fill="none"
            stroke="#141417"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        );
      default:
        return (
          <path
            d="M109 132 Q120 137 131 131"
            fill="none"
            stroke="#141417"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        );
    }
  };

  const renderAccessory = () => {
    if (damageStage >= 1) return null;

    switch (visual.accessory) {
      case 'glasses':
        return (
          <g>
            <rect
              x="78"
              y="93"
              width="32"
              height="21"
              rx="5"
              fill="rgba(56,189,248,0.14)"
              stroke="#e4e4e7"
              strokeWidth="2.6"
            />
            <rect
              x="130"
              y="93"
              width="32"
              height="21"
              rx="5"
              fill="rgba(56,189,248,0.14)"
              stroke="#e4e4e7"
              strokeWidth="2.6"
            />
            <path d="M110 102 Q120 98 130 102" fill="none" stroke="#e4e4e7" strokeWidth="2.6" />
            <line x1="83" y1="97" x2="91" y2="110" stroke="#ffffff" strokeWidth="1.8" opacity="0.55" />
            <line x1="135" y1="97" x2="143" y2="110" stroke="#ffffff" strokeWidth="1.8" opacity="0.55" />
          </g>
        );
      case 'visor':
        return (
          <g>
            <rect
              x="74"
              y="93"
              width="92"
              height="20"
              rx="6"
              fill="rgba(34,211,238,0.32)"
              stroke="#22d3ee"
              strokeWidth="2.6"
            />
            <line x1="80" y1="100" x2="160" y2="100" stroke="#a5f3fc" strokeWidth="1.6" opacity="0.75" />
            <circle cx="158" cy="103" r="2.2" fill="#f43f5e" />
          </g>
        );
      case 'flower':
        return (
          <g transform="translate(166, 66)">
            <ellipse cx="-8" cy="4" rx="7" ry="4" fill="#10b981" stroke="#141417" strokeWidth="1.8" transform="rotate(-25)" />
            <circle cx="-5" cy="-4" r="6.5" fill="#fb7185" stroke="#141417" strokeWidth="1.8" />
            <circle cx="5" cy="-4" r="6.5" fill="#fb7185" stroke="#141417" strokeWidth="1.8" />
            <circle cx="0" cy="4" r="6.5" fill="#f43f5e" stroke="#141417" strokeWidth="1.8" />
            <circle cx="0" cy="-1" r="4" fill="#fde047" stroke="#141417" strokeWidth="1.4" />
          </g>
        );
      case 'beret':
        return (
          <g>
            <path
              d="M64 52 C74 22 158 18 176 48 C154 58 92 58 64 52 Z"
              fill={visual.accent}
              stroke="#141417"
              strokeWidth="3"
            />
            <path d="M118 24 L123 16" stroke="#141417" strokeWidth="3" strokeLinecap="round" />
            <circle cx="152" cy="44" r="4" fill="#fde047" stroke="#141417" strokeWidth="1.5" />
          </g>
        );
      case 'ruana':
        return (
          <g>
            <path
              d="M44 166 L120 214 L196 166 L208 272 L32 272 Z"
              fill={visual.accent}
              stroke="#141417"
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
            <path
              d="M48 228 L120 256 L192 228"
              fill="none"
              stroke="#78350f"
              strokeWidth="6"
              opacity="0.65"
            />
            <path
              d="M62 246 L120 270 L178 246"
              fill="none"
              stroke="#fef3c7"
              strokeWidth="3"
              strokeDasharray="6 5"
            />
          </g>
        );
      case 'carriel':
        return (
          <g>
            <line
              x1="62"
              y1="162"
              x2="178"
              y2="274"
              stroke="#78350f"
              strokeWidth="13"
              strokeLinecap="round"
            />
            <line
              x1="62"
              y1="162"
              x2="178"
              y2="274"
              stroke="#b45309"
              strokeWidth="6"
              strokeDasharray="8 6"
            />
            <rect
              x="128"
              y="220"
              width="20"
              height="16"
              rx="3"
              fill="#fbbf24"
              stroke="#141417"
              strokeWidth="2.2"
              transform="rotate(42 138 228)"
            />
          </g>
        );
      case 'camera':
        return (
          <g>
            <path d="M84 160 L106 204 M156 160 L134 204" stroke="#27272a" strokeWidth="4.5" />
            <g transform="translate(96, 198)">
              <rect x="0" y="0" width="48" height="32" rx="5" fill="#18181b" stroke="#09090b" strokeWidth="2.5" />
              <rect x="14" y="-6" width="20" height="7" rx="2" fill="#27272a" stroke="#09090b" strokeWidth="2" />
              <circle cx="24" cy="17" r="10.5" fill="#0f172a" stroke="#e4e4e7" strokeWidth="2.2" />
              <circle cx="24" cy="17" r="6.5" fill="#0284c7" />
              <circle cx="21" cy="14" r="2.2" fill="#bae6fd" />
            </g>
          </g>
        );
      case 'scarf':
        return (
          <g>
            <path
              d="M78 152 Q120 172 162 152 L166 178 Q120 194 74 178 Z"
              fill={visual.accent}
              stroke="#141417"
              strokeWidth="2.8"
            />
            <path
              d="M110 176 L102 226 L124 226 L126 176 Z"
              fill={adjustHexColor(visual.accent, -18)}
              stroke="#141417"
              strokeWidth="2.4"
            />
          </g>
        );
      case 'labcoat':
        return (
          <g>
            <path
              d="M52 168 L94 164 L96 276 L40 276 Z"
              fill="#f8fafc"
              stroke="#141417"
              strokeWidth="2.8"
            />
            <path
              d="M188 168 L146 164 L144 276 L200 276 Z"
              fill="#f8fafc"
              stroke="#141417"
              strokeWidth="2.8"
            />
            <rect x="154" y="216" width="24" height="22" rx="2" fill="#e2e8f0" stroke="#141417" strokeWidth="2" />
            <line x1="160" y1="208" x2="160" y2="218" stroke="#14b8a6" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="168" y1="206" x2="168" y2="218" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        );
      case 'apron':
        return (
          <g>
            <path d="M84 162 L88 276 M156 162 L152 276" stroke="#fefce8" strokeWidth="7" />
            <path d="M84 198 L156 198 L162 276 L78 276 Z" fill="#fefce8" stroke="#141417" strokeWidth="2.6" />
            <path d="M100 226 L140 226 L140 250 L100 250 Z" fill="#fde68a" stroke="#141417" strokeWidth="2" />
          </g>
        );
      case 'accordion_pin':
        return (
          <g>
            <polygon
              points="120,164 110,214 120,228 130,214"
              fill={visual.accent}
              stroke="#141417"
              strokeWidth="2.2"
            />
            <g transform="translate(152, 188)">
              <rect x="-8" y="-7" width="16" height="14" rx="2" fill="#fbbf24" stroke="#141417" strokeWidth="2" />
              <line x1="-3" y1="-6" x2="-3" y2="6" stroke="#141417" strokeWidth="1.5" />
              <line x1="3" y1="-6" x2="3" y2="6" stroke="#141417" strokeWidth="1.5" />
            </g>
          </g>
        );
      case 'mask_pin':
        return (
          <g>
            <polygon
              points="120,164 108,216 120,230 132,216"
              fill={visual.accent}
              stroke="#141417"
              strokeWidth="2.2"
            />
            <circle cx="152" cy="192" r="7" fill="#ffffff" stroke="#141417" strokeWidth="2" />
            <circle cx="159" cy="196" r="7" fill="#18181b" stroke="#f43f5e" strokeWidth="2" />
          </g>
        );
      case 'trench':
        return (
          <g>
            <path
              d="M66 154 L88 186 L96 158 Z"
              fill={outfitLight}
              stroke="#141417"
              strokeWidth="2.4"
            />
            <path
              d="M174 154 L152 186 L144 158 Z"
              fill={outfitLight}
              stroke="#141417"
              strokeWidth="2.4"
            />
            <polygon
              points="120,166 111,216 120,228 129,216"
              fill="#334155"
              stroke="#141417"
              strokeWidth="2"
            />
          </g>
        );
      case 'cipher_tie':
        return (
          <g>
            <polygon
              points="120,164 110,220 120,238 130,220"
              fill={visual.accent}
              stroke="#141417"
              strokeWidth="2.4"
            />
            <line x1="113" y1="186" x2="127" y2="186" stroke="#fecaca" strokeWidth="2" />
            <line x1="112" y1="202" x2="128" y2="202" stroke="#141417" strokeWidth="2.4" />
            <rect x="112" y="192" width="16" height="4" rx="1" fill="#e4e4e7" stroke="#141417" strokeWidth="1.2" />
          </g>
        );
      default:
        return (
          <g>
            <polygon
              points="120,164 110,216 120,230 130,216"
              fill={visual.accent}
              stroke="#141417"
              strokeWidth="2.2"
            />
            <line x1="114" y1="188" x2="126" y2="188" stroke="#ffffff" strokeWidth="1.8" opacity="0.7" />
          </g>
        );
    }
  };

  const postureTransform =
    expression === 'pointing' || expression === 'angry'
      ? 'scale-[1.03] -translate-y-0.5'
      : expression === 'shocked'
      ? 'scale-[0.98] translate-y-1'
      : '';

  const motionClass =
    damageStage >= 5
      ? 'animate-dr-shake'
      : isSpeaking
      ? 'animate-dr-sprite-talk'
      : 'animate-dr-sprite-breathe';

  return (
    <div
      className={`relative select-none flex items-end justify-center ${
        SIZE_MAP[size]
      } ${dead ? 'grayscale contrast-125 opacity-75' : ''} ${
        flip ? '-scale-x-100' : ''
      } ${animateEnter ? 'animate-dr-sprite-enter' : ''} ${className}`}
    >
      <div
        className={`w-full h-full flex items-end justify-center transition-transform duration-200 ${postureTransform} ${motionClass}`}
      >
        <svg
          viewBox="0 0 240 280"
          className="w-full h-full drop-shadow-[0_14px_24px_rgba(0,0,0,0.72)]"
          aria-label={char.name}
        >
          <defs>
            <radialGradient id={auraGradId} cx="50%" cy="48%" r="50%">
              <stop offset="0%" stopColor={char.signatureColor} stopOpacity="0.28" />
              <stop offset="100%" stopColor={char.signatureColor} stopOpacity="0" />
            </radialGradient>
            <linearGradient id={skinGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={skinBase} />
              <stop offset="72%" stopColor={skinBase} />
              <stop offset="100%" stopColor={skinShade} />
            </linearGradient>
            <linearGradient id={hairGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={hairHighlight} />
              <stop offset="35%" stopColor={hairBase} />
              <stop offset="100%" stopColor={hairShade} />
            </linearGradient>
            <linearGradient id={hairBackGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={hairBase} />
              <stop offset="100%" stopColor={hairShade} />
            </linearGradient>
            <linearGradient id={outfitGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={outfitLight} />
              <stop offset="45%" stopColor={outfitBase} />
              <stop offset="100%" stopColor={outfitShade} />
            </linearGradient>
            <linearGradient id={shirtGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={shirtBase} />
              <stop offset="100%" stopColor={shirtShade} />
            </linearGradient>
            <radialGradient id={irisGradId} cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor={irisDark} />
              <stop offset="55%" stopColor={char.signatureColor} />
              <stop offset="92%" stopColor={irisGlow} />
              <stop offset="100%" stopColor={irisDark} />
            </radialGradient>
          </defs>

          {/* Soft Signature Rim Glow */}
          <circle cx="120" cy="135" r="108" fill={`url(#${auraGradId})`} />

          {/* Dramatic V3 Breakdown Aura at Stage 5 */}
          {damageStage >= 5 && (
            <g opacity="0.65" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round">
              <line x1="16" y1="36" x2="58" y2="76" />
              <line x1="224" y1="36" x2="182" y2="76" />
              <line x1="10" y1="138" x2="48" y2="138" />
              <line x1="230" y1="138" x2="192" y2="138" />
            </g>
          )}

          {/* Back Hair */}
          {renderHairBack()}

          {/* Shoulders & Tailored Blazer */}
          {damageStage < 4 ? (
            <g>
              <path
                d="M42 276 L50 184 C54 162 80 152 120 152 C160 152 186 162 190 184 L198 276 Z"
                fill={`url(#${outfitGradId})`}
                stroke="#141417"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              {/* Sleeve / Shoulder Seam Shading */}
              <path
                d="M66 176 L58 272 M174 176 L182 272"
                stroke={outfitShade}
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            </g>
          ) : (
            <g>
              <path
                d="M52 276 L56 188 C60 166 86 156 120 156 C154 156 180 166 184 188 L188 276 Z"
                fill={`url(#${shirtGradId})`}
                stroke="#141417"
                strokeWidth="3.2"
              />
              <path
                d="M46 276 L50 192 L80 212 L68 276 Z"
                fill={outfitBase}
                stroke="#141417"
                strokeWidth="2.8"
              />
              <path
                d="M194 276 L190 192 L158 214 L170 276 Z"
                fill={outfitBase}
                stroke="#141417"
                strokeWidth="2.8"
              />
            </g>
          )}

          {/* Inner Collared Shirt + Lapels */}
          {damageStage < 4 && (
            <g>
              <polygon
                points="94,154 146,154 120,218"
                fill={`url(#${shirtGradId})`}
                stroke="#141417"
                strokeWidth="2.8"
                strokeLinejoin="round"
              />
              {/* Blazer Left & Right Lapels */}
              <polygon
                points="94,154 78,176 96,192 108,216"
                fill={outfitLight}
                stroke="#141417"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <polygon
                points="146,154 162,176 144,192 132,216"
                fill={outfitLight}
                stroke="#141417"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              {/* Shirt Collar Flaps */}
              <polygon
                points="98,150 120,168 106,172"
                fill={shirtBase}
                stroke="#141417"
                strokeWidth="2.2"
              />
              <polygon
                points="142,150 120,168 134,172"
                fill={shirtBase}
                stroke="#141417"
                strokeWidth="2.2"
              />
            </g>
          )}

          {/* Progressive Cloth Tears & Rips (Stages 1..5) */}
          {damageStage >= 1 && (
            <path
              d="M60 206 L78 216 L66 224"
              fill="none"
              stroke="#09090b"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}
          {damageStage >= 2 && (
            <path
              d="M158 174 L178 188 L164 198 L182 210"
              fill={skinBase}
              stroke="#141417"
              strokeWidth="2.6"
            />
          )}
          {damageStage >= 3 && (
            <path
              d="M84 196 L134 236 L118 246 L148 264"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          )}
          {damageStage >= 5 && (
            <g>
              <polygon
                points="90,166 116,204 98,220"
                fill={skinBase}
                stroke="#141417"
                strokeWidth="2.4"
              />
              <polygon
                points="152,182 128,222 146,234"
                fill={skinBase}
                stroke="#141417"
                strokeWidth="2.4"
              />
            </g>
          )}

          {/* Neck + Deep Chin Shadow */}
          <rect
            x="104"
            y="134"
            width="32"
            height="28"
            rx="10"
            fill={skinBase}
            stroke="#141417"
            strokeWidth="3"
          />
          <path
            d="M105 138 Q120 156 135 138 L135 148 Q120 160 105 148 Z"
            fill={skinDeep}
            opacity="0.7"
          />

          {/* Ears */}
          <ellipse cx="68" cy="108" rx="7" ry="12" fill={skinShade} stroke="#141417" strokeWidth="2.8" />
          <ellipse cx="172" cy="108" rx="7" ry="12" fill={skinShade} stroke="#141417" strokeWidth="2.8" />

          {/* Sculpted Anime Face */}
          <path
            d="M68 88 C68 50 172 50 172 88 C172 118 156 144 120 148 C84 144 68 118 68 88 Z"
            fill={`url(#${skinGradId})`}
            stroke="#141417"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />

          {/* Subtle Anime Nose + Bridge Shadow */}
          <path d="M120 109 L117 119 L122 120" fill="none" stroke={skinDeep} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Cheek Blush + Diagonal Anime Hash Strokes */}
          <ellipse cx="86" cy="120" rx="9" ry="4.2" fill="#f43f5e" opacity="0.24" />
          <ellipse cx="154" cy="120" rx="9" ry="4.2" fill="#f43f5e" opacity="0.24" />
          {(expression === 'happy' || expression === 'worried') && !dead && (
            <g stroke="#fb7185" strokeWidth="1.6" opacity="0.65" strokeLinecap="round">
              <line x1="81" y1="122" x2="84" y2="117" />
              <line x1="86" y1="122" x2="89" y2="117" />
              <line x1="151" y1="122" x2="154" y2="117" />
              <line x1="156" y1="122" x2="159" y2="117" />
            </g>
          )}

          {/* Sweat drops during high Argument Armament damage */}
          {damageStage >= 2 && (
            <path
              d="M158 72 C163 82 163 89 158 89 C153 89 153 82 158 72 Z"
              fill="#38bdf8"
              stroke="#0284c7"
              strokeWidth="1.8"
            />
          )}
          {damageStage >= 4 && (
            <path
              d="M80 76 C84 84 84 90 80 90 C76 90 76 84 80 76 Z"
              fill="#38bdf8"
              stroke="#0284c7"
              strokeWidth="1.8"
            />
          )}

          {/* Facial Expression */}
          {renderEyes()}
          {renderMouth()}

          {/* Layered Front Hair & Specular Highlights */}
          {renderHairFront()}

          {/* Colombian / Talent Accessory */}
          {renderAccessory()}

          {/* ICFES Gold-Rimmed Crest Pin on Blazer */}
          {damageStage < 2 && (
            <g>
              <circle
                cx="80"
                cy="196"
                r="8"
                fill={char.signatureColor}
                stroke="#141417"
                strokeWidth="2.2"
              />
              <circle cx="80" cy="196" r="3.5" fill="#fef08a" />
            </g>
          )}

          {/* Blazer Metallic Buttons */}
          {damageStage < 4 && (
            <g fill="#fbbf24" stroke="#141417" strokeWidth="1.8">
              <circle cx="120" cy="238" r="3.5" />
              <circle cx="120" cy="256" r="3.5" />
            </g>
          )}

          {/* Expressive Objection / Counter Pointing Arm */}
          {expression === 'pointing' && !dead && (
            <g transform="translate(142, 174)">
              <path
                d="M18 38 L-4 20 L8 4 L30 22 Z"
                fill={outfitBase}
                stroke="#141417"
                strokeWidth="2.8"
                strokeLinejoin="round"
              />
              <path
                d="M20 26 L56 4 L62 15 L28 38 Z"
                fill={skinBase}
                stroke="#141417"
                strokeWidth="2.6"
                strokeLinejoin="round"
              />
              {/* Pointing Finger Highlight */}
              <circle cx="60" cy="9" r="6" fill={visual.accent} opacity="0.85" />
              <circle cx="60" cy="9" r="3" fill="#ffffff" />
            </g>
          )}
        </svg>
      </div>

      {dead && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="px-2.5 py-0.5 bg-rose-600/95 text-white font-display font-bold text-xs tracking-widest uppercase -rotate-12 border border-rose-200 shadow-lg">
            ELIMINADO
          </span>
        </div>
      )}
    </div>
  );
};
