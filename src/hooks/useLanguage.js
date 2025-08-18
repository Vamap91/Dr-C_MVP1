import { useState, useEffect } from 'react'

export const useLanguage = () => {
  // Detectar idioma do navegador ou usar português como padrão
  const getInitialLanguage = () => {
    const saved = localStorage.getItem('dr-c-language')
    if (saved) return saved
    
    const browserLang = navigator.language.toLowerCase()
    return browserLang.startsWith('en') ? 'en' : 'pt'
  }
  
  const [language, setLanguage] = useState(getInitialLanguage)
  
  // Salvar idioma no localStorage
  useEffect(() => {
    localStorage.setItem('dr-c-language', language)
    document.documentElement.lang = language === 'en' ? 'en-US' : 'pt-BR'
  }, [language])
  
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'pt' ? 'en' : 'pt')
  }
  
  const setLanguageDirectly = (lang) => {
    if (lang === 'pt' || lang === 'en') {
      setLanguage(lang)
    }
  }
  
  return {
    language,
    toggleLanguage,
    setLanguage: setLanguageDirectly,
    isPortuguese: language === 'pt',
    isEnglish: language === 'en'
  }
}
