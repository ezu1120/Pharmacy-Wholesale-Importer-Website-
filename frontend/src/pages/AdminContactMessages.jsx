import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AdminLayout from '../components/AdminLayout'
import api from '../lib/api'

const DEPT_LABELS = {
  procurement: 'Procurement',
  logistics: 'Logistics',
  regulatory: 'Regulatory',
  support: 'Support',
  other: 'Other',
}

const DEPT_COLORS = {
  procurement: 'bg-blue-50 text-blue-700',
  logistics: 'bg-amber-50 text-amber-700',
  regulatory: 'bg-purple-50 text-purple-700',
  support: 'bg-green-50 text-green-700',
  other: 'bg-slate-100 text-slate-600',
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function AdminContactMessages() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all') // all | unread | read

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['admin-contact-messages'],
    queryFn: () => api.get('/contact').then(r => r.data),
    refetchInterval: 30000,
  })

  const markRead = useMutation({
    mutationFn: (id) => api.patch(`/contact/${id}/read`),
    onSuccess: () => qc.invalidateQueries(['admin-contact-messages']),
  })

  const deleteMsg = useMutation({
    mutationFn: (id) => api.delete(`/contact/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(['admin-contact-messages'])
      setSelected(null)
    },
  })

  const handleSelect = (msg) => {
    setSelected(msg)
    if (!msg.isRead) markRead.mutate(msg.id)
  }

  const handleReply = (msg) => {
    const subject = encodeURIComponent(`Re: Your Enquiry — PharmaLink Pro`)
    const body = encodeURIComponent(
      `Dear ${msg.firstName} ${msg.lastName},\n\nThank you for reaching out to PharmaLink Pro.\n\nRegarding your message:\n"${msg.message}"\n\n[Write your reply here]\n\nBest regards,\nPharmaLink Pro Team`
    )
    window.open(`https://mail.google.com/mail/?view=cm&to=${msg.email}&su=${subject}&body=${body}`, '_blank')
  }

  const filtered = messages.filter(m =>
    filter === 'all' ? true : filter === 'unread' ? !m.isRead : m.isRead
  )

  const unreadCount = messages.filter(m => !m.isRead).length

  return (
    <AdminLayout title="Contact Messages" subtitle="Enquiries submitted via the Contact page">
      <div className="flex gap-0 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" style={{ minHeight: '75vh' }}>

        {/* ── Left sidebar: message list ── */}
        <div className="w-80 flex-shrink-0 border-r border-slate-100 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-headline font-bold text-on-surface text-base">Inbox</h2>
              {unreadCount > 0 && (
                <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {/* Filter tabs */}
            <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
              {[['all', 'All'], ['unread', 'Unread'], ['read', 'Read']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setFilter(val)}
                  className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${
                    filter === val ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {label}
                  {val === 'unread' && unreadCount > 0 && (
                    <span className="ml-1 text-primary">({unreadCount})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Message list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-slate-400">
                <span className="material-symbols-outlined text-5xl mb-3 opacity-30">inbox</span>
                <p className="text-sm font-medium">No messages</p>
              </div>
            ) : (
              filtered.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => handleSelect(msg)}
                  className={`w-full text-left px-4 py-4 border-b border-slate-50 transition-all hover:bg-slate-50 ${
                    selected?.id === msg.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      {!msg.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                      )}
                      <p className={`text-sm truncate ${!msg.isRead ? 'font-bold text-on-surface' : 'font-medium text-slate-600'}`}>
                        {msg.firstName} {msg.lastName}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">{timeAgo(msg.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mb-1.5">{msg.email}</p>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{msg.message}</p>
                  {msg.department && (
                    <span className={`mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${DEPT_COLORS[msg.department] || DEPT_COLORS.other}`}>
                      {DEPT_LABELS[msg.department] || msg.department}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Right: message detail ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {selected ? (
            <>
              {/* Detail header */}
              <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="font-headline font-bold text-on-surface text-lg">
                    {selected.firstName} {selected.lastName}
                  </h3>
                  <p className="text-sm text-slate-500">{selected.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Reply via Gmail */}
                  <button
                    onClick={() => handleReply(selected)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-sm hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">reply</span>
                    Reply via Gmail
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => { if (window.confirm('Delete this message?')) deleteMsg.mutate(selected.id) }}
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                    title="Delete message"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>

              {/* Meta info */}
              <div className="px-8 py-4 border-b border-slate-100 flex flex-wrap gap-6 text-sm bg-white">
                {selected.company && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Company</p>
                    <p className="font-semibold text-on-surface">{selected.company}</p>
                  </div>
                )}
                {selected.phone && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Phone</p>
                    <p className="font-semibold text-on-surface">{selected.phone}</p>
                  </div>
                )}
                {selected.department && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Department</p>
                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${DEPT_COLORS[selected.department] || DEPT_COLORS.other}`}>
                      {DEPT_LABELS[selected.department] || selected.department}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Received</p>
                  <p className="font-semibold text-on-surface">
                    {new Date(selected.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>

              {/* Message body */}
              <div className="flex-1 px-8 py-8 overflow-y-auto">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 max-w-3xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {selected.firstName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">{selected.firstName} {selected.lastName}</p>
                      <p className="text-xs text-slate-400">{selected.email}</p>
                    </div>
                  </div>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">{selected.message}</p>
                </div>

                {/* Quick reply hint */}
                <div className="mt-6 max-w-3xl">
                  <button
                    onClick={() => handleReply(selected)}
                    className="w-full flex items-center gap-3 px-6 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all group"
                  >
                    <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">reply</span>
                    <span className="text-sm font-medium">Click to reply via Gmail — opens pre-filled draft automatically</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl opacity-40">mark_email_unread</span>
              </div>
              <p className="font-medium text-slate-500">Select a message to read</p>
              <p className="text-sm mt-1">
                {messages.length === 0 ? 'No contact messages yet' : `${messages.length} message${messages.length !== 1 ? 's' : ''} in inbox`}
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
