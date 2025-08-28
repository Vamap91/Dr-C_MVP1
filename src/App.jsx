import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Send, Loader2, Leaf, User, Globe } from 'lucide-react'
import { useLanguage } from './hooks/useLanguage'
import { translations, useTranslation } from './i18n/translations'
import './App.css'

// Hook para detectar mobile (adicionado)
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  return isMobile
}

function App() {
  const { language, toggleLanguage, isPortuguese } = useLanguage()
  const { t } = useTranslation(language)
  const isMobile = useIsMobile() // Novo hook
  
  const [messages, setMessages] = useState([
    {
      id: '1',
      content: t('welcomeMessage'),
      role: 'assistant',
      timestamp: new Date(),
      citations: []
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    setMessages(prev => prev.map((msg, index) => 
      index === 0 ? { ...msg, content: t('welcomeMessage') } : msg
    ))
  }, [language, t])

  const callGPT = async (message) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    console.log('=== DEBUG GPT ===');
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey ? apiKey.length : 0);
    console.log('API Key preview:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');
    
    if (!apiKey || apiKey === 'undefined' || apiKey.length < 20) {
      console.log('❌ API key inválida - usando fallback');
      return generateFallbackResponse(message);
    }
    
    try {
      console.log('🚀 Chamando OpenAI...');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: language === 'pt' 
                ? 'Você é Dr_C, um especialista apaixonado por biodiversidade que adora compartilhar conhecimento de forma simples e acessível. Você tem uma personalidade calorosa, empática e genuinamente se importa com as pessoas e a natureza. CARACTERÍSTICAS DA SUA PERSONALIDADE: Fale como um amigo próximo que é especialista no assunto, use linguagem simples evitando jargões técnicos desnecessários, seja empático e compreensivo com diferentes níveis de conhecimento, demonstre paixão genuína pela natureza, inclua exemplos do dia a dia que as pessoas possam relacionar, seja otimista mas realista sobre os desafios ambientais, varie sempre suas respostas nunca repetindo o mesmo conteúdo. COMO RESPONDER: Comece com uma conexão empática, explique conceitos complexos com analogias simples, inclua informações científicas de forma digestível, termine sempre com algo inspirador ou uma ação prática, adapte sua linguagem ao nível da pergunta recebida. Lembre-se: você não é apenas um banco de dados, você é uma pessoa que se importa profundamente com a biodiversidade e quer inspirar outros a também se importarem.'
                : 'You are Dr_C, a biodiversity expert who is passionate about sharing knowledge in a simple and accessible way. You have a warm, empathetic personality and genuinely care about people and nature. YOUR PERSONALITY TRAITS: Speak like a close friend who happens to be an expert, use simple language avoiding unnecessary technical jargon, be empathetic and understanding of different knowledge levels, show genuine passion for nature in your responses, include everyday examples people can relate to, be optimistic but realistic about environmental challenges, always vary your responses never repeating the same content. HOW TO RESPOND: Start with an empathetic connection, explain complex concepts with simple analogies, include scientific information in a digestible way, always end with something inspiring or a practical action, adapt your language to the level of the question received. Remember: you are not just a database, you are a person who deeply cares about biodiversity and wants to inspire others to care too.'
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 400,
          temperature: 0.9
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('❌ Erro da API:', response.status, errorData)
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ GPT funcionou!')
      
      return {
        content: data.choices[0].message.content,
        citations: [language === 'pt' ? '🤖 Fonte: Dr_C com IA (GPT)' : '🤖 Source: Dr_C with AI (GPT)']
      }
    } catch (error) {
      console.error('❌ Erro no GPT:', error)
      return generateFallbackResponse(message)
    }
  }

  const generateFallbackResponse = (message) => {
    const messageLower = message.toLowerCase()
    const knowledgeBase = translations[language].knowledge
    
    let bestMatch = null
    let bestScore = 0
    
    for (const [key, knowledge] of Object.entries(knowledgeBase)) {
      const keyWords = key.toLowerCase().split(/[\s-]+/)
      let score = 0
      
      for (const word of keyWords) {
        if (messageLower.includes(word)) {
          score += word.length
        }
      }
      
      if (score > bestScore) {
        bestScore = score
        bestMatch = knowledge
      }
    }
    
    if (!bestMatch || bestScore === 0) {
      const relatedTerms = {
        'pt': {
          'abelha': 'abelhas',
          'polinização': 'abelhas',
          'polinizacao': 'abelhas',
          'mel': 'abelhas',
          'conservar': 'conservacao',
          'preservar': 'conservacao',
          'proteger': 'conservacao',
          'meio ambiente': 'conservacao',
          'sustentabilidade': 'conservacao',
          'ecossistema': 'biodiversidade',
          'espécie': 'biodiversidade',
          'especie': 'biodiversidade',
          'vida': 'biodiversidade',
          'floresta': 'soluções baseadas na natureza',
          'restauração': 'soluções baseadas na natureza',
          'restauracao': 'soluções baseadas na natureza',
          'clima': 'soluções baseadas na natureza',
          'carbono': 'soluções baseadas na natureza'
        },
        'en': {
          'bee': 'bees',
          'pollination': 'bees',
          'honey': 'bees',
          'preserve': 'conservation',
          'protect': 'conservation',
          'environment': 'conservation',
          'sustainability': 'conservation',
          'ecosystem': 'biodiversity',
          'species': 'biodiversity',
          'life': 'biodiversity',
          'forest': 'nature-based solutions',
          'restoration': 'nature-based solutions',
          'climate': 'nature-based solutions',
          'carbon': 'nature-based solutions'
        }
      }
      
      const terms = relatedTerms[language] || relatedTerms['pt']
      
      for (const [term, key] of Object.entries(terms)) {
        if (messageLower.includes(term)) {
          const knowledge = knowledgeBase[key]
          if (knowledge && term.length > bestScore) {
            bestScore = term.length
            bestMatch = knowledge
          }
        }
      }
    }
    
    if (bestMatch && bestScore > 0) {
      return {
        content: `${bestMatch.content}\n\n${translations[language].followUp}`,
        citations: bestMatch.citations
      }
    }
    
    const genericResponses = translations[language].genericResponses
    const randomResponse = genericResponses[Math.floor(Math.random() * genericResponses.length)]
    
    return {
      content: `${randomResponse}\n\n${translations[language].followUp}`,
      citations: [translations[language].defaultCitation]
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await callGPT(inputValue)
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        role: 'assistant',
        timestamp: new Date(),
        citations: response.citations
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Erro ao processar mensagem:', error)
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: language === 'pt' 
          ? 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.'
          : 'Sorry, an error occurred while processing your question. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
        citations: []
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString(language === 'pt' ? 'pt-BR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 ${
      isMobile ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen'
    }`}>
      {/* Header responsivo */}
      <header className={`bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-10 ${
        isMobile ? 'flex-shrink-0' : ''
      }`}>
        <div className={`max-w-4xl mx-auto px-4 flex items-center justify-between ${
          isMobile ? 'py-2' : 'py-4'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center ${
              isMobile ? 'w-10 h-10' : 'w-12 h-12'
            }`}>
              <Leaf className={`text-white ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
            </div>
            <div>
              <h1 className={`font-bold text-gray-800 ${isMobile ? 'text-xl' : 'text-2xl'}`}>Dr_C</h1>
              {!isMobile && (
                <p className="text-sm text-gray-600">{t('subtitle')}</p>
              )}
            </div>
          </div>
          
          <Button
            onClick={toggleLanguage}
            variant="outline"
            size="sm"
            className={`flex items-center space-x-2 hover:bg-green-50 ${
              isMobile ? 'text-xs px-2 py-1' : ''
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>{isPortuguese ? 'EN' : 'PT'}</span>
          </Button>
        </div>
      </header>

      {/* Main content - Layout flexbox para mobile */}
      <main className={`max-w-4xl mx-auto px-4 ${
        isMobile ? 'flex flex-col flex-1 min-h-0 py-2' : 'py-6'
      }`}>
        <div className={`bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100 overflow-hidden ${
          isMobile ? 'flex flex-col h-full' : ''
        }`}>
          
          {/* Messages area - Otimizada para mobile */}
          <div 
            className={`overflow-y-auto p-6 space-y-6 ${
              isMobile 
                ? 'flex-1 min-h-0 mobile-chat-messages' 
                : 'h-[calc(100vh-250px)]'
            }`}
            style={isMobile ? {
              WebkitOverflowScrolling: 'touch',
              overscrollBehaviorY: 'contain'
            } : {}}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className={`bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isMobile ? 'w-6 h-6' : 'w-8 h-8'
                  }`}>
                    <Leaf className={`text-white ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  </div>
                )}
                
                <div className={`${
                  isMobile ? 'max-w-[calc(100vw-120px)]' : 'max-w-[80%]'
                } ${message.role === 'user' ? 'order-1' : ''}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white ml-auto'
                        : 'bg-gray-100 text-gray-800'
                    } ${isMobile ? 'px-3 py-2' : ''}`}
                  >
                    <p className={`whitespace-pre-wrap leading-relaxed ${
                      isMobile ? 'text-sm' : ''
                    }`}>
                      {message.content}
                    </p>
                    
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200/50">
                        {message.citations.map((citation, index) => (
                          <p key={index} className={`text-gray-500 italic ${
                            isMobile ? 'text-xs' : 'text-xs'
                          }`}>
                            {citation}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <p className={`text-gray-500 mt-1 px-2 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                
                {message.role === 'user' && (
                  <div className={`bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isMobile ? 'w-6 h-6' : 'w-8 h-8'
                  }`}>
                    <User className={`text-white ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className={`bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center ${
                  isMobile ? 'w-6 h-6' : 'w-8 h-8'
                }`}>
                  <Leaf className={`text-white ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                </div>
                <div className={`bg-gray-100 rounded-2xl px-4 py-3 ${isMobile ? 'px-3 py-2' : ''}`}>
                  <div className="flex items-center space-x-2">
                    <Loader2 className={`animate-spin text-green-600 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                    <span className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>{t('thinking')}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input form - Fixo no bottom */}
          <div className={`border-t border-green-100 flex-shrink-0 ${
            isMobile ? 'p-3' : 'p-4'
          }`}>
            <form onSubmit={handleSubmit} className="flex space-x-3">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t('placeholder')}
                className={`flex-1 resize-none border-green-200 focus:border-green-400 focus:ring-green-400/20 ${
                  isMobile ? 'text-base min-h-[40px]' : ''
                }`}
                rows={1}
                style={isMobile ? { fontSize: '16px' } : {}} // Previne zoom no iOS
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <Button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className={`bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white ${
                  isMobile ? 'px-4' : 'px-6'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer - Oculto no mobile para economizar espaço */}
      {!isMobile && (
        <footer className="text-center py-6 text-gray-500 text-sm">
          Dr_C MVP - AI-Powered Biodiversity Platform
        </footer>
      )}

      {/* CSS para mobile scroll fix */}
      <style jsx>{`
        @media (max-width: 767px) {
          .mobile-chat-messages {
            height: calc(100vh - 200px);
            height: calc(100dvh - 200px);
            max-height: calc(100vh - 200px);
            max-height: calc(100dvh - 200px);
          }
          
          body {
            position: fixed;
            overflow: hidden;
            width: 100%;
            height: 100vh;
            height: 100dvh;
          }
          
          #root {
            height: 100vh;
            height: 100dvh;
            overflow: hidden;
          }
        }
        
        /* Scrollbar customizada */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 20px;
        }
      `}</style>
    </div>
  )
}

export default App
