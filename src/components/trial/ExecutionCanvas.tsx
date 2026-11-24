import React, { useEffect, useRef } from 'react';
import { CharacterId } from '../../types/game';
import { CHARACTERS } from '../../data/characters';

interface ExecutionCanvasProps {
  culpritId: CharacterId;
  progress: number; // 0 to 1 across entire execution
  phase: 'chain_yank' | 'playing' | 'verdict_end';
}

export const ExecutionCanvas: React.FC<ExecutionCanvasProps> = ({
  culpritId,
  progress,
  phase,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(progress);
  const phaseRef = useRef(phase);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const startTime = performance.now();
    const char =
      CHARACTERS[culpritId as Exclude<keyof typeof CHARACTERS, never>] ||
      CHARACTERS.sebastian;

    // Pre-seed deterministic particles
    const particles = Array.from({ length: 55 }, (_, i) => ({
      x: ((i * 73) % 900) / 900,
      y: ((i * 137) % 450) / 450,
      vx: ((i % 7) - 3) * 0.6,
      vy: 0.7 + (i % 5) * 0.45,
      size: 2 + (i % 5),
      phase: i * 0.4,
    }));

    const drawStudentSilhouette = (
      x: number,
      y: number,
      scale: number,
      panicShake: number,
      tied = false
    ) => {
      ctx.save();
      const sx = x + Math.sin(panicShake * 22) * (phaseRef.current === 'playing' ? 3 : 0);
      const sy = y + Math.cos(panicShake * 18) * (phaseRef.current === 'playing' ? 2 : 0);
      ctx.translate(sx, sy);
      ctx.scale(scale, scale);

      // Shoulders/Torso
      ctx.fillStyle = char.visual.outfitPrimary;
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-26, 55);
      ctx.lineTo(-20, 12);
      ctx.quadraticCurveTo(0, 4, 20, 12);
      ctx.lineTo(26, 55);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Head
      ctx.fillStyle = char.visual.skin;
      ctx.beginPath();
      ctx.arc(0, -14, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Hair cap
      ctx.fillStyle = char.visual.hairColor;
      ctx.beginPath();
      ctx.arc(0, -18, 19, Math.PI, 0);
      ctx.fill();
      ctx.stroke();

      // Panicked Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-6, -13, 4.5, 0, Math.PI * 2);
      ctx.arc(6, -13, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(-6, -13, 1.8, 0, Math.PI * 2);
      ctx.arc(6, -13, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Screaming Mouth
      ctx.fillStyle = '#881337';
      ctx.beginPath();
      ctx.ellipse(0, -3, 4, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();

      if (tied) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-22, 24);
        ctx.lineTo(22, 28);
        ctx.moveTo(-23, 38);
        ctx.lineTo(23, 34);
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawMiniMonokuma = (x: number, y: number, scale: number, t: number) => {
      ctx.save();
      ctx.translate(x, y + Math.sin(t * 6) * 3);
      ctx.scale(scale, scale);

      // Left White Half
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(0, 0, 18, Math.PI * 0.5, Math.PI * 1.5);
      ctx.fill();

      // Right Black Half
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(0, 0, 18, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.fill();

      // Ears
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(-13, -14, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(13, -14, 6, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(-6, -3, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(4, -5);
      ctx.lineTo(11, -7);
      ctx.lineTo(9, -1);
      ctx.closePath();
      ctx.fill();

      // Grin
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(4, 5, 7, 0, Math.PI * 0.7);
      ctx.stroke();

      ctx.restore();
    };

    const render = (now: number) => {
      const t = (now - startTime) / 1000;
      const p = progressRef.current;
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // Base theater background + spotlight sweep
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#09090b');
      bgGrad.addColorStop(1, '#180912');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Sweeping Stage Spotlights
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const spot1X = W * 0.5 + Math.sin(t * 1.4) * 180;
      const spotGrad = ctx.createRadialGradient(spot1X, 40, 10, spot1X, H * 0.7, 320);
      spotGrad.addColorStop(0, 'rgba(244, 63, 94, 0.22)');
      spotGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = spotGrad;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // --- CHAIN YANK INTRO ---
      if (phaseRef.current === 'chain_yank') {
        drawStudentSilhouette(W * 0.5, H * 0.55, 1.35, t, false);
        const chainReach = Math.min(1, (t % 2.2) / 1.1);
        const collarX = W * (1 - chainReach * 0.5);
        // Chain links shooting from right
        ctx.strokeStyle = '#d4d4d8';
        ctx.lineWidth = 6;
        ctx.setLineDash([12, 8]);
        ctx.beginPath();
        ctx.moveTo(W, H * 0.45);
        ctx.lineTo(collarX, H * 0.48);
        ctx.stroke();
        ctx.setLineDash([]);

        // Monokuma Collar
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(collarX, H * 0.48, 20, 0, Math.PI * 2);
        ctx.stroke();

        // Flashing Crimson Warning
        ctx.fillStyle = `rgba(225, 29, 72, ${0.25 + 0.2 * Math.sin(t * 14)})`;
        ctx.fillRect(0, 0, W, 38);
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 18px "Barlow Condensed", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('¡HA LLEGADO EL CASTIGO! · CONECTANDO CADENA DE EJECUCIÓN', W * 0.5, 25);

        animId = requestAnimationFrame(render);
        return;
      }

      // --- 7 CUSTOM ANIMATED EXECUTIONS ---
      switch (culpritId) {
        case 'sebastian': {
          // Boyaca Clay Tejo Arena: rotating target + flying flaming iron tejos + giant golden tejo drop
          const targetX = W * 0.68;
          const targetY = H * 0.54;

          // Clay pit floor
          ctx.fillStyle = '#451a03';
          ctx.fillRect(0, H * 0.78, W, H * 0.22);

          // Spinning Wooden Target
          ctx.save();
          ctx.translate(targetX, targetY);
          ctx.rotate(t * 0.9);
          [110, 82, 54, 26].forEach((r, idx) => {
            ctx.fillStyle = idx % 2 === 0 ? '#dc2626' : '#fef3c7';
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#18181b';
            ctx.lineWidth = 3;
            ctx.stroke();
          });
          ctx.restore();

          drawStudentSilhouette(targetX, targetY - 12, 1.1, t, true);

          // 3 Mini-Monokumas throwing flaming tejos from left
          drawMiniMonokuma(80, H * 0.66, 1.0, t);
          drawMiniMonokuma(145, H * 0.7, 0.9, t + 1);

          for (let i = 0; i < 4; i++) {
            const cycle = ((t * 1.4 + i * 0.25) % 1);
            const tx = 110 + cycle * (targetX - 130);
            const ty = H * 0.65 - Math.sin(cycle * Math.PI) * 160;
            ctx.save();
            ctx.translate(tx, ty);
            ctx.rotate(t * 12);
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();
          }

          // Climax: Giant Golden Tejo Drop when p > 0.72
          if (p > 0.72) {
            const dropRatio = Math.min(1, (p - 0.72) / 0.2);
            const goldenY = -60 + dropRatio * (targetY - 10 + 60);
            ctx.fillStyle = '#facc15';
            ctx.strokeStyle = '#b45309';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.ellipse(targetX, goldenY, 95, 36, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            if (dropRatio >= 0.95) {
              ctx.fillStyle = 'rgba(251, 191, 36, 0.45)';
              ctx.beginPath();
              ctx.arc(targetX, targetY, 150 + Math.sin(t * 30) * 15, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          break;
        }

        case 'santiago': {
          // Giant Crystal Erlenmeyer Flask filling with neon chemicals + catalyst drop
          const cx = W * 0.5;
          const flaskBottom = H * 0.86;
          const flaskTop = H * 0.16;

          // Carnival Confetti Particles
          particles.forEach((pt, idx) => {
            ctx.fillStyle = idx % 3 === 0 ? '#14b8a6' : idx % 3 === 1 ? '#f43f5e' : '#facc15';
            const py = ((pt.y * H + t * 85 * pt.vy) % H);
            ctx.fillRect(pt.x * W, py, 6, 6);
          });

          // Student trapped inside flask
          drawStudentSilhouette(cx, H * 0.62, 1.15, t, false);

          // Rising Neon-Teal Chemical Fluid with Sine Wave
          const fillRatio = Math.min(0.92, 0.15 + p * 0.8);
          const fluidY = flaskBottom - (flaskBottom - flaskTop - 40) * fillRatio;

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(cx - 135, flaskBottom);
          ctx.lineTo(cx - 50, flaskTop + 55);
          ctx.lineTo(cx + 50, flaskTop + 55);
          ctx.lineTo(cx + 135, flaskBottom);
          ctx.closePath();
          ctx.clip();

          ctx.fillStyle = p > 0.8 ? 'rgba(244, 63, 94, 0.72)' : 'rgba(20, 184, 166, 0.62)';
          ctx.beginPath();
          ctx.moveTo(cx - 150, flaskBottom);
          for (let x = cx - 150; x <= cx + 150; x += 15) {
            ctx.lineTo(x, fluidY + Math.sin(x * 0.05 + t * 6) * 8);
          }
          ctx.lineTo(cx + 150, flaskBottom);
          ctx.closePath();
          ctx.fill();

          // Effervescent bubbles
          for (let b = 0; b < 14; b++) {
            const bx = cx - 90 + ((b * 37) % 180);
            const by = flaskBottom - (((t * 90 + b * 45) % (flaskBottom - fluidY + 1)));
            ctx.strokeStyle = '#ccfbf1';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(bx, by, 4 + (b % 4), 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.restore();

          // Glass Flask Outline
          ctx.strokeStyle = '#67e8f9';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(cx - 45, flaskTop);
          ctx.lineTo(cx - 45, flaskTop + 55);
          ctx.lineTo(cx - 135, flaskBottom);
          ctx.lineTo(cx + 135, flaskBottom);
          ctx.lineTo(cx + 45, flaskTop + 55);
          ctx.lineTo(cx + 45, flaskTop);
          ctx.stroke();

          // Catalyst Drop falling at climax
          if (p > 0.7) {
            const dropY = (t * 220) % (fluidY + 20);
            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            ctx.arc(cx, dropY, 10, 0, Math.PI * 2);
            ctx.fill();
          }
          drawMiniMonokuma(cx + 195, H * 0.72, 1.1, t);
          break;
        }

        case 'andres': {
          // Server Room + Matrix Red Error Rain + Crushing BSOD 000/500 Walls
          // Falling red error code columns
          ctx.font = 'bold 13px "JetBrains Mono", monospace';
          const codes = ['ERR_404', 'FATAL', '000/500', 'SEGFAULT', 'NULL_PTR', 'ABORT'];
          for (let col = 0; col < 16; col++) {
            const cx = 30 + col * 56;
            const cy = ((t * (130 + (col % 4) * 35) + col * 60) % (H + 40)) - 20;
            ctx.fillStyle = col % 3 === 0 ? '#22d3ee' : '#f43f5e';
            ctx.fillText(codes[col % codes.length], cx, cy);
          }

          // Server Racks Left & Right sliding inward
          const wallShift = p > 0.5 ? (p - 0.5) * 2 * 185 : 0;
          [0, 1].forEach((side) => {
            const rx = side === 0 ? 40 + wallShift : W - 160 - wallShift;
            ctx.fillStyle = '#18181b';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 3;
            ctx.fillRect(rx, 50, 120, H - 90);
            ctx.strokeRect(rx, 50, 120, H - 90);
            for (let led = 0; led < 7; led++) {
              ctx.fillStyle = Math.sin(t * 10 + led) > 0 ? '#ef4444' : '#22d3ee';
              ctx.fillRect(rx + 18, 70 + led * 38, 84, 12);
            }
          });

          drawStudentSilhouette(W * 0.5, H * 0.62, 1.2, t, true);

          // Giant BSOD Banner
          if (p > 0.78) {
            ctx.fillStyle = 'rgba(30, 58, 138, 0.88)';
            ctx.fillRect(W * 0.22, H * 0.24, W * 0.56, 110);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.strokeRect(W * 0.22, H * 0.24, W * 0.56, 110);
            ctx.fillStyle = '#ffffff';
            ctx.font = '800 32px "Barlow Condensed", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('FATAL ERROR: 000 / 500 REPROBADO', W * 0.5, H * 0.37);
          }
          break;
        }

        case 'juanpablo': {
          // Giant Bronze Clockwork Gears + Swinging Trigonometric Pendulums
          const drawGear = (gx: number, gy: number, r: number, dir: number) => {
            ctx.save();
            ctx.translate(gx, gy);
            ctx.rotate(t * dir);
            ctx.fillStyle = '#451a03';
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            for (let tooth = 0; tooth < 8; tooth++) {
              ctx.rotate(Math.PI / 4);
              ctx.fillStyle = '#d97706';
              ctx.fillRect(-8, -r - 12, 16, 14);
            }
            ctx.restore();
          };

          drawGear(W * 0.25, H * 0.45, 78, 0.8);
          drawGear(W * 0.75, H * 0.45, 78, -0.8);
          drawGear(W * 0.5, H * 0.35, 55, 1.2);

          drawStudentSilhouette(W * 0.5, H * 0.66, 1.15, t, true);

          // Swinging Pendulum Blade
          const angle = Math.sin(t * 3.4) * 0.95;
          const pivX = W * 0.5;
          const pivY = 0;
          const len = H * 0.62;
          const bobX = pivX + Math.sin(angle) * len;
          const bobY = pivY + Math.cos(angle) * len;

          ctx.strokeStyle = '#e4e4e7';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(pivX, pivY);
          ctx.lineTo(bobX, bobY);
          ctx.stroke();

          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(bobX, bobY, 34, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 4;
          ctx.stroke();

          // Division by Zero Display
          ctx.fillStyle = '#09090b';
          ctx.fillRect(W * 0.36, 18, W * 0.28, 44);
          ctx.strokeStyle = '#818cf8';
          ctx.lineWidth = 2;
          ctx.strokeRect(W * 0.36, 18, W * 0.28, 44);
          ctx.fillStyle = '#a5b4fc';
          ctx.font = 'bold 22px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('Σ ÷ 0 = ∞', W * 0.5, 48);
          break;
        }

        case 'camila': {
          // Botanical Glass Dome + Rising Robotic Vines + Giant Mechanical Orchid Closing
          const cx = W * 0.5;
          const cy = H * 0.56;

          // Swirling golden pollen spores
          particles.forEach((pt) => {
            ctx.fillStyle = 'rgba(250, 204, 21, 0.7)';
            const px = (pt.x * W + Math.sin(t * 2 + pt.phase) * 30);
            const py = (pt.y * H + Math.cos(t * 1.6 + pt.phase) * 20);
            ctx.beginPath();
            ctx.arc(px, py, pt.size, 0, Math.PI * 2);
            ctx.fill();
          });

          // Animated Thorny Robotic Vines
          for (let v = -2; v <= 2; v++) {
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(cx + v * 90, H);
            ctx.quadraticCurveTo(
              cx + v * 50 + Math.sin(t * 3 + v) * 25,
              H * 0.65,
              cx + v * 18,
              cy + 15
            );
            ctx.stroke();
          }

          drawStudentSilhouette(cx, cy, 1.1, t, true);

          // 6 Giant Robotic Orchid Petals Closing In as progress approaches 1
          const closeAngle = Math.min(1, p * 1.15);
          for (let k = 0; k < 6; k++) {
            const baseA = (k * Math.PI) / 3 + t * 0.3;
            const radius = 145 * (1 - closeAngle * 0.62);
            const px = cx + Math.cos(baseA) * radius;
            const py = cy + Math.sin(baseA) * radius * 0.65;
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(baseA);
            ctx.fillStyle = k % 2 === 0 ? '#ec4899' : '#be185d';
            ctx.strokeStyle = '#fdf2f8';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.ellipse(0, 0, 52, 26, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }
          break;
        }

        case 'sofia': {
          // Newspaper Printing Press Rollers + Flying Headlines + Camera Flash Strobes
          // Spinning giant cylinders
          const rollerOffset = p > 0.6 ? (p - 0.6) * 2 * 70 : 0;
          [0, 1].forEach((idx) => {
            const ry = idx === 0 ? 85 + rollerOffset : H - 85 - rollerOffset;
            ctx.fillStyle = '#3f3f46';
            ctx.strokeStyle = '#f97316';
            ctx.lineWidth = 4;
            ctx.fillRect(W * 0.14, ry - 38, W * 0.72, 76);
            ctx.strokeRect(W * 0.14, ry - 38, W * 0.72, 76);
            // Rolling stripe lines
            ctx.strokeStyle = '#a1a1aa';
            ctx.lineWidth = 3;
            for (let s = 0; s < 6; s++) {
              const sx = W * 0.16 + ((s * 105 + t * 220) % (W * 0.68));
              ctx.beginPath();
              ctx.moveTo(sx, ry - 34);
              ctx.lineTo(sx, ry + 34);
              ctx.stroke();
            }
          });

          drawStudentSilhouette(W * 0.5, H * 0.54, 1.1, t, false);

          // Flying Spinning Newspapers
          for (let n = 0; n < 5; n++) {
            const nx = ((t * 280 + n * 190) % (W + 120)) - 60;
            const ny = H * 0.28 + Math.sin(t * 4 + n) * 55;
            ctx.save();
            ctx.translate(nx, ny);
            ctx.rotate(t * 4 + n);
            ctx.fillStyle = '#f4f4f5';
            ctx.fillRect(-26, -18, 52, 36);
            ctx.fillStyle = '#18181b';
            ctx.font = 'bold 9px sans-serif';
            ctx.fillText('EXTRA', -16, 4);
            ctx.restore();
          }

          // Camera Flash Strobe pulse
          if (Math.sin(t * 14) > 0.85) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
            ctx.fillRect(0, 0, W, H);
          }
          break;
        }

        case 'mateo': {
          // Chapter 5: Mateo strapped to ICFES OMR Grading Conveyor toward Hydraulic Press #53, saved by basement hatch glitch!
          const conveyorX = W * (0.14 + Math.min(0.36, p * 0.65));
          const escaped = p >= 0.78;
          const pressDrop = p < 0.78 ? Math.sin(p * Math.PI * 1.4) * 145 : 210;

          // Giant ICFES Grading Conveyor Belt
          ctx.fillStyle = '#18181b';
          ctx.fillRect(0, H * 0.72, W, 38);
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 3;
          ctx.strokeRect(0, H * 0.72, W, 38);
          for (let b = 0; b < 14; b++) {
            const bx = ((b * 75 + t * 180) % (W + 60)) - 30;
            ctx.fillStyle = '#3f3f46';
            ctx.fillRect(bx, H * 0.74, 24, 18);
          }

          // Emergency Basement Trapdoor under Press (opens at p >= 0.78)
          if (escaped) {
            ctx.fillStyle = '#06b6d4';
            ctx.fillRect(W * 0.42, H * 0.72, 140, 44);
            ctx.fillStyle = '#09090b';
            ctx.fillRect(W * 0.43, H * 0.73, 124, 95);
          }

          // Descending Hydraulic Press #53
          const pressY = 30 + pressDrop;
          ctx.fillStyle = '#7f1d1d';
          ctx.fillRect(W * 0.42, 0, 140, pressY);
          ctx.fillStyle = '#e11d48';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.fillRect(W * 0.38, pressY, 210, 46);
          ctx.strokeRect(W * 0.38, pressY, 210, 46);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 14px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('PRENSA #53 · REPROBADO', W * 0.495, pressY + 28);

          // Mateo sliding on conveyor, then dropping safely through hatch
          const mateoY = escaped ? H * 0.64 + (p - 0.78) * 520 : H * 0.59;
          drawStudentSilhouette(conveyorX, mateoY, 1.05, t, !escaped);

          if (escaped) {
            ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = '#22d3ee';
            ctx.font = '800 22px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('¡TRAMPILLA DE SÓTANO ABIERTA · SOBREVIVE!', W * 0.5, 42);
          } else {
            ctx.fillStyle = '#f43f5e';
            ctx.font = '800 20px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('EJECUCIÓN FORZADA SIN CULPABLE', W * 0.5, 42);
          }
          break;
        }

        default: {
          // Chapter 7 Laura Jiménez: Mainframe Collapse + Raining OMR Answer Sheets + Rising Bogotá Sunrise Gates
          const gateRise = Math.max(0, (p - 0.45) / 0.55);

          // Dawn sky behind rising steel blast gates
          if (gateRise > 0) {
            const sunGrad = ctx.createLinearGradient(0, 0, 0, H);
            sunGrad.addColorStop(0, '#0284c7');
            sunGrad.addColorStop(0.65, '#f97316');
            sunGrad.addColorStop(1, '#fde047');
            ctx.fillStyle = sunGrad;
            ctx.fillRect(0, 0, W, H);

            // Monserrate Andes Silhouette
            ctx.fillStyle = '#1e1b4b';
            ctx.beginPath();
            ctx.moveTo(0, H);
            ctx.lineTo(0, H * 0.62);
            ctx.lineTo(W * 0.3, H * 0.42);
            ctx.lineTo(W * 0.58, H * 0.58);
            ctx.lineTo(W * 0.85, H * 0.38);
            ctx.lineTo(W, H * 0.54);
            ctx.lineTo(W, H);
            ctx.closePath();
            ctx.fill();
          }

          // Steel ICFES Gate sliding upward
          const gateY = -gateRise * (H * 0.88);
          ctx.fillStyle = 'rgba(24, 24, 27, 0.92)';
          ctx.fillRect(0, gateY, W, H * 0.9);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 4;
          ctx.strokeRect(12, gateY + 12, W - 24, H * 0.86);

          // Raining OMR ICFES Answer Sheets
          particles.forEach((pt, idx) => {
            const px = pt.x * W;
            const py = (pt.y * H + t * 140) % H;
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(t * 2 + idx);
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(-9, -12, 18, 24);
            ctx.fillStyle = '#e11d48';
            ctx.fillRect(-5, -6, 10, 4);
            ctx.restore();
          });

          // Laura & Monokuma V3 Saluting
          if (p < 0.85) {
            drawStudentSilhouette(W * 0.42, H * 0.62, 1.18, t, false);
          }
          drawMiniMonokuma(W * 0.64, H * 0.65, 1.3, t);

          ctx.fillStyle = '#f43f5e';
          ctx.font = '800 22px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(
            p < 0.7 ? 'SISTEMA MAESTRO: 000 / 500' : 'COMPUERTAS DEL ICFES DESBLOQUEADAS',
            W * 0.5,
            42
          );
          break;
        }
      }

      // Dramatic Danganronpa Letterbox Cinema Bars
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, W, 14);
      ctx.fillRect(0, H - 14, W, 14);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [culpritId]);

  return (
    <canvas
      ref={canvasRef}
      width={900}
      height={420}
      className="w-full max-h-[55dvh] h-auto object-contain block bg-black rounded-lg border border-zinc-800 shadow-2xl"
    />
  );
};
