import React, { useEffect, useMemo, useState } from 'react'
import { ArchiveRestore, Building2, Check, Pencil, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react'
import { createDepartment, deleteDepartment, listDepartments, updateDepartment } from '../../api/auth'
import { useAuth } from '../../auth/useAuth'
import { useDialog } from '../../components/ui/DialogProvider'

type Department = { id: string; name: string; company_domain: string; active: boolean; owner?: { id: string; name: string; email: string } | null }

export default function DepartmentsPage() {
  const { user } = useAuth()
  const dialog = useDialog()
  const isGlobalManager = user?.permission_scopes?.['user.manage'] === 'global'
  const [departments, setDepartments] = useState<Department[]>([])
  const [name, setName] = useState('')
  const [companyDomain, setCompanyDomain] = useState(user?.company_domain || '')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [actingId, setActingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      setDepartments(await listDepartments())
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not load departments')
    } finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [])
  useEffect(() => { if (!companyDomain && user?.company_domain) setCompanyDomain(user.company_domain) }, [companyDomain, user?.company_domain])

  const companies = useMemo(() => [...new Set(departments.map(item => item.company_domain))].sort(), [departments])
  const grouped = useMemo(() => Object.entries(departments.reduce<Record<string, Department[]>>((result, item) => {
    ;(result[item.company_domain] ||= []).push(item)
    return result
  }, {})).sort(([a], [b]) => a.localeCompare(b)), [departments])

  const create = async (event: React.FormEvent) => {
    event.preventDefault()
    setActingId('create'); setError('')
    try {
      const created = await createDepartment({ name, company_domain: companyDomain })
      setDepartments(items => [...items, created].sort((a, b) => a.company_domain.localeCompare(b.company_domain) || a.name.localeCompare(b.name)))
      setName(''); setMessage(`Created ${created.name}`)
    } catch (err: any) { setError(err.response?.data?.detail || 'Could not create department') } finally { setActingId(null) }
  }

  const rename = async (department: Department) => {
    if (!editingName.trim() || editingName.trim() === department.name) { setEditingId(null); return }
    setActingId(department.id); setError('')
    try {
      const updated = await updateDepartment(department.id, { name: editingName })
      await load(); setEditingId(null); setMessage(`Renamed department to ${updated.name}`)
    } catch (err: any) { setError(err.response?.data?.detail || 'Could not rename department') } finally { setActingId(null) }
  }

  const toggleActive = async (department: Department) => {
    setActingId(department.id); setError('')
    try {
      const updated = await updateDepartment(department.id, { active: !department.active })
      setDepartments(items => items.map(item => item.id === updated.id ? updated : item))
      setMessage(`${updated.name} is now ${updated.active ? 'active' : 'inactive'}`)
    } catch (err: any) { setError(err.response?.data?.detail || 'Could not update department status') } finally { setActingId(null) }
  }

  const remove = async (department: Department) => {
    if (!(await dialog.confirm(`Delete ${department.name}? Departments with users, content, or ownership assignments must be deactivated instead.`, { title: 'Delete department', confirmLabel: 'Delete', tone: 'danger' }))) return
    setActingId(department.id); setError('')
    try {
      await deleteDepartment(department.id)
      setDepartments(items => items.filter(item => item.id !== department.id))
      setMessage(`${department.name} was deleted`)
    } catch (err: any) { setError(err.response?.data?.detail || 'Could not delete department') } finally { setActingId(null) }
  }

  return <main className="page-shell page-stack text-foreground">
    <header className="page-hero glass-panel rounded-panel border border-border px-4 py-5 shadow-[0_14px_34px_rgb(var(--shadow)/.1)] sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute right-0 top-0 h-52 w-[40%] rounded-full bg-primary/10 blur-3xl" />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground">Administration / structure</p><h1 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-foreground sm:text-3xl">Departments</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Create and maintain the department records used for employee membership, ownership scope, article uploads, and access rules.</p></div><Building2 className="text-info" size={28} /></div>
    </header>

    {(message || error) && <div role="status" className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${error ? 'border-destructive/25 bg-destructive/10 text-destructive' : 'border-success/25 bg-success/10 text-success'}`}><span>{error || message}</span><button type="button" aria-label="Dismiss message" onClick={() => { setMessage(''); setError('') }} className="rounded-md p-1 hover:bg-foreground/10"><X size={15} /></button></div>}

    <form onSubmit={create} className="rounded-2xl border border-primary/20 bg-card p-5 shadow-[0_10px_28px_rgb(var(--shadow)/.08)]"><div className="mb-4 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"><Plus size={17} /></span><div><h2 className="font-semibold text-foreground">Add department</h2><p className="text-xs text-muted-foreground">A department name must be unique inside its company.</p></div></div><div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><label className="block"><span className="label">Department name</span><input required maxLength={100} value={name} onChange={event => setName(event.target.value)} placeholder="Engineering" className="field" /></label><label className="block"><span className="label">Company</span><input required maxLength={255} value={companyDomain} onChange={event => setCompanyDomain(event.target.value)} disabled={!isGlobalManager} placeholder="company.com" className="field disabled:opacity-60" />{!isGlobalManager && <span className="mt-1 block text-[11px] text-muted">Your company only</span>}</label><button type="submit" disabled={actingId === 'create'} className="self-end inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"><Plus size={15} />{actingId === 'create' ? 'Adding…' : 'Add'}</button></div></form>

    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_10px_28px_rgb(var(--shadow)/.08)]"><header className="flex items-center justify-between border-b border-border bg-surface px-5 py-4"><div><h2 className="font-semibold text-foreground">Department directory</h2><p className="mt-1 text-xs text-muted-foreground">Rename records safely; deactivate them when they are no longer used. Deactivation pauses access but preserves the owner assignment for reactivation.</p></div><button type="button" onClick={() => void load()} title="Refresh departments" className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface-soft text-muted-foreground transition hover:text-foreground"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /></button></header>{loading ? <div className="grid min-h-40 place-items-center text-sm text-muted-foreground"><RefreshCw size={16} className="mr-2 animate-spin text-info" /> Loading departments…</div> : !grouped.length ? <div className="p-10 text-center text-sm text-muted-foreground">No departments yet. Add the first department above.</div> : <div className="divide-y divide-border">{grouped.map(([domain, items]) => <div key={domain}><div className="flex items-center gap-2 bg-surface-soft px-5 py-3 text-xs font-bold uppercase tracking-[.12em] text-muted-foreground"><Building2 size={14} className="text-info" />{domain}<span className="font-normal normal-case tracking-normal">{items.length} departments</span></div><div className="divide-y divide-border">{items.map(department => <div key={department.id} className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${!department.active ? 'opacity-65' : ''}`}><div className="min-w-0 flex-1">{editingId === department.id ? <input autoFocus value={editingName} onChange={event => setEditingName(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); void rename(department) } if (event.key === 'Escape') setEditingId(null) }} className="field max-w-md" /> : <div className="flex items-center gap-2"><span className="font-semibold text-foreground">{department.name}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${department.active ? 'bg-success/10 text-success' : 'bg-muted/20 text-muted-foreground'}`}>{department.active ? 'Active' : 'Inactive'}</span></div>}<p className="mt-1 text-xs text-muted-foreground">Owner: <span className="font-semibold text-foreground">{department.owner?.name || 'Unassigned'}</span>{department.owner?.email ? ` · ${department.owner.email}` : ''}</p><p className="mt-1 text-xs text-muted-foreground">Membership and Department Owner scope are assigned from Users &amp; Roles.</p></div><div className="flex flex-wrap items-center gap-2">{editingId === department.id ? <><button type="button" disabled={actingId === department.id} onClick={() => void rename(department)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"><Save size={14} /> Save name</button><button type="button" disabled={actingId === department.id} onClick={() => setEditingId(null)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground"><X size={14} /> Cancel</button></> : <button type="button" onClick={() => { setEditingId(department.id); setEditingName(department.name) }} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-surface-soft hover:text-foreground"><Pencil size={14} /> Rename</button>}<button type="button" disabled={actingId === department.id} onClick={() => void toggleActive(department)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-surface-soft hover:text-foreground disabled:opacity-50">{department.active ? <><ArchiveRestore size={14} /> Deactivate</> : <><Check size={14} /> Reactivate</>}</button><button type="button" disabled={actingId === department.id} onClick={() => void remove(department)} className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-50"><Trash2 size={14} /> Delete</button></div></div>)}</div></div>)}</div>}</section>
  </main>
}
