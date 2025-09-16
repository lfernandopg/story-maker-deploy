// api/generate-images.js
import { GoogleGenAI } from  '@google/genai';

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
    
    const { imagePrompts } = req.body;

    if (!imagePrompts || !Array.isArray(imagePrompts)) {
      return res.status(400).json({ error: 'imagePrompts debe ser un array' });
    }

    console.log(`🎨 Generando ${imagePrompts.length} imágenes...`);

    const imageUrls = [];
    const results = [];

    // Generar imágenes secuencialmente para evitar límites de rate
    for (let i = 0; i < imagePrompts.length; i++) {
      try {
        console.log(`🎨 Generando imagen ${i + 1}/${imagePrompts.length}`);
        
        // Mejorar el prompt para mejores resultados
        const enhancedPrompt = `Create an image with aspect ratio 16:9 of ${imagePrompts[i]}, high quality, detailed, cinematic, digital art, fantasy art style, vibrant colors, professional artwork`;
        
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash-exp",
          contents: enhancedPrompt,
          config: {
            responseModalities: ['Text', 'Image']
          }
        });
        
        console.log("Imagen generada con éxito");
        
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
          sceneIndex: i + 1,
          prompt: imagePrompts[i],
          success: true
        });

        console.log(`✅ Imagen ${i + 1} generada exitosamente`);

        // Pequeña pausa entre requests para respetar rate limits
        if (i < imagePrompts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (imageError) {
        console.error(`❌ Error generando imagen ${i + 1}:`, imageError);
        
        // Usar imagen placeholder externa
        const placeholderUrl = `https://picsum.photos/768/432?random=${Date.now()}-${i}`;
        imageUrls.push(placeholderUrl);
        
        results.push({
          sceneIndex: i + 1,
          prompt: imagePrompts[i],
          error: imageError.message,
          placeholder: placeholderUrl,
          success: false
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.status(200).json({ 
      images: imageUrls,
      results,
      metadata: {
        total: imagePrompts.length,
        successful,
        failed,
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