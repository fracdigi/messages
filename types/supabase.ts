export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      n8n_chat_histories: {
        Row: {
          id: number
          session_id: string
          message: {
            type: 'ai' | 'human'
            content: string
          }
          created_at?: string
        }
        Insert: {
          id?: number
          session_id: string
          message: {
            type: 'ai' | 'human'
            content: string
          }
          created_at?: string
        }
        Update: {
          id?: number
          session_id?: string
          message?: {
            type: 'ai' | 'human'
            content: string
          }
          created_at?: string
        }
      }
    }
  }
}
