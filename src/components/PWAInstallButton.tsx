import React, { useState } from 'react';
import { Check, Copy, Download, Smartphone, WifiOff, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { sfx } from '../utils/sound';

export const PWAInstallButton: React.FC<{ variant?: 'title' | 'header' }> = ({
  variant = 'title',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [copied, setCopied] = useState(false);

  if (isInstalled) {
    return null;
  }

  // Direct Chromium/Android install when prompt is available in header compact mode
  if (variant === 'header') {
    if (isInstallable) {
      return (
        <button
          onClick={() => {
            sfx.click();
            void install();
          }}
          className="px-3 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold text-xs whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Instalar App</span>
        </button>
      );
    }
    return null;
  }

  const handlePrimaryClick = async () => {
    sfx.click();
    if (isInstallable) {
      const ok = await install();
      if (!ok) setShowGuide(true);
    } else {
      setShowGuide(true);
    }
  };

  const currentUrl =
    typeof window !== 'undefined' ? window.location.origin : '';

  const copyUrl = async () => {
    if (!currentUrl) return;
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <>
      <button
        onClick={handlePrimaryClick}
        className="px-5 sm:px-6 py-3 sm:py-3.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/60 text-emerald-300 font-display font-bold text-lg sm:text-xl rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer"
      >
        <Smartphone className="w-5 h-5" />
        {isInstallable ? 'Instalar App (Android / PC)' : 'Instalar · APK / EXE'}
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-700 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src="/pwa-192x192.png"
                  alt="Icono Saber Mortal 11°"
                  className="w-12 h-12 rounded-xl border border-zinc-700 object-cover shrink-0 shadow-lg"
                />
                <div>
                  <h3 className="font-display font-extrabold text-xl text-white">
                    Instalar en Android (.APK) y PC (.EXE)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    PWA Offline + Capacitor (Android) + Electron (Windows)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs sm:text-sm text-zinc-200">
                <div className="font-bold text-cyan-300">
                  Instalación directa en iPhone / iPad (Safari):
                </div>
                <p>
                  1. Toca el botón <strong>Compartir</strong> en la barra de Safari.
                  <br />
                  2. Desliza y selecciona <strong>Agregar a inicio</strong>.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs sm:text-sm text-zinc-200">
                <div className="font-bold text-emerald-300">
                  1. Instalar directo en Android o PC sin compilar (Chrome / Edge):
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  Abre el juego en <strong>Chrome</strong> o <strong>Edge</strong> y
                  toca el icono de <strong>Instalar aplicación</strong> en la barra
                  (o en el menú <strong>⋮</strong> en Android). Se creará una app
                  independiente en tu celular o escritorio de PC con su icono y modo
                  offline.
                </p>
              </div>
            )}

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs sm:text-sm text-zinc-200">
              <div className="font-bold text-cyan-300">
                2. Generar archivos binarios .APK (Android) y .EXE (Windows):
              </div>
              <p className="text-zinc-300 leading-relaxed">
                Este servidor web no incluye Android SDK ni compiladores de Windows
                para exportar los binarios directamente aquí, pero ya quedó todo
                configurado: usa el workflow{' '}
                <code className="text-amber-300">
                  Build Android APK and Windows EXE
                </code>{' '}
                en GitHub Actions (genera ambos instaladores automáticamente), o
                pega esta URL en <strong>PWABuilder.com</strong> para tu{' '}
                <strong>.apk</strong>.
              </p>

              {currentUrl && (
                <div className="flex items-center gap-2 pt-1">
                  <code className="flex-1 truncate px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300">
                    {currentUrl}
                  </code>
                  <button
                    onClick={copyUrl}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white cursor-pointer shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copiar URL
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowGuide(false)}
                className="px-5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-display font-extrabold text-sm cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-zinc-950 shadow-lg">
      <WifiOff className="w-3.5 h-3.5" />
      Modo Offline — Usando datos en caché
    </div>
  );
};
