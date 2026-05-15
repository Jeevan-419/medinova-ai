import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import axios from 'axios';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I am MediNova AI, your healthcare assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const newUserMsg = { id: Date.now(), text: userText, isBot: false };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/chat', 
        { message: userText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessages(prev => [...prev, { id: Date.now(), text: res.data.reply, isBot: true }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now(), text: "Sorry, I am having trouble connecting to the network.", isBot: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary-600 to-cyan-500 rounded-full shadow-[0_0_20px_rgba(14,165,233,0.4)] flex items-center justify-center text-white z-40 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageSquare size={24} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400">
                    <Bot size={22} />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">MediNova AI</h3>
                  <p className="text-primary-400 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse"></span> Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/50">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex items-end gap-2 ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {msg.isBot && (
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 mb-1">
                      <Bot size={14} />
                    </div>
                  )}
                  <div 
                    className={`max-w-[75%] p-3 text-sm ${
                      msg.isBot 
                        ? 'bg-slate-800 text-slate-200 rounded-2xl rounded-bl-sm border border-slate-700/50' 
                        : 'bg-primary-600 text-white rounded-2xl rounded-br-sm shadow-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {!msg.isBot && (
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 mb-1">
                      <User size={14} />
                    </div>
                  )}
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2 justify-start">
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 mb-1">
                    <Bot size={14} />
                  </div>
                  <div className="bg-slate-800 rounded-2xl rounded-bl-sm border border-slate-700/50 p-4 flex items-center gap-1.5 w-16">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your health query..."
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-full pl-5 pr-12 py-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder-slate-500"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <Send size={14} className="ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
