// app/api/prediction/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI, type Content } from '@google/genai'

export const runtime = 'edge'

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
})

export async function POST(req: NextRequest) {
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

  // 2. Kick off the streaming call
  const generator = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash-preview-04-17',
    contents: [
      { role: 'system', text: system },
      { role: 'user',   text: user   },
    ] satisfies Content[],
    config: {
      thinkingConfig:  { thinkingBudget: Number(thinkingBudget) },
      maxOutputTokens: Number(maxOutputTokens),
      temperature:     Number(temperature),
      topP:            Number(topP),
      topK:            Number(topK),
    },
  })

  // 3. Stream it back as text/plain
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        for await (const part of generator) {
          if (part.text) {
            controller.enqueue(new TextEncoder().encode(part.text))
          }
        }
        controller.close()
      } catch (err) {
        controller.error(err)
      }
    }
  })

  return new NextResponse(stream, {
    status: 200,
    headers: {
      'Content-Type':  'text/plain; charset=utf-8',
      'Cache-Control': 'no-transform',
    },
  })
}
