// api/generate-images.js
import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY no está configurado');
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    const { imagePrompts, currentIndex = 0, batchSize = 1 } = req.body;

    if (!imagePrompts || !Array.isArray(imagePrompts)) {
      return res.status(400).json({ error: 'imagePrompts debe ser un array' });
    }

    // Procesar solo un batch a la vez para optimizar memoria y tiempo
    const endIndex = Math.min(currentIndex + batchSize, imagePrompts.length);
    const currentBatch = imagePrompts.slice(currentIndex, endIndex);

    console.log(`🎨 Generando imágenes ${currentIndex + 1}-${endIndex} de ${imagePrompts.length}...`);

    const imageUrls = [];
    const results = [];

    // Generar imágenes secuencialmente con timeouts optimizados
    for (let i = 0; i < currentBatch.length; i++) {
      const globalIndex = currentIndex + i;
      
      try {
        console.log(`🎨 Generando imagen ${globalIndex + 1}/${imagePrompts.length}`);
        
        // Timeout para evitar que la función serverless se cuelgue
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout generando imagen')), 25000) // 25s timeout
        );

        // Mejorar el prompt para mejores resultados
        const enhancedPrompt = `Create an image with aspect ratio 16:9 of ${currentBatch[i]}, high quality, detailed, cinematic, digital art, fantasy art style, vibrant colors, professional artwork`;
        
        const generationPromise = ai.models.generateContent({
          model: "gemini-2.0-flash-exp",
          contents: enhancedPrompt,
          config: {
            responseModalities: ['Text', 'Image']
          }
        });

        // Usar Promise.race para timeout
        const response = await Promise.race([generationPromise, timeoutPromise]);
        
        console.log(`✅ Imagen ${globalIndex + 1} generada con éxito`);
        
        // Extraer la imagen de la respuesta
        const imagePart = response.candidates[0].content.parts.find(p => p.inlineData);
        if (!imagePart) {
          throw new Error('No image data found in response');
        }
        
        // Crear URL base64 para respuesta inmediata
        const base64 = imagePart.inlineData.data;
        const imageUrl = `data:image/png;base64,${base64}`;
        
        imageUrls.push(imageUrl);
        results.push({
          sceneIndex: globalIndex + 1,
          prompt: currentBatch[i],
          success: true
        });

        // Pausa más corta entre requests para optimizar tiempo total
        if (i < currentBatch.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Reducido de 1000ms a 500ms
        }

      } catch (imageError) {
        console.error(`❌ Error generando imagen ${globalIndex + 1}:`, imageError);
        
        // Usar imagen placeholder externa con parámetros únicos
        const placeholderUrl = `https://picsum.photos/768/432?random=${Date.now()}-${globalIndex}`;
        imageUrls.push(placeholderUrl);
        
        results.push({
          sceneIndex: globalIndex + 1,
          prompt: currentBatch[i],
          error: imageError.message,
          placeholder: placeholderUrl,
          success: false
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const isComplete = endIndex >= imagePrompts.length;

    res.status(200).json({ 
      images: imageUrls,
      results,
      metadata: {
        currentBatch: {
          start: currentIndex,
          end: endIndex,
          size: currentBatch.length
        },
        progress: {
          current: endIndex,
          total: imagePrompts.length,
          percentage: Math.round((endIndex / imagePrompts.length) * 100)
        },
        stats: {
          successful,
          failed,
          isComplete
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error generando imágenes:', error);
    res.status(500).json({ 
      error: 'Error generando imágenes',
      details: error.message 
    });
  }
}