import { useState, useEffect, useRef } from 'react'
import { Shield, Plus, Trash2, CheckCircle, Loader2, MapPin, DollarSign } from 'lucide-react'
import { propertyService, adminService } from '../services/aiService'
import Loader from '../components/Loader'

const Admin = () => {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    type: 'house',
    location: '',
    price: '',
    bedrooms: '2',
    bathrooms: '1',
    areaSqft: '',
    description: '',
    image: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null)
  const imagePreviewRef = useRef(null)
  const [formErrors, setFormErrors] = useState({})
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const res = await adminService.getAllProperties({ limit: 100 })
      if (res.success && res.data) setProperties(res.data)
    } catch (err) {
      console.error('Fetch properties error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  // Revoke object URL when preview changes or component unmounts
  useEffect(() => {
    const prev = imagePreviewRef.current
    imagePreviewRef.current = imagePreviewUrl
    if (prev && prev !== imagePreviewUrl) URL.revokeObjectURL(prev)
    return () => {
      if (imagePreviewRef.current) URL.revokeObjectURL(imagePreviewRef.current)
    }
  }, [imagePreviewUrl])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const err = {}
    if (!formData.title?.trim()) err.title = 'Title is required'
    if (!formData.location?.trim()) err.location = 'Location is required'
    if (!formData.price || Number(formData.price) <= 0) err.price = 'Valid price required'
    if (!formData.bedrooms || Number(formData.bedrooms) < 0) err.bedrooms = 'Required'
    if (!formData.bathrooms || Number(formData.bathrooms) < 0) err.bathrooms = 'Required'
    if (!formData.areaSqft || Number(formData.areaSqft) <= 0) err.areaSqft = 'Required'
    if (!formData.description?.trim() || formData.description.length < 20) err.description = 'Min 20 characters'
    if (!imageFile && !formData.image?.trim()) err.image = 'Upload an image or enter image URL'
    setFormErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      setActionLoading('create')
      let res
      if (imageFile) {
        const fd = new FormData()
        fd.append('title', formData.title.trim())
        fd.append('type', formData.type)
        fd.append('location', formData.location.trim())
        fd.append('price', String(formData.price))
        fd.append('bedrooms', String(formData.bedrooms))
        fd.append('bathrooms', String(formData.bathrooms))
        fd.append('areaSqft', String(formData.areaSqft))
        fd.append('description', formData.description.trim())
        fd.append('image', imageFile)
        res = await propertyService.createWithFormData(fd)
      } else {
        const payload = {
          title: formData.title.trim(),
          type: formData.type,
          location: formData.location.trim(),
          price: Number(formData.price),
          bedrooms: Number(formData.bedrooms),
          bathrooms: Number(formData.bathrooms),
          areaSqft: Number(formData.areaSqft),
          description: formData.description.trim(),
          image: formData.image.trim()
        }
        res = await propertyService.create(payload)
      }
      if (res.success) {
        setSubmitSuccess(true)
        setFormData({ title: '', type: 'house', location: '', price: '', bedrooms: '2', bathrooms: '1', areaSqft: '', description: '', image: '' })
        setImageFile(null)
        setImagePreviewUrl(null)
        setTimeout(() => setSubmitSuccess(false), 3000)
        fetchProperties()
      } else {
        setFormErrors({ general: res.message || 'Create failed' })
      }
    } catch (err) {
      setFormErrors({ general: err.response?.data?.message || 'Failed to create property' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleApprove = async (id) => {
    try {
      setActionLoading(id)
      const res = await adminService.approveProperty(id)
      if (res.success) fetchProperties()
    } catch (err) {
      console.error('Approve error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property?')) return
    try {
      setActionLoading(id)
      await propertyService.delete(id)
      fetchProperties()
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-2xl">
              <Shield className="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-surface-900">Admin Dashboard</h1>
              <p className="text-sm text-surface-500">Manage properties</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="btn-gradient"
          >
            <Plus className="w-4 h-4" />
            {showForm ? 'Hide form' : 'Add Property'}
          </button>
        </div>

        {showForm && (
          <div className="card-glass-solid p-8 mb-10">
            <h2 className="font-display text-lg font-semibold text-surface-900 mb-6">Add new property</h2>
            {submitSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
                Property created successfully.
              </div>
            )}
            {formErrors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
                {formErrors.general}
              </div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input name="title" value={formData.title} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Property title" />
                {formErrors.title && <p className="mt-1 text-xs text-red-600">{formErrors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="house">House</option>
                  <option value="flat_apartment">Flat / Apartment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input name="location" value={formData.location} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Kathmandu" />
                {formErrors.location && <p className="mt-1 text-xs text-red-600">{formErrors.location}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (NPR/mo)</label>
                <input name="price" type="number" value={formData.price} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="15000" />
                {formErrors.price && <p className="mt-1 text-xs text-red-600">{formErrors.price}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <input name="bedrooms" type="number" min="0" value={formData.bedrooms} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                {formErrors.bedrooms && <p className="mt-1 text-xs text-red-600">{formErrors.bedrooms}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <input name="bathrooms" type="number" min="0" value={formData.bathrooms} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                {formErrors.bathrooms && <p className="mt-1 text-xs text-red-600">{formErrors.bathrooms}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area (sq ft)</label>
                <input name="areaSqft" type="number" min="0" value={formData.areaSqft} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="1200" />
                {formErrors.areaSqft && <p className="mt-1 text-xs text-red-600">{formErrors.areaSqft}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (min 20 chars)</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Brief description" />
                {formErrors.description && <p className="mt-1 text-xs text-red-600">{formErrors.description}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image (upload or URL)</label>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setImageFile(file)
                        setImagePreviewUrl(URL.createObjectURL(file))
                        if (formErrors.image) setFormErrors(prev => ({ ...prev, image: '' }))
                      } else {
                        setImageFile(null)
                        setImagePreviewUrl(null)
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700 file:text-sm"
                  />
                  <input name="image" type="url" value={formData.image} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Or paste image URL (https://...)" disabled={!!imageFile} />
                </div>
                {(imagePreviewUrl || formData.image?.trim()) && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Preview</p>
                    <img src={imagePreviewUrl || formData.image} alt="Preview" className="h-32 w-auto max-w-full rounded-lg border border-gray-200 object-cover" />
                  </div>
                )}
                {formErrors.image && <p className="mt-1 text-xs text-red-600">{formErrors.image}</p>}
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <button type="submit" disabled={actionLoading === 'create'} className="btn-gradient disabled:opacity-50">
                  {actionLoading === 'create' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create property
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card-glass-solid overflow-hidden">
          <div className="px-6 py-5 border-b border-surface-100">
            <h2 className="font-display text-lg font-semibold text-surface-900">All properties</h2>
            <p className="text-sm text-surface-500">{properties.length} total</p>
          </div>
          {loading ? (
            <Loader className="py-16" />
          ) : properties.length === 0 ? (
            <div className="py-16 text-center text-gray-500">No properties yet. Add one above.</div>
          ) : (
            <div className="divide-y divide-surface-100">
              {properties.map((p) => (
                <div key={p._id} className="px-6 py-5 flex flex-wrap items-center gap-4 hover:bg-surface-50/80 transition-colors">
                  <div className="flex-1 min-w-0 flex items-center gap-4">
                    {p.image && (
                      <img src={p.image} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{p.title}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {p.location}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                        <DollarSign className="w-3.5 h-3.5" /> NPR {Number(p.price)?.toLocaleString()}/mo · {p.bedrooms} bed · {p.bathrooms} bath
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge-modern ${p.status === 'approved' ? '!bg-emerald-100 !text-emerald-800 !border-emerald-200' : p.status === 'rejected' ? '!bg-red-100 !text-red-800 !border-red-200' : '!bg-amber-100 !text-amber-800 !border-amber-200'}`}>
                      {p.status || 'pending'}
                    </span>
                    {p.status !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleApprove(p._id)}
                        disabled={actionLoading === p._id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 text-sm font-medium disabled:opacity-50 transition-all duration-300"
                      >
                        {actionLoading === p._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        Approve
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(p._id)}
                      disabled={actionLoading === p._id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 text-sm font-medium disabled:opacity-50 transition-all duration-300"
                    >
                      {actionLoading === p._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Admin
