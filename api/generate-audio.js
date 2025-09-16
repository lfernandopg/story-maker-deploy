// api/generate-audio.js
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';

// Configuración de voces disponibles por idioma
const VOICE_CONFIGS = {
  'es-ES': { // Español (España)
    standard: ['Conchita', 'Enrique'],
    neural: ['Lupe', 'Conchita'],
    default: 'Lupe'
  },
  'es-MX': { // Español (México)
    standard: ['Mia'],
    neural: ['Andrés', 'Mia'], 
    default: 'Mia'
  },
  'es-US': { // Español (Estados Unidos)
    standard: ['Penélope', 'Miguel'],
    neural: ['Lupe', 'Penélope'],
    default: 'Lupe'
  },
  'en-US': { // Inglés (Estados Unidos)
    standard: ['Joanna', 'Matthew', 'Kimberly', 'Justin'],
    neural: ['Joanna', 'Matthew', 'Ruth', 'Stephen', 'Olivia', 'Kevin'],
    default: 'Joanna'
  },
  'en-GB': { // Inglés (Reino Unido)
    standard: ['Emma', 'Brian', 'Amy'],
    neural: ['Emma', 'Brian', 'Arthur'],
    default: 'Emma'
  }
};

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Configure Amazon Polly client
  const pollyClient = new PollyClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  try {
    const { 
      audioTexts, 
      language = 'es-ES',
      voiceType = 'standard',
      voice = null,
      speed = 'medium',
      outputFormat = 'mp3'
    } = req.body;

    if (!audioTexts || !Array.isArray(audioTexts)) {
      return res.status(400).json({ error: 'audioTexts debe ser un array' });
    }

    console.log(`🎵 Generando ${audioTexts.length} audios con Amazon Polly...`);
    console.log(`🗣️ Idioma: ${language}, Tipo: ${voiceType}, Formato: ${outputFormat}`);

    const audioUrls = [];
    const results = [];

    // Seleccionar voz automáticamente si no se especifica
    const selectedVoice = voice || getDefaultVoice(language, voiceType);
    console.log(`🎤 Usando voz: ${selectedVoice}`);

    // Generar audios secuencialmente para evitar límites de rate
    for (let i = 0; i < audioTexts.length; i++) {
      try {
        console.log(`🎵 Generando audio ${i + 1}/${audioTexts.length}`);

        // Preparar texto con SSML para mejor control
        const ssmlText = wrapWithSSML(audioTexts[i], speed, language);

        const synthesizeParams = {
          Text: ssmlText,
          TextType: 'ssml',
          OutputFormat: outputFormat,
          VoiceId: selectedVoice,
          Engine: voiceType === 'neural' ? 'neural' : 'standard',
          SampleRate: outputFormat === 'mp3' ? '22050' : '16000'
        };

        const command = new SynthesizeSpeechCommand(synthesizeParams);
        const response = await pollyClient.send(command);

        if (!response.AudioStream) {
          throw new Error('No se recibió audio stream de Polly');
        }

        // Leer el stream y convertir a buffer
        const chunks = [];
        for await (const chunk of response.AudioStream) {
          chunks.push(chunk);
        }
        const audioBuffer = Buffer.concat(chunks);

        // Crear URL base64 para respuesta inmediata
        const mimeType = getMimeType(outputFormat);
        const base64 = audioBuffer.toString('base64');
        const audioUrl = `data:${mimeType};base64,${base64}`;
        
        audioUrls.push(audioUrl);
        results.push({
          sceneIndex: i + 1,
          text: audioTexts[i],
          voice: selectedVoice,
          engine: synthesizeParams.Engine,
          format: outputFormat,
          language,
          size: audioBuffer.length,
          duration: estimateAudioDuration(audioTexts[i], speed),
          success: true
        });

        console.log(`✅ Audio ${i + 1} generado: ${(audioBuffer.length / 1024).toFixed(1)} KB`);

        // Pausa entre requests para respetar rate limits
        if (i < audioTexts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (audioError) {
        console.error(`❌ Error generando audio ${i + 1}:`, audioError);
        
        // Generar audio silencioso placeholder
        const silentAudio = generateSilentAudioBase64(3);
        audioUrls.push(silentAudio);
        
        results.push({
          sceneIndex: i + 1,
          text: audioTexts[i],
          voice: selectedVoice,
          language,
          error: audioError.message,
          placeholder: true,
          success: false
        });
      }
    }

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const totalSize = successful.reduce((sum, result) => sum + (result.size || 0), 0);
    const totalDuration = successful.reduce((sum, result) => sum + (result.duration || 0), 0);

    res.status(200).json({ 
      audioUrls,
      results,
      metadata: {
        voice: selectedVoice,
        language,
        engine: voiceType,
        format: outputFormat,
        total: audioTexts.length,
        successful: successful.length,
        failed: failed.length,
        totalSizeKB: (totalSize / 1024).toFixed(1),
        totalDurationSeconds: totalDuration.toFixed(1),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error generando audios:', error);
    res.status(500).json({ 
      error: 'Error generando audios con Amazon Polly',
      details: error.message,
      suggestion: 'Verifica que tus credenciales de AWS estén configuradas correctamente'
    });
  }
}

// Funciones auxiliares
function getDefaultVoice(language, voiceType) {
  const config = VOICE_CONFIGS[language];
  if (!config) return 'Joanna'; // Fallback por defecto
  
  if (voiceType === 'neural' && config.neural?.length > 0) {
    return config.default || config.neural[0];
  }
  
  return config.default || config.standard[0] || 'Joanna';
}

function wrapWithSSML(text, speed, language) {
  const langAttr = language ? `xml:lang="${language}"` : '';
  
  return `<speak ${langAttr}>
    <prosody rate="${speed}">
      <break time="500ms"/>
      ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      <break time="1s"/>
    </prosody>
  </speak>`;
}

function getMimeType(format) {
  const mimeTypes = {
    'mp3': 'audio/mpeg',
    'ogg_vorbis': 'audio/ogg',
    'pcm': 'audio/wav'
  };
  return mimeTypes[format] || 'audio/mpeg';
}

function estimateAudioDuration(text, speed) {
  const wordsPerMinute = {
    'x-slow': 80,
    'slow': 110,
    'medium': 150,
    'fast': 190,
    'x-fast': 230
  };
  
  const wpm = wordsPerMinute[speed] || 150;
  const wordCount = text.split(/\s+/).length;
  return (wordCount / wpm) * 60;
}

function generateSilentAudioBase64(durationSeconds = 3) {
  return "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAQKAAAAAAAAASABTxItAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
}