import Replicate from 'replicate';
import fetch from 'node-fetch'; // Asegúrate de tener node-fetch instalado
import { Buffer } from 'buffer';

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    if (!REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN no está configurado');
    }

    const replicate = new Replicate({ auth: REPLICATE_API_TOKEN });
    
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

    // Generar imágenes secuencialmente
    for (let i = 0; i < currentBatch.length; i++) {
      const globalIndex = currentIndex + i;
      
      try {
        console.log(`🎨 Generando imagen ${globalIndex + 1}/${imagePrompts.length}`);
        
        // Mejorar el prompt para mejores resultados
        const enhancedPrompt = `Create an image of ${currentBatch[i]}, high quality, detailed, cinematic, digital art, fantasy art style, vibrant colors, professional artwork`;
        
        const output = await replicate.run(
          "black-forest-labs/flux-schnell",
          {
            input: {
              prompt: enhancedPrompt,
              aspect_ratio: "16:9",
              output_format: "png"
            }
          }
        );
        
        console.log(`✅ Imagen ${globalIndex + 1} generada con éxito`);
        
        // La respuesta de Replicate es un array de URLs
        if (!output || !Array.isArray(output) || output.length === 0) {
          throw new Error('No image data found in response');
        }
        
        // Descargar la imagen y convertirla a base64
        const imageUrl = output[0];
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error('Error al descargar la imagen');
        }
        const imageBuffer = await response.buffer();
        const base64 = imageBuffer.toString('base64');
        const base64Url = `data:image/png;base64,${base64}`;
        
        imageUrls.push(base64Url);
        results.push({
          sceneIndex: globalIndex + 1,
          prompt: currentBatch[i],
          success: true
        });

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