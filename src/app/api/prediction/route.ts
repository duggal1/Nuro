


import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI, type Content } from '@google/genai'

export const runtime = 'edge'

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
})

export async function POST(req: NextRequest) {
  try {
    // 1. Parse incoming JSON body
    const {
      system          = 'You are a helpful assistant.',
      user            = '',
      thinkingBudget  = '0',
      maxOutputTokens = '1500',
      temperature     = '0.8',
      topP            = '0.9',
      topK            = '40',
    } = await req.json()

    // 2. Generate the content stream (async generator)
    const streamGen = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: [
        { role: 'system', text: system },
        { role: 'user',   text: user   },
      ] satisfies Content[],
      config: {
        thinkingConfig: { thinkingBudget: Number(thinkingBudget) },
        maxOutputTokens: Number(maxOutputTokens),
        temperature: Number(temperature),
        topP: Number(topP),
        topK: Number(topK),
      },
    })

    // 3. Create a readable stream by iterating the generator directly
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamGen) {
            const text = chunk.text
            if (text) {
              controller.enqueue(new TextEncoder().encode(text))
            }
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      }
    })

    // 4. Return the stream with headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Prediction API Error:', error)
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}
