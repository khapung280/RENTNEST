import { useState, useEffect, useRef, useCallback } from 'react'
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  MapPin,
  Trash2,
  ChevronDown,
  Zap,
  BookOpen,
  ExternalLink
} from 'lucide-react'
import { aiService } from '../services/aiService'
import { Link, useNavigate } from 'react-router-dom'

const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80'

/** Renders **bold** and line structure for AI replies */
function FormattedBotContent({ text, className = '' }) {
  if (!text) return null
  const paragraphs = text.split(/\n\n/)
  return (
    <div className={`text-sm leading-relaxed ${className}`}>
      {paragraphs.map((para, pi) => (
        <div key={pi} className={pi > 0 ? 'mt-3' : ''}>
          {para.split('\n').map((line, li) => (
            <p
              key={li}
              className={`text-neutral-200 ${line.trim().startsWith('•') ? 'pl-0.5 my-0.5' : 'my-0.5'}`}
            >
              <LineParts text={line} />
            </p>
          ))}
        </div>
      ))}
    </div>
  )
}

function LineParts({ text }) {
  const segments = text.split(/(\*\*[^*]+\*\*)/g)
  return segments.map((seg, i) => {
    if (seg.startsWith('**') && seg.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-white">
          {seg.slice(2, -2)}
        </strong>
      )
    }
    return <span key={i}>{seg}</span>
  })
}

const QUICK_PROMPTS = {
  search: [
    { label: 'Kathmandu houses', q: 'Show me houses in Kathmandu under 30000' },
    { label: 'Pokhara flats', q: '2 bedroom flat in Pokhara budget 25000' },
    { label: 'Budget deal', q: 'Properties under 15000 NPR per month' },
    { label: 'Verified only', q: 'Verified listings in Lalitpur' }
  ],
  learn: [
    { label: 'FairFlex', q: 'How does FairFlex pricing work?' },
    { label: 'How to book', q: 'How do I book a property step by step?' },
    { label: 'Cancel booking', q: 'What is the cancellation policy?' }
  ]
}

const WELCOME_TEXT = `Hi — I'm **RentNest AI**, your rental assistant for Nepal.

**Ask in plain English**, for example:
• "3 BHK house Baneshwor under 35k"
• "Studio flat Pokhara"
• "What is FairFlex?"

I can search live listings, explain pricing, and guide you through booking.`

const AIChatbot = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [promptsOpen, setPromptsOpen] = useState(true)
  const messagesEndRef = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    setMessages((prev) => {
      if (prev.length > 0) return prev
      return [
        {
          id: 'welcome',
          isAI: true,
          content: WELCOME_TEXT,
          timestamp: new Date()
        }
      ]
    })
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  const clearChat = useCallback(() => {
    setConversationId(null)
    setMessages([
      {
        id: 'welcome',
        isAI: true,
        content: WELCOME_TEXT,
        timestamp: new Date()
      }
    ])
    setPromptsOpen(true)
  }, [])

  const handleSend = async (text = input) => {
    const messageText = (text || input).trim()
    if (!messageText || loading) return

    const userMessage = {
      id: Date.now(),
      isAI: false,
      content: messageText,
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setPromptsOpen(false)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            isAI: true,
            content:
              '**Sign in required**\n\nThe AI assistant uses your account to save chat history and search listings.\n\nPlease log in and try again.',
            timestamp: new Date(),
            showLoginButton: true
          }
        ])
        setLoading(false)
        return
      }

      const response = await aiService.chat(messageText, conversationId)

      if (response.success) {
        const { aiMessage, response: aiResponse } = response.data

        if (!conversationId && response.data.conversation) {
          setConversationId(response.data.conversation._id)
        }

        const aiMsg = {
          id: aiMessage._id || Date.now(),
          isAI: true,
          content: aiResponse.message,
          timestamp: new Date(aiMessage.createdAt),
          properties: aiResponse.properties || [],
          responseType: aiResponse.type
        }

        setMessages((prev) => [...prev, aiMsg])
      }
    } catch (error) {
      console.error('Chat error:', error)
      let errorMessage = 'Sorry, something went wrong. Please try again.'

      if (error.response?.status === 400) {
        const data = error.response.data
        if (data.errors && Array.isArray(data.errors)) {
          const errorList = data.errors.map((err) => `• ${err.msg || err.message}`).join('\n')
          errorMessage = `${data.message || 'Validation failed'}\n\n${errorList}`
        } else {
          errorMessage = data.message || 'Invalid request.'
        }
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage =
          '**Session issue**\n\nPlease log in again. Your session may have expired.'
      } else if (error.response?.status === 500) {
        errorMessage =
          '**Server error**\n\nThe AI service is temporarily unavailable. Please try in a moment.'
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        errorMessage =
          '**Connection problem**\n\nCheck your internet connection and that the API is reachable.'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          isAI: true,
          content: errorMessage,
          timestamp: new Date()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (d) => {
    if (!d) return ''
    const date = d instanceof Date ? d : new Date(d)
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom,0px)+0.75rem)] right-4 z-[9999] group flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 pl-4 pr-5 py-3 text-white shadow-xl shadow-violet-600/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-violet-500/40 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-neutral-950 sm:bottom-6 sm:right-6"
          aria-label="Open AI assistant"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
            <MessageCircle className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-violet-600" />
          </span>
          <span className="hidden sm:inline text-sm font-semibold tracking-tight">Ask AI</span>
          <Sparkles className="h-4 w-4 text-amber-200/90 hidden sm:block" />
        </button>
      )}

      {isOpen && (
        <div
          ref={panelRef}
          className="fixed inset-x-3 top-[max(5.25rem,env(safe-area-inset-top,0px)+4.25rem)] bottom-[max(7.5rem,env(safe-area-inset-bottom,0px)+6rem)] z-[9999] flex flex-col sm:inset-auto sm:left-auto sm:top-auto sm:bottom-32 sm:right-6 sm:h-[min(640px,calc(100dvh-9rem))] sm:w-[min(440px,calc(100vw-2rem))] sm:max-h-[calc(100dvh-10rem)] animate-slide-in-chat"
        >
          <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl shadow-black/40 ring-1 ring-white/5">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 px-4 py-3.5 text-white shrink-0">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="relative flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base leading-tight">RentNest AI</h3>
                    <p className="text-xs text-violet-100/90 mt-0.5">
                      Property search · FairFlex · Booking help
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={clearChat}
                    className="rounded-lg p-2 text-white/80 hover:bg-white/15 hover:text-white transition-colors"
                    title="New chat"
                    aria-label="New chat"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg p-2 text-white/80 hover:bg-white/15 hover:text-white transition-colors"
                    aria-label="Close chat"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-neutral-950 to-neutral-950/95 min-h-0">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.isAI ? 'justify-start' : 'justify-end'} animate-fade-in`}
                >
                  {msg.isAI && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600/40 to-indigo-600/30 border border-violet-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot size={17} className="text-violet-200" />
                    </div>
                  )}
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 shadow-lg ${
                      msg.isAI
                        ? 'bg-neutral-800/90 border border-neutral-700/80 rounded-tl-md'
                        : 'bg-gradient-to-br from-violet-600 to-indigo-600 rounded-tr-md text-white'
                    }`}
                  >
                    {msg.isAI ? (
                      <FormattedBotContent text={msg.content} />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap text-white">{msg.content}</p>
                    )}

                    <p
                      className={`text-[10px] mt-2 opacity-60 ${
                        msg.isAI ? 'text-neutral-500' : 'text-violet-200'
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </p>

                    {msg.showLoginButton && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false)
                            navigate('/login')
                          }}
                          className="w-full rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-sm font-semibold py-2.5 px-4 transition-colors"
                        >
                          Go to login
                        </button>
                      </div>
                    )}

                    {msg.properties && msg.properties.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-neutral-700/60 pt-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                          Matching listings
                        </p>
                        {msg.properties.slice(0, 5).map((property, idx) => (
                          <Link
                            key={property._id}
                            to={`/property/${property._id}`}
                            className={`block overflow-hidden rounded-xl border transition-all duration-200 hover:border-violet-500/50 hover:bg-neutral-700/50 ${
                              idx === 0
                                ? 'border-violet-500/40 ring-1 ring-violet-500/20'
                                : 'border-neutral-600/80'
                            }`}
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="flex gap-3 p-2">
                              <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-700">
                                <img
                                  src={property.image || PLACEHOLDER_IMG}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                                {idx === 0 && (
                                  <span className="absolute left-1 top-1 rounded bg-violet-600/90 px-1.5 py-0.5 text-[9px] font-bold text-white">
                                    Top pick
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1 py-0.5">
                                <p className="text-xs font-semibold text-white truncate leading-snug">
                                  {property.title}
                                </p>
                                <p className="flex items-center gap-1 text-[11px] text-neutral-400 mt-0.5 truncate">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  {property.location}
                                </p>
                                <p className="text-xs font-bold text-violet-300 mt-1 tabular-nums">
                                  NPR {property.price?.toLocaleString?.() ?? property.price}
                                  <span className="font-normal text-neutral-500">/mo</span>
                                </p>
                              </div>
                              <ExternalLink className="w-4 h-4 text-neutral-500 shrink-0 self-center" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  {!msg.isAI && (
                    <div className="w-9 h-9 rounded-xl bg-neutral-700/80 border border-neutral-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User size={16} className="text-violet-300" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-2 justify-start animate-fade-in">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600/40 to-indigo-600/30 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                    <Bot size={17} className="text-violet-300" />
                  </div>
                  <div className="bg-neutral-800/90 border border-neutral-700 rounded-2xl rounded-tl-md px-4 py-3 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1" aria-label="Assistant is typing">
                        <span
                          className="h-2 w-2 rounded-full bg-violet-400 animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        />
                        <span
                          className="h-2 w-2 rounded-full bg-violet-400 animate-bounce"
                          style={{ animationDelay: '120ms' }}
                        />
                        <span
                          className="h-2 w-2 rounded-full bg-violet-400 animate-bounce"
                          style={{ animationDelay: '240ms' }}
                        />
                      </div>
                      <span className="text-xs text-neutral-500">Searching & thinking…</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            {messages.length <= 1 && !loading && (
              <div className="border-t border-neutral-800 bg-neutral-900/95 px-3 py-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPromptsOpen(!promptsOpen)}
                  className="flex w-full items-center justify-between text-left text-xs font-medium text-neutral-400 hover:text-neutral-200 py-1"
                >
                  <span className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Quick prompts
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${promptsOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {promptsOpen && (
                  <div className="mt-2 space-y-2 max-h-[9rem] overflow-y-auto pr-1">
                    <p className="text-[10px] uppercase tracking-wider text-neutral-600 font-semibold">
                      Search
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_PROMPTS.search.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => handleSend(p.q)}
                          className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 hover:border-violet-500/40 hover:bg-neutral-700/80 transition-colors"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-neutral-600 font-semibold pt-1">
                      Learn
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_PROMPTS.learn.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => handleSend(p.q)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 hover:border-violet-500/40 transition-colors"
                        >
                          <BookOpen className="w-3 h-3 opacity-70" />
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-neutral-800 bg-neutral-900 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about areas, budget, FairFlex, booking…"
                  disabled={loading}
                  className="flex-1 min-w-0 px-3.5 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="shrink-0 px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl disabled:opacity-45 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-900/30"
                  aria-label="Send"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[10px] text-neutral-600 mt-2 text-center">
                AI uses live listings · Sign in required · Press Esc to close
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AIChatbot
