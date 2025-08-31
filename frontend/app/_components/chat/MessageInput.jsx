'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Send, 
  X
} from 'lucide-react';

export default function MessageInput({ onSendMessage, socket, chatId }) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Handle typing indicators - only emit to others, not self
  useEffect(() => {
    if (message.trim() && !isTyping) {
      setIsTyping(true);
      socket?.emit('typing_start', chatId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socket?.emit('typing_stop', chatId);
      }
    }, 1000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, socket, chatId]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
      
      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        socket?.emit('typing_stop', chatId);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  return (
    <div className="space-y-3">
      {/* Main input area */}
      <div className="flex items-center space-x-3 p-3 bg-gray-900/30 rounded-xl border border-red-900/20 backdrop-blur-sm">
        {/* Message input */}
        <div className="flex-1">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your dark message..."
            className="bg-transparent border-0 text-red-100 placeholder-gray-400 focus:ring-0 focus:outline-none text-sm"
            maxLength={1000}
          />
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim()}
          size="sm"
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white disabled:bg-gray-700 disabled:text-gray-400 transition-all duration-200 shadow-lg shadow-red-600/20 rounded-lg px-4"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick hint */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <span>Press Enter to send • Shift+Enter for new line</span>
        <span className="text-red-400/60">{message.length}/1000</span>
      </div>
    </div>
  );
}
