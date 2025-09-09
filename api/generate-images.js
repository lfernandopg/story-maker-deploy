// api/generate-images.js
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

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
    const { imagePrompts } = req.body;

    if (!imagePrompts || !Array.isArray(imagePrompts)) {
      return res.status(400).json({ error: 'imagePrompts debe ser un array' });
    }

    const imageUrls = [];

    // Generar imágenes secuencialmente para evitar límites de rate
    for (let i = 0; i < imagePrompts.length; i++) {
      try {
        console.log(`Generando imagen ${i + 1}/${imagePrompts.length}`);
        
        // Mejorar el prompt para mejores resultados
        const enhancedPrompt = `${imagePrompts[i]}, high quality, detailed, cinematic, digital art, fantasy art style, vibrant colors, professional artwork`;
        
        const blob = await hf.textToImage({
          provider: "together",
          model: "black-forest-labs/FLUX.1-schnell",
          inputs: enhancedPrompt,
          parameters: {
            negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, bad proportions, deformed",
            num_inference_steps: 20,
            guidance_scale: 7.5,
            width: 1280,
            height: 960
          }
        });

        // Convertir blob a base64
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const imageUrl = `data:image/png;base64,${base64}`;
        
        imageUrls.push(imageUrl);

        // Pequeña pausa entre requests para respetar rate limits
        if (i < imagePrompts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (imageError) {
        console.error(`Error generando imagen ${i + 1}:`, imageError);
        // Usar imagen placeholder en caso de error
        imageUrls.push(`https://picsum.photos/768/512?random=${i + 1}`);
      }
    }

    res.status(200).json({ images: imageUrls });

  } catch (error) {
    console.error('Error generando imágenes:', error);
    res.status(500).json({ 
      error: 'Error generando imágenes',
      details: error.message 
    });
  }
}

// Configurar límite de tiempo para Vercel (máximo 10 segundos en plan gratuito)
export const config = {
  maxDuration: 9,
};