// api/generate-images.js
import Replicate from 'replicate';

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

    const replicate = new Replicate({
      auth: REPLICATE_API_TOKEN,
    });
    
    const { imagePrompts, model = 'flux-schnell' } = req.body;

    if (!imagePrompts || !Array.isArray(imagePrompts)) {
      return res.status(400).json({ error: 'imagePrompts debe ser un array' });
    }

    console.log(`🎨 Generando ${imagePrompts.length} imágenes con Replicate...`);

    const imageUrls = [];
    const results = [];

    // Configuración de modelos disponibles
    const modelConfigs = {
      'flux-schnell': {
        model: 'black-forest-labs/flux-schnell',
        version: 'bf2f2a8a85b10f48b7c27b91b75320621adeb37a26711b9e4ab9ed57d8a2d9e9',
        params: {
          width: 1024,
          height: 768,
          num_outputs: 1,
          disable_safety_checker: false
        }
      },
      'flux-dev': {
        model: 'black-forest-labs/flux-dev',
        params: {
          width: 1024,
          height: 768,
          num_outputs: 1,
          guidance_scale: 3.5,
          num_inference_steps: 28
        }
      },
      'sdxl': {
        model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        params: {
          width: 1024,
          height: 768,
          num_outputs: 1,
          scheduler: "DPMSolverMultistep",
          num_inference_steps: 25,
          guidance_scale: 7.5
        }
      }
    };

    const selectedModel = modelConfigs[model] || modelConfigs['flux-schnell'];
    console.log(`🎭 Usando modelo: ${selectedModel.model}`);

    // Generar imágenes secuencialmente para evitar límites de rate
    for (let i = 0; i < imagePrompts.length; i++) {
      try {
        console.log(`🎨 Generando imagen ${i + 1}/${imagePrompts.length}`);
        
        // Mejorar el prompt para mejores resultados cinematográficos
        const enhancedPrompt = `${imagePrompts[i]}, cinematic composition, dramatic lighting, high quality, detailed, professional photography, 16:9 aspect ratio, vivid colors, sharp focus`;
        
        const input = {
          prompt: enhancedPrompt,
          ...selectedModel.params
        };

        console.log(`📝 Prompt: ${enhancedPrompt.substring(0, 100)}...`);

        const output = await replicate.run(selectedModel.model, { input });
        
        console.log("✅ Imagen generada con Replicate");
        
        // Replicate devuelve URLs directas a las imágenes
        let imageUrl;
        if (Array.isArray(output) && output.length > 0) {
          imageUrl = output[0];
        } else if (typeof output === 'string') {
          imageUrl = output;
        } else {
          throw new Error('Formato de respuesta inesperado de Replicate');
        }

        // Convertir a base64 para consistencia con el frontend
        try {
          const response = await fetch(imageUrl);
          if (!response.ok) {
            throw new Error(`Error fetching image: ${response.statusText}`);
          }
          
          const arrayBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          const base64Url = `data:image/png;base64,${base64}`;
          
          imageUrls.push(base64Url);
          results.push({
            sceneIndex: i + 1,
            prompt: imagePrompts[i],
            enhancedPrompt,
            originalUrl: imageUrl,
            model: selectedModel.model,
            success: true
          });

        } catch (fetchError) {
          console.warn(`⚠️ No se pudo convertir a base64, usando URL original: ${fetchError.message}`);
          imageUrls.push(imageUrl);
          results.push({
            sceneIndex: i + 1,
            prompt: imagePrompts[i],
            enhancedPrompt,
            originalUrl: imageUrl,
            model: selectedModel.model,
            success: true,
            note: 'Usando URL original (no base64)'
          });
        }

        console.log(`✅ Imagen ${i + 1} procesada exitosamente`);

        // Pausa entre requests para respetar rate limits de Replicate
        if (i < imagePrompts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 segundos
        }

      } catch (imageError) {
        console.error(`❌ Error generando imagen ${i + 1}:`, imageError);
        
        // Usar imagen placeholder externa en caso de error
        const placeholderUrl = `https://picsum.photos/1024/768?random=${Date.now()}-${i}`;
        imageUrls.push(placeholderUrl);
        
        results.push({
          sceneIndex: i + 1,
          prompt: imagePrompts[i],
          error: imageError.message,
          placeholder: placeholderUrl,
          model: selectedModel.model,
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
        model: selectedModel.model,
        total: imagePrompts.length,
        successful,
        failed,
        timestamp: new Date().toISOString(),
        rateLimitInfo: 'Replicate: ~2s entre requests para evitar límites'
      }
    });

  } catch (error) {
    console.error('❌ Error generando imágenes:', error);
    
    let errorMessage = 'Error generando imágenes con Replicate';
    let suggestion = 'Verifica que tu token de Replicate esté configurado correctamente';
    
    if (error.message?.includes('authentication')) {
      suggestion = 'Verifica que REPLICATE_API_TOKEN esté configurado y sea válido';
    } else if (error.message?.includes('rate limit')) {
      suggestion = 'Has alcanzado el límite de rate de Replicate. Intenta de nuevo en unos minutos';
    } else if (error.message?.includes('insufficient funds')) {
      suggestion = 'Fondos insuficientes en tu cuenta de Replicate';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message,
      suggestion
    });
  }
}

// Función auxiliar para validar URLs de imágenes
async function validateImageUrl(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && response.headers.get('content-type')?.startsWith('image/');
  } catch {
    return false;
  }
}