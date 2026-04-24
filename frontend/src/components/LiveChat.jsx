import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import api from '../lib/api'

const POLL_INTERVAL = 3000

export default function LiveChat() {
  const location = useLocation()
  const { user } = useAuthStore()

  // ── 1. All hooks must be at the very top ──────────────────────────────────
  const [isOpen, setIsOpen]         = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [chatId, setChatId]         = useState(null)
  const [messages, setMessages]     = useState([])
  const [loading, setLoading]       = useState(false)
  const [sending, setSending]       = useState(false)
  const [isOnline, setIsOnline]     = useState(true)
  const [initError, setInitError]   = useState(false)

  // Dragging state
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition]     = useState({ x: 0, y: 0 })
  const [opensUpward, setOpensUpward] = useState(true)
  const [alignsRight, setAlignsRight] = useState(true)

  const msgsEndRef   = useRef(null)
  const pollRef      = useRef(null)
  const chatIdRef    = useRef(null)
  const containerRef = useRef(null)
  const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 })
  const hasMovedRef  = useRef(false)

  // Sync ref for polling
  useEffect(() => { chatIdRef.current = chatId }, [chatId])

  // Scroll to bottom
  useEffect(() => {
    if (isOpen && msgsEndRef.current) {
      msgsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const fetchMessages = useCallback(async (id) => {
    if (!id) return
    try {
      const { data } = await api.get(`/chat/${id}/messages`)
      setMessages(data)
    } catch (_) {}
  }, [])

  const initSession = useCallback(async () => {
    if (chatId) return
    setLoading(true)
    setInitError(false)
    try {
      const guestName = user?.fullName || 'Guest'
      const { data } = await api.post('/chat/session', {
        guestName,
        customerId: user?.id || null,
      })
      setChatId(data.id)
      setIsOnline(true)
      await fetchMessages(data.id)
    } catch (_) {
      setInitError(true)
      setIsOnline(false)
      setMessages([{
        id: 'fallback',
        is_from_admin: true,
        sender_name: 'PharmaLink Support',
        message: 'Hello! How can we help you today?',
        created_at: new Date().toISOString(),
      }])
    } finally {
      setLoading(false)
    }
  }, [chatId, user, fetchMessages])

  // Chat Polling Effect
  useEffect(() => {
    const isInsideAdmin = location.pathname.startsWith('/admin')
    if (!isOpen || isInsideAdmin) {
      clearInterval(pollRef.current)
      return
    }
    initSession()
    pollRef.current = setInterval(() => {
      fetchMessages(chatIdRef.current)
    }, POLL_INTERVAL)
    return () => clearInterval(pollRef.current)
  }, [isOpen, initSession, fetchMessages, location.pathname])

  // Dragging Gesture Helpers
  const handleStart = (clientX, clientY) => {
    setIsDragging(true)
    hasMovedRef.current = false
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      startX: position.x,
      startY: position.y
    }
  }

  const handleMove = (clientX, clientY) => {
    if (!isDragging) return
    const dx = clientX - dragStartRef.current.x
    const dy = clientY - dragStartRef.current.y
    const newX = dragStartRef.current.startX + dx
    const newY = dragStartRef.current.startY + dy
    
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasMovedRef.current = true
    }

    setPosition({ x: newX, y: newY })
    setOpensUpward(clientY > window.innerHeight / 2)
    setAlignsRight(clientX > window.innerWidth / 2)
  }

  const handleEnd = () => {
    setIsDragging(false)
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const padding = 16
      let clampX = 0
      let clampY = 0
      if (rect.left < padding) clampX = padding - rect.left
      if (rect.right > window.innerWidth - padding) clampX = (window.innerWidth - padding) - rect.right
      if (rect.top < padding) clampY = padding - rect.top
      if (rect.bottom > window.innerHeight - padding) clampY = (window.innerHeight - padding) - rect.bottom
      if (clampX !== 0 || clampY !== 0) {
        setPosition(prev => ({ x: prev.x + clampX, y: prev.y + clampY }))
      }
    }
  }

  // Dragging Event Listeners Effect
  useEffect(() => {
    if (!isDragging) return
    const onMouseMove = (e) => handleMove(e.clientX, e.clientY)
    const onMouseUp = () => handleEnd()
    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    }
    const onTouchEnd = () => handleEnd()

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [isDragging])

  // ── 2. Early return AFTER all hooks ───────────────────────────────────────
  const isAdminPath = location.pathname.startsWith('/admin')
  if (isAdminPath) return null

  // ── 3. Sub-components and logic ───────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || !chatId || sending) return
    const text = inputValue.trim()
    setInputValue('')
    setSending(true)

    const optimistic = {
      id: `opt-${Date.now()}`,
      is_from_admin: false,
      sender_name: user?.fullName || 'You',
      message: text,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])

    try {
      await api.post(`/chat/${chatId}/messages`, {
        message: text,
        senderName: user?.fullName || 'Guest',
        senderId: user?.id || null,
        isAdmin: false,
      })
      await fetchMessages(chatId)
    } catch (_) {
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const toggleChat = (e) => {
    if (!hasMovedRef.current) {
      setIsOpen(o => !o)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`fixed z-50 flex transition-all duration-500 pointer-events-none ${
        opensUpward ? 'flex-col' : 'flex-col-reverse'
      } ${
        alignsRight ? 'items-end' : 'items-start'
      } ${
        location.pathname.startsWith('/portal/rfq') || location.pathname.startsWith('/rfq') || location.pathname.startsWith('/portal/compare') || location.pathname.startsWith('/products')
          ? 'bottom-20 sm:bottom-28 right-4 sm:right-8'
          : 'bottom-6 sm:bottom-8 right-4 sm:right-8'
      }`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.19, 1, 0.22, 1), bottom 0.3s, right 0.3s',
        touchAction: 'none'
      }}
    >
      {/* ── Chat Window (Mobile: Fullscreen, Desktop: Popup) ────────────────────── */}
      <div
        className={`
          flex flex-col overflow-hidden bg-white/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] 
          border border-gray-200/50 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
          ${isOpen 
            ? 'opacity-100 scale-100 pointer-events-auto' 
            : 'opacity-0 scale-90 pointer-events-none'
          }
          ${/* Mobile: Full-screen relative to viewport, Desktop: Fixed size */ ''}
          fixed md:relative top-0 left-0 md:top-auto md:left-auto
          w-screen h-screen md:w-[380px] md:h-[min(520px,calc(100vh-140px))]
          md:rounded-3xl
          ${isOpen ? 'translate-y-0' : (opensUpward ? 'translate-y-10' : '-translate-y-10')}
          ${opensUpward ? 'md:mb-4' : 'md:mt-4'}
          ${alignsRight ? 'md:origin-bottom-right' : 'md:origin-bottom-left'}
        `}
        style={{
          zIndex: 100,
          // On mobile, we override the natural positioning to fill the screen
          ...(isOpen && typeof window !== 'undefined' && window.innerWidth < 768 ? {
            position: 'fixed',
            inset: 0,
            transform: 'none',
            borderRadius: 0,
            width: '100vw',
            height: '100dvh'
          } : {})
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="bg-primary/95 backdrop-blur-md px-5 py-4 flex items-center justify-between flex-shrink-0 shadow-sm relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-4 relative">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary font-black text-xl shadow-inner">
                P
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-primary ${isOnline ? 'bg-green-400' : 'bg-gray-400'} shadow-sm`} />
            </div>
            <div className="min-w-0">
              <p className="text-white font-black text-sm tracking-tight leading-none mb-1">PharmaLink Support</p>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isOnline ? 'bg-green-300' : 'bg-gray-300'}`} />
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{isOnline ? 'Online' : 'Away'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-90 text-white"
            >
              <span className="material-symbols-outlined text-2xl font-bold">close</span>
            </button>
          </div>
        </div>

        {/* ── Messages Area ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 bg-gray-50/50 scroll-smooth">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
              <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Syncing Chat...</p>
            </div>
          ) : initError ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl">cloud_off</span>
              </div>
              <div>
                <p className="font-black text-gray-900 text-lg mb-1 tracking-tight">Offline</p>
                <p className="text-xs text-gray-500 font-medium">We couldn't connect to the secure server.</p>
              </div>
              <button
                onClick={() => { setInitError(false); setChatId(null); initSession() }}
                className="px-8 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all pointer-events-auto"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <>
              {/* Intelligent Date Marker */}
              <div className="flex items-center gap-4 py-4 opacity-30">
                <div className="h-px bg-gray-400 flex-1" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-900">Secure Channel</span>
                <div className="h-px bg-gray-400 flex-1" />
              </div>

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.is_from_admin ? 'items-start' : 'items-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div className={`
                    max-w-[85%] px-5 py-3.5 text-sm font-semibold leading-relaxed shadow-sm
                    ${m.is_from_admin
                      ? 'bg-white text-gray-800 rounded-3xl rounded-tl-lg border border-gray-100'
                      : 'bg-primary text-white rounded-3xl rounded-tr-lg'
                    }
                  `}>
                    {m.message}
                  </div>
                  <p className="text-[9px] text-gray-400 font-bold mt-1.5 px-2 flex items-center gap-1">
                    {m.is_from_admin && <span className="text-primary font-black uppercase tracking-tighter mr-1">{m.sender_name} •</span>}
                    {formatTime(m.created_at)}
                  </p>
                </div>
              ))}
              <div ref={msgsEndRef} />
            </>
          )}
        </div>

        {/* ── Native-Style Input Bar ────────────────────────────────────────── */}
        <div className="px-5 py-4 bg-white border-t border-gray-100 sm:pb-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-[2rem] border border-gray-200/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/5 transition-all"
          >
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={initError ? 'Connection failed' : 'Write your message...'}
              disabled={!chatId || sending || initError}
              className="flex-1 bg-transparent px-4 py-2.5 text-sm font-bold text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || !chatId || sending || initError}
              className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-20 shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-90"
            >
              <span className="material-symbols-outlined text-xl">
                {sending ? 'sync' : 'arrow_upward'}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* ── Enhanced Toggle Bubble ───────────────────────────────────────────── */}
      <div className="relative group">
        {/* Subtle Hint Tooltip */}
        {!isOpen && !isDragging && (
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 hidden sm:block pointer-events-none group-hover:block transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
            <div className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-xl whitespace-nowrap">
              Chat with us
            </div>
          </div>
        )}

        <button
          onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
          onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
          onClick={toggleChat}
          className={`
            w-16 h-16 bg-primary text-white rounded-[2rem] shadow-[0_15px_40px_rgba(0,63,135,0.4)] 
            flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 
            outline-none relative cursor-move pointer-events-auto z-10 overflow-hidden
            ${isDragging ? 'scale-110 shadow-2xl ring-4 ring-primary/20 rotate-12' : ''}
            ${isOpen ? 'rounded-2xl rotate-90 !bg-slate-900 scale-90 md:scale-100' : ''}
          `}
        >
          {/* Drag Handle Indicator */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-white/20 rounded-full md:opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <span className={`material-symbols-outlined text-3xl transition-all duration-500 font-bold ${isOpen ? 'rotate-[-90deg]' : 'rotate-0'}`}>
            {isOpen ? 'close' : 'chat_bubble'}
          </span>

          {/* Unread dot / Glow */}
          {!isOpen && messages.some(m => m.is_from_admin) && (
            <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full border-4 border-primary animate-bounce shadow-sm" />
          )}
        </button>
      </div>
    </div>
  )
}

