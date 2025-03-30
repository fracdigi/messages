"use client";

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Message } from '@/types/chat';

interface ChatMessagesProps {
  sessionId: string | null;
}

export default function ChatMessages({ sessionId }: ChatMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchMessages() {
      if (!sessionId) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('n8n_chat_histories')
          .select('*')
          .eq('session_id', sessionId);

        if (error) throw error;

        // Transform data to match our Message type
        const formattedMessages: Message[] = data.map(item => ({
          id: item.id,
          type: item.message.type,
          content: item.message.content,
          created_at: item.created_at
        }));

        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
    
    // Set up real-time listener for this session
    const channel = supabase
      .channel(`session_${sessionId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'n8n_chat_histories', filter: `session_id=eq.${sessionId}` },
        fetchMessages
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!sessionId) {
    return (
      <div className="flex-1 flex justify-center items-center p-4 bg-white dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Select a chat session to view messages</p>
      </div>
    );
  }

  // Determine the platform from the session ID
  const getPlatformInfo = (sessionId: string) => {
    if (sessionId.includes('line')) {
      return { name: 'LINE', icon: '🟢', color: 'bg-green-500' };
    } else if (sessionId.includes('messenger')) {
      return { name: 'Messenger', icon: '🔵', color: 'bg-blue-600' };  
    } else if (sessionId.includes('instagram') || sessionId.includes('ig')) {
      return { name: 'Instagram', icon: '📸', color: 'bg-purple-500' };
    }
    return { name: 'Unknown', icon: '💬', color: 'bg-gray-500' };
  };
  
  const platformInfo = sessionId ? getPlatformInfo(sessionId) : { name: '', icon: '', color: '' };

  return (
    <div className="flex-1 p-4 bg-white dark:bg-gray-900 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Session header with platform info */}
        {sessionId && (
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xl">{platformInfo.icon}</span>
            <h2 className="text-xl font-bold">{platformInfo.name} Session</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              ID: {sessionId}
            </span>
          </div>
        )}
        
        {loading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No messages in this session</p>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isHuman = message.type === 'human';
              const showTimeSeparator = index > 0 && 
                new Date(message.created_at || '').toDateString() !== 
                new Date(messages[index-1].created_at || '').toDateString();
                
              return (
                <div key={message.id}>
                  {/* Date separator */}
                  {showTimeSeparator && (
                    <div className="flex justify-center my-6">
                      <div className="px-4 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-500 dark:text-gray-400">
                        {new Date(message.created_at || '').toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  
                  {/* Message bubble */}
                  <div 
                    className={`flex items-end gap-2 ${isHuman ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Avatar for AI messages */}
                    {!isHuman && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${platformInfo.color} text-white flex-shrink-0`}>
                        {platformInfo.icon}
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${isHuman
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-200 dark:bg-gray-700 rounded-bl-none'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      {message.created_at && (
                        <div className="text-xs opacity-70 mt-1">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                    
                    {/* Avatar for human messages */}
                    {isHuman && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 flex-shrink-0">
                        👤
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
