import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Loader2, 
  MessageSquare, 
  ChevronDown, 
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const FloatingChat: React.FC = () => {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) return null;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      text: 'Olá, Gestor(a)! Sou a **Inteligência Artificial da Unimar**.\n\nEstou pronta para responder todas as suas dúvidas sobre o manual de **Mídia Compartilhada**, cálculo de verbas, limite de CAC (R$ 90,00 por aluno) e regras de prestação de contas. Como posso ajudar você hoje?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    const lower = queryText.toLowerCase();
    const isHumanContactIntent = 
      lower.includes('atendente') || 
      lower.includes('humano') || 
      lower.includes('falar conosco') || 
      lower.includes('falar com alguem') || 
      lower.includes('falar com alguém') || 
      lower.includes('falar com um atendente') || 
      lower.includes('suporte humano') || 
      lower.includes('contato humano') || 
      lower.includes('falar direto');

    if (isHumanContactIntent) {
      setTimeout(() => {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: 'Para falar diretamente conosco, você pode clicar no botão do WhatsApp localizado no balão no canto esquerdo da tela, ou ligar/enviar mensagem no número (14) 99812-4403.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMessage]);
        setLoading(false);
      }, 300);
      return;
    }

    try {
      // Build conversation history for API
      const apiMessages = messages
        .filter(m => m.id !== 'welcome-1')
        .map(m => ({
          role: m.role,
          content: m.text
        }));
      apiMessages.push({ role: 'user', content: queryText });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: apiMessages })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao conectar com a IA.');
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'Recebi sua mensagem, mas não consegui formatar uma resposta.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: `⚠️ **Ops!** Tive um problema ao consultar a base do guia de mídia (${err.message || 'Erro no servidor'}). Por favor, tente novamente em instantes.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-1',
        role: 'assistant',
        text: 'Conversa reiniciada! Como posso ajudar você com as diretrizes de Mídia Compartilhada da Unimar?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Simple text renderer helper to format bold text & lists
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      if (!line.trim()) return <div key={idx} className="h-2" />;

      // Format bold text **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-black text-[#003b70]">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        return (
          <li key={idx} className="ml-4 list-disc my-1 leading-relaxed text-slate-800">
            {formattedParts}
          </li>
        );
      }

      return (
        <p key={idx} className="my-1 leading-relaxed text-slate-800">
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div className="w-[calc(100vw-2.5rem)] sm:w-[420px] h-[580px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-[#dce5ee] flex flex-col overflow-hidden mb-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#001c37] via-[#003b70] to-[#0074b8] text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 text-[#5bd5ff]">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#003b70] rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-black tracking-tight text-white">
                    Tira-Dúvidas IA Unimar
                  </h3>
                  <span className="bg-[#00a9e8] text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md">
                    24/7
                  </span>
                </div>
                <p className="text-[11px] text-sky-200 font-medium">
                  Base oficial de Mídia Compartilhada
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Limpar Conversa"
                className="p-2 text-sky-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Fechar Chat"
                className="p-2 text-sky-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subheader info badge */}
          <div className="bg-[#eef6fb] border-b border-[#dce5ee] px-4 py-2 flex items-center justify-between text-[11px] text-[#0074b8] font-bold">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00a9e8]" />
              <span>Dúvidas sobre verbas, CAC R$ 90 e notas fiscais</span>
            </div>
            <span className="text-emerald-600 font-extrabold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-[#003b70] text-[#5bd5ff] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#003b70] to-[#0074b8] text-white rounded-tr-xs'
                      : 'bg-white border border-[#dce5ee] text-slate-800 rounded-tl-xs'
                  }`}
                >
                  <div className="space-y-1">
                    {msg.role === 'assistant' ? (
                      renderFormattedText(msg.text)
                    ) : (
                      <p className="leading-relaxed font-medium">{msg.text}</p>
                    )}
                  </div>
                  <div
                    className={`text-[9px] mt-2 text-right ${
                      msg.role === 'user' ? 'text-sky-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-[#0074b8] bg-white border border-[#dce5ee] p-3 rounded-2xl max-w-[80%] shadow-xs">
                <Loader2 className="w-4 h-4 animate-spin text-[#00a9e8]" />
                <span className="font-semibold">Buscando diretriz oficial no manual...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-[#dce5ee] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Pergunte sobre regras, verbas ou documentos..."
              disabled={loading}
              className="flex-1 bg-slate-100 focus:bg-white text-xs font-medium text-slate-800 placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-transparent focus:border-[#0074b8] focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-[#003b70] hover:bg-[#0074b8] text-white p-2.5 rounded-xl shadow-sm transition-all disabled:opacity-40 disabled:hover:bg-[#003b70] cursor-pointer flex-shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>

        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative bg-gradient-to-r from-[#001c37] via-[#003b70] to-[#0074b8] hover:from-[#003b70] hover:to-[#00a9e8] text-white p-4 sm:px-5 sm:py-3.5 rounded-full shadow-2xl border-2 border-white/20 flex items-center gap-3 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
      >
        {/* Glow Ring */}
        <span className="absolute -inset-1 rounded-full bg-[#00a9e8] opacity-30 blur-md group-hover:opacity-60 transition-opacity animate-pulse pointer-events-none" />

        <div className="relative flex items-center justify-center">
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <div className="relative">
              <Bot className="w-6 h-6 text-[#5bd5ff]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-[#003b70]" />
            </div>
          )}
        </div>

        <div className="relative hidden sm:flex flex-col items-start text-left">
          <span className="text-xs font-black tracking-wide leading-none text-white flex items-center gap-1">
            Tirar Dúvidas <Sparkles className="w-3 h-3 text-[#5bd5ff]" />
          </span>
          <span className="text-[10px] font-bold text-sky-200 leading-tight">
            IA Unimar Rozinho EAD
          </span>
        </div>
      </button>

    </div>
  );
};
