import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import useAuthStore from '../store/authStore'

export default function CustomerChat() {
  const { t } = useTranslation()
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [inputValue, setInputValue] = useState('')
  const [chatId, setChatId] = useState(() => sessionStorage.getItem('activeChatId'))
  const [isUploading, setIsUploading] = useState(false)
  const [threadSearch, setThreadSearch] = useState('')
  const [isThreadSearchOpen, setIsThreadSearchOpen] = useState(false)
  
  const msgsEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // 1. Initialize/Sync session
  const { data: chatSession } = useQuery({
    queryKey: ['customer-chat-session', user?.id],
    queryFn: async () => {
      const resp = await api.post('/chat/session', {
        chatId: sessionStorage.getItem('activeChatId'),
        customerId: user?.id,
        guestName: user?.fullName
      })
      if (resp.data?.id) {
        setChatId(resp.data.id)
        sessionStorage.setItem('activeChatId', resp.data.id)
      }
      return resp.data
    },
    enabled: !!user
  })

  // 2. Fetch messages
  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['customer-chat-messages', chatId],
    queryFn: () => api.get(`/chat/${chatId}/messages`).then(r => r.data),
    enabled: !!chatId,
    refetchInterval: 3000,
  })

  // 3. Send message mutation
  const sendMutation = useMutation({
    mutationFn: (text) => api.post(`/chat/${chatId}/messages`, {
      message: text,
      senderName: user?.fullName || 'Customer',
      senderId: user?.id,
      isAdmin: false
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['customer-chat-messages', chatId])
      setInputValue('')
    }
  })

  // 4. File upload mutation
  const uploadMutation = useMutation({
    mutationFn: (formData) => api.post(`/chat/${chatId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['customer-chat-messages', chatId])
      setIsUploading(false)
    },
    onError: () => setIsUploading(false)
  })

  useEffect(() => {
    if (msgsEndRef.current) {
      msgsEndRef.current.scrollTop = msgsEndRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!inputValue.trim() || !chatId || chatSession?.status === 'CLOSED') return
    sendMutation.mutate(inputValue)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file || !chatId) return
    const formData = new FormData()
    formData.append('file', file)
    formData.append('senderName', user?.fullName || 'Customer')
    formData.append('senderId', user?.id)
    formData.append('isAdmin', 'false')
    setIsUploading(true)
    uploadMutation.mutate(formData)
    e.target.value = null
  }

  const displayMessages = isThreadSearchOpen && threadSearch 
    ? messages.filter(m => m.message.toLowerCase().includes(threadSearch.toLowerCase()))
    : messages

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-surface font-body text-on-surface overflow-hidden">
      {/* Sidebar — matches CustomerDashboard exactly */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] bg-surface-container-low border-r border-outline-variant/10 py-6">
        {/* User info */}
        <div className="px-6 mb-6 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {user?.fullName?.[0] || 'C'}
          </div>
          <div className="min-w-0">
            <p className="font-headline font-bold text-primary text-sm truncate">{user?.fullName}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.companyName}</p>
          </div>
        </div>

        <div className="px-4 mb-3">
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Menu</p>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {[
            { to: '/portal',      icon: 'dashboard',      label: 'Dashboard',       exact: true },
            { to: '/rfq',         icon: 'add_circle',     label: 'New RFQ' },
            { to: '/portal/chat', icon: 'chat',           label: 'Live Support' },
            { to: '/products',    icon: 'inventory_2',    label: 'Product Catalog' },
            { to: '/compare',     icon: 'compare_arrows', label: 'Compare' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.to}
              onClick={(e) => { e.preventDefault(); navigate(item.to) }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                window.location.pathname === item.to
                  ? 'bg-white text-primary font-bold shadow-sm'
                  : 'text-slate-500 hover:bg-white/60 hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="px-4 pt-4 border-t border-outline-variant/10 mt-4">
          <button
            onClick={() => { clearAuth(); navigate('/login') }}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-error transition-colors w-full px-4 py-2"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header */}
        <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">support_agent</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-base leading-tight">Live Support</h1>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${chatSession?.status === 'OPEN' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {chatSession?.status === 'OPEN' ? 'Active Session' : 'Closed'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
             {isThreadSearchOpen && (
                <input 
                  type="text" 
                  autoFocus 
                  placeholder="Search messages..." 
                  value={threadSearch}
                  onChange={e => setThreadSearch(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary w-40 animate-in slide-in-from-right-2"
                />
             )}
             <button onClick={() => setIsThreadSearchOpen(!isThreadSearchOpen)} className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isThreadSearchOpen ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 text-gray-400'}`}>
                <span className="material-symbols-outlined text-xl">search</span>
             </button>
          </div>
        </div>

        {/* Message Thread */}
        <div ref={msgsEndRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8F9FB]">
          {loadingMessages ? (
            <div className="h-full flex items-center justify-center">
              <span className="animate-spin material-symbols-outlined text-gray-300 text-2xl">progress_activity</span>
            </div>
          ) : (
            displayMessages.map((m, idx) => {
              const isMe = !m.is_from_admin;
              const isSequence = idx > 0 && displayMessages[idx - 1].is_from_admin === m.is_from_admin;
              return (
                <div key={m.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isSequence ? '!mt-1' : ''}`}>
                  <div className="flex flex-col max-w-[75%] md:max-w-[60%]">
                    {!isSequence && !isMe && (
                      <span className="text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase tracking-tight">Support Agent</span>
                    )}
                    <div className={`px-4 py-2.5 text-[14px] shadow-sm leading-relaxed ${
                      isMe 
                        ? 'bg-primary text-white rounded-2xl rounded-tr-sm' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm'
                    }`}>
                      {m.file_url ? (
                        <div className="flex flex-col gap-2 min-w-[200px]">
                           <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined">{m.mime_type?.startsWith('image/') ? 'image' : 'description'}</span>
                              <span className="text-xs font-bold truncate">{m.file_name}</span>
                           </div>
                           {m.mime_type?.startsWith('image/') && (
                              <img src={m.file_url} className="max-h-60 rounded-lg object-contain bg-black/5" alt="" />
                           )}
                           <a href={m.file_url} target="_blank" rel="noreferrer" className={`py-1.5 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold ${isMe ? 'bg-white/20 text-white' : 'bg-primary/5 text-primary'}`}>
                              <span className="material-symbols-outlined text-sm">download</span>
                              Download
                           </a>
                        </div>
                      ) : m.message}
                    </div>
                    {!isSequence && (
                      <span className={`text-[9px] text-gray-400 mt-1 font-medium px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
          {isUploading && (
             <div className="flex justify-end">
                <div className="bg-primary/5 text-primary px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-2 animate-pulse">
                   <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>
                   Sending file...
                </div>
             </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
           {chatSession?.status === 'CLOSED' ? (
             <div className="p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-500 font-medium border border-dashed border-gray-200">
                This conversation has been closed by an administrator.
             </div>
           ) : (
             <form onSubmit={handleSend} className="flex gap-2 items-end max-w-4xl mx-auto w-full">
                <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all flex items-center overflow-hidden">
                   <input 
                      type="text" 
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 bg-transparent py-3.5 px-5 outline-none text-sm text-gray-800"
                   />
                   <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">attach_file</span>
                   </button>
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                </div>
                <button 
                  type="submit" 
                  disabled={!inputValue.trim() || sendMutation.isPending}
                  className="h-[48px] px-6 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-40 flex items-center gap-2"
                >
                   {sendMutation.isPending ? '...' : (
                      <>
                        <span>Send</span>
                        <span className="material-symbols-outlined text-base">send</span>
                      </>
                   )}
                </button>
             </form>
           )}
           <p className="text-[10px] text-center text-gray-400 mt-3 font-medium">Our support team typically responds within 10 minutes.</p>
        </div>
      </main>
    </div>
  )
}
