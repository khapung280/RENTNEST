import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { User, Shield, ArrowLeft, Loader2 } from 'lucide-react'
import { userService } from '../services/aiService'
import { getCurrentUserId } from '../utils/auth'

const UserPublicProfile = () => {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const me = getCurrentUserId()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await userService.getById(id)
        if (cancelled) return
        if (res.success && res.data) setUser(res.data)
        else setError('User not found')
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || 'Could not load profile')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  const isSelf = me && id && String(me) === String(id)

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-neutral-950">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center bg-neutral-950 text-center px-4">
        <p className="text-gray-400 mb-4">{error || 'User not found'}</p>
        <Link to="/" className="text-violet-400 hover:underline">
          Back to home
        </Link>
      </div>
    )
  }

  const roleLabel =
    user.accountType === 'owner'
      ? 'Property owner'
      : user.accountType === 'admin'
        ? 'Administrator'
        : 'Renter'

  return (
    <div className="min-h-screen bg-neutral-950 text-gray-100 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <Link
          to="/messages"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-8 shadow-xl">
          <div className="flex flex-col items-center text-center">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt=""
                className="w-24 h-24 rounded-full object-cover ring-2 ring-violet-500/40 mb-4"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center text-2xl font-bold text-white mb-4">
                {(user.name || '?')
                  .split(/\s+/)
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            )}
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <p className="text-sm text-gray-400 mt-1 flex items-center justify-center gap-2">
              <User className="w-4 h-4" />
              {roleLabel}
            </p>
            {user.isVerified && (
              <span className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/30">
                <Shield className="w-3 h-3" />
                Verified
              </span>
            )}
            {user.createdAt && (
              <p className="text-xs text-gray-500 mt-4">
                Member since{' '}
                {new Date(user.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long'
                })}
              </p>
            )}
          </div>

          {isSelf && (
            <div className="mt-8 pt-6 border-t border-neutral-800 text-center">
              <Link
                to="/profile"
                className="text-violet-400 hover:text-violet-300 text-sm font-medium"
              >
                Edit your full profile
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserPublicProfile
