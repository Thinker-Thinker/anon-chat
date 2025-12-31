'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const [username, setUsername] = useState('')
  const router = useRouter()

  const handleClaim = () => {
    if (!username) return
    // In a real app, you'd save this to auth. 
    // For this MVP, we just send them to their dashboard view.
    router.push(`/dashboard`) 
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tighter">ANON_CHAT.</h1>
        <p className="text-gray-400">
          Receive anonymous messages. Reply without revealing who you are.
        </p>

        <div className="border border-gray-800 p-6 rounded-lg space-y-4">
          <div className="text-left text-xs text-gray-500 uppercase">Step 1: Pick a username</div>
          <input 
            className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white text-center focus:border-white outline-none"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          
          {username && (
            <div className="p-3 bg-gray-900 rounded text-sm text-gray-300 break-all">
              your-site.com/{username}
            </div>
          )}

          <button 
            onClick={handleClaim}
            className="w-full bg-white text-black font-bold py-3 rounded hover:bg-gray-200 transition"
          >
            START RECEIVING MESSAGES
          </button>
        </div>

        <div className="pt-8 text-sm text-gray-600">
          <Link href="/dashboard" className="underline hover:text-white">
            Go to Inbox (Dashboard)
          </Link>
        </div>
      </div>
    </div>
  )
}