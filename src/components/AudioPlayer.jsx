import React from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';


export default function AudioPlayer({ isPlaying, onPlayPause, progress, duration, onSeek, isMuted, onToggleMute }) {
  const formatTime = (time) => {
    if (isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent backdrop-blur-sm hidden transition-opacity duration-300 group-hover:block group-hover:opacity-100 opacity-0">
      <div className="flex items-center gap-4 text-white">
        <button
          onClick={onPlayPause}
          className="w-12 h-12 bg-purple-600/80 hover:bg-purple-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm shadow-lg"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
        </button>
        
        <button
          onClick={onToggleMute}
          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        <div className="flex-grow flex items-center gap-3">
          <span className="text-sm font-mono text-purple-200 min-w-[48px]">
            {formatTime(progress)}
          </span>
          
          <div className="relative flex-grow">
            <input
              type="range"
              value={progress}
              max={duration || 0}
              onChange={onSeek}
              className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider-thumb"
            />
            <div 
              className="absolute top-2 left-0 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none transition-all duration-300"
              style={{ width: `${(progress / (duration || 1)) * 97}%` }}
            />
          </div>
          
          <span className="text-sm font-mono text-purple-200 min-w-[48px]">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}