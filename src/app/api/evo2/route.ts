/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'

// Configuration
const API_URL = process.env.NVCF_URL ?? 'https://health.api.nvidia.com/v1/biology/arc/evo2-40b/generate'
const RUN_KEY = process.env.NVCF_RUN_KEY

if (!RUN_KEY) {
  console.error('[EVO2] Missing RUN_KEY. Set NVCF_RUN_KEY env var.')
  throw new Error('NVCF_RUN_KEY env var is required')
}

export async function POST(request: NextRequest) {
  let body: {
    sequence: string
    num_tokens?: number
    temperature?: number
    top_k?: number
    top_p?: number
    random_seed?: number
    enable_logits?: boolean
    enable_sampled_probs?: boolean
    enable_elapsed_ms_per_token?: boolean
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
  }

  if (!body.sequence || typeof body.sequence !== 'string') {
    return NextResponse.json({ error: '`sequence` (string) is required in body' }, { status: 400 })
  }

  // Enforce max length to prevent timeouts
  const MAX_INPUT_LEN = 1000
  const seq = body.sequence.length > MAX_INPUT_LEN ? body.sequence.slice(0, MAX_INPUT_LEN) : body.sequence

  const payload = {
    sequence: seq,
    num_tokens: body.num_tokens ?? 500,
    temperature: body.temperature ?? 0.9,
    top_k: body.top_k ?? 3,
    top_p: body.top_p ?? 1,
    ...(body.random_seed !== undefined && { random_seed: body.random_seed }),
    enable_logits: body.enable_logits ?? false,
    enable_sampled_probs: body.enable_sampled_probs ?? false,
    enable_elapsed_ms_per_token: body.enable_elapsed_ms_per_token ?? false,
  }

  let res: Response
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RUN_KEY}`,
        'nvcf-poll-seconds': '120',
      },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('[EVO2] Network error when calling remote service', err)
    return NextResponse.json({ error: 'Network error when calling remote service' }, { status: 502 })
  }

  const contentType = res.headers.get('Content-Type') || ''

  // Handle errors
  if (contentType.includes('application/problem+json') || res.status >= 400) {
    let errData: any
    try {
      errData = await res.json()
    } catch {
      const raw = await res.text()
      console.error('[EVO2] Error parsing error response:', raw)
      return NextResponse.json({ error: raw }, { status: res.status })
    }
    const message = errData.detail || errData.title || JSON.stringify(errData)
    console.warn('[EVO2] Model error:', message)
    return NextResponse.json({ error: message }, { status: res.status })
  }

  // Return JSON
  if (contentType.includes('application/json')) {
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  }

  // Return plain text
  if (contentType.includes('text/plain')) {
    const text = await res.text()
    return new NextResponse(text, { status: res.status, headers: { 'Content-Type': 'text/plain' } })
  }

  // Fallback: text
  const fallback = await res.text()
  return new NextResponse(fallback, { status: res.status })
}
