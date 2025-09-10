// api/generate-story.js
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { genre, description } = req.body;

    if (!genre || !description) {
      return res.status(400).json({ error: 'Género y descripción son requeridos' });
    }

    console.log(`🎭 Generando historia de género: ${genre}`);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    Eres un escritor experto en ${genre}. Crea una historia basada en: "${description}"

    IMPORTANTE: Responde ÚNICAMENTE con un JSON válido en este formato exacto:
    {
      "title": "Título principal de la historia",
      "scenes": [
        {
          "id": 1,
          "title": "Título de la escena",
          "text": "Narración de la escena (máximo 150 palabras)",
          "imagePrompt": "Descripción detallada en inglés para generar imagen (máximo 100 palabras, muy visual y específica)",
          "audioText": "Texto para narración en audio, más dramático y expresivo"
        }
      ]
    }

    Genera exactamente 5 escenas que formen una historia completa con:
    - Introducción
    - Desarrollo del conflicto
    - Clímax
    - Resolución
    - Epílogo

    Las descripciones de imágenes deben ser muy específicas, visuales y en inglés.
    El texto de audio debe ser más dramático y expresivo para la narración.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Limpiar la respuesta para obtener solo el JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON válido de la respuesta');
    }

    const storyData = JSON.parse(jsonMatch[0]);

    // Validar estructura
    if (!storyData.scenes || !Array.isArray(storyData.scenes)) {
      throw new Error('Estructura de respuesta inválida');
    }

    console.log(`✅ Historia generada exitosamente`);

    // Responder con la historia
    res.status(200).json({
      ...storyData,
      metadata: {
        createdAt: new Date().toISOString(),
        genre,
        description
      }
    });

  } catch (error) {
    console.error('❌ Error generando historia:', error);
    res.status(500).json({ 
      error: 'Error generando historia',
      details: error.message 
    });
  }
}