# StoryForge AI - Generador de Historias con IA

Una aplicación que genera historias inmersivas con narración e imágenes usando IA.

## 🚀 Tecnologías

- **Frontend**: React + Next.js + Tailwind CSS
- **Backend**: Serverless Functions (Vercel)
- **IA**: Gemini (texto) + ElevenLabs (audio) + HuggingFace (imágenes)
- **Deploy**: Vercel (capa gratuita)

## 📋 Requisitos Previos

### 1. Obtener API Keys (todas gratuitas)

#### Gemini API (Google AI Studio)
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una cuenta o inicia sesión
3. Genera una nueva API key
4. **Límite gratuito**: 60 requests por minuto

#### ElevenLabs API
1. Ve a [ElevenLabs](https://elevenlabs.io/app/speech-synthesis)
2. Crea una cuenta gratuita
3. Ve a Profile → API Keys
4. **Límite gratuito**: 10,000 caracteres por mes

#### HuggingFace API
1. Ve a [HuggingFace](https://huggingface.co/settings/tokens)
2. Crea una cuenta
3. Genera un Access Token
4. **Límite gratuito**: Generoso para uso personal

## 🛠️ Instalación

### 1. Clonar y configurar el proyecto

```bash
# Si tienes el proyecto existente
cd tu-proyecto-react

# Instalar dependencias adicionales
npm install @google/generative-ai @huggingface/inference next
```

### 2. Estructura de archivos

Crea los siguientes archivos en tu proyecto:

```
tu-proyecto/
├── api/
│   ├── generate-story.js
│   ├── generate-images.js
│   └── generate-audio.js
├── .env.local
├── .env.example
├── next.config.js
├── vercel.json
└── package.json (actualizado)
```

### 3. Configurar variables de entorno

```bash
# Copia el archivo de ejemplo
cp .env.example .env.local

# Edita .env.local y agrega tus API keys
GEMINI_API_KEY=tu_gemini_api_key_aqui
ELEVENLABS_API_KEY=tu_elevenlabs_api_key_aqui
HUGGINGFACE_API_KEY=tu_huggingface_api_key_aqui
```

### 4. Actualizar archivos existentes

- Reemplaza tu `App.jsx` con la versión actualizada
- Los componentes `SceneCard.jsx` y `AudioPlayer.jsx` no necesitan cambios
- Puedes eliminar el archivo `data/scenes.js` (ya no es necesario)

## 🚀 Deploy en Vercel

### 1. Preparar para deploy

```bash
# Asegúrate de que el build funciona localmente
npm run build
```

### 2. Deploy automático

1. Conecta tu repositorio a [Vercel](https://vercel.com)
2. Vercel detectará automáticamente que es un proyecto Next.js
3. Agrega las variables de entorno en el dashboard de Vercel:
   - Settings → Environment Variables
   - Agrega: `GEMINI_API_KEY`, `ELEVENLABS_API_KEY`, `HUGGINGFACE_API_KEY`

### 3. Deploy manual (alternativo)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Agregar variables de entorno
vercel env add GEMINI_API_KEY
vercel env add ELEVENLABS_API_KEY
vercel env add HUGGINGFACE_API_KEY

# Re-deploy
vercel --prod
```

## 🎯 Uso

1. Ingresa un género (ej: "Fantasía épica", "Ciencia ficción")
2. Describe tu historia (personajes, conflicto, ambientación)
3. Haz clic en "Generar Historia"
4. Espera mientras la IA crea:
   - ✍️ Guión (Gemini)
   - 🖼️ Imágenes (HuggingFace)
   - 🎙️ Narración (ElevenLabs)
5. ¡Disfruta tu historia interactiva!

## 📊 Límites y Optimizaciones

### Límites de APIs Gratuitas
- **Gemini**: 60 requests/min
- **ElevenLabs**: 10,000 caracteres/mes
- **HuggingFace**: Rate limit flexible
- **Vercel**: 10 segundos máximo por function

### Optimizaciones Implementadas
- ⏱️ Timeouts configurados (9 segundos)
- 🔄 Retry logic y fallbacks
- 📦 Imágenes placeholder si falla generación
- 🔇 Audio silencioso si falla ElevenLabs
- ⚡ Requests secuenciales para respetar rate limits

## 🐛 Solución de Problemas

### Error de CORS
- Verifica que `next.config.js` esté configurado correctamente
- Las headers CORS están configuradas en cada API

### Error de API Keys
- Verifica que las variables de entorno estén correctamente configuradas en Vercel
- Las keys deben estar en formato correcto (sin espacios extra)

### Error de Rate Limit
- ElevenLabs: Reduce la longitud del texto o usa menos escenas
- HuggingFace: Espera unos minutos entre generaciones

### Error de Deploy
- Verifica que `next.config.js` y `vercel.json` estén presentes
- Revisa los logs en el dashboard de Vercel

## 🔧 Personalización

### Cambiar modelo de IA
```javascript
// En api/generate-story.js, línea 24
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
// Cambiar por: gemini-1.5-flash, etc.
```

### Cambiar voz de narración
```javascript
// En api/generate-audio.js, línea 20
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Rachel
// Cambiar por otro voice_id de ElevenLabs
```

### Cambiar modelo de imágenes
```javascript
// En api/generate-images.js, línea 25
model: 'runwayml/stable-diffusion-v1-5'
// Cambiar por: 'stabilityai/stable-diffusion-xl-base-1.0', etc.
```

## 📝 Licencia

MIT License - Siéntete libre de usar este código para tus proyectos.

---

¿Problemas? Abre un issue en GitHub o consulta la documentación de las APIs utilizadas.