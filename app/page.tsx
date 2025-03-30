'use client'

import { useState } from 'react'
import ChatSidebar from '@/components/ChatSidebar'
import ChatMessages from '@/components/ChatMessages'
import ChatInput from '@/components/ChatInput'

export default function Home() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-center">訊息管理系統</h1>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Chat rooms list */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 hidden md:block">
          <ChatSidebar 
            onSelectSession={setSelectedSessionId} 
            selectedSessionId={selectedSessionId} 
          />
        </div>
        
        {/* Mobile sidebar toggle */}
        <div className="md:hidden p-2 bg-gray-100 dark:bg-gray-800">
          <button 
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md"
            onClick={() => {
              const sidebar = document.getElementById('mobile-sidebar')
              if (sidebar) {
                sidebar.classList.toggle('hidden')
              }
            }}
          >
            {selectedSessionId ? `Session: ${selectedSessionId}` : 'Select Session'}
          </button>
          
          <div id="mobile-sidebar" className="hidden fixed inset-0 z-50 bg-white dark:bg-gray-900">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold">Chat Sessions</h2>
              <button 
                onClick={() => {
                  const sidebar = document.getElementById('mobile-sidebar')
                  if (sidebar) {
                    sidebar.classList.add('hidden')
                  }
                }}
                className="p-2"
              >
                ✕
              </button>
            </div>
            <div className="h-full">
              <ChatSidebar 
                onSelectSession={(sessionId) => {
                  setSelectedSessionId(sessionId)
                  const sidebar = document.getElementById('mobile-sidebar')
                  if (sidebar) {
                    sidebar.classList.add('hidden')
                  }
                }} 
                selectedSessionId={selectedSessionId} 
              />
            </div>
          </div>
        </div>
        
        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {/* Messages display */}
          <ChatMessages sessionId={selectedSessionId} />
          
          {/* Message input */}
          <ChatInput 
            sessionId={selectedSessionId} 
            onNewSession={setSelectedSessionId} 
          />
        </div>
      </div>
    </div>
  )
}