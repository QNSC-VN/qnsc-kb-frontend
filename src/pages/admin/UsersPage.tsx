import React, { useEffect, useMemo, useState } from 'react'
import { Building2, Check, UserMinus, UserPlus, Users } from 'lucide-react'
import { assignCompanyCeo, createManagedUser, deactivateUser, listUsers, updateUser } from '../../api/auth'
import { useAuth } from '../../auth/useAuth'
import { useDialog } from '../../components/ui/DialogProvider'

type ManagedUser = { id: string; email: string; name: string; dept?: string | null; role: string; company_domain: string; active: boolean }
const allRoles = ['Staff', 'Reviewer', 'Department Owner', 'CEO', 'Admin']
const employeeRoles = ['Staff', 'Reviewer', 'Department Owner']

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const dialog = useDialog()
  const isAdmin = currentUser?.role === 'Admin'
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [form, setForm] = useState({ email: '', name: '', password: '', dept: '', role: 'Staff' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try { setUsers(await listUsers()) } catch (err: any) { setError(err.response?.data?.detail || 'Could not load employees') } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])

  const companies = useMemo(() => Object.entries(users.reduce<Record<string, ManagedUser[]>>((groups, item) => { (groups[item.company_domain] ||= []).push(item); return groups }, {})).sort(([a], [b]) => a.localeCompare(b)), [users])

  const create = async (event: React.FormEvent) => {
    event.preventDefault(); setError('')
    try {
      const created = await createManagedUser({ ...form, password: form.password })
      setUsers(current => [...current, created]); setForm({ email: '', name: '', password: '', dept: '', role: 'Staff' }); setMessage(`Added ${created.email}`)
    } catch (err: any) { setError(err.response?.data?.detail || 'Could not create employee') }
  }

  const changeRole = async (employee: ManagedUser, role: string) => {
    try { const updated = await updateUser(employee.id, { role }); setUsers(current => current.map(item => item.id === updated.id ? updated : item)); setMessage(`${updated.name} is now ${updated.role}`) } catch (err: any) { setError(err.response?.data?.detail || 'Could not update role') }
  }

  const makeCeo = async (domain: string, employee: ManagedUser) => {
    try { await assignCompanyCeo(domain, employee.id); await load(); setMessage(`${employee.name} is now the CEO of ${domain}`) } catch (err: any) { setError(err.response?.data?.detail || 'Could not assign CEO') }
  }

  const deactivate = async (employee: ManagedUser) => {
    if (!(await dialog.confirm(`Deactivate ${employee.name}?`, { title: 'Deactivate employee', confirmLabel: 'Deactivate', tone: 'danger' }))) return
    try { const updated = await deactivateUser(employee.id); setUsers(current => current.map(item => item.id === updated.id ? updated : item)); setMessage(`${employee.email} was deactivated`) } catch (err: any) { setError(err.response?.data?.detail || 'Could not deactivate employee') }
  }

  return <main className="mx-auto max-w-6xl p-8 text-ink">
    <div className="mb-8 flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-stone">Administration</p><h1 className="mt-2 text-2xl font-semibold">Manage users</h1><p className="mt-1 text-sm text-steel">Employees are grouped by company boundary. {isAdmin ? 'You can assign each company CEO.' : 'You can manage employees in your company.'}</p></div><Users className="text-steel" size={22} /></div>
    {(message || error) && <div className={`mb-5 rounded-lg border px-4 py-3 text-sm ${error ? 'border-rose-500/20 bg-rose-500/10 text-rose-400' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700'}`}>{error || message}</div>}
    <form onSubmit={create} className="mb-8 grid gap-3 rounded-xl border border-hairline bg-surface p-5 md:grid-cols-6"><div className="md:col-span-2"><label className="label">Email</label><input required type="email" placeholder="name@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="field" /></div><div><label className="label">Name</label><input required placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="field" /></div><div><label className="label">Temporary password</label><input required minLength={8} placeholder="Required" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="field" /></div><div><label className="label">Role</label><select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="field">{(isAdmin ? allRoles : employeeRoles).map(role => <option key={role}>{role}</option>)}</select></div><button className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white"><UserPlus size={15} />Add employee</button></form>
    <div className="space-y-5">{loading ? <div className="rounded-xl border border-hairline bg-surface p-5 text-sm text-steel">Loading companies…</div> : companies.map(([domain, employees]) => { const ceo = employees.find(item => item.role === 'CEO'); return <section key={domain} className="overflow-hidden rounded-xl border-2 border-hairline bg-surface"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-surface-soft px-5 py-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-ink p-2 text-white"><Building2 size={17} /></div><div><h2 className="font-semibold">{domain}</h2><p className="text-xs text-stone">Company ID: {domain} · Status: Active · {employees.length} employees</p></div></div><div className="flex items-center gap-2 text-sm">{isAdmin ? <><span className="text-stone">CEO</span><select value={ceo?.id || ''} onChange={e => { const chosen = employees.find(item => item.id === e.target.value); if (chosen) void makeCeo(domain, chosen) }} className="field min-w-48"><option value="">No CEO assigned</option>{employees.filter(item => item.active).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></> : <span className="rounded-full bg-cyan/10 px-3 py-1 text-xs font-medium text-cyan">{ceo?.name || 'CEO not assigned'}</span>}</div></header><div className="divide-y divide-hairline">{employees.map(employee => <div key={employee.id} className="flex flex-wrap items-center gap-4 px-5 py-4"><div className="min-w-0 flex-1"><div className="flex items-center gap-2 font-medium">{employee.name}{employee.role === 'CEO' && <span className="rounded-full bg-cyan/10 px-2 py-0.5 text-[10px] font-bold uppercase text-cyan">CEO</span>}{!employee.active && <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-400">Inactive</span>}</div><div className="truncate text-xs text-stone">{employee.email} · {employee.dept || 'No department'}</div></div><select disabled={!isAdmin && employee.role === 'CEO'} value={employee.role} onChange={e => void changeRole(employee, e.target.value)} className="field w-44">{(isAdmin ? allRoles : employeeRoles).map(role => <option key={role}>{role}</option>)}</select><button title="Deactivate employee" disabled={!employee.active || employee.id === currentUser?.id} onClick={() => void deactivate(employee)} className="rounded-lg p-2 text-stone hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-30"><UserMinus size={16} /></button>{employee.active && employee.role === 'CEO' && isAdmin && <Check size={16} className="text-cyan" />}</div>)}</div></section> })}</div>
  </main>
}
