import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_id, message } = body;
    
    if (!session_id || !message) {
      return NextResponse.json({ error: 'Missing session_id or message' }, { status: 400 });
    }
    
    // Add a short delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a simple AI response based on the user's message
    const aiResponse = generateResponse(message);
    
    // Insert the AI response to the same session
    const { error } = await supabase
      .from('n8n_chat_histories')
      .insert({
        session_id,
        message: {
          type: 'ai',
          content: aiResponse
        }
      });
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Simple function to generate responses
function generateResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return '你好！有什麼我可以幫助你的嗎？';
  }
  
  if (lowerMessage.includes('how are you') || lowerMessage.includes('how\'s it going')) {
    return '我很好，謝謝關心！你呢？';
  }
  
  if (lowerMessage.includes('thank')) {
    return '不客氣！隨時都可以問我問題。';
  }
  
  if (lowerMessage.includes('?') || lowerMessage.includes('？')) {
    return '這是個好問題。讓我思考一下... 基於目前的資訊，我建議可以從以下幾個方向思考這個問題...';
  }
  
  // Default response
  return `我收到了你的訊息：「${userMessage}」。我會盡快處理並回覆你。`;
}