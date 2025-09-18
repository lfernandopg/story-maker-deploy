// src/i18n.js
export const translations = {
  es: {
    // Header
    appTitle: "StoryMaker AI",
    appSubtitle: "Genera historias inmersivas con narración e imágenes",
    
    // Navigation
    home: "Inicio",
    about: "Acerca de",
    
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
    loadingMessage: "La magia está tomando forma. Cada historia única requiere tiempo para crear las imágenes perfectas y la narración envolvente que mereces.",
    pleaseWait: "Por favor, ten paciencia mientras nuestros algoritmos trabajan...",
    
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
    english: "English",
    
    // About section
    aboutTitle: "Acerca de StoryMaker AI",
    aboutDescription: "StoryMaker AI es una aplicación innovadora que combina inteligencia artificial de vanguardia para crear experiencias narrativas inmersivas y personalizadas.",
    aboutFeatures: "Características principales:",
    feature1: "Generación de historias usando Google Gemini AI",
    feature2: "Creación de imágenes cinematográficas con IA",
    feature3: "Narración de voz profesional con Amazon Polly",
    feature4: "Interfaz optimizada para dispositivos móviles",
    feature5: "Soporte multiidioma (Español/Inglés)",
    aboutTech: "Tecnologías utilizadas:",
    tech1: "React 18 + Vite para una interfaz moderna",
    tech2: "Tailwind CSS para diseño responsivo",
    tech3: "Vercel Serverless Functions para escalabilidad",
    tech4: "AWS Polly para síntesis de voz natural",
    tech5: "Google Gemini AI para contenido inteligente",
    aboutPortfolio: "Esta aplicación forma parte de mi portafolio de desarrollo, demostrando competencias en:",
    skill1: "Integración de múltiples APIs de IA",
    skill2: "Desarrollo full-stack con arquitectura serverless",
    skill3: "Diseño UX/UI centrado en el usuario",
    skill4: "Optimización para dispositivos móviles",
    skill5: "Internacionalización y accesibilidad",
    
    // Footer
    footerText: "Desarrollado por",
    footerSubtext: "Creando experiencias digitales innovadoras",
    footerRights: "Todos los derechos reservados",
    portfolio: "Portafolio",
    contact: "Contacto"
  },
  
  en: {
    // Header
    appTitle: "StoryMaker AI",
    appSubtitle: "Generate immersive stories with narration and images",
    
    // Navigation
    home: "Home",
    about: "About",
    
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
    loadingMessage: "Magic is taking shape. Each unique story requires time to create the perfect images and immersive narration you deserve.",
    pleaseWait: "Please be patient while our algorithms work their magic...",
    
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
    english: "English",
    
    // About section
    aboutTitle: "About StoryMaker AI",
    aboutDescription: "StoryMaker AI is an innovative application that combines cutting-edge artificial intelligence to create immersive and personalized narrative experiences.",
    aboutFeatures: "Key Features:",
    feature1: "Story generation using Google Gemini AI",
    feature2: "Cinematic image creation with AI",
    feature3: "Professional voice narration with Amazon Polly",
    feature4: "Mobile-optimized interface",
    feature5: "Multi-language support (Spanish/English)",
    aboutTech: "Technologies used:",
    tech1: "React 18 + Vite for modern interface",
    tech2: "Tailwind CSS for responsive design",
    tech3: "Vercel Serverless Functions for scalability",
    tech4: "AWS Polly for natural voice synthesis",
    tech5: "Google Gemini AI for intelligent content",
    aboutPortfolio: "This application is part of my development portfolio, demonstrating skills in:",
    skill1: "Multi-AI API integration",
    skill2: "Full-stack development with serverless architecture",
    skill3: "User-centered UX/UI design",
    skill4: "Mobile device optimization",
    skill5: "Internationalization and accessibility",
    
    // Footer
    footerText: "Developed by",
    footerSubtext: "Creating innovative digital experiences",
    footerRights: "All rights reserved",
    portfolio: "Portfolio",
    contact: "Contact"
  }
};

// Hook para usar traducciones
export const useTranslation = (language = 'es') => {
  const t = (key) => {
    return translations[language]?.[key] || translations.es[key] || key;
  };
  
  return { t };
};