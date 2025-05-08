// src/app/api/image-gen/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenAI, Modality, type GenerateContentResponse } from '@google/genai';

interface ReqBody {
  prompt?: string;
}

interface ImagePart {
  inlineData?: { data: string };
}

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 });
  }

  // Safely parse prompt
  let promptText = '';
  try {
    const { prompt } = (await request.json()) as ReqBody;
    promptText = prompt?.trim() || '';
  } catch {
    promptText = '';
  }


// --------- IMAGE GENERATION PROMPT STARTS BELOW --------- 


  const imageCount = 3;
  const baseDescription = promptText || 'a 4K HDR photorealistic close-up photo of a DNA double helix';
  const instruction =
    `Generate ${imageCount} distinct, ultra-realistic, cinematic-quality images with 8K resolution, deep depth of field, volumetric lighting, physically-based rendering, lifelike textures, and rich, photorealistic detail of: ${baseDescription}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    // Request both TEXT and IMAGE modalities so inlineData parts include images
    const response = (await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp-image-generation',
      contents: instruction,
      config: { responseModalities: [Modality.TEXT, Modality.IMAGE] },
    })) as GenerateContentResponse;

    const candidates = response.candidates;
    if (!Array.isArray(candidates) || candidates.length === 0) {
      return NextResponse.json({ error: 'No output from Gemini model' }, { status: 502 });
    }

    // Extract inline image parts (multiple parts for multiple images)
    const parts = (candidates[0].content?.parts ?? []) as ImagePart[];
    const images = parts
      .filter(part => Boolean(part.inlineData?.data))
      .map((part, idx) => ({ id: idx, data: part.inlineData!.data }));

    return NextResponse.json({ images });
  } catch (err: unknown) {
    console.error('Error generating images:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
