/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'

const EVO2_API_URL =
  process.env.NVCF_URL ??
  'https://health.api.nvidia.com/v1/biology/arc/evo2-40b/generate'
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
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (typeof body.sequence !== 'string') {
    return NextResponse.json(
      { error: '`sequence` (string) is required' },
      { status: 400 }
    )
  }

  const seq =
    body.sequence.length > 1000
      ? body.sequence.slice(0, 1000)
      : body.sequence

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
    res = await fetch(EVO2_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RUN_KEY}`,
        'nvcf-poll-seconds': '120',
      },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('[EVO2] Network error', err)
    return NextResponse.json(
      { error: 'Network error calling EVO2' },
      { status: 502 }
    )
  }

  if (res.status >= 400) {
    let errData: any
    try {
      errData = await res.json()
    } catch {
      errData = await res.text()
    }
    const msg =
      errData.detail || errData.title || JSON.stringify(errData)
    return NextResponse.json({ error: msg }, { status: res.status })
  }

  const ct = res.headers.get('Content-Type') || ''
  if (ct.includes('application/json')) {
    const data = await res.json()
    return NextResponse.json(data)
  }
  const text = await res.text()
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': ct || 'text/plain' },
  })
}
