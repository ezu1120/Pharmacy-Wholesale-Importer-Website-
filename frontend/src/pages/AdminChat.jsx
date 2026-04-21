import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import AdminLayout from '../components/AdminLayout'
import useAuthStore from '../store/authStore'

export default function AdminChat() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [selectedChat, setSelectedChat] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [sidebarSearch, setSidebarSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL, OPEN, CLOSED
  const [threadSearch, setThreadSearch] = useState('')
  const [isThreadSearchOpen, setIsThreadSearchOpen] = useState(false)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  const markAsReadMutation = useMutation({
    mutationFn: (id) => api.post(`/chat/admin/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-chat-sessions'])
      queryClient.invalidateQueries(['admin-chat-sessions-badge'])
    }
  })

  const msgsEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // 1. Fetch all chat sessions
  const { data: sessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['admin-chat-sessions'],
    queryFn: () => api.get('/chat/admin/sessions').then(r => r.data),
    refetchInterval: 3000,
    onSuccess: (data) => {
       // If currently selected chat has new messages, mark as read
       const active = data.find(s => s.id === selectedChat?.id)
       if (active && active.unreadCount > 0) {
         markAsReadMutation.mutate(active.id)
       }
    }
  })

  // Ensure we have the freshest version of the selected chat from the sessions list
  const activeChat = sessions.find(s => s.id === selectedChat?.id) || selectedChat;

  // 2. Fetch messages for selected chat
  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['admin-chat-messages', selectedChat?.id],
    queryFn: () => api.get(`/chat/${selectedChat.id}/messages`).then(r => r.data),
    enabled: !!selectedChat,
    refetchInterval: 3000, // Poll for new messages more frequently when active
  })

  // 3. Send message mutation
  const sendMutation = useMutation({
    mutationFn: (text) => api.post(`/chat/${selectedChat.id}/messages`, {
      message: text,
      senderName: user?.fullName || 'Admin',
      senderId: user?.id,
      isAdmin: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-chat-messages', selectedChat?.id])
      setInputValue('')
    }
  })

  // 4. Update status mutation
  const statusMutation = useMutation({
    mutationFn: ({ chatId, status }) => api.patch(`/chat/admin/${chatId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-chat-sessions'])
      setIsMoreMenuOpen(false)
    }
  })

  // 5. File upload mutation
  const uploadMutation = useMutation({
    mutationFn: (formData) => api.post(`/chat/${selectedChat.id}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-chat-messages', selectedChat?.id])
      setIsUploading(false)
    },
    onError: () => setIsUploading(false)
  })

  useEffect(() => {
    if (msgsEndRef.current) {
      msgsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSelectChat = (chat) => {
    setSelectedChat(chat)
    if (chat.unreadCount > 0) {
      markAsReadMutation.mutate(chat.id)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || !selectedChat) return
    sendMutation.mutate(inputValue)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file || !selectedChat) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('senderName', user?.fullName || 'Admin')
    formData.append('senderId', user?.id)
    formData.append('isAdmin', 'true')

    setIsUploading(true)
    uploadMutation.mutate(formData)
    e.target.value = null // reset
  }

  // Filter sessions
  const filteredSessions = sessions.filter(s => {
    const name = (s.customerFull || s.guest_name || '').toLowerCase()
    const matchesSearch = name.includes(sidebarSearch.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Filter messages in thread if search is open
  const displayMessages = isThreadSearchOpen && threadSearch 
    ? messages.filter(m => m.message.toLowerCase().includes(threadSearch.toLowerCase()))
    : messages

  return (
    <AdminLayout title={t('admin.chat.title')} subtitle="Manage your real-time customer support inquiries professionally.">
      <div className="flex h-[calc(100vh-240px)] min-h-[600px] border border-gray-200 bg-white rounded-xl shadow-sm overflow-hidden font-body">
        
        {/* Left Pane: Sessions List */}
        <div className="w-[320px] bg-gray-50/50 flex flex-col border-r border-gray-200 relative z-10 flex-shrink-0">
          <div className="h-16 px-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              Conversations
              <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">{filteredSessions.length}</span>
            </h3>
            <div className="flex items-center gap-1">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-transparent border-none focus:ring-0 text-gray-500 font-medium cursor-pointer"
              >
                <option value="ALL">All</option>
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          <div className="px-4 py-2 border-b border-gray-100 bg-white">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
              <input 
                type="text"
                placeholder="Search by name..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-100 border-none rounded-md text-xs focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingSessions ? (
              <div className="p-8 text-center flex flex-col items-center gap-3">
                <span className="animate-spin material-symbols-outlined text-gray-400 text-2xl">progress_activity</span>
                <span className="text-sm text-gray-500">Loading conversations...</span>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-gray-300 text-4xl">inbox</span>
                <div className="text-sm text-gray-500">No matching conversations</div>
              </div>
            ) : (
              filteredSessions.map(s => {
                const isActive = selectedChat?.id === s.id;
                return (
                  <button
                  key={s.id}
                  onClick={() => handleSelectChat(s)}
                  className={`w-full p-4 flex flex-col items-start transition-all relative group ${isActive ? 'bg-white shadow-sm ring-1 ring-black/5' : 'hover:bg-white/60'}`}
                >
                  {s.unreadCount > 0 && (
                    <div className="absolute top-4 right-4 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce-subtle z-20">
                      <span className="text-[9px] font-bold text-white leading-none">{s.unreadCount}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2 w-full pr-8">
                    <div className="flex items-center gap-2 flex-grow overflow-hidden">
                      {s.status === 'OPEN' ? (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500"></span>
                      ) : (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-gray-300"></span>
                      )}
                      <span className={`font-semibold text-sm truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                        {s.customerFull || s.guest_name || t('admin.chat.guest')}
                      </span>
                    </div>
                    <span className={`text-[10px] whitespace-nowrap flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                      {new Date(s.last_msg_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="w-full text-left">
                    <p className={`text-sm tracking-tight line-clamp-1 ${isActive ? 'text-blue-800/80' : 'text-gray-500'}`}>
                      {s.lastMessage || 'Starting conversation...'}
                    </p>
                  </div>
                </button>
              )
            })
            )}
          </div>
        </div>

        {/* Right Pane: Chat History */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedChat ? (
            <>
              {/* Thread Header */}
              <div className="h-16 px-6 border-b border-gray-200 flex items-center justify-between bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] z-10 relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-indigo-50">
                    {(activeChat.customerFull || activeChat.guest_name || 'G').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-[15px] text-gray-900 leading-tight">
                        {activeChat.customerFull || activeChat.guest_name}
                      </h4>
                      {activeChat.status === 'CLOSED' && (
                        <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">Closed</span>
                      )}
                    </div>
                    <p className="text-xs text-indigo-600 font-medium">
                      {activeChat.customer_id ? 'Authenticated Customer' : 'Sessional Guest'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isThreadSearchOpen && (
                    <div className="relative animate-in fade-in slide-in-from-right-2 duration-200">
                      <input 
                        type="text" 
                        autoFocus
                        placeholder="Find in thread..."
                        value={threadSearch}
                        onChange={(e) => setThreadSearch(e.target.value)}
                        className="pl-3 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none w-48 focus:border-blue-500 transition-all font-body"
                      />
                      <button 
                        onClick={() => { setIsThreadSearchOpen(false); setThreadSearch('') }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  )}
                  <button 
                    onClick={() => setIsThreadSearchOpen(!isThreadSearchOpen)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isThreadSearchOpen ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-700'}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">search</span>
                  </button>
                  <div className="relative">
                    <button 
                      onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isMoreMenuOpen ? 'bg-gray-100 text-gray-700' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-700'}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                    {isMoreMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                        <button 
                          onClick={() => statusMutation.mutate({ chatId: selectedChat.id, status: selectedChat.status === 'OPEN' ? 'CLOSED' : 'OPEN' })}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700 font-medium"
                        >
                          <span className="material-symbols-outlined text-[18px] text-gray-400">
                            {selectedChat.status === 'OPEN' ? 'close' : 'check_circle'}
                          </span>
                          {selectedChat.status === 'OPEN' ? 'Close Conversation' : 'Reopen Conversation'}
                        </button>
                        <button 
                          onClick={() => { queryClient.invalidateQueries(['admin-chat-messages', selectedChat.id]); setIsMoreMenuOpen(false); }}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700 border-t border-gray-100 font-medium"
                        >
                          <span className="material-symbols-outlined text-[18px] text-gray-400">refresh</span>
                          Refresh Thread
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-[#F8F9FB] shadow-[inset_0_4px_6px_rgba(0,0,0,0.02)]">
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center">
                    <span className="animate-spin material-symbols-outlined text-gray-300 text-3xl">progress_activity</span>
                  </div>
                ) : (
                  displayMessages.map((m, idx) => {
                    const isSequence = idx > 0 && displayMessages[idx - 1].is_from_admin === m.is_from_admin;
                    return (
                    <div key={m.id || idx} className={`flex ${m.is_from_admin ? 'justify-end' : 'justify-start'} ${isSequence ? '!mt-1.5' : ''}`}>
                      <div className="flex flex-col max-w-[65%]">
                         {!isSequence && !m.is_from_admin && (
                           <span className="text-[11px] font-semibold text-gray-500 mb-1 ml-2">{m.sender_name || activeChat.guest_name}</span>
                         )}
                         <div className={`px-4 py-2.5 text-[14px] leading-relaxed shadow-sm ${
                           m.is_from_admin 
                             ? 'bg-[#2B52D0] text-white rounded-2xl rounded-tr-sm' 
                             : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm'
                         }`}>
                           {m.file_url ? (
                             <div className="flex flex-col gap-2 min-w-[150px]">
                                <div className="flex items-center gap-3">
                                  <span className="material-symbols-outlined text-2xl">
                                    {m.mime_type?.startsWith('image/') ? 'image' : 'description'}
                                  </span>
                                  <div className="flex flex-col overflow-hidden">
                                     <span className="text-sm font-bold truncate pr-4">{m.file_name}</span>
                                     <span className="text-[10px] opacity-70 uppercase tracking-tighter">Content Delivery</span>
                                  </div>
                                </div>
                                {m.mime_type?.startsWith('image/') && (
                                   <div className="mt-1 rounded-lg overflow-hidden border border-white/10 group relative">
                                      <img src={m.file_url} alt={m.file_name} className="max-h-60 object-contain mx-auto bg-black/5" />
                                   </div>
                                )}
                                <a 
                                  href={m.file_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className={`mt-2 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                                    m.is_from_admin ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-[16px]">download</span>
                                  Download File
                                </a>
                             </div>
                           ) : m.message}
                         </div>
                         {!isSequence && (
                           <span className={`text-[10px] text-gray-400 mt-1 px-1 font-medium ${m.is_from_admin ? 'text-right' : 'text-left'}`}>
                             {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                         )}
                      </div>
                    </div>
                  )}))
                }
                {isUploading && (
                  <div className="flex justify-end">
                    <div className="bg-blue-50 px-4 py-2 rounded-2xl rounded-tr-sm border border-blue-100 flex items-center gap-2 text-xs text-blue-600 font-medium animate-pulse">
                      <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>
                      Uploading file...
                    </div>
                  </div>
                )}
                <div ref={msgsEndRef} className="h-1" />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSend} className="flex gap-2 items-end max-w-full">
                  <div className="flex-1 bg-gray-50 border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 focus-within:bg-white rounded-lg transition-all flex items-center overflow-hidden">
                    <button type="button" className="px-3 py-3 text-gray-400 hover:text-gray-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
                    </button>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      placeholder={selectedChat.status === 'CLOSED' ? "Conversation is closed." : "Type a message..."}
                      disabled={selectedChat.status === 'CLOSED'}
                      className="flex-1 bg-transparent py-3 text-[14px] outline-none text-gray-800 placeholder-gray-400 disabled:cursor-not-allowed"
                    />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={selectedChat.status === 'CLOSED' || isUploading}
                      className="px-3 py-3 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[20px]">attach_file</span>
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange}
                      className="hidden" 
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || sendMutation.isPending}
                    className="h-[46px] px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg flex items-center justify-center disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shrink-0 gap-2"
                  >
                    {sendMutation.isPending ? (
                      <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    ) : (
                      <>
                        <span>Send</span>
                        <span className="material-symbols-outlined text-[16px]">send</span>
                      </>
                    )}
                  </button>
                </form>
                <div className="flex justify-between items-center mt-2 px-1">
                  <div className="text-[11px] text-gray-400">Return to send</div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/30">
              <span className="material-symbols-outlined text-gray-300 text-[64px] mb-4">chat</span>
              <h3 className="font-semibold text-lg text-gray-800 mb-1">No conversation selected</h3>
              <p className="text-sm text-gray-500 text-center max-w-xs">
                Select a conversation from the sidebar to view messages or start replying.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
