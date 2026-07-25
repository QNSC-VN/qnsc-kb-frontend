import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save, Shield, HelpCircle, Lock } from 'lucide-react'
import { getArticle, createArticle, updateArticle } from '../../api/articles'
import { getAccessGroups } from '../../api/search'

export default function ArticleEditPage() {
  const { id } = useParams<{ id: string }>()
  const isEditMode = !!id
  const navigate = useNavigate()

  // Form states
  const [title, setTitle] = useState('')
  const [bodyMd, setBodyMd] = useState('')
  const [dept, setDept] = useState('Engineering')
  const [domain, setDomain] = useState('General')
  const [type, setType] = useState('SOP')
  const [sensitivity, setSensitivity] = useState('internal')
  const [status, setStatus] = useState('draft')
  const [tagsInput, setTagsInput] = useState('')
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [nextReview, setNextReview] = useState('')

  const [availableGroups, setAvailableGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSetupData = async () => {
      setLoading(true)
      try {
        // Fetch groups
        const groups = await getAccessGroups()
        setAvailableGroups(groups)

        if (isEditMode && id) {
          const art = await getArticle(id)
          setTitle(art.title)
          setBodyMd(art.body_md)
          setDept(art.dept)
          setDomain(art.domain)
          setType(art.type)
          setSensitivity(art.sensitivity)
          setStatus(art.status)
          setTagsInput(art.tags ? art.tags.map((t: any) => t.tag).join(', ') : '')
          setSelectedGroups(art.access_groups ? art.access_groups.map((g: any) => g.id) : [])
          if (art.next_review) {
            setNextReview(new Date(art.next_review).toISOString().split('T')[0])
          }
        }
      } catch (err) {
        console.error(err)
        setError('Failed to load article metadata or details')
      } finally {
        setLoading(false)
      }
    }
    fetchSetupData()
  }, [id, isEditMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    // Parse comma separated tags
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    const payload = {
      title,
      body_md: bodyMd,
      dept,
      domain,
      type,
      sensitivity,
      status,
      tags,
      access_group_ids: selectedGroups.length > 0 ? selectedGroups : null,
      next_review: nextReview ? new Date(nextReview).toISOString() : null
    }

    try {
      if (isEditMode && id) {
        await updateArticle(id, payload)
        navigate(`/articles/${id}`)
      } else {
        const created = await createArticle(payload)
        navigate(`/articles/${created.id}`)
      }
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.detail || 'Failed to save article')
    } finally {
      setSaving(false)
    }
  }

  const handleGroupSelect = (groupId: string) => {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups(selectedGroups.filter(g => g !== groupId))
    } else {
      setSelectedGroups([...selectedGroups, groupId])
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500 mr-3" />
        <span>Preparing editor panel...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <h1 className="text-xl font-bold text-white">
          {isEditMode ? 'Modify Article' : 'Draft New Article'}
        </h1>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Editor Body */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-300">Document Title</label>
            <input
              type="text"
              placeholder="e.g., Incident Response Playbook: Database Outages"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 py-3 px-4 text-white outline-none focus:border-brand-500 text-sm"
              required
            />
          </div>

          {/* Markdown Content */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-300">Body Markdown</label>
            <textarea
              placeholder="# Introduction&#10;Write details about procedures, policies, or decision log references here..."
              value={bodyMd}
              onChange={(e) => setBodyMd(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm text-white placeholder-slate-500 outline-none focus:border-brand-500 h-96 font-mono resize-y"
              required
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-300">Tags</label>
            <input
              type="text"
              placeholder="incident, database, runbook (comma separated)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2.5 px-3.5 text-white outline-none focus:border-brand-500 text-sm"
            />
          </div>
        </div>

        {/* Sidebar attributes */}
        <div className="lg:col-span-1 space-y-5">
          {/* Properties card */}
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
              Parameters
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Department</label>
                <select
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-2.5 text-xs text-white outline-none focus:border-brand-500"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Security">Security</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Legal">Legal</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Domain Context</label>
                <input
                  type="text"
                  placeholder="e.g. Infrastructure, SOPs"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-2.5 text-xs text-white outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Document Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-2.5 text-xs text-white outline-none focus:border-brand-500"
                >
                  <option value="POLICY">Policy</option>
                  <option value="SOP">SOP</option>
                  <option value="DECISION">Decision Log</option>
                  <option value="FAQ">FAQ</option>
                  <option value="RCA">RCA</option>
                  <option value="HOWTO">How-To</option>
                  <option value="PLAYBOOK">Playbook</option>
                  <option value="REFERENCE">Reference</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Sensitivity</label>
                <select
                  value={sensitivity}
                  onChange={(e) => setSensitivity(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-2.5 text-xs text-white outline-none focus:border-brand-500"
                >
                  <option value="public">Public (Everyone)</option>
                  <option value="internal">Internal (Staff)</option>
                  <option value="confidential">Confidential</option>
                  <option value="restricted">Restricted</option>
                </select>
              </div>

              {isEditMode && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-2.5 text-xs text-white outline-none focus:border-brand-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="pending_review">Pending Review</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Next Review Date</label>
                <input
                  type="date"
                  value={nextReview}
                  onChange={(e) => setNextReview(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-2.5 text-xs text-white outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Access groups scoping */}
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Lock size={14} className="text-slate-400" />
              <span>Scoping Groups</span>
            </h3>

            {availableGroups.length === 0 ? (
              <p className="text-xs text-slate-500">No custom access groups registered.</p>
            ) : (
              <div className="space-y-2">
                {availableGroups.map((g) => (
                  <label 
                    key={g.id} 
                    className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none py-1 hover:text-white"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGroups.includes(g.id)}
                      onChange={() => handleGroupSelect(g.id)}
                      className="rounded bg-slate-950 border-slate-800 text-brand-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>{g.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Save button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20 hover:shadow-brand-500/35 transition-all disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Publish Article'}</span>
          </button>
        </div>

      </form>
    </div>
  )
}
