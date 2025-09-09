// api/generate-story.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    const { genre, description } = req.body;

    if (!genre || !description) {
      return res.status(400).json({ error: 'Género y descripción son requeridos' });
    }

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

    res.status(200).json(storyData);

  } catch (error) {
    console.error('Error generando historia:', error);
    res.status(500).json({ 
      error: 'Error generando historia',
      details: error.message 
    });
  }
}