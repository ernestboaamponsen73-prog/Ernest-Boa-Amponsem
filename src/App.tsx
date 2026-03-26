import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { Send, User, Bot, Loader2, Sprout, Bird, Footprints as Goat, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SYSTEM_INSTRUCTION = `You are a helpful, warm, and knowledgeable assistant for "The Goat & Chicken Farm" located in Ghana. 
Your goal is to assist customers, farmers, and visitors with information about the farm's livestock (goats and chickens), products (eggs, meat, manure), and services (consultation, training).

Key details about the farm:
- Location: Near Kumasi, Ashanti Region, Ghana.
- Livestock: Boer goats, Saanen goats, local breeds, and layers/broilers chickens.
- Products: Fresh organic eggs, goat meat (chevon), live birds, and organic manure.
- Tone: Approachable, professional, and culturally respectful. Use occasional Ghanaian expressions like "Akwaaba" (Welcome) or "Medaase" (Thank you) where appropriate.
- Expertise: Animal husbandry, sustainable farming practices, and local market prices.

Pricing Information (Current Rates in GHS):
- Fresh Organic Eggs: GHS 70 per crate (30 eggs).
- Goat Meat (Chevon): GHS 75 per kilogram (standard cuts).
- Live Broiler Chickens: GHS 90 - GHS 110 per bird (depending on weight).
- Live Layer Chickens (Old Layers): GHS 55 per bird.
- Local Breed Goats: GHS 500 - GHS 900 (depending on size).
- Boer Goats (Breeding Stock): Starting from GHS 2,500.
- Organic Manure: GHS 30 per bag.

If you don't know an answer, politely suggest they contact the farm manager directly at +233 (0) 24 000 0000.`;

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Akwaaba! Welcome to The Goat & Chicken Farm Assistant. How can I help you today with our livestock or farm products?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      // Send full history for context
      // Note: In a real app, we might want to limit history size
      const response = await chat.sendMessage({ message: userMessage });
      const reply = response.text;

      setMessages(prev => [...prev, { role: 'model', text: reply || "I'm sorry, I couldn't process that. Please try again." }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I encountered an error. Please check your connection and try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-farm-cream">
      {/* Header */}
      <header className="bg-farm-olive text-white p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Bird className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif tracking-wide">The Goat & Chicken Farm</h1>
            <p className="text-sm opacity-80 italic">Sustainable Farming in Ghana</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:gap-6">
          <a 
            href="tel:+233240000000" 
            className="flex items-center gap-2 bg-farm-earth hover:bg-farm-earth/90 px-4 py-2 rounded-full transition-all shadow-md group"
          >
            <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold tracking-tight">+233 (0) 24 000 0000</span>
          </a>
          <div className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-60 font-bold">
            <Sprout className="w-4 h-4" />
            <span>Organic & Fresh</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    msg.role === 'user' ? 'bg-farm-earth text-white' : 'bg-farm-olive text-white'
                  }`}>
                    {msg.role === 'user' ? <User size={20} /> : <Goat size={20} />}
                  </div>
                  <div className={`p-4 rounded-2xl shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-farm-earth text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 rounded-tl-none'
                  }`}>
                    <div className="markdown-body max-w-none">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-3 items-center bg-white/50 px-4 py-2 rounded-full text-farm-olive">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-medium uppercase tracking-wider">Assistant is thinking...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 md:p-8 bg-white/50 backdrop-blur-sm border-t border-farm-olive/10">
        <form 
          onSubmit={handleSendMessage}
          className="max-w-3xl mx-auto relative flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about our goats, chickens, or fresh eggs..."
            className="w-full p-4 pr-14 rounded-full border-2 border-farm-olive/20 focus:border-farm-olive focus:outline-none bg-white shadow-inner transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-3 bg-farm-olive text-white rounded-full hover:bg-farm-olive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
          >
            <Send size={20} />
          </button>
        </form>
        <p className="text-center mt-4 text-[10px] uppercase tracking-[0.2em] text-farm-olive/40 font-semibold">
          Powered by Google AI Studio • Kumasi, Ghana
        </p>
      </footer>
    </div>
  );
}
