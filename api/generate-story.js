// api/generate-story.js
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { genre, description, language } = req.body;

    if (!genre || !description) {
      return res.status(400).json({ error: language === "es" 
        ? 'Género y descripción son requeridos' 
        : 'Genre and description are required' 
      });
    }

    console.log(`🎭 Generando historia (${language}) de género: ${genre}`);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Prompt en inglés o español según language
    const promptES = `
    Eres un escritor experto en ${genre}. Crea una historia en español basada en: "${description}"

    IMPORTANTE: Responde ÚNICAMENTE con un JSON válido en este formato exacto:
    {
      "title": "Título principal de la historia",
      "scenes": [
        {
          "id": 1,
          "title": "Título de la escena",
          "text": "Narración de la escena (máximo 150 palabras, en español)",
          "imagePrompt": "Descripción detallada en inglés para generar imagen (máximo 100 palabras, muy visual y específica)",
          "audioText": "Texto para narración en audio (español), más dramático y expresivo"
        }
      ]
    }

    Genera exactamente 5 escenas que formen una historia completa con:
    - Introducción
    - Desarrollo del conflicto
    - Clímax
    - Resolución
    - Epílogo
    `;

    const promptEN = `
    You are an expert writer in ${genre}. Create a story in English based on: "${description}"

    IMPORTANT: Respond ONLY with a valid JSON in this exact format:
    {
      "title": "Main title of the story",
      "scenes": [
        {
          "id": 1,
          "title": "Scene title",
          "text": "Scene narration (maximum 150 words, in English)",
          "imagePrompt": "Detailed description in English for image generation (max 100 words, very visual and specific)",
          "audioText": "Text for audio narration (English), more dramatic and expressive"
        }
      ]
    }

    Generate exactly 5 scenes that form a complete story with:
    - Introduction
    - Conflict development
    - Climax
    - Resolution
    - Epilogue
    `;

    const prompt = language === "en" ? promptEN : promptES;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Limpiar la respuesta para obtener solo el JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(language === "es" 
        ? 'No se pudo extraer JSON válido de la respuesta' 
        : 'Could not extract valid JSON from response'
      );
    }

    const storyData = JSON.parse(jsonMatch[0]);

    // Validar estructura
    if (!storyData.scenes || !Array.isArray(storyData.scenes)) {
      throw new Error(language === "es" 
        ? 'Estructura de respuesta inválida' 
        : 'Invalid response structure'
      );
    }

    console.log(`✅ Historia generada exitosamente (${language})`);

    // Responder con la historia
    res.status(200).json({
      ...storyData,
      metadata: {
        createdAt: new Date().toISOString(),
        genre,
        description,
        language
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