// src/i18n.js
export const translations = {
  es: {
    // Header
    appTitle: "StoryMaker AI",
    appSubtitle: "Genera historias inmersivas con narración e imágenes",
    
    // Form
    genre: "Género",
    genrePlaceholder: "Ej: Fantasía épica, Ciencia ficción, Misterio...",
    description: "Descripción de la historia",
    descriptionPlaceholder: "Describe tu historia: personajes, conflicto, ambientación...",
    generateStory: "Generar Historia",
    
    // Loading states
    creatingMagic: "Creando magia...",
    generatingStory: "Generando historia con IA...",
    creatingImages: "Creando imágenes mágicas...",
    recordingNarration: "Grabando narración...",
    loadingMessage: "Esto puede tomar unos minutos...",
    
    // Story player
    adventureReady: "¡Tu aventura está lista para comenzar!",
    startStory: "Iniciar Historia",
    scene: "Escena",
    of: "de",
    newStory: "Nueva Historia",
    
    // Controls
    previousScene: "Escena anterior",
    nextScene: "Siguiente escena",
    playPause: "Reproducir/Pausar",
    mute: "Silenciar",
    unmute: "Activar sonido",
    
    // Errors
    error: "Error",
    storyGenerationError: "Hubo un problema generando tu historia. Por favor intenta de nuevo.",
    fieldsRequired: "Género y descripción son requeridos",
    
    // Language selector
    language: "Idioma",
    spanish: "Español",
    english: "English"
  },
  
  en: {
    // Header
    appTitle: "StoryMaker AI",
    appSubtitle: "Generate immersive stories with narration and images",
    
    // Form
    genre: "Genre",
    genrePlaceholder: "e.g: Epic Fantasy, Science Fiction, Mystery...",
    description: "Story Description",
    descriptionPlaceholder: "Describe your story: characters, conflict, setting...",
    generateStory: "Generate Story",
    
    // Loading states
    creatingMagic: "Creating magic...",
    generatingStory: "Generating story with AI...",
    creatingImages: "Creating magical images...",
    recordingNarration: "Recording narration...",
    loadingMessage: "This may take a few minutes...",
    
    // Story player
    adventureReady: "Your adventure is ready to begin!",
    startStory: "Start Story",
    scene: "Scene",
    of: "of",
    newStory: "New Story",
    
    // Controls
    previousScene: "Previous scene",
    nextScene: "Next scene",
    playPause: "Play/Pause",
    mute: "Mute",
    unmute: "Unmute",
    
    // Errors
    error: "Error",
    storyGenerationError: "There was a problem generating your story. Please try again.",
    fieldsRequired: "Genre and description are required",
    
    // Language selector
    language: "Language",
    spanish: "Español",
    english: "English"
  }
};

// Hook para usar traducciones
export const useTranslation = (language = 'es') => {
  const t = (key) => {
    return translations[language]?.[key] || translations.es[key] || key;
  };
  
  return { t };
};