import React, {useState}  from 'react';
import AudioPlayer from './AudioPlayer';
import { ChevronLeft, ChevronRight } from 'lucide-react';


export default function SceneCard({ scene, isPlaying, onPlayPause, progress, duration, onSeek, onNext, onPrev, isFirst, isLast, isMuted, onToggleMute }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Texto de la escena con animaciones */}
      <div className="mb-8 text-center space-y-4 animate-fade-in">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent animate-pulse-glow">
          {scene.title}
        </h2>
        <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto px-4 animate-slide-up">
          {scene.text}
        </p>
      </div>

      {/* Contenedor principal con efectos visuales mejorados */}
      <div className="relative group rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-500/20 transition-all duration-500 hover:shadow-purple-500/25 hover:shadow-2xl">
        {/* Efectos de fondo animados */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-pink-600/10 opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.1),transparent_70%)] animate-pulse-slow" />
        
        {/* Imagen con efectos de carga */}
        <div className="relative overflow-hidden rounded-2xl">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50 animate-pulse flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
            </div>
          )}
          <img
            src={scene.image}
            alt={scene.title}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-[500px] object-cover transition-all duration-700 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'} group-hover:scale-105`}
          />
        </div>

        {/* Botón de navegación anterior mejorado */}
        <button
          onClick={onPrev}
          disabled={isFirst}
          aria-label="Escena anterior"
          className="absolute top-1/2 left-6 -translate-y-1/2 w-14 h-14 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-purple-600/80 hover:scale-110 disabled:opacity-20 disabled:cursor-not-allowed backdrop-blur-md border border-white/20"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Botón de navegación siguiente mejorado */}
        <button
          onClick={onNext}
          disabled={isLast}
          aria-label="Siguiente escena"
          className="absolute top-1/2 right-6 -translate-y-1/2 w-14 h-14 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-purple-600/80 hover:scale-110 disabled:opacity-20 disabled:cursor-not-allowed backdrop-blur-md border border-white/20"
        >
          <ChevronRight size={24} />
        </button>

        {/* Reproductor de audio */}
        <AudioPlayer
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          progress={progress}
          duration={duration}
          onSeek={onSeek}
          isMuted={isMuted}
          onToggleMute={onToggleMute}
        />
      </div>
    </div>
  );
}