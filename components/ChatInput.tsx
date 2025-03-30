"use client";

import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';

interface ChatInputProps {
  sessionId: string | null;
  onNewSession: (sessionId: string) => void;
}

export default function ChatInput({ sessionId, onNewSession }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [newSessionId, setNewSessionId] = useState('');
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    
    // For existing session
    if (sessionId) {
      try {
        setSending(true);
        
        // In static export mode, we don't connect to Supabase
        if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
          // Static export fallback
          setTimeout(() => {
            alert('This is a static demo version. In the hosted version, messages would be sent to the API.');
            setMessage('');
            setSending(false);
          }, 1000);
          return;
        }
        
        // Insert the human message
        const { error } = await supabase
          .from('n8n_chat_histories')
          .insert({
            session_id: sessionId,
            message: {
              type: 'human',
              content: message.trim()
            }
          });

        if (error) throw error;
        
        setMessage('');
        
        // Trigger AI response via API
        try {
          await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              session_id: sessionId,
              message: message.trim()
            }),
          });
        } catch (apiError) {
          console.error('Error getting AI response:', apiError);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message');
      } finally {
        setSending(false);
      }
      return;
    }
    
    // For new session creation
    if (!selectedPlatform || !newSessionId.trim()) {
      alert('Please select a platform and enter a session ID');
      return;
    }

    try {
      setSending(true);
      
      // Create formatted session ID with platform prefix
      const formattedSessionId = `${selectedPlatform}_${newSessionId.trim()}`;
      
      // In static export mode, we don't connect to Supabase
      if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
        // Static export fallback
        setTimeout(() => {
          alert('This is a static demo version. In the hosted version, a new chat session would be created.');
          
          // Tell parent about the new session anyway for demo purposes
          onNewSession(formattedSessionId);
          
          // Reset form state
          setNewSessionId('');
          setSelectedPlatform('');
          setIsCreatingSession(false);
          setMessage('');
          setSending(false);
        }, 1000);
        return;
      }
      
      // Insert the human message
      const { error } = await supabase
        .from('n8n_chat_histories')
        .insert({
          session_id: formattedSessionId,
          message: {
            type: 'human',
            content: message.trim()
          }
        });

      if (error) throw error;
      
      // Tell parent about the new session
      onNewSession(formattedSessionId);
      
      // Reset form state
      setNewSessionId('');
      setSelectedPlatform('');
      setIsCreatingSession(false);
      setMessage('');
      
      // Trigger AI response via API
      try {
        await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: formattedSessionId,
            message: message.trim()
          }),
        });
      } catch (apiError) {
        console.error('Error getting AI response:', apiError);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  }

  function handleCreateSession() {
    setIsCreatingSession(true);
  }

  function handleCancelCreate() {
    setIsCreatingSession(false);
    setNewSessionId('');
  }

  const [selectedPlatform, setSelectedPlatform] = useState<'line' | 'messenger' | 'instagram' | ''>('');
  
  if (isCreatingSession) {
    return (
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-medium mb-4">Create New Chat Session</h3>
          
          <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-2">Platform</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`flex items-center gap-2 px-4 py-2 rounded-md border ${
                    selectedPlatform === 'line' 
                      ? 'bg-green-100 dark:bg-green-900 border-green-500' 
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedPlatform('line')}
                >
                  <span>🟢</span>
                  <span>LINE</span>
                </button>
                
                <button
                  type="button"
                  className={`flex items-center gap-2 px-4 py-2 rounded-md border ${
                    selectedPlatform === 'messenger' 
                      ? 'bg-blue-100 dark:bg-blue-900 border-blue-500' 
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedPlatform('messenger')}
                >
                  <span>🔵</span>
                  <span>Messenger</span>
                </button>
                
                <button
                  type="button"
                  className={`flex items-center gap-2 px-4 py-2 rounded-md border ${
                    selectedPlatform === 'instagram' 
                      ? 'bg-purple-100 dark:bg-purple-900 border-purple-500' 
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedPlatform('instagram')}
                >
                  <span>📸</span>
                  <span>Instagram</span>
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="session-id" className="block text-sm font-medium mb-1">Session ID</label>
              <div className="flex">
                {selectedPlatform && (
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                    {selectedPlatform}_
                  </span>
                )}
                <input
                  id="session-id"
                  type="text"
                  value={newSessionId}
                  onChange={(e) => setNewSessionId(e.target.value)}
                  placeholder="Enter a unique identifier (e.g. customer name or ID)"
                  className={`w-full p-2 border border-gray-300 dark:border-gray-600 ${
                    selectedPlatform ? 'rounded-r-md' : 'rounded-md'
                  } bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Complete session ID will be: {selectedPlatform && `${selectedPlatform}_`}{newSessionId || 'example'}
              </p>
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">First Message</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
                required
              />
            </div>
            
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={handleCancelCreate}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                disabled={sending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={sending || !selectedPlatform || !newSessionId.trim() || !message.trim()}
              >
                {sending ? (
                  <><span className="animate-spin mr-2">↻</span> Creating...</>
                ) : (
                  'Create & Send'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        {sessionId ? (
          <form className="flex flex-col space-y-2" onSubmit={handleSubmit}>
            <div className="flex space-x-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[50px] max-h-[120px] resize-y"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-stretch flex items-center justify-center"
                disabled={sending || !message.trim()}
              >
                {sending ? (
                  <span className="animate-spin">↻</span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
              <span>Press Shift+Enter for new line</span>
              <span>{message.length} characters</span>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="text-center mb-2">
              <h3 className="text-lg font-medium mb-1">Welcome to the Message Management System</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select a chat session from the sidebar or create a new one
              </p>
            </div>
            
            <button
              onClick={handleCreateSession}
              className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Chat Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
