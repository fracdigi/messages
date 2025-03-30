"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ChatSession } from '@/types/chat';

interface ChatSidebarProps {
  onSelectSession: (sessionId: string) => void;
  selectedSessionId: string | null;
}

export default function ChatSidebar({ onSelectSession, selectedSessionId }: ChatSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        setLoading(true);
        
        // Get unique session_ids with the last message for each session
        const { data, error } = await supabase
          .from('n8n_chat_histories')
          .select('*')

        if (error) throw error;

        // Group by session_id
        const sessionMap = new Map<string, ChatSession>();
        
        data.forEach(item => {
          const existingSession = sessionMap.get(item.session_id);
          
          if (!existingSession) {
            // First encounter of this session, create a new entry
            sessionMap.set(item.session_id, {
              session_id: item.session_id,
              messages: [],
              last_message: item.message.content,
              updated_at: item.created_at
            });
          } else if (new Date(item.created_at) > new Date(existingSession.updated_at || '')) {
            // Update the session with more recent message if needed
            existingSession.last_message = item.message.content;
            existingSession.updated_at = item.created_at;
          }
        });

        // Convert to array and sort by updated_at (most recent first)
        const sortedSessions = Array.from(sessionMap.values())
          .sort((a, b) => new Date(b.updated_at || '').getTime() - new Date(a.updated_at || '').getTime());
          
        setSessions(sortedSessions);
        
        // Select first session if none selected
        if (!selectedSessionId && sortedSessions.length > 0) {
          onSelectSession(sortedSessions[0].session_id);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
    
    // Set up real-time listener
    const channel = supabase
      .channel('n8n_chat_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'n8n_chat_histories' }, fetchSessions)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onSelectSession, selectedSessionId]);

  return (
    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 p-4 overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Chat Sessions</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center">No chat sessions found</p>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => {
            // Determine if this is a Line, Messenger, or IG session based on the session_id
            let platform = 'Unknown';
            let platformIcon = '💬';
            
            if (session.session_id.includes('line')) {
              platform = 'LINE';
              platformIcon = '🟢';
            } else if (session.session_id.includes('messenger')) {
              platform = 'Messenger';
              platformIcon = '🔵';
            } else if (session.session_id.includes('instagram') || session.session_id.includes('ig')) {
              platform = 'Instagram';
              platformIcon = '📸';
            }
            
            return (
              <button
                key={session.session_id}
                onClick={() => onSelectSession(session.session_id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedSessionId === session.session_id
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{platformIcon}</span>
                    <span className="truncate font-medium">{session.session_id}</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {session.updated_at && new Date(session.updated_at).toLocaleDateString()}
                  </span>
                </div>
                
                {session.last_message && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-2 pl-6">
                    {session.last_message.length > 30 
                      ? session.last_message.substring(0, 30) + '...' 
                      : session.last_message}
                  </p>
                )}
                
                <div className="mt-1 text-xs text-gray-400 dark:text-gray-500 pl-6">
                  {platform}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
