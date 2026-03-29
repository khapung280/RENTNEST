/**
 * Stable Mongo-style user id string from populated participant or id string.
 * Use for /user/:id links from chat so the route always gets a valid id.
 */
export function resolveMongoUserId(participant) {
  if (participant == null) return null
  if (typeof participant === 'string') {
    return /^[a-f\d]{24}$/i.test(participant.trim()) ? participant.trim() : null
  }
  const raw = participant._id ?? participant.id
  if (raw == null) return null
  try {
    return typeof raw === 'object' && raw !== null && typeof raw.toString === 'function'
      ? String(raw.toString())
      : String(raw)
  } catch {
    return null
  }
}
