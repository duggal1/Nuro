/* eslint-disable @typescript-eslint/no-explicit-any */
// app/page.tsx
'use client'
import { Loader } from '@/components/Loader';
import { useState, useRef, useCallback } from 'react'

type Message = { role: 'user' | 'assistant'; text: string }

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const controllerRef = useRef<AbortController|null>(null)

  const send = useCallback(async (userText: string) => {
    setMessages(msgs => [...msgs, { role: 'user', text: userText }])
    setLoading(true)
    controllerRef.current?.abort()
    const ctrl = new AbortController()
    controllerRef.current = ctrl

    try {
      const res = await fetch('/api/prediction', { // <-- fixed path
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({ system: 'You are a helpful assistant.', user: userText }),
      })
      if (!res.ok) throw new Error(`Status ${res.status}`)

      const reader = res.body!.getReader()
      const dec    = new TextDecoder()
      let acc = ''

      setMessages(msgs => [...msgs, { role: 'assistant', text: '' }])
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += dec.decode(value, { stream: true })
        setMessages(msgs => {
          const next = [...msgs]
          next[next.length - 1].text = acc
          return next
        })
      }
    } catch (e) {
      if ((e as any).name !== 'AbortError') console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    send(input.trim())
    setInput('')
  }

  const cancel = () => {
    controllerRef.current?.abort()
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="border rounded p-3 h-64 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
              <span
                className={`inline-block px-3 py-1 rounded-lg ${
                  m.role === 'user'
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {m.text}
              </span>
            </div>
          ))}
          {loading && <Loader/>}
        </div>
        <form onSubmit={onSubmit} className="flex space-x-2">
          <input
            className="flex-1 border rounded px-3 py-2"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message…"
            disabled={loading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            disabled={loading}
          >
            Send
          </button>
          {loading && (
            <button
              type="button"
              onClick={cancel}
              className="px-3 py-2 bg-red-500 text-white rounded"
            >
              Cancel
            </button>
          )}
        </form>
      </div>
    </main>
  )
}
