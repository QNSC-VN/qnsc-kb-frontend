import React, { useEffect, useState } from 'react'
import { FolderSync, RefreshCw } from 'lucide-react'
import { createConnector, listConnectors, syncConnector } from '../../api/connectors'

type Connector = { id: string; name: string; system: string; status: string; company_domain: string; path: string; last_sync?: string }
export default function ConnectorsPage() {
  const [items, setItems] = useState<Connector[]>([])
  const [form, setForm] = useState({ name: '', path: '' })
  const [message, setMessage] = useState('')
  const load = async () => setItems(await listConnectors())
  useEffect(() => { void load() }, [])
  const create = async (event: React.FormEvent) => { event.preventDefault(); const item = await createConnector({ ...form, system: 'local_folder' }); setItems(current => [...current, item]); setForm({ name: '', path: '' }); setMessage('Connector created') }
  const sync = async (item: Connector) => { setMessage(`Syncing ${item.name}…`); await syncConnector(item.id); await load(); setMessage(`${item.name} synced. Review imported files in Pending Drafts.`) }
  return <main className="mx-auto max-w-5xl p-8 text-ink"><div className="mb-8"><p className="text-xs font-semibold uppercase tracking-widest text-stone">Administration</p><h1 className="mt-2 text-2xl font-semibold">Source connectors</h1><p className="mt-1 text-sm text-steel">Local folders work without cloud authorization. Imported files become pending drafts for review.</p></div>{message && <div className="mb-5 rounded-lg border border-cyan/20 bg-cyan/10 px-4 py-3 text-sm text-cyan">{message}</div>}<form onSubmit={create} className="mb-7 grid gap-3 rounded-xl border border-hairline bg-surface p-5 md:grid-cols-[1fr_2fr_auto]"><input required placeholder="Connector name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="field" /><input required placeholder="/app/storage/connectors/company-a" value={form.path} onChange={e => setForm({ ...form, path: e.target.value })} className="field" /><button className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white">Add folder</button></form><div className="space-y-3">{items.map(item => <div key={item.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-hairline bg-surface p-5"><FolderSync className="text-cyan" size={20} /><div className="min-w-0 flex-1"><p className="font-medium">{item.name}</p><p className="truncate text-xs text-stone">{item.company_domain} · {item.path}</p><p className="text-xs text-stone">Last sync: {item.last_sync ? new Date(item.last_sync).toLocaleString() : 'Never'}</p></div><button onClick={() => void sync(item)} className="inline-flex items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-xs font-semibold hover:bg-surface-soft"><RefreshCw size={14} />Sync now</button></div>)}</div></main>
}
