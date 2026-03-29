import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, Loader2 } from 'lucide-react'
import { notificationService } from '../services/aiService'
import { isAuthenticated } from '../utils/auth'

const POLL_MS = 25000

const NotificationBell = () => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [marking, setMarking] = useState(false)
  const wrapRef = useRef(null)

  const loadCount = async () => {
    if (!isAuthenticated()) return
    try {
      const res = await notificationService.getUnreadCount()
      if (res.success) setCount(typeof res.count === 'number' ? res.count : 0)
    } catch {
      /* ignore */
    }
  }

  const loadList = async () => {
    if (!isAuthenticated()) return
    setLoading(true)
    try {
      const res = await notificationService.getAll({ limit: 15 })
      if (res.success && Array.isArray(res.data)) setItems(res.data)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCount()
    const t = setInterval(loadCount, POLL_MS)
    const onFocus = () => loadCount()
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(t)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  useEffect(() => {
    if (open) {
      loadList()
      loadCount()
    }
  }, [open])

  const handleOpen = () => {
    if (!isAuthenticated()) return
    setOpen((o) => !o)
  }

  const handleClickNotif = async (n) => {
    try {
      if (!n.read) {
        await notificationService.markRead(n._id)
        setCount((c) => Math.max(0, c - 1))
        setItems((prev) =>
          prev.map((x) => (x._id === n._id ? { ...x, read: true } : x))
        )
      }
      if (n.link) {
        navigate(n.link)
        setOpen(false)
      }
    } catch {
      if (n.link) navigate(n.link)
    }
  }

  const handleMarkAll = async () => {
    setMarking(true)
    try {
      await notificationService.markAllRead()
      setCount(0)
      setItems((prev) => prev.map((x) => ({ ...x, read: true })))
    } catch {
      /* ignore */
    } finally {
      setMarking(false)
    }
  }

  if (!isAuthenticated()) return null

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={handleOpen}
        className="relative p-2.5 rounded-xl text-gray-300 hover:text-primary-400 hover:bg-white/5 transition-all duration-300"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(100vw-2rem,380px)] rounded-2xl border border-neutral-700 bg-neutral-900 shadow-2xl z-[60] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {items.some((n) => !n.read) && (
              <button
                type="button"
                onClick={handleMarkAll}
                disabled={marking}
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 disabled:opacity-50"
              >
                {marking ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[min(70vh,420px)] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-10 px-4">No notifications yet</p>
            ) : (
              <ul className="divide-y divide-neutral-800">
                {items.map((n) => (
                  <li key={n._id}>
                    <button
                      type="button"
                      onClick={() => handleClickNotif(n)}
                      className={`w-full text-left px-4 py-3 hover:bg-neutral-800/80 transition-colors ${
                        n.read ? 'opacity-75' : 'bg-violet-500/5'
                      }`}
                    >
                      <p className="text-sm font-medium text-white pr-6">{n.title}</p>
                      {n.body && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{n.body}</p>
                      )}
                      <p className="text-[10px] text-gray-600 mt-1.5">
                        {n.createdAt
                          ? new Date(n.createdAt).toLocaleString(undefined, {
                              dateStyle: 'short',
                              timeStyle: 'short'
                            })
                          : ''}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
