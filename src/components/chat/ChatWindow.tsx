import React, { useEffect, useRef, useState } from 'react';

import { ThemeToggle } from '../ui/ThemeToggle';

import type { Coach } from '../../types/coach';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'coach';
  timestamp: Date;
  isRead?: boolean;
}

interface ChatWindowProps {
  coach: Coach;
  onClose: () => void;
  onLogout?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ coach, onClose, onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Estoy aquí para ayudarte. ¿En qué puedo apoyarte hoy?',
      sender: 'coach',
      timestamp: new Date(Date.now() - 300000), // 5 minutos atrás
      isRead: true,
    },
    {
      id: '2',
      text: 'Hola, me gustaría saber más sobre tus sesiones de coaching.',
      sender: 'user',
      timestamp: new Date(Date.now() - 240000), // 4 minutos atrás
      isRead: true,
    },
    {
      id: '3',
      text: 'Perfecto. Trabajo principalmente con técnicas de coaching ejecutivo y desarrollo personal. ¿Hay algún área específica en la que te gustaría enfocarte?',
      sender: 'coach',
      timestamp: new Date(Date.now() - 180000), // 3 minutos atrás
      isRead: true,
    },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
      isRead: false,
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Simular que el coach está escribiendo
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const coachResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Gracias por tu mensaje. Te responderé pronto.',
        sender: 'coach',
        timestamp: new Date(),
        isRead: false,
      };
      setMessages(prev => [...prev, coachResponse]);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans gradient-bg">
      {/* Header */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <i className="fas fa-arrow-left text-lg" />
            </button>

            <div className="relative">
              <img
                src={coach.profileimage || '/placeholder-avatar.jpg'}
                alt={coach.displayname}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800" />
            </div>

            <div>
              <h1 className="text-lg font-semibold text-slate-800 dark:text-white">
                {coach.displayname}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isTyping ? 'Escribiendo...' : 'En línea'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <i className="fas fa-video text-lg" />
            </button>
            <button className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <i className="fas fa-phone text-lg" />
            </button>
            <ThemeToggle />
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <i className="fas fa-sign-out-alt text-lg" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 max-h-[calc(100vh-140px)] overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-bl-sm shadow-sm'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === 'user'
                      ? 'text-indigo-200'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl rounded-bl-sm bg-white dark:bg-slate-700 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  />
                  <div
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <i className="fas fa-paperclip text-lg" />
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <button className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <i className="fas fa-smile text-lg" />
            </button>

            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <i className="fas fa-paper-plane text-sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
