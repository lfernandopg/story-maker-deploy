import React from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

export default function AudioPlayer({ 
  isPlaying, 
  onPlayPause, 
  progress, 
  duration, 
  onSeek, 
  isMuted, 
  onToggleMute,
  isMobile = false,
  showControls = true,
  t = (key) => key // Función de traducción por defecto
}) {
  const formatTime = (time) => {
    if (isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className={`absolute bottom-0 left-0 w-full ${isMobile ? 'p-3' : 'p-6'} bg-gradient-to-t from-black/90 via-black/60 to-transparent backdrop-blur-sm transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex items-center gap-2 sm:gap-4 text-white">
        <button
          onClick={onPlayPause}
          aria-label={isPlaying ? t('pause') : t('play')}
          className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-purple-600/80 hover:bg-purple-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm shadow-lg ${isMobile ? 'active:scale-95' : ''}`}
        >
          {isPlaying ? <Pause size={isMobile ? 16 : 20} /> : <Play size={isMobile ? 16 : 20} className="ml-0.5" />}
        </button>
        
        <button
          onClick={onToggleMute}
          aria-label={isMuted ? t('unmute') : t('mute')}
          className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${isMobile ? 'active:scale-95' : ''}`}
        >
          {isMuted ? <VolumeX size={isMobile ? 14 : 16} /> : <Volume2 size={isMobile ? 14 : 16} />}
        </button>

        <div className="flex-grow flex items-center gap-2 sm:gap-3">
          <span className={`text-xs font-mono text-purple-200 ${isMobile ? 'min-w-[40px]' : 'min-w-[48px]'}`}>
            {formatTime(progress)}
          </span>
          
          <div className="relative flex-grow">
            <input
              type="range"
              value={progress}
              max={duration || 0}
              onChange={onSeek}
              className={`w-full ${isMobile ? 'h-3' : 'h-2'} bg-white/20 rounded-full appearance-none cursor-pointer slider-thumb`}
              style={{
                background: 'transparent'
              }}
            />
            <div 
              className={`absolute ${isMobile ? 'top-1.5 h-1.5' : 'top-1 h-1'} left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none transition-all duration-300`}
              style={{ width: `${(progress / (duration || 1)) * 100}%` }}
            />
          </div>
          
          <span className={`text-xs font-mono text-purple-200 ${isMobile ? 'min-w-[40px]' : 'min-w-[48px]'}`}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <style jsx>{`
        .slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }
        
        .slider-thumb::-webkit-slider-track {
          background: transparent;
          height: ${isMobile ? '12px' : '8px'};
          border-radius: 6px;
        }
        
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: ${isMobile ? '20px' : '16px'};
          height: ${isMobile ? '20px' : '16px'};
          background: linear-gradient(45deg, #a855f7, #ec4899);
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 10px rgba(168, 85, 247, 0.5);
          transition: all 0.3s ease;
        }
        
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 20px rgba(168, 85, 247, 0.7);
        }
        
        .slider-thumb::-webkit-slider-thumb:active {
          transform: scale(1.3);
          box-shadow: 0 6px 25px rgba(168, 85, 247, 0.8);
        }
        
        .slider-thumb::-moz-range-track {
          background: transparent;
          height: ${isMobile ? '12px' : '8px'};
          border-radius: 6px;
          border: none;
        }
        
        .slider-thumb::-moz-range-thumb {
          width: ${isMobile ? '20px' : '16px'};
          height: ${isMobile ? '20px' : '16px'};
          background: linear-gradient(45deg, #a855f7, #ec4899);
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 10px rgba(168, 85, 247, 0.5);
        }
        
        @media (max-width: 768px) {
          .slider-thumb::-webkit-slider-thumb {
            width: 22px;
            height: 22px;
          }
          
          .slider-thumb::-moz-range-thumb {
            width: 22px;
            height: 22px;
          }
        }
      `}</style>
    </div>
  );
}