import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  TrendingUp, LayoutDashboard, ArrowUpCircle, ArrowDownCircle,
  Settings, LogOut, Bell, Search, Menu, X, Plus, ChevronUp, ChevronDown,
  Wallet, Target, PieChart, List, BarChart2, User
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import {
  mockTransactions, mockMonthlyData, categoryStats,
  formatCurrency, formatDate, getTotalIncome, getTotalExpense, getBalance,
  CATEGORY_LABELS, CATEGORY_ICONS
} from '../utils/data'
import type { Transaction } from '../types'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Vue d\'ensemble', id: 'overview' },
  { icon: ArrowUpCircle, label: 'Revenus', id: 'income' },
  { icon: ArrowDownCircle, label: 'Dépenses', id: 'expenses' },
  { icon: PieChart, label: 'Analytiques', id: 'analytics' },
  { icon: Target, label: 'Objectifs', id: 'goals' },
  { icon: Settings, label: 'Paramètres', id: 'settings' },
]

const PIE_COLORS = ['#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#64748b']

function StatCard({
  title, value, subtitle, icon: Icon, trend, trendValue, color
}: {
  title: string; value: string; subtitle?: string; icon: React.ElementType;
  trend?: 'up' | 'down'; trendValue?: string; color: string
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trend === 'up' ? 'text-brand-400 bg-brand-500/10' : 'text-red-400 bg-red-500/10'
          }`}>
            {trend === 'up' ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {trendValue}
          </span>
        )}
      </div>
      <p className="text-dark-400 text-sm mb-1">{title}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-dark-500 text-xs mt-1">{subtitle}</p>}
    </div>
  )
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const isIncome = tx.type === 'income'
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-dark-800 last:border-0 hover:bg-dark-800/30 px-2 -mx-2 rounded-xl transition-colors group">
      <div className="w-10 h-10 rounded-xl bg-dark-800 group-hover:bg-dark-700 flex items-center justify-center text-lg transition-colors shrink-0">
        {CATEGORY_ICONS[tx.category]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{tx.description}</p>
        <p className="text-dark-500 text-xs mt-0.5">{CATEGORY_LABELS[tx.category]} · {formatDate(tx.date)}</p>
      </div>
      <span className={`text-sm font-semibold shrink-0 ${isIncome ? 'text-brand-400' : 'text-red-400'}`}>
        {isIncome ? '+' : '-'}{formatCurrency(tx.amount).replace(' FCFA', '')} F
      </span>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-3 text-xs border border-white/10">
        <p className="text-dark-300 mb-2 font-medium">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {new Intl.NumberFormat('fr-SN').format(p.value)} F
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('overview')
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const totalIncome = getTotalIncome(mockTransactions)
  const totalExpense = getTotalExpense(mockTransactions)
  const balance = getBalance(mockTransactions)
  const savingsRate = Math.round(((totalIncome - totalExpense) / totalIncome) * 100)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-dark-800">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
            <TrendingUp size={18} className="text-dark-950" />
          </div>
          <span className="text-white font-bold text-xl">Fin<span className="text-brand-400">Track</span></span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => { setActiveNav(item.id); setSidebarOpen(false) }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeNav === item.id
                ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                : 'text-dark-400 hover:text-white hover:bg-dark-800'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* User profile */}
      <div className="p-4 border-t border-dark-800">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-dark-800 transition-colors mb-1">
          <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 text-sm font-bold shrink-0">
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-dark-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-dark-400 hover:text-red-400 hover:bg-red-500/5 text-sm transition-all"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-dark-900 border-r border-dark-800">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-dark-900 border-r border-dark-800 z-10">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-dark-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="glass border-b border-dark-800 px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-dark-400 hover:text-white"
          >
            <Menu size={22} />
          </button>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
              <input
                type="text"
                placeholder="Rechercher une transaction..."
                className="input-field pl-9 py-2 text-sm bg-dark-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button className="relative w-9 h-9 rounded-xl bg-dark-800 hover:bg-dark-700 flex items-center justify-center text-dark-400 hover:text-white transition-all">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full" />
            </button>
            <button className="w-9 h-9 rounded-xl bg-dark-800 hover:bg-dark-700 flex items-center justify-center text-dark-400 hover:text-white transition-all">
              <User size={18} />
            </button>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Page title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Bonjour, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-dark-400 text-sm mt-1">Voici un résumé de vos finances ce mois-ci</p>
            </div>
            <button className="btn-primary text-sm py-2.5">
              <Plus size={16} />
              <span className="hidden sm:inline">Nouvelle transaction</span>
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Solde total"
              value={formatCurrency(balance).replace('FCFA', 'F')}
              subtitle="Mis à jour aujourd'hui"
              icon={Wallet}
              trend="up"
              trendValue="+12%"
              color="bg-brand-500"
            />
            <StatCard
              title="Revenus du mois"
              value={formatCurrency(totalIncome).replace('FCFA', 'F')}
              subtitle="Septembre 2024"
              icon={ArrowUpCircle}
              trend="up"
              trendValue="+8%"
              color="bg-blue-500"
            />
            <StatCard
              title="Dépenses du mois"
              value={formatCurrency(totalExpense).replace('FCFA', 'F')}
              subtitle="Septembre 2024"
              icon={ArrowDownCircle}
              trend="down"
              trendValue="-5%"
              color="bg-red-500"
            />
            <StatCard
              title="Taux d'épargne"
              value={`${savingsRate}%`}
              subtitle="Excellent ce mois !"
              icon={Target}
              trend="up"
              trendValue="+3%"
              color="bg-purple-500"
            />
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Area chart */}
            <div className="card lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-white font-semibold">Évolution des finances</h2>
                  <p className="text-dark-500 text-xs mt-1">6 derniers mois</p>
                </div>
                <div className="flex gap-4 text-xs text-dark-400">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block" />Revenus</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />Dépenses</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={mockMonthlyData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="income" name="Revenus" stroke="#22c55e" strokeWidth={2} fill="url(#incomeGrad)" />
                  <Area type="monotone" dataKey="expense" name="Dépenses" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart */}
            <div className="card">
              <h2 className="text-white font-semibold mb-1">Répartition des dépenses</h2>
              <p className="text-dark-500 text-xs mb-4">Par catégorie</p>
              <div className="flex justify-center">
                <ResponsiveContainer width="100%" height={180}>
                  <RePieChart>
                    <Pie
                      data={categoryStats}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {categoryStats.map((entry, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => [`${new Intl.NumberFormat('fr-SN').format(v)} F`, '']}
                      contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', fontSize: '12px' }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {categoryStats.slice(0, 4).map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-dark-300">{CATEGORY_LABELS[s.category]}</span>
                    </div>
                    <span className="text-dark-400">{s.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar chart + recent transactions */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Bar chart */}
            <div className="card">
              <h2 className="text-white font-semibold mb-1">Dépenses par catégorie</h2>
              <p className="text-dark-500 text-xs mb-5">Ce mois-ci</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryStats} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={v => CATEGORY_LABELS[v]?.slice(0, 6) || v} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(v: number) => [`${new Intl.NumberFormat('fr-SN').format(v)} F`, 'Montant']}
                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {categoryStats.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent transactions */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-white font-semibold">Transactions récentes</h2>
                  <p className="text-dark-500 text-xs mt-0.5">{mockTransactions.length} transactions ce mois</p>
                </div>
                <button className="text-brand-400 hover:text-brand-300 text-xs flex items-center gap-1 transition-colors">
                  <List size={14} />
                  Tout voir
                </button>
              </div>
              <div className="space-y-0 overflow-y-auto max-h-64 pr-1">
                {mockTransactions.slice(0, 7).map(tx => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </div>
            </div>
          </div>

          {/* Budget progress */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white font-semibold">Suivi du budget mensuel</h2>
                <p className="text-dark-500 text-xs mt-0.5">Budget : {formatCurrency(user?.monthlyBudget || 800000)}</p>
              </div>
              <span className="text-brand-400 text-sm font-semibold">
                {Math.round((totalExpense / (user?.monthlyBudget || 800000)) * 100)}% utilisé
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoryStats.slice(0, 4).map((s, i) => {
                const limit = [120000, 60000, 80000, 40000][i]
                const pct = Math.min(100, Math.round((s.amount / limit) * 100))
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-dark-300">{CATEGORY_LABELS[s.category]}</span>
                      <span className="text-dark-400 text-xs">{pct}%</span>
                    </div>
                    <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: PIE_COLORS[i],
                          boxShadow: `0 0 8px ${PIE_COLORS[i]}60`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-dark-500">
                      <span>{new Intl.NumberFormat('fr-SN').format(s.amount)} F</span>
                      <span>{new Intl.NumberFormat('fr-SN').format(limit)} F</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
