import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';

export default function SceneCard({ 
  scene, 
  isPlaying, 
  onPlayPause, 
  progress, 
  duration, 
  onSeek, 
  onNext, 
  onPrev, 
  isFirst, 
  isLast, 
  isMuted, 
  onToggleMute,
  isMobile,
  t 
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const formatTime = (time) => {
    if (isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className={`w-full ${isMobile ? 'max-w-full mx-2' : 'max-w-4xl mx-auto'}`}>
      {/* Texto de la escena con animaciones */}
      <div className={`${isMobile ? 'mb-4 px-2' : 'mb-8'} text-center space-y-2 sm:space-y-4 animate-fade-in`}>
        <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent animate-pulse-glow`}>
          {scene.title}
        </h2>
        <p className={`text-gray-300 ${isMobile ? 'text-base px-2' : 'text-lg'} leading-relaxed max-w-3xl mx-auto animate-slide-up`}>
          {scene.text}
        </p>
      </div>

      {/* Contenedor principal con efectos visuales mejorados */}
      <div 
        className="relative group rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-500/20 transition-all duration-500 hover:shadow-purple-500/25 hover:shadow-2xl"
        onTouchStart={() => isMobile && setShowControls(true)}
        onTouchEnd={() => isMobile && setTimeout(() => setShowControls(false), 3000)}
      >
        {/* Efectos de fondo animados */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-pink-600/10 opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.1),transparent_70%)] animate-pulse-slow" />
        
        {/* Imagen con efectos de carga */}
        <div className="relative overflow-hidden rounded-2xl">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50 animate-pulse flex items-center justify-center">
              <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin`} />
            </div>
          )}
          <img
            src={scene.image}
            alt={scene.title}
            onLoad={() => setImageLoaded(true)}
            className={`w-full ${isMobile ? 'h-64 sm:h-80' : 'h-[500px]'} object-cover transition-all duration-700 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'} group-hover:scale-105`}
          />
        </div>

        {/* Controles de navegación mejorados para móvil */}
        {!isFirst && (
          <button
            onClick={onPrev}
            disabled={isFirst}
            aria-label={t('previousScene')}
            className={`absolute top-1/2 -translate-y-1/2 ${isMobile ? 'left-2 w-12 h-12' : 'left-6 w-14 h-14'} bg-black/60 text-white rounded-full flex items-center justify-center ${isMobile ? (showControls ? 'opacity-90' : 'opacity-60') : 'opacity-0 group-hover:opacity-100'} transition-all duration-300 hover:bg-purple-600/80 hover:scale-110 disabled:opacity-20 disabled:cursor-not-allowed backdrop-blur-md border border-white/20 active:scale-95`}
          >
            <ChevronLeft size={isMobile ? 20 : 24} />
          </button>
        )}

        {!isLast && (
          <button
            onClick={onNext}
            disabled={isLast}
            aria-label={t('nextScene')}
            className={`absolute top-1/2 -translate-y-1/2 ${isMobile ? 'right-2 w-12 h-12' : 'right-6 w-14 h-14'} bg-black/60 text-white rounded-full flex items-center justify-center ${isMobile ? (showControls ? 'opacity-90' : 'opacity-60') : 'opacity-0 group-hover:opacity-100'} transition-all duration-300 hover:bg-purple-600/80 hover:scale-110 disabled:opacity-20 disabled:cursor-not-allowed backdrop-blur-md border border-white/20 active:scale-95`}
          >
            <ChevronRight size={isMobile ? 20 : 24} />
          </button>
        )}

        {/* Reproductor de audio optimizado para móvil */}
        <div className={`absolute bottom-0 left-0 w-full ${isMobile ? 'p-3' : 'p-6'} bg-gradient-to-t from-black/90 via-black/60 to-transparent backdrop-blur-sm transition-opacity duration-300 ${isMobile ? (showControls ? 'opacity-100' : 'opacity-0') : 'opacity-0 group-hover:opacity-100'}`}>
          <div className="flex items-center gap-2 sm:gap-4 text-white">
            <button
              onClick={onPlayPause}
              aria-label={t('playPause')}
              className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-purple-600/80 hover:bg-purple-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm shadow-lg active:scale-95`}
            >
              {isPlaying ? <Pause size={isMobile ? 16 : 20} /> : <Play size={isMobile ? 16 : 20} className="ml-0.5" />}
            </button>
            
            <button
              onClick={onToggleMute}
              aria-label={isMuted ? t('unmute') : t('mute')}
              className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm active:scale-95`}
            >
              {isMuted ? <VolumeX size={isMobile ? 14 : 16} /> : <Volume2 size={isMobile ? 14 : 16} />}
            </button>

            <div className="flex-grow flex items-center gap-2 sm:gap-3">
              <span className={`text-xs ${isMobile ? 'font-mono' : 'font-mono'} text-purple-200 ${isMobile ? 'min-w-[40px]' : 'min-w-[48px]'}`}>
                {formatTime(progress)}
              </span>
              
              <div className="relative flex-grow">
                <input
                  type="range"
                  value={progress}
                  max={duration || 0}
                  onChange={onSeek}
                  className={`w-full ${isMobile ? 'h-3' : 'h-2'} bg-white/20 rounded-full appearance-none cursor-pointer slider-thumb`}
                />
                <div 
                  className={`absolute ${isMobile ? 'top-1 h-3' : 'top-2 h-2'} left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none transition-all duration-300`}
                  style={{ width: `${(progress / (duration || 1)) * 97}%` }}
                />
              </div>
              
              <span className={`text-xs ${isMobile ? 'font-mono' : 'font-mono'} text-purple-200 ${isMobile ? 'min-w-[40px]' : 'min-w-[48px]'}`}>
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Indicador para móvil */}
        {isMobile && !showControls && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white/80 animate-pulse">
            Toca para controles
          </div>
        )}
      </div>
    </div>
  );
}