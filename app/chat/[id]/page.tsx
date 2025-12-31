'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function ChatRoom({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isHost, setIsHost] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 1. Identify User Role (Simple Logic for MVP)
    // If the URL has ?host=true, we treat them as host (Secure this later!)
    const isHostView = window.location.search.includes('host=true')
    setIsHost(isHostView)

    // 2. Fetch History
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', params.id)
        .order('created_at', { ascending: true })
      if (data) setMessages(data)
    }
    fetchHistory()

    // 3. Realtime Subscription
    const channel = supabase.channel('chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${params.id}` }, 
      (payload) => {
        setMessages((prev) => [...prev, payload.new])
        // Scroll to bottom on new message
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [params.id])

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    await supabase.from('messages').insert({
      conversation_id: params.id,
      content: newMessage,
      sender_type: isHost ? 'host' : 'anon'
    })
    setNewMessage('')
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white font-mono max-w-md mx-auto border-x border-gray-800">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-black z-10 sticky top-0">
        <h2 className="text-sm text-gray-400">
          {isHost ? 'Reply to Anonymous' : 'Chat with Host'}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          // Logic: If I am Host, my messages (host) go right. Anon goes left.
          // If I am Anon, my messages (anon) go right. Host goes left.
          const isMe = isHost ? msg.sender_type === 'host' : msg.sender_type === 'anon'
          
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                isMe ? 'bg-white text-black' : 'bg-gray-800 text-gray-200'
              }`}>
                {msg.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-black border-t border-gray-800">
        <div className="flex gap-2">
          <input 
            className="flex-1 bg-gray-900 border border-gray-700 p-3 rounded text-white focus:outline-none"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type..."
          />
          <button onClick={sendMessage} className="bg-white text-black px-4 rounded font-bold">→</button>
        </div>
      </div>
    </div>
  )
}