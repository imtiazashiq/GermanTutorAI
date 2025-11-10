import { useState, useRef, useEffect } from 'react';
import { Send, Languages, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sendChatMessage, ChatMessage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

/**
 * Chat component - Main interface for German-English conversation
 */
export const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [language, setLanguage] = useState<'en-de' | 'de-en'>('en-de');
  const [formality, setFormality] = useState<'du' | 'sie'>('du');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        message: userMessage.content,
        language,
        formality,
        conversationHistory: messages,
      });

      const botMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast({
      title: 'Chat cleared',
      description: 'Your conversation history has been cleared.',
    });
  };

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden border border-border shadow-card font-mono rounded-lg">
      {/* Header - Modern Terminal Style */}
      <div className="bg-gradient-primary border-b border-border/50 p-4 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="text-terminal-cyan font-semibold">root@german-learning</span>
          <span className="text-terminal-cyan-dim">:~$</span>
          <span className="text-terminal-cyan animate-pulse">_</span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-terminal-cyan-dim hover:text-primary transition-colors text-xs px-3 py-1.5 border border-border hover:border-primary rounded hover:shadow-glow"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Controls - Modern CLI Style */}
      <div className="p-4 bg-muted/50 border-b border-border/50 flex flex-wrap gap-4 text-sm backdrop-blur-sm">
        <div className="flex-1 min-w-[200px]">
          <label className="text-terminal-cyan-dim mb-2 block font-medium">&gt; LANG_DIRECTION</label>
          <Select value={language} onValueChange={(val) => setLanguage(val as 'en-de' | 'de-en')}>
            <SelectTrigger className="w-full bg-card border-border text-foreground font-mono hover:border-primary transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border z-50 font-mono shadow-card">
              <SelectItem value="en-de" className="text-foreground hover:bg-primary/10 focus:bg-primary/10">EN → DE</SelectItem>
              <SelectItem value="de-en" className="text-foreground hover:bg-primary/10 focus:bg-primary/10">DE → EN</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="text-terminal-cyan-dim mb-2 block font-medium">&gt; FORMALITY</label>
          <Select value={formality} onValueChange={(val) => setFormality(val as 'du' | 'sie')}>
            <SelectTrigger className="w-full bg-card border-border text-foreground font-mono hover:border-primary transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border z-50 font-mono shadow-card">
              <SelectItem value="du" className="text-foreground hover:bg-primary/10 focus:bg-primary/10">DU (informal)</SelectItem>
              <SelectItem value="sie" className="text-foreground hover:bg-primary/10 focus:bg-primary/10">SIE (formal)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Messages - Modern Terminal Output */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background/50 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="text-terminal-cyan-dim space-y-1.5 text-sm">
            <p className="flex items-center gap-2">
              <span className="text-terminal-cyan">&gt;</span> System initialized...
            </p>
            <p className="flex items-center gap-2">
              <span className="text-terminal-cyan">&gt;</span> Ready for input.
            </p>
            <p className="flex items-center gap-2">
              <span className="text-terminal-cyan">&gt;</span> Type message to begin conversation
              <span className="animate-pulse">_</span>
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className="animate-fade-in font-mono text-sm">
              {message.role === 'user' ? (
                <div className="bg-chat-user border-l-4 border-primary px-5 py-4 rounded-lg shadow-sm">
                  <span className="text-terminal-cyan font-semibold block mb-2 text-sm">&gt; USER</span>
                  <p className="text-chat-user-foreground leading-relaxed text-base whitespace-pre-wrap">{message.content}</p>
                </div>
              ) : (
                <div className="bg-chat-bot border-l-4 border-terminal-purple px-5 py-4 rounded-lg shadow-sm">
                  <span className="text-terminal-purple font-semibold block mb-3 text-sm">&gt; ASSISTANT</span>
                  <div className="text-chat-bot-foreground leading-relaxed text-base">
                    <MarkdownRenderer content={message.content} />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="animate-fade-in text-terminal-cyan flex items-center gap-2">
            <span>&gt;</span> Processing<span className="animate-pulse">...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Modern Command Line */}
      <div className="p-5 bg-muted/50 border-t border-border/50 backdrop-blur-sm">
        <div className="flex gap-3 items-center">
          <span className="text-terminal-cyan font-bold text-lg">$</span>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter command..."
            disabled={isLoading}
            className="flex-1 bg-card border-border text-foreground placeholder:text-muted-foreground font-mono focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="text-primary-foreground bg-primary border border-primary px-5 py-2 rounded hover:bg-primary/90 hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono font-semibold"
          >
            {isLoading ? '...' : 'SEND'}
          </button>
        </div>
      </div>
    </div>
  );
};
