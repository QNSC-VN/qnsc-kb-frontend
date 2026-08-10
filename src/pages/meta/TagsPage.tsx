import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tag as TagIcon, Layers, RefreshCw } from 'lucide-react'
import { getTags } from '../../api/search'
import PageHeader from '../../components/ui/PageHeader'

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
    <div className="page-shell page-stack">
      <PageHeader eyebrow="Knowledge taxonomy" title="Tags database" description="Cross-referenced keywords matching knowledge articles." icon={TagIcon} actions={<button
          onClick={fetchTagsList}
          className="mm-secondary flex items-center gap-2 px-3 py-2 text-xs font-semibold"
        >
          <RefreshCw size={15} /> Refresh
        </button>} />

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
        <div className="glass-panel rounded-panel border border-border p-5 md:p-6">
          <div className="flex flex-wrap gap-3">
            {tags.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => navigate(`/articles?q=${tag}`)}
                className="interactive-lift flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-secondary-foreground shadow-sm transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground"
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
