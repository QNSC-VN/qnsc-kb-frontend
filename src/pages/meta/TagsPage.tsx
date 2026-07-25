import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tag as TagIcon, Layers, RefreshCw } from 'lucide-react'
import { getTags } from '../../api/search'

export default function TagsPage() {
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchTagsList = async () => {
    setLoading(true)
    try {
      const data = await getTags()
      setTags(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTagsList()
  }, [])

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <TagIcon size={28} className="text-brand-500" />
            <span>Tags Database</span>
          </h1>
          <p className="text-slate-400 mt-1">Cross-referenced keywords matching knowledge articles</p>
        </div>
        <button
          onClick={fetchTagsList}
          className="p-2 rounded-lg border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500 mr-3" />
          <span>Fusing tags dictionary...</span>
        </div>
      ) : tags.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-850 p-12 text-center bg-slate-900/5 text-slate-500 text-xs">
          No tags found in the system. Create articles and add tags to register them.
        </div>
      ) : (
        <div className="bg-slate-900/20 border border-slate-800 rounded-xl p-6 md:p-8">
          <div className="flex flex-wrap gap-3">
            {tags.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => navigate(`/articles?q=${tag}`)}
                className="bg-slate-900 hover:bg-brand-600 hover:text-white border border-slate-800 hover:border-transparent text-sm text-slate-300 font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              >
                <TagIcon size={14} />
                <span>{tag}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
