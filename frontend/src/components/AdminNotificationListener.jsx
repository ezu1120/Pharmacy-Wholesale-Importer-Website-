import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast, { Toaster } from 'react-hot-toast'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../lib/api'
import useAuthStore from '../store/authStore'

export default function AdminNotificationListener() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const lastStateRef = useRef({}) // { chatId: lastMsgId }

  // Poll for sessions to detect new unread messages
  const { data: sessions = [] } = useQuery({
    queryKey: ['admin-notifications-poll'],
    queryFn: () => api.get('/chat/admin/sessions').then(r => r.data),
    refetchInterval: 5000, // Poll every 5 seconds for notifications
    enabled: !!user && user.role === 'admin'
  })

  useEffect(() => {
    if (!sessions.length) return

    sessions.forEach(s => {
      const prevLastMsgAt = lastStateRef.current[s.id]
      const currentLastMsgAt = new Date(s.last_msg_at).getTime()

      // If we have a new message and it's unread
      if (prevLastMsgAt && currentLastMsgAt > prevLastMsgAt && s.unreadCount > 0) {
        // Don't show toast if we are already on the chat page with this chat selected
        const isCurrentlyViewing = location.pathname === '/admin/chat'
        
        if (!isCurrentlyViewing) {
          toast.custom((t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4 cursor-pointer hover:bg-gray-50 transition-colors`}
              onClick={() => {
                toast.dismiss(t.id)
                navigate('/admin/chat')
              }}
            >
              <div className="flex-1 w-0">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {(s.customerFull || s.guest_name || 'G').charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-bold text-gray-900">
                      New message from {s.customerFull || s.guest_name}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-1 italic">
                      "{s.lastMessage}"
                    </p>
                  </div>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toast.dismiss(t.id)
                  }}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </div>
          ), {
            duration: 5000,
            position: 'top-right',
          })
          
          // Optional: Play a subtle notification sound?
          // try { new Audio('/notification.mp3').play() } catch(e){}
        }
      }
      
      // Update ref state
      lastStateRef.current[s.id] = currentLastMsgAt
    })
  }, [sessions, location.pathname, navigate])

  return <Toaster />
}
