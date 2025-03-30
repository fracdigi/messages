export interface Message {
  id: number
  type: 'ai' | 'human'
  content: string
  created_at?: string
}

export interface ChatSession {
  session_id: string
  messages: Message[]
  last_message?: string
  updated_at?: string
}
