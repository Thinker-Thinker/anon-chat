'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Dashboard() {
  const [chats, setChats] = useState<any[]>([])
  // Hardcode your username for the 3hr MVP
  const MY_USERNAME = 'thinker' 

  useEffect(() => {
    const fetchChats = async () => {
      // Get conversations where host is 'thinker'
      const { data } = await supabase
        .from('conversations')
        .select('*, messages(content, created_at)')
        .eq('host_username', MY_USERNAME)
        .order('created_at', { ascending: false })
      
      if (data) setChats(data)
    }
    fetchChats()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white font-mono p-4">
      <h1 className="text-2xl mb-6">Inbox for @{MY_USERNAME}</h1>
      <div className="space-y-2">
        {chats.map(chat => (
          <Link key={chat.id} href={`/chat/${chat.id}?host=true`} className="block">
            <div className="border border-gray-800 p-4 hover:bg-gray-900 cursor-pointer">
              <span className="text-xs text-gray-500">{new Date(chat.created_at).toLocaleDateString()}</span>
              <p className="truncate text-gray-300">
                {chat.messages?.[0]?.content || 'New conversation'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}