import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Play, RotateCcw, Sparkles, BookOpen, Headphones, AlertCircle } from 'lucide-react';
import SceneCard from './components/SceneCard';

export default function App() {
  const [genre, setGenre] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [scenes, setScenes] = useState([]);
  const [current, setCurrent] = useState(0);
  const [storyReady, setStoryReady] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState('');

  const audioRef = useRef(null);

  const playAudio = useCallback(async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setAutoplayBlocked(false);
      } catch (error) {
        console.warn('Autoplay fue bloqueado por el navegador:', error);
        setIsPlaying(false);
        setAutoplayBlocked(true);
      }
    }
  }, []);

  const nextScene = useCallback(() => {
    if (current < scenes.length - 1) setCurrent(current + 1);
  }, [current, scenes.length]);

  const prevScene = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const resetStory = () => {
    setStoryReady(false);
    setScenes([]);
    setCurrent(0);
    setIsPlaying(false);
    setGenre('');
    setDescription('');
    setError('');
  };

  useEffect(() => {
    if (storyReady && scenes.length > 0 && scenes[current]?.audio) {
      const audio = audioRef.current;
      audio.src = scenes[current].audio;
      audio.load();
      playAudio();
    }
  }, [current, scenes, storyReady, playAudio]);

  const handleGenerate = async () => {
    if (!genre || !description) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Paso 1: Generar historia con Gemini
      setLoadingStep('Generando historia con IA...');
      
      const storyResponse = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ genre, description }),
      });

      if (!storyResponse.ok) {
        const errorData = await storyResponse.json();
        throw new Error(errorData.error || 'Error generando historia');
      }

      const storyData = await storyResponse.json();
      
      // Paso 2: Generar imágenes
      setLoadingStep('Creando imágenes mágicas...');
      const imagePrompts = storyData.scenes.map(scene => scene.imagePrompt);
      
      const imagesResponse = await fetch('/api/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imagePrompts }),
      });

      if (!imagesResponse.ok) {
        const errorData = await imagesResponse.json();
        throw new Error(errorData.error || 'Error generando imágenes');
      }

      const imagesData = await imagesResponse.json();

      // Paso 3: Generar audios
      setLoadingStep('Grabando narración...');
      const audioTexts = storyData.scenes.map(scene => scene.audioText);
      
      const audioResponse = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audioTexts }),
      });

      if (!audioResponse.ok) {
        const errorData = await audioResponse.json();
        throw new Error(errorData.error || 'Error generando audios');
      }

      const audioData = await audioResponse.json();

      // Combinar todos los datos
      const completeScenes = storyData.scenes.map((scene, index) => ({
        ...scene,
        image: imagesData.images[index],
        audio: audioData.audioUrls[index]
      }));

      setScenes(completeScenes);
      setCurrent(0);
      setStoryReady(true);

    } catch (error) {
      console.error('Error en generación:', error);
      setError(error.message || 'Hubo un problema generando tu historia. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleStartStory = () => {
    playAudio();
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const newTime = e.target.value;
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  const toggleMute = () => {
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const onTimeUpdate = () => setProgress(audioRef.current.currentTime);
  const onLoadedMetadata = () => setDuration(audioRef.current.duration);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center text-white font-sans p-6 relative overflow-hidden">
      {/* Efectos de fondo animados estilo cine */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(30,30,30,0.8),transparent_70%)] animate-pulse-slow" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(20,20,20,0.6),transparent_60%)] animate-pulse-slow" style={{ animationDelay: '1s' }} />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_40%,rgba(40,40,40,0.1)_50%,transparent_60%)]" />
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black/80 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/80 to-transparent" />
      <audio 
        ref={audioRef} 
        onTimeUpdate={onTimeUpdate} 
        onLoadedMetadata={onLoadedMetadata} 
        onEnded={nextScene}
        muted={isMuted}
      />

      {!storyReady ? (
        <div className="relative z-10 w-full max-w-lg">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-purple-500/20 animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <Sparkles className="text-purple-400 animate-pulse" size={32} />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  StoryForge AI
                </h1>
                <BookOpen className="text-pink-400 animate-pulse" size={32} />
              </div>
              <p className="text-gray-400 text-sm">Genera historias inmersivas con narración e imágenes</p>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center gap-3">
                <AlertCircle className="text-red-400" size={20} />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <label className="block text-purple-200 font-semibold mb-2 flex items-center gap-2">
                  <Sparkles size={16} />
                  Género
                </label>
                <input 
                  type="text" 
                  value={genre} 
                  onChange={(e) => setGenre(e.target.value)}
                  disabled={loading}
                  className="w-full p-4 rounded-xl bg-gray-800/80 border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm disabled:opacity-50" 
                  placeholder="Ej: Fantasía épica, Ciencia ficción, Misterio..." 
                />
              </div>
              
              <div>
                <label className="block text-purple-200 font-semibold mb-2 flex items-center gap-2">
                  <BookOpen size={16} />
                  Descripción de la historia
                </label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  className="w-full p-4 rounded-xl bg-gray-800/80 border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm min-h-[120px] resize-none disabled:opacity-50" 
                  placeholder="Describe tu historia: personajes, conflicto, ambientación..." 
                />
              </div>
              
              <button 
                onClick={handleGenerate}
                disabled={loading || !genre || !description}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {loadingStep || 'Creando magia...'}
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generar Historia
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
            <div className="absolute inset-0 w-20 h-20 border-4 border-pink-500/30 border-b-pink-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <div className="text-center space-y-2">
            <p className="text-xl font-semibold text-purple-300 animate-pulse">✨ {loadingStep}</p>
            <p className="text-gray-400">Esto puede tomar unos momentos...</p>
          </div>
        </div>
      ) : (
        <div className="relative z-10 w-full animate-fade-in">
          {autoplayBlocked && !isPlaying && (
            <div className="mb-8 text-center bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl border border-purple-500/20 animate-bounce-in">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Headphones className="text-purple-400" size={24} />
                <p className="text-lg">¡Tu aventura está lista para comenzar!</p>
              </div>
              <button 
                onClick={handleStartStory} 
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 transition-all duration-300 text-lg font-semibold flex items-center gap-3 mx-auto hover:shadow-lg hover:shadow-green-500/25"
              >
                <Play size={20} />
                Iniciar Historia
              </button>
            </div>
          )}

          {scenes[current] && (
            <SceneCard
              scene={scenes[current]}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              progress={progress}
              duration={duration}
              onSeek={handleSeek}
              onNext={nextScene}
              onPrev={prevScene}
              isFirst={current === 0}
              isLast={current === scenes.length - 1}
              isMuted={isMuted}
              onToggleMute={toggleMute}
            />
          )}

          {/* Información y controles adicionales */}
          <div className="mt-8 text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <span className="px-4 py-2 bg-purple-600/20 rounded-full text-purple-200 font-semibold border border-purple-500/30">
                Escena {current + 1} de {scenes.length}
              </span>
              <button
                onClick={resetStory}
                className="px-4 py-2 bg-gray-600/20 hover:bg-gray-500/30 rounded-full text-gray-300 hover:text-white transition-all duration-300 flex items-center gap-2 border border-gray-500/30"
              >
                <RotateCcw size={16} />
                Nueva Historia
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
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
        .slider-thumb::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: linear-gradient(45deg, #a855f7, #ec4899);
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 10px rgba(168, 85, 247, 0.5);
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.8); }
          60% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(168, 85, 247, 0.5); }
          50% { text-shadow: 0 0 30px rgba(236, 72, 153, 0.7); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-slide-up { animation: slide-up 0.8s ease-out 0.2s both; }
        .animate-bounce-in { animation: bounce-in 0.6s ease-out; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}