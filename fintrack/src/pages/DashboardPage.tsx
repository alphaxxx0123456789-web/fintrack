import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  TrendingUp, LayoutDashboard, ArrowUpCircle, ArrowDownCircle,
  Settings, LogOut, Bell, Search, Menu, X, Plus, ChevronUp, ChevronDown,
  Wallet, Target, PieChart, List, User, Filter, Trash2, CheckCircle,
  AlertCircle, TrendingDown, Calendar, Download, RefreshCw, Edit3, Check
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
  BarChart, Bar, LineChart, Line, Legend
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import {
  mockTransactions, mockMonthlyData, categoryStats,
  formatDate, getTotalIncome, getTotalExpense, getBalance,
  CATEGORY_LABELS, CATEGORY_ICONS
} from '../utils/data'
import type { Transaction } from '../types'

/* ─── Constantes ─────────────────────────────────────────────── */
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Vue d'ensemble", id: 'overview'  },
  { icon: ArrowUpCircle,   label: 'Revenus',        id: 'income'    },
  { icon: ArrowDownCircle, label: 'Dépenses',       id: 'expenses'  },
  { icon: PieChart,        label: 'Analytiques',    id: 'analytics' },
  { icon: Target,          label: 'Objectifs',      id: 'goals'     },
  { icon: Settings,        label: 'Paramètres',     id: 'settings'  },
]

const PIE_COLORS = ['#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#64748b']

const INCOME_MONTHLY = [
  { month:'Avr', salaire:580000, freelance:90000,  investissement:40000 },
  { month:'Mai', salaire:580000, freelance:60000,  investissement:30000 },
  { month:'Juin',salaire:580000, freelance:150000, investissement:55000 },
  { month:'Juil',salaire:650000, freelance:60000,  investissement:30000 },
  { month:'Août',salaire:650000, freelance:120000, investissement:45000 },
  { month:'Sep', salaire:650000, freelance:200000, investissement:45000 },
]

const EXPENSE_WEEKLY = [
  { week:'Sem 1', montant:65000 },
  { week:'Sem 2', montant:48000 },
  { week:'Sem 3', montant:72000 },
  { week:'Sem 4', montant:40000 },
]

const INIT_GOALS = [
  { id:1, name:"Fonds d'urgence", target:1500000, current:980000, color:'#22c55e', icon:'🛡️', deadline:'2025-06-01' },
  { id:2, name:'Voyage à Paris',  target:600000,  current:210000, color:'#06b6d4', icon:'✈️', deadline:'2025-12-01' },
  { id:3, name:'Nouveau laptop',  target:350000,  current:350000, color:'#8b5cf6', icon:'💻', deadline:'2024-10-01' },
  { id:4, name:'Voiture',         target:4000000, current:800000, color:'#f59e0b', icon:'🚗', deadline:'2026-01-01' },
]

/* ─── Utilitaires ────────────────────────────────────────────── */
const fmt = (n: number) => new Intl.NumberFormat('fr-SN').format(n)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 text-xs border border-white/10 shadow-xl">
      <p className="text-dark-300 mb-2 font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {fmt(p.value)} F</p>
      ))}
    </div>
  )
}

/* ─── Composants shared ──────────────────────────────────────── */
function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, color }: {
  title:string; value:string; subtitle?:string; icon:React.ElementType
  trend?:'up'|'down'; trendValue?:string; color:string
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white"/>
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trend==='up' ? 'text-brand-400 bg-brand-500/10' : 'text-red-400 bg-red-500/10'
          }`}>
            {trend==='up' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}{trendValue}
          </span>
        )}
      </div>
      <p className="text-dark-400 text-sm mb-1">{title}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-dark-500 text-xs mt-1">{subtitle}</p>}
    </div>
  )
}

function TxRow({ tx, onDelete }: { tx:Transaction; onDelete?:(id:string)=>void }) {
  const inc = tx.type === 'income'
  return (
    <div className="flex items-center gap-3 py-3 border-b border-dark-800 last:border-0 hover:bg-dark-800/40 px-2 -mx-2 rounded-xl transition-colors group">
      <div className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center text-lg shrink-0">
        {CATEGORY_ICONS[tx.category]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{tx.description}</p>
        <p className="text-dark-500 text-xs mt-0.5">{CATEGORY_LABELS[tx.category]} · {formatDate(tx.date)}</p>
      </div>
      <span className={`text-sm font-semibold shrink-0 ${inc ? 'text-brand-400' : 'text-red-400'}`}>
        {inc ? '+' : '-'}{fmt(tx.amount)} F
      </span>
      {onDelete && (
        <button onClick={()=>onDelete(tx.id)} className="opacity-0 group-hover:opacity-100 text-dark-600 hover:text-red-400 transition-all ml-1">
          <Trash2 size={14}/>
        </button>
      )}
    </div>
  )
}

/* ─── VUE : Overview ─────────────────────────────────────────── */
function OverviewView({ user, transactions }: { user:any; transactions:Transaction[] }) {
  const inc   = getTotalIncome(transactions)
  const exp   = getTotalExpense(transactions)
  const bal   = getBalance(transactions)
  const rate  = Math.round(((inc - exp) / inc) * 100)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Solde total"    value={`${fmt(bal)} F`} subtitle="Mis à jour aujourd'hui" icon={Wallet}         trend="up"   trendValue="+12%" color="bg-brand-500"/>
        <StatCard title="Revenus"        value={`${fmt(inc)} F`} subtitle="Septembre 2024"          icon={ArrowUpCircle}  trend="up"   trendValue="+8%"  color="bg-blue-500"/>
        <StatCard title="Dépenses"       value={`${fmt(exp)} F`} subtitle="Septembre 2024"          icon={ArrowDownCircle}trend="down" trendValue="-5%"  color="bg-red-500"/>
        <StatCard title="Taux d'épargne" value={`${rate}%`}      subtitle="Excellent ce mois !"     icon={Target}         trend="up"   trendValue="+3%"  color="bg-purple-500"/>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-white font-semibold">Évolution des finances</h2>
              <p className="text-dark-500 text-xs mt-1">6 derniers mois</p>
            </div>
            <div className="flex gap-4 text-xs text-dark-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block"/>Revenus</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"/>Dépenses</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockMonthlyData} margin={{ top:5,right:5,bottom:0,left:0 }}>
              <defs>
                <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="month" tick={{fill:'#64748b',fontSize:12}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="income"  name="Revenus"  stroke="#22c55e" strokeWidth={2} fill="url(#gInc)"/>
              <Area type="monotone" dataKey="expense" name="Dépenses" stroke="#ef4444" strokeWidth={2} fill="url(#gExp)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-white font-semibold mb-1">Répartition dépenses</h2>
          <p className="text-dark-500 text-xs mb-3">Par catégorie</p>
          <ResponsiveContainer width="100%" height={170}>
            <RePieChart>
              <Pie data={categoryStats} dataKey="amount" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3}>
                {categoryStats.map((_,i)=><Cell key={i} fill={PIE_COLORS[i]} strokeWidth={0}/>)}
              </Pie>
              <Tooltip formatter={(v:number)=>[`${fmt(v)} F`,'']}
                contentStyle={{background:'#0f172a',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'12px',fontSize:'12px'}}/>
            </RePieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-1">
            {categoryStats.slice(0,5).map((s,i)=>(
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:PIE_COLORS[i]}}/>
                  <span className="text-dark-300">{CATEGORY_LABELS[s.category]}</span>
                </div>
                <span className="text-dark-400">{s.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Transactions récentes</h2>
            <span className="text-dark-500 text-xs">{transactions.length} ce mois</span>
          </div>
          <div className="overflow-y-auto max-h-64">
            {transactions.slice(0,6).map(tx=><TxRow key={tx.id} tx={tx}/>)}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold">Budget mensuel</h2>
            <span className="text-brand-400 text-sm font-semibold">
              {Math.round((exp/(user?.monthlyBudget||800000))*100)}% utilisé
            </span>
          </div>
          <div className="space-y-4">
            {categoryStats.slice(0,4).map((s,i)=>{
              const limit=[120000,60000,80000,40000][i]
              const pct=Math.min(100,Math.round((s.amount/limit)*100))
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-300">{CATEGORY_LABELS[s.category]}</span>
                    <span className="text-dark-400 text-xs">{pct}%</span>
                  </div>
                  <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{width:`${pct}%`,background:PIE_COLORS[i],boxShadow:`0 0 8px ${PIE_COLORS[i]}60`}}/>
                  </div>
                  <div className="flex justify-between text-xs text-dark-500">
                    <span>{fmt(s.amount)} F</span><span>{fmt(limit)} F</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── VUE : Revenus ──────────────────────────────────────────── */
function IncomeView({ transactions }: { transactions:Transaction[] }) {
  const incomes = transactions.filter(t=>t.type==='income')
  const total   = getTotalIncome(transactions)
  const best    = Math.max(...incomes.map(t=>t.amount))

  const byCategory = incomes.reduce<Record<string,number>>((acc,t)=>{
    acc[t.category]=(acc[t.category]||0)+t.amount; return acc
  },{})
  const catData = Object.entries(byCategory).map(([cat,amount])=>({
    name:CATEGORY_LABELS[cat]||cat, amount, icon:CATEGORY_ICONS[cat]||'💰'
  }))

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard title="Total revenus"    value={`${fmt(total)} F`}           subtitle="Septembre 2024"  icon={ArrowUpCircle} trend="up" trendValue="+8%"  color="bg-brand-500"/>
        <StatCard title="Meilleure entrée" value={`${fmt(best)} F`}            subtitle="Salaire"         icon={TrendingUp}    trend="up" trendValue="+5%"  color="bg-blue-500"/>
        <StatCard title="Nb transactions"  value={`${incomes.length}`}         subtitle="Entrées ce mois" icon={List}                                        color="bg-purple-500"/>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-semibold">Revenus par source</h2>
            <p className="text-dark-500 text-xs mt-1">6 derniers mois</p>
          </div>
          <button className="btn-ghost text-xs py-1.5 px-3">
            <Download size={13}/> Exporter
          </button>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={INCOME_MONTHLY} margin={{top:5,right:5,bottom:0,left:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
            <XAxis dataKey="month" tick={{fill:'#64748b',fontSize:12}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Legend wrapperStyle={{fontSize:'12px',paddingTop:'12px'}}/>
            <Bar dataKey="salaire"        name="Salaire"        stackId="a" fill="#22c55e" radius={[0,0,0,0]}/>
            <Bar dataKey="freelance"      name="Freelance"      stackId="a" fill="#06b6d4" radius={[0,0,0,0]}/>
            <Bar dataKey="investissement" name="Investissement" stackId="a" fill="#8b5cf6" radius={[6,6,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-white font-semibold mb-4">Répartition par source</h2>
          <div className="space-y-4">
            {catData.map((c,i)=>{
              const pct=Math.round((c.amount/total)*100)
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-dark-200">
                      <span>{c.icon}</span>{c.name}
                    </span>
                    <span className="text-brand-400 text-sm font-semibold">{fmt(c.amount)} F</span>
                  </div>
                  <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{width:`${pct}%`}}/>
                  </div>
                  <span className="text-dark-500 text-xs">{pct}% du total</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card">
          <h2 className="text-white font-semibold mb-4">Toutes les entrées</h2>
          <div className="overflow-y-auto max-h-72">
            {incomes.map(tx=><TxRow key={tx.id} tx={tx}/>)}
          </div>
          <div className="mt-4 pt-4 border-t border-dark-800 flex justify-between text-sm">
            <span className="text-dark-400">Total</span>
            <span className="text-brand-400 font-semibold">+{fmt(total)} F</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── VUE : Dépenses ─────────────────────────────────────────── */
function ExpensesView({ transactions }: { transactions:Transaction[] }) {
  const [filterCat, setFilterCat] = useState('all')
  const [txList, setTxList]       = useState<Transaction[]>(transactions)

  const expenses = txList.filter(t=>t.type==='expense')
  const filtered = filterCat==='all' ? expenses : expenses.filter(t=>t.category===filterCat)
  const total    = expenses.reduce((s,t)=>s+t.amount,0)
  const avgDay   = Math.round(total/30)
  const cats     = [...new Set(expenses.map(t=>t.category))]

  const handleDelete = (id:string) => setTxList(prev=>prev.filter(t=>t.id!==id))

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard title="Total dépenses" value={`${fmt(total)} F`}  subtitle="Septembre 2024"  icon={ArrowDownCircle} trend="down" trendValue="-5%"  color="bg-red-500"/>
        <StatCard title="Moy. par jour"  value={`${fmt(avgDay)} F`} subtitle="Estimation"      icon={Calendar}                                         color="bg-amber-500"/>
        <StatCard title="Catégorie #1"   value={CATEGORY_LABELS[categoryStats[0]?.category]||'—'} subtitle={`${fmt(categoryStats[0]?.amount||0)} F`} icon={TrendingDown} color="bg-orange-500"/>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-white font-semibold mb-1">Évolution hebdomadaire</h2>
          <p className="text-dark-500 text-xs mb-4">Septembre 2024</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={EXPENSE_WEEKLY} margin={{top:5,right:5,bottom:0,left:-10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
              <XAxis dataKey="week" tick={{fill:'#64748b',fontSize:12}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="montant" name="Dépenses" fill="#ef4444" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-white font-semibold mb-4">Par catégorie</h2>
          <div className="space-y-3">
            {categoryStats.map((s,i)=>(
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg w-6">{CATEGORY_ICONS[s.category]}</span>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-dark-300">{CATEGORY_LABELS[s.category]}</span>
                    <span className="text-dark-400">{fmt(s.amount)} F</span>
                  </div>
                  <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{width:`${s.percentage}%`,background:PIE_COLORS[i]}}/>
                  </div>
                </div>
                <span className="text-xs text-dark-500 w-8 text-right">{s.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-white font-semibold">Liste des dépenses</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-dark-500"/>
            <button onClick={()=>setFilterCat('all')}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${filterCat==='all'?'bg-brand-500/20 text-brand-400 border border-brand-500/30':'text-dark-400 hover:text-white'}`}>
              Tout
            </button>
            {cats.map(cat=>(
              <button key={cat} onClick={()=>setFilterCat(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${filterCat===cat?'bg-brand-500/20 text-brand-400 border border-brand-500/30':'text-dark-400 hover:text-white'}`}>
                {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-y-auto max-h-72">
          {filtered.length===0
            ? <p className="text-dark-500 text-sm text-center py-8">Aucune dépense dans cette catégorie</p>
            : filtered.map(tx=><TxRow key={tx.id} tx={tx} onDelete={handleDelete}/>)
          }
        </div>
        <div className="mt-4 pt-4 border-t border-dark-800 flex justify-between text-sm">
          <span className="text-dark-400">Total affiché ({filtered.length} transactions)</span>
          <span className="text-red-400 font-semibold">-{fmt(filtered.reduce((s,t)=>s+t.amount,0))} F</span>
        </div>
      </div>
    </div>
  )
}

/* ─── VUE : Analytiques ──────────────────────────────────────── */
function AnalyticsView({ transactions }: { transactions:Transaction[] }) {
  const inc  = getTotalIncome(transactions)
  const exp  = getTotalExpense(transactions)
  const bal  = getBalance(transactions)
  const rate = Math.round(((inc-exp)/inc)*100)

  const netData = mockMonthlyData.map(d=>({
    month:d.month, net:d.income-d.expense, income:d.income, expense:d.expense
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-dark-400 text-xs mb-2">Taux d'épargne</p>
          <p className="text-4xl font-bold text-brand-400">{rate}%</p>
          <p className="text-dark-500 text-xs mt-1">Excellent !</p>
        </div>
        <div className="card text-center">
          <p className="text-dark-400 text-xs mb-2">Ratio R/D</p>
          <p className="text-4xl font-bold text-blue-400">{(inc/exp).toFixed(1)}x</p>
          <p className="text-dark-500 text-xs mt-1">Revenus vs Dépenses</p>
        </div>
        <div className="card text-center">
          <p className="text-dark-400 text-xs mb-2">Solde net</p>
          <p className="text-2xl font-bold text-white">{fmt(bal)} F</p>
          <p className="text-dark-500 text-xs mt-1">Ce mois</p>
        </div>
        <div className="card text-center">
          <p className="text-dark-400 text-xs mb-2">Transactions</p>
          <p className="text-4xl font-bold text-purple-400">{transactions.length}</p>
          <p className="text-dark-500 text-xs mt-1">Ce mois</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-semibold">Solde net mensuel</h2>
            <p className="text-dark-500 text-xs mt-1">Différence revenus - dépenses</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={netData} margin={{top:5,right:5,bottom:0,left:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
            <XAxis dataKey="month" tick={{fill:'#64748b',fontSize:12}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Line type="monotone" dataKey="net"    name="Solde net" stroke="#22c55e" strokeWidth={2.5} dot={{fill:'#22c55e',r:4}}/>
            <Line type="monotone" dataKey="income" name="Revenus"   stroke="#06b6d4" strokeWidth={1.5} strokeDasharray="4 4" dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-white font-semibold mb-5">Revenus vs Dépenses</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockMonthlyData} margin={{top:5,right:5,bottom:0,left:-15}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
              <XAxis dataKey="month" tick={{fill:'#64748b',fontSize:12}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend wrapperStyle={{fontSize:'12px'}}/>
              <Bar dataKey="income"  name="Revenus"  fill="#22c55e" radius={[4,4,0,0]}/>
              <Bar dataKey="expense" name="Dépenses" fill="#ef4444" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-white font-semibold mb-2">Dépenses par catégorie</h2>
          <p className="text-dark-500 text-xs mb-3">Détail complet</p>
          <ResponsiveContainer width="100%" height={175}>
            <RePieChart>
              <Pie data={categoryStats} dataKey="amount" cx="50%" cy="50%" outerRadius={75} paddingAngle={3}
                label={({percent})=>`${Math.round(percent*100)}%`} labelLine={false}>
                {categoryStats.map((_,i)=><Cell key={i} fill={PIE_COLORS[i]} strokeWidth={0}/>)}
              </Pie>
              <Tooltip formatter={(v:number)=>[`${fmt(v)} F`,'']}
                contentStyle={{background:'#0f172a',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'12px',fontSize:'12px'}}/>
            </RePieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
            {categoryStats.map((s,i)=>(
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:PIE_COLORS[i]}}/>
                <span className="text-dark-300 truncate">{CATEGORY_LABELS[s.category]}</span>
                <span className="text-dark-500 ml-auto">{s.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-white font-semibold mb-4">💡 Insights personnalisés</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="glass-green rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-brand-400"/>
              <span className="text-brand-400 text-sm font-medium">Point fort</span>
            </div>
            <p className="text-dark-200 text-xs leading-relaxed">Votre taux d'épargne de <strong className="text-white">{rate}%</strong> est excellent. Continuez ainsi !</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-amber-400"/>
              <span className="text-amber-400 text-sm font-medium">À surveiller</span>
            </div>
            <p className="text-dark-200 text-xs leading-relaxed">Le logement représente <strong className="text-white">38%</strong> de vos dépenses. Considérez des alternatives.</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-blue-400"/>
              <span className="text-blue-400 text-sm font-medium">Opportunité</span>
            </div>
            <p className="text-dark-200 text-xs leading-relaxed">Vos revenus freelance ont augmenté de <strong className="text-white">+67%</strong> ce mois. Diversifiez vos sources !</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── VUE : Objectifs ───────────────────────────────────────── */
function GoalsView() {
  const [goals, setGoals] = useState(INIT_GOALS)
  const [adding, setAdding] = useState(false)
  const [form, setForm]     = useState({ name:'', target:'', current:'', icon:'🎯' })

  const handleAdd = () => {
    if (!form.name || !form.target) return
    setGoals(prev=>[...prev,{
      id:Date.now(), name:form.name, target:parseInt(form.target),
      current:parseInt(form.current)||0, color:'#22c55e', icon:form.icon, deadline:'2025-12-01'
    }])
    setForm({ name:'', target:'', current:'', icon:'🎯' })
    setAdding(false)
  }

  const totalSaved  = goals.reduce((s,g)=>s+g.current,0)
  const totalTarget = goals.reduce((s,g)=>s+g.target,0)
  const completed   = goals.filter(g=>g.current>=g.target).length

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard title="Total économisé"  value={`${fmt(totalSaved)} F`}  subtitle="Tous objectifs"   icon={Wallet}       color="bg-brand-500"/>
        <StatCard title="Objectif global"  value={`${fmt(totalTarget)} F`} subtitle="À atteindre"      icon={Target}       color="bg-purple-500"/>
        <StatCard title="Complétés"        value={`${completed} / ${goals.length}`} subtitle="Objectifs réussis" icon={CheckCircle} color="bg-blue-500"/>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {goals.map(goal=>{
          const pct  = Math.min(100, Math.round((goal.current/goal.target)*100))
          const done = pct >= 100
          return (
            <div key={goal.id} className={`card relative group ${done?'border border-brand-500/30':''}`}>
              {done && (
                <div className="absolute top-3 right-3">
                  <span className="flex items-center gap-1 text-xs text-brand-400 bg-brand-500/15 px-2 py-1 rounded-full">
                    <CheckCircle size={11}/> Atteint !
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{goal.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold">{goal.name}</h3>
                  <p className="text-dark-500 text-xs mt-0.5 flex items-center gap-1">
                    <Calendar size={11}/>
                    {new Date(goal.deadline).toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}
                  </p>
                </div>
                <button onClick={()=>setGoals(p=>p.filter(g=>g.id!==goal.id))}
                  className="opacity-0 group-hover:opacity-100 text-dark-600 hover:text-red-400 transition-all">
                  <Trash2 size={15}/>
                </button>
              </div>

              <div className="flex justify-between text-sm mb-2">
                <span className="text-dark-400">Économisé</span>
                <span className="text-white font-semibold">{fmt(goal.current)} F</span>
              </div>
              <div className="h-2.5 bg-dark-800 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{width:`${pct}%`,background:done?'#22c55e':goal.color,boxShadow:`0 0 10px ${goal.color}50`}}/>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-dark-500 text-xs">{pct}% complété</span>
                <span className="text-dark-400 text-xs">{fmt(goal.target)} F</span>
              </div>
              {!done && (
                <p className="text-dark-500 text-xs mt-3">
                  Encore <strong className="text-white">{fmt(goal.target-goal.current)} F</strong> à atteindre
                </p>
              )}
            </div>
          )
        })}

        {!adding ? (
          <button onClick={()=>setAdding(true)}
            className="card border-dashed border-dark-600 hover:border-brand-500/50 flex flex-col items-center justify-center gap-3 min-h-[180px] cursor-pointer transition-all">
            <div className="w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center">
              <Plus size={22} className="text-dark-500"/>
            </div>
            <p className="text-dark-500 text-sm">Ajouter un objectif</p>
          </button>
        ) : (
          <div className="card space-y-3">
            <h3 className="text-white font-semibold">Nouvel objectif</h3>
            <input className="input-field text-sm py-2.5" placeholder="Nom de l'objectif"
              value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
            <div className="grid grid-cols-2 gap-2">
              <input className="input-field text-sm py-2.5" placeholder="Objectif (F)" type="number"
                value={form.target} onChange={e=>setForm(f=>({...f,target:e.target.value}))}/>
              <input className="input-field text-sm py-2.5" placeholder="Déjà économisé" type="number"
                value={form.current} onChange={e=>setForm(f=>({...f,current:e.target.value}))}/>
            </div>
            <input className="input-field text-sm py-2.5" placeholder="Emoji (ex: 🏠)"
              value={form.icon} onChange={e=>setForm(f=>({...f,icon:e.target.value}))}/>
            <div className="flex gap-2 pt-1">
              <button onClick={handleAdd} className="btn-primary flex-1 text-sm py-2">
                <Check size={15}/> Ajouter
              </button>
              <button onClick={()=>setAdding(false)} className="btn-ghost text-sm py-2 flex-1">
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── VUE : Paramètres ───────────────────────────────────────── */
function SettingsView({ user, onLogout }: { user:any; onLogout:()=>void }) {
  const [form, setForm] = useState({
    name:     user?.name     || '',
    email:    user?.email    || '',
    currency: user?.currency || 'FCFA',
    budget:   String(user?.monthlyBudget || 800000),
    notifBudget: true,
    notifMonthly: true,
    notifTx: false,
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => { setSaved(true); setTimeout(()=>setSaved(false),2500) }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card">
        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
          <User size={18} className="text-brand-400"/> Profil utilisateur
        </h2>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-brand-500/20 border-2 border-brand-500/40 flex items-center justify-center text-brand-400 text-2xl font-bold">
            {form.name?.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}
          </div>
          <div>
            <p className="text-white font-medium">{form.name}</p>
            <p className="text-dark-500 text-sm">{form.email}</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-dark-400 text-sm block mb-1.5">Nom complet</label>
            <input className="input-field" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          </div>
          <div>
            <label className="text-dark-400 text-sm block mb-1.5">Email</label>
            <input className="input-field" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
          <Wallet size={18} className="text-brand-400"/> Préférences financières
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-dark-400 text-sm block mb-1.5">Devise</label>
            <select className="input-field" value={form.currency} onChange={e=>setForm(f=>({...f,currency:e.target.value}))}>
              <option value="FCFA">FCFA (Franc CFA)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="USD">USD (Dollar)</option>
            </select>
          </div>
          <div>
            <label className="text-dark-400 text-sm block mb-1.5">Budget mensuel (F)</label>
            <input className="input-field" type="number" value={form.budget} onChange={e=>setForm(f=>({...f,budget:e.target.value}))}/>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
          <Bell size={18} className="text-brand-400"/> Notifications
        </h2>
        <div className="space-y-3">
          {([
            { key:'notifBudget',   label:'Alertes budget dépassé',  desc:'Notifié quand une catégorie dépasse son budget' },
            { key:'notifMonthly',  label:'Récapitulatif mensuel',    desc:'Résumé envoyé le 1er de chaque mois' },
            { key:'notifTx',       label:'Nouvelles transactions',   desc:'Confirmation à chaque ajout' },
          ] as const).map(n=>(
            <div key={n.key} className="flex items-center justify-between py-2 border-b border-dark-800 last:border-0">
              <div>
                <p className="text-white text-sm">{n.label}</p>
                <p className="text-dark-500 text-xs">{n.desc}</p>
              </div>
              <button
                onClick={()=>setForm(f=>({...f,[n.key]:!f[n.key]}))}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${form[n.key]?'bg-brand-500':'bg-dark-700'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form[n.key]?'left-5':'left-0.5'}`}/>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={handleSave} className="btn-primary">
          {saved ? <><CheckCircle size={16}/> Sauvegardé !</> : <><Edit3 size={16}/> Sauvegarder</>}
        </button>
        <button onClick={onLogout} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/5 hover:border-red-500/50 text-sm font-medium transition-all">
          <LogOut size={16}/> Déconnexion
        </button>
      </div>
    </div>
  )
}

/* ─── COMPOSANT PRINCIPAL ────────────────────────────────────── */
export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeNav,   setActiveNav]   = useState('overview')
  const [transactions]                = useState<Transaction[]>(mockTransactions)
  const { user, logout }              = useAuth()
  const navigate                      = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  const inc = getTotalIncome(transactions)
  const exp = getTotalExpense(transactions)

  const PAGE_TITLES: Record<string,string> = {
    overview:  `Bonjour, ${user?.name?.split(' ')[0]} 👋`,
    income:    '💚 Revenus',
    expenses:  '🔴 Dépenses',
    analytics: '📊 Analytiques',
    goals:     '🎯 Objectifs',
    settings:  '⚙️ Paramètres',
  }
  const PAGE_SUBS: Record<string,string> = {
    overview:  'Résumé de vos finances ce mois-ci',
    income:    `Total : ${fmt(inc)} F ce mois`,
    expenses:  `Total : ${fmt(exp)} F ce mois`,
    analytics: 'Analyse détaillée de vos finances',
    goals:     "Suivez vos objectifs d'épargne",
    settings:  'Gérez votre profil et préférences',
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-dark-800">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
            <TrendingUp size={18} className="text-dark-950"/>
          </div>
          <span className="text-white font-bold text-xl">Fin<span className="text-brand-400">Track</span></span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(item=>(
          <button key={item.id}
            onClick={()=>{ setActiveNav(item.id); setSidebarOpen(false) }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeNav===item.id ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20' : 'text-dark-400 hover:text-white hover:bg-dark-800'
            }`}
          >
            <item.icon size={18}/>{item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-dark-800">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-dark-800 transition-colors mb-1">
          <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 text-sm font-bold shrink-0">
            {user?.name?.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-dark-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-dark-400 hover:text-red-400 hover:bg-red-500/5 text-sm transition-all">
          <LogOut size={16}/> Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-dark-900 border-r border-dark-800">
        <SidebarContent/>
      </aside>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={()=>setSidebarOpen(false)}/>
          <aside className="relative w-72 bg-dark-900 border-r border-dark-800 z-10">
            <button onClick={()=>setSidebarOpen(false)} className="absolute top-4 right-4 text-dark-400 hover:text-white">
              <X size={20}/>
            </button>
            <SidebarContent/>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="glass border-b border-dark-800 px-4 sm:px-6 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button onClick={()=>setSidebarOpen(true)} className="lg:hidden text-dark-400 hover:text-white">
            <Menu size={22}/>
          </button>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500"/>
              <input type="text" placeholder="Rechercher..." className="input-field pl-9 py-2 text-sm bg-dark-900"/>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button className="relative w-9 h-9 rounded-xl bg-dark-800 hover:bg-dark-700 flex items-center justify-center text-dark-400 hover:text-white transition-all">
              <Bell size={18}/>
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full"/>
            </button>
            <button className="w-9 h-9 rounded-xl bg-dark-800 hover:bg-dark-700 flex items-center justify-center text-dark-400 hover:text-white transition-all">
              <User size={18}/>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* En-tête de page */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{PAGE_TITLES[activeNav]}</h1>
              <p className="text-dark-400 text-sm mt-1">{PAGE_SUBS[activeNav]}</p>
            </div>
            {(activeNav==='overview'||activeNav==='income'||activeNav==='expenses') && (
              <button className="btn-primary text-sm py-2.5">
                <Plus size={16}/>
                <span className="hidden sm:inline">Nouvelle transaction</span>
              </button>
            )}
            {activeNav==='analytics' && (
              <button className="btn-ghost text-sm py-2.5">
                <RefreshCw size={15}/> Actualiser
              </button>
            )}
          </div>

          {/* Rendu conditionnel des vues */}
          {activeNav==='overview'  && <OverviewView  user={user} transactions={transactions}/>}
          {activeNav==='income'    && <IncomeView    transactions={transactions}/>}
          {activeNav==='expenses'  && <ExpensesView  transactions={transactions}/>}
          {activeNav==='analytics' && <AnalyticsView transactions={transactions}/>}
          {activeNav==='goals'     && <GoalsView/>}
          {activeNav==='settings'  && <SettingsView  user={user} onLogout={handleLogout}/>}
        </main>
      </div>
    </div>
  )
}
