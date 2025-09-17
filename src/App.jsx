
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Play, RotateCcw, Sparkles, BookOpen, Headphones, AlertCircle, Globe, ChevronDown, Github, Linkedin, Mail, ArrowLeft, Zap, Palette, Mic, Smartphone, Languages, Code, Layers, User, Lightbulb, Rocket } from 'lucide-react';
import SceneCard from './components/SceneCard';
import { useTranslation } from './i18n';

export default function App() {
  const [language, setLanguage] = useState(
    localStorage.getItem('language') || 
    (navigator.language.startsWith('es') ? 'es' : 'en')
  );
  const { t } = useTranslation(language);
  
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'about'
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
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const audioRef = useRef(null);

  // Detectar si es dispositivo móvil
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    setShowLanguageSelector(false);
  };

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
    setCurrentView('home');
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
    if (!genre || !description) {
      setError(t('fieldsRequired'));
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Paso 1: Generar historia
      setLoadingStep(t('generatingStory'));
      
      const storyResponse = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          genre, 
          description, 
          language: language === 'es' ? 'spanish' : 'english' 
        }),
      });

      if (!storyResponse.ok) {
        const errorData = await storyResponse.json();
        throw new Error(errorData.error || t('storyGenerationError'));
      }

      const storyData = await storyResponse.json();
      
      // Paso 2: Generar imágenes
      setLoadingStep(t('creatingImages'));
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
        throw new Error(errorData.error || t('storyGenerationError'));
      }

      const imagesData = await imagesResponse.json();

      // Paso 3: Generar audios
      setLoadingStep(t('recordingNarration'));
      const audioTexts = storyData.scenes.map(scene => scene.audioText);
      
      const audioResponse = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          audioTexts,
          language: language === 'es' ? 'es-ES' : 'en-US'
        }),
      });

      if (!audioResponse.ok) {
        const errorData = await audioResponse.json();
        throw new Error(errorData.error || t('storyGenerationError'));
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
      setError(error.message || t('storyGenerationError'));
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

  const renderAboutSection = () => (
    <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 animate-fade-in">
      <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-purple-500/20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/60 hover:bg-gray-700/60 rounded-xl transition-all duration-300 text-gray-300 hover:text-white"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">{t('home')}</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t('aboutTitle')}
          </h1>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-8">
          {t('aboutDescription')}
        </p>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-purple-300 mb-4 flex items-center gap-2">
              <Zap size={20} />
              {t('aboutFeatures')}
            </h3>
            <ul className="space-y-3">
              {[
                { icon: <Sparkles size={16} />, text: t('feature1') },
                { icon: <Palette size={16} />, text: t('feature2') },
                { icon: <Mic size={16} />, text: t('feature3') },
                { icon: <Smartphone size={16} />, text: t('feature4') },
                { icon: <Languages size={16} />, text: t('feature5') }
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-400">
                  <span className="text-purple-400 mt-1">{feature.icon}</span>
                  <span className="text-sm sm:text-base">{feature.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-pink-300 mb-4 flex items-center gap-2">
              <Code size={20} />
              {t('aboutTech')}
            </h3>
            <ul className="space-y-3">
              {[
                { icon: <Layers size={16} />, text: t('tech1') },
                { icon: <Palette size={16} />, text: t('tech2') },
                { icon: <Rocket size={16} />, text: t('tech3') },
                { icon: <Mic size={16} />, text: t('tech4') },
                { icon: <Lightbulb size={16} />, text: t('tech5') }
              ].map((tech, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-400">
                  <span className="text-pink-400 mt-1">{tech.icon}</span>
                  <span className="text-sm sm:text-base">{tech.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Portfolio Skills */}
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
          <h3 className="text-xl font-semibold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-4 flex items-center gap-2">
            <User size={20} />
            {t('aboutPortfolio')}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              t('skill1'),
              t('skill2'),
              t('skill3'),
              t('skill4'),
              t('skill5')
            ].map((skill, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 mt-2"></div>
                <span className="text-gray-300 text-sm sm:text-base">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLoadingScreen = () => (
    <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in px-4">
      <div className="relative">
        <div className="w-16 sm:w-20 h-16 sm:h-20 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
        <div className="absolute inset-0 w-16 sm:w-20 h-16 sm:h-20 border-4 border-pink-500/30 border-b-pink-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      
      <div className="text-center space-y-4 max-w-md">
        <p className="text-lg sm:text-xl font-semibold text-purple-300 animate-pulse">
          ✨ {loadingStep}
        </p>
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            {t('loadingMessage')}
          </p>
          <p className="text-purple-400 text-xs sm:text-sm mt-2">
            {t('pleaseWait')}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col text-white font-sans relative overflow-hidden">
      {/* Efectos de fondo animados estilo cine */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(30,30,30,0.8),transparent_70%)] animate-pulse-slow" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(20,20,20,0.6),transparent_60%)] animate-pulse-slow" style={{ animationDelay: '1s' }} />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_40%,rgba(40,40,40,0.1)_50%,transparent_60%)]" />
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black/80 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/80 to-transparent" />
      
      {/* Navigation */}
      <nav className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentView('home')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${currentView === 'home' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-800/60'}`}
          >
            {t('home')}
          </button>
          <button
            onClick={() => setCurrentView('about')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${currentView === 'about' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-800/60'}`}
          >
            {t('about')}
          </button>
        </div>

        {/* Selector de idioma */}
        <div className="relative">
          <button
            onClick={() => setShowLanguageSelector(!showLanguageSelector)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-600/30 hover:bg-gray-700/80 transition-all duration-300"
          >
            <Globe size={16} />
            <span className="text-sm font-medium">
              {language === 'es' ? 'ES' : 'EN'}
            </span>
            <ChevronDown 
              size={14} 
              className={`transform transition-transform duration-200 ${showLanguageSelector ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {showLanguageSelector && (
            <div className="absolute top-full right-0 mt-2 bg-gray-800/95 backdrop-blur-sm rounded-lg border border-gray-600/30 overflow-hidden shadow-xl animate-fade-in">
              <button
                onClick={() => changeLanguage('es')}
                className={`w-full px-4 py-2 text-left hover:bg-gray-700/50 transition-colors duration-200 text-sm ${language === 'es' ? 'bg-purple-600/20 text-purple-300' : 'text-gray-300'}`}
              >
                {t('spanish')}
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`w-full px-4 py-2 text-left hover:bg-gray-700/50 transition-colors duration-200 text-sm ${language === 'en' ? 'bg-purple-600/20 text-purple-300' : 'text-gray-300'}`}
              >
                {t('english')}
              </button>
            </div>
          )}
        </div>
      </nav>
      
      <audio 
        ref={audioRef} 
        onTimeUpdate={onTimeUpdate} 
        onLoadedMetadata={onLoadedMetadata} 
        onEnded={nextScene}
        muted={isMuted}
      />

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-3 sm:p-6 pt-20">
        {currentView === 'about' ? (
          renderAboutSection()
        ) : loading ? (
          renderLoadingScreen()
        ) : !storyReady ? (
          <div className="relative z-10 w-full max-w-sm sm:max-w-lg">
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-purple-500/20 animate-fade-in">
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-2 sm:gap-3 mb-4">
                  <Sparkles className="text-purple-400 animate-pulse" size={isMobile ? 24 : 32} />
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {t('appTitle')}
                  </h1>
                  <BookOpen className="text-pink-400 animate-pulse" size={isMobile ? 24 : 32} />
                </div>
                <p className="text-gray-400 text-sm">{t('appSubtitle')}</p>
              </div>
              
              {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-start gap-3">
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
              
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-purple-200 font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <Sparkles size={16} />
                    {t('genre')}
                  </label>
                  <input 
                    type="text" 
                    value={genre} 
                    onChange={(e) => setGenre(e.target.value)}
                    disabled={loading}
                    className="w-full p-3 sm:p-4 rounded-xl bg-gray-800/80 border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm disabled:opacity-50 text-sm sm:text-base" 
                    placeholder={t('genrePlaceholder')}
                  />
                </div>
                
                <div>
                  <label className="block text-purple-200 font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <BookOpen size={16} />
                    {t('description')}
                  </label>
                  <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                    className="w-full p-3 sm:p-4 rounded-xl bg-gray-800/80 border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm min-h-[100px] sm:min-h-[120px] resize-none disabled:opacity-50 text-sm sm:text-base" 
                    placeholder={t('descriptionPlaceholder')}
                  />
                </div>
                
                <button 
                  onClick={handleGenerate}
                  disabled={loading || !genre || !description}
                  className={`w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 font-semibold text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-3 ${isMobile ? 'active:scale-95' : ''}`}
                >
                  <Sparkles size={20} />
                  {t('generateStory')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 w-full animate-fade-in">
            {autoplayBlocked && !isPlaying && (
              <div className="mb-6 sm:mb-8 text-center bg-gray-800/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-purple-500/20 animate-bounce-in mx-4 sm:mx-0">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Headphones className="text-purple-400" size={isMobile ? 20 : 24} />
                  <p className="text-base sm:text-lg">{t('adventureReady')}</p>
                </div>
                <button 
                  onClick={handleStartStory} 
                  className={`px-6 sm:px-8 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 transition-all duration-300 text-base sm:text-lg font-semibold flex items-center gap-3 mx-auto hover:shadow-lg hover:shadow-green-500/25 ${isMobile ? 'active:scale-95' : ''}`}
                >
                  <Play size={18} />
                  {t('startStory')}
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
                isMobile={isMobile}
                t={t}
              />
            )}

            {/* Información y controles adicionales */}
            <div className="mt-6 sm:mt-8 text-center space-y-4 px-4 sm:px-0">
              <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
                <span className="px-3 sm:px-4 py-1 sm:py-2 bg-purple-600/20 rounded-full text-purple-200 font-semibold border border-purple-500/30 text-sm sm:text-base">
                  {t('scene')} {current + 1} {t('of')} {scenes.length}
                </span>
                <button
                  onClick={resetStory}
                  className={`px-3 sm:px-4 py-1 sm:py-2 bg-gray-600/20 hover:bg-gray-500/30 rounded-full text-gray-300 hover:text-white transition-all duration-300 flex items-center gap-2 border border-gray-500/30 text-sm sm:text-base ${isMobile ? 'active:scale-95' : ''}`}
                >
                  <RotateCcw size={14} />
                  {t('newStory')}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800/50 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-gray-400 text-sm">
                {t('footerText')} <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text font-semibold">Luis Fernando</span>
              </p>
              <p className="text-gray-500 text-xs mt-1">{t('footerSubtext')}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/lfernandopg" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-purple-400 transition-colors duration-300 hover:scale-110"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a 
                href="https://linkedin.com/in/lfernandopg" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-purple-400 transition-colors duration-300 hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a 
                href="mailto:lfernandopg@gmail.com"
                className="p-2 text-gray-400 hover:text-purple-400 transition-colors duration-300 hover:scale-110"
                aria-label={t('contact')}
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-800/50 text-center">
            <p className="text-gray-500 text-xs">
              © 2025 StoryMaker AI. {t('footerRights')}.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
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
        .slider-thumb::-moz-range-thumb {
          width: ${isMobile ? '20px' : '16px'};
          height: ${isMobile ? '20px' : '16px'};
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