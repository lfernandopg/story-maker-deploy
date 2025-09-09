// api/generate-audio.js
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { audioTexts } = req.body;

    if (!audioTexts || !Array.isArray(audioTexts)) {
      return res.status(400).json({ error: 'audioTexts debe ser un array' });
    }

    const audioUrls = [];

    // Usar voz gratuita de ElevenLabs (Rachel - voice_id public)
    const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Rachel (voz gratuita)
    const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

    for (let i = 0; i < audioTexts.length; i++) {
      try {
        console.log(`Generando audio ${i + 1}/${audioTexts.length}`);

        const response = await fetch(`${ELEVENLABS_API_URL}/${VOICE_ID}`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVENLABS_API_KEY
          },
          body: JSON.stringify({
            text: audioTexts[i],
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
              style: 0.5,
              use_speaker_boost: true
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error ElevenLabs para audio ${i + 1}:`, errorText);
          throw new Error(`Error ${response.status}: ${errorText}`);
        }

        // Convertir a base64 para enviar al frontend
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const audioUrl = `data:audio/mpeg;base64,${base64}`;
        
        audioUrls.push(audioUrl);

        // Pausa entre requests para respetar rate limits
        if (i < audioTexts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

      } catch (audioError) {
        console.error(`Error generando audio ${i + 1}:`, audioError);
        // Usar audio silencioso placeholder en caso de error
        // Generar 3 segundos de silencio en base64
        const silentAudio = "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAQKAAAAAAAAASABTxItAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
        audioUrls.push(silentAudio);
      }
    }

    res.status(200).json({ audioUrls });

  } catch (error) {
    console.error('Error generando audios:', error);
    res.status(500).json({ 
      error: 'Error generando audios',
      details: error.message 
    });
  }
}

// Configurar límite de tiempo
export const config = {
  maxDuration: 9,
};