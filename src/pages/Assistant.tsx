import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { mockProducts, mockSales, mockDeliveries, mockVendors } from '../data';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hello! I am your FreshSync AI Assistant. You can ask me questions about your sales, inventory, vendors, or deliveries. For example, "What were the sales for today?" or "Which items are low on stock?"' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      // Prepare context from mock data
      const todaySales = mockSales.filter(s => new Date(s.date).toDateString() === new Date().toDateString());
      const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
      const lowStock = mockProducts.filter(p => p.stock <= p.minStock).map(p => `${p.name} (${p.stock} left)`).join(', ');
      
      const productList = mockProducts.map(p => `- ${p.name} (Category: ${p.category}, Stock: ${p.stock}, Price: $${p.price})`).join('\n        ');

      const systemInstruction = `
        You are an AI assistant for a grocery store inventory management system called FreshSync.
        You have access to the following current data:
        - Today's Revenue: $${todayRevenue.toFixed(2)}
        - Total Products in Inventory: ${mockProducts.length}
        - Low Stock Items: ${lowStock || 'None'}
        - Pending Deliveries: ${mockDeliveries.filter(d => d.status === 'pending').length}
        - Total Vendors: ${mockVendors.length}
        
        Detailed Product List:
        ${productList}
        
        Answer the user's questions concisely and professionally based on this data. If they ask something outside of this data, politely explain what you can help with.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction,
        }
      });

      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: response.text || 'I am sorry, I could not process that request.' 
      }]);
    } catch (error) {
      console.error('Error calling Gemini:', error);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: 'Sorry, I encountered an error while trying to answer your question. Please check your API key configuration.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-50">
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-sm' 
                  : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-sm shadow-sm'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white border border-zinc-200 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-3 text-zinc-500">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span>Analyzing store data...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-6 bg-white border-t border-zinc-200">
        <div className="max-w-3xl mx-auto relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about sales, inventory, or vendors..."
            className="w-full pl-12 pr-16 py-4 bg-zinc-100 border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none shadow-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 text-white rounded-xl transition-colors shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-xs text-zinc-400 mt-3">
          AI Assistant uses Gemini to analyze your store's mock data.
        </p>
      </div>
    </div>
  );
}
