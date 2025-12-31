'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function PublicProfile({ params }: { params: { username: string } }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // 1. THE COOKIE/CACHE CHECK
  useEffect(() => {
    const savedChatId = localStorage.getItem(`chat_${params.username}`)
    if (savedChatId) {
      // If we remember them, send them straight to the chat
      router.push(`/chat/${savedChatId}`)
    }
  }, [params.username, router])

  const startConversation = async () => {
    if (!message.trim()) return
    setLoading(true)

    // A. Create Conversation
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .insert({ host_username: params.username })
      .select()
      .single()

    if (convError) { alert('Error starting chat'); setLoading(false); return }

    // B. Create First Message
    await supabase.from('messages').insert({
      conversation_id: conv.id,
      content: message,
      sender_type: 'anon'
    })

    // C. SAVE TO CACHE (The "Cookie" Logic)
    localStorage.setItem(`chat_${params.username}`, conv.id)

    // D. Redirect
    router.push(`/chat/${conv.id}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black text-white font-mono">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl border-l-4 border-white pl-4">
          Send anonymous message to <span className="text-gray-400">@{params.username}</span>
        </h1>
        
        <textarea
          className="w-full bg-gray-900 border border-gray-700 p-4 rounded text-white focus:outline-none focus:border-white transition-colors"
          rows={4}
          placeholder="Say something..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button 
          onClick={startConversation}
          disabled={loading}
          className="w-full bg-white text-black font-bold py-3 rounded hover:bg-gray-200 transition"
        >
          {loading ? 'SENDING...' : 'SEND MESSAGE'}
        </button>
        
        <p className="text-xs text-gray-500 text-center">
          If you return to this page later, we will remember you.
        </p>
      </div>
    </div>
  )
}