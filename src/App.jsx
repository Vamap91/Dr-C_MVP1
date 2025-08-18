import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Textarea } from '@/components/textarea.jsx'
import { Send, Loader2, Leaf, User, Globe } from 'lucide-react'
import { useLanguage } from './hooks/useLanguage'
import { translations, useTranslation } from './i18n/translations'
import './App.css'

function App() {
  const { language, toggleLanguage, isPortuguese } = useLanguage()
  const { t } = useTranslation(language)
  
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

  // Atualizar mensagem de boas-vindas quando idioma mudar
  useEffect(() => {
    setMessages(prev => prev.map((msg, index) => 
      index === 0 ? { ...msg, content: t('welcomeMessage') } : msg
    ))
  }, [language, t])

  // Função para chamar GPT
  const callGPT = async (message) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: language === 'pt' 
                ? 'Você é Dr_C, um guia digital especialista em biodiversidade. Responda de forma educativa e inspiradora sobre natureza, conservação, ecossistemas e soluções baseadas na natureza. Sempre inclua informações científicas e seja otimista sobre a conservação. Mantenha as respostas concisas mas informativas.'
                : 'You are Dr_C, a digital guide expert in biodiversity. Answer in an educational and inspiring way about nature, conservation, ecosystems and nature-based solutions. Always include scientific information and be optimistic about conservation. Keep answers concise but informative.'
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error('Erro na API do OpenAI')
      }

      const data = await response.json()
      return {
        content: data.choices[0].message.content,
        citations: [language === 'pt' ? 'Fonte: Dr_C com IA' : 'Source: Dr_C with AI']
      }
    } catch (error) {
      console.error('Erro ao chamar GPT:', error)
      return generateFallbackResponse(message)
    }
  }

  // Função de fallback (sistema atual)
  const generateFallbackResponse = (message) => {
    const messageLower = message.toLowerCase()
    const knowledgeBase = translations[language].knowledge
    
    let bestMatch = null
    let bestScore = 0
    
    // Buscar correspondências diretas
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
    
    // Buscar por termos relacionados
    if (!bestMatch || bestScore === 0) {
      const searchTerms = {
        pt: {
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
        en: {
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
      
      const currentSearchTerms = searchTerms[language] || searchTerms.pt
      
      for (const [searchTerm, knowledgeKey] of Object.entries(currentSearchTerms)) {
        if (messageLower.includes(searchTerm)) {
          const knowledge = knowledgeBase[knowledgeKey]
          if (knowledge && searchTerm.length > bestScore) {
            bestScore = searchTerm.length
            bestMatch = knowledge
          }
        }
      }
    }
    
    // Se encontrou um tópico relevante
    if (bestMatch && bestScore > 0) {
      return {
        content: `${bestMatch.content}\n\n${t('followUp')}`,
        citations: bestMatch.citations
      }
    }
    
    // Resposta genérica
    const genericResponses = translations[language].genericResponses
    const randomResponse = genericResponses[Math.floor(Math.random() * genericResponses.length)]
    
    return {
      content: `${randomResponse}\n\n${t('followUp')}`,
      citations: [t('defaultCitation')]
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
    const currentInput = inputValue
    setInputValue('')
    setIsLoading(true)

    try {
      // Tentar usar GPT primeiro, depois fallback
      const response = await callGPT(currentInput)
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        role: 'assistant',
        timestamp: new Date(),
        citations: response.citations || []
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Erro ao processar mensagem:', error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: language === 'pt' 
          ? 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.'
          : 'Sorry, an error occurred while processing your message. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Função para lidar com Enter no textarea
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center mb-4 relative">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">🌱</span>
            </div>
            
            {/* Language Toggle */}
            <Button
              onClick={toggleLanguage}
              className="absolute -right-12 top-0 w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200"
              variant="ghost"
              size="sm"
            >
              <div className="flex flex-col items-center">
                <Globe className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-600">
                  {isPortuguese ? 'EN' : 'PT'}
                </span>
              </div>
            </Button>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            Dr_C
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </header>

        {/* Chat Interface */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Chat Messages */}
            <div className="h-96 md:h-[500px] overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-blue-500' 
                      : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Leaf className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 max-w-xs md:max-w-md lg:max-w-lg ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    <div className={`inline-block p-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {/* Citations */}
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.citations.map((citation, index) => (
                          <div key={index} className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                            {citation}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className={`text-xs text-gray-400 mt-1 ${
                      message.role === 'user' ? 'text-right' : 'text-left'
                    }`}>
                      {message.timestamp.toLocaleTimeString(language === 'pt' ? 'pt-BR' : 'en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Leaf className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block p-3 rounded-2xl bg-gray-100">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                        <span className="text-sm text-gray-500">{t('thinking')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form - MELHORADO COM TEXTAREA */}
            <div className="border-t border-gray-100 p-4">
              <form onSubmit={handleSubmit} className="flex space-x-3">
                <div className="flex-1">
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('placeholder')}
                    className="resize-none min-h-[60px] max-h-[120px] border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    disabled={isLoading}
                    rows={2}
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    {language === 'pt' ? 'Pressione Enter para enviar, Shift+Enter para nova linha' : 'Press Enter to send, Shift+Enter for new line'}
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="self-end px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-500">
          <p className="text-sm">
            {t('footer')}
          </p>
          <p className="text-xs mt-2">
            © 2025 - Todos os direitos reservados a Charles Gully Frewen Webster
          </p>
        </footer>
      </div>
    </main>
  )
}

export default App
