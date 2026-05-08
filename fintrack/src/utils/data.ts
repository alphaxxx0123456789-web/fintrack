import type { Transaction, MonthlyData, CategoryStat, User } from '../types'

export const mockUser: User = {
  id: '1',
  name: 'Amadou Diallo',
  email: 'amadou@fintrack.sn',
  currency: 'FCFA',
  monthlyBudget: 800000,
}

export const mockTransactions: Transaction[] = [
  { id: '1', type: 'income', amount: 650000, category: 'salary', description: 'Salaire Septembre', date: '2024-09-01' },
  { id: '2', type: 'income', amount: 120000, category: 'freelance', description: 'Projet web Dakar Tech', date: '2024-09-05' },
  { id: '3', type: 'expense', amount: 85000, category: 'housing', description: 'Loyer appartement', date: '2024-09-03' },
  { id: '4', type: 'expense', amount: 22000, category: 'food', description: 'Marché Sandaga', date: '2024-09-08' },
  { id: '5', type: 'expense', amount: 15000, category: 'transport', description: 'Taxi & DDD', date: '2024-09-10' },
  { id: '6', type: 'income', amount: 45000, category: 'investment', description: 'Dividendes BOAD', date: '2024-09-12' },
  { id: '7', type: 'expense', amount: 38000, category: 'shopping', description: 'Centre commercial', date: '2024-09-14' },
  { id: '8', type: 'expense', amount: 12500, category: 'entertainment', description: 'Cinéma & sortie', date: '2024-09-15' },
  { id: '9', type: 'expense', amount: 18000, category: 'health', description: 'Consultation médicale', date: '2024-09-18' },
  { id: '10', type: 'expense', amount: 25000, category: 'utilities', description: 'SENELEC & eau', date: '2024-09-20' },
  { id: '11', type: 'income', amount: 80000, category: 'freelance', description: 'Design logo entreprise', date: '2024-09-22' },
  { id: '12', type: 'expense', amount: 9500, category: 'food', description: 'Restaurant Plateau', date: '2024-09-25' },
]

export const mockMonthlyData: MonthlyData[] = [
  { month: 'Avr', income: 720000, expense: 420000 },
  { month: 'Mai', income: 680000, expense: 380000 },
  { month: 'Juin', income: 810000, expense: 510000 },
  { month: 'Juil', income: 750000, expense: 460000 },
  { month: 'Août', income: 820000, expense: 530000 },
  { month: 'Sep', income: 895000, expense: 225000 },
]

export const categoryStats: CategoryStat[] = [
  { category: 'housing', amount: 85000, percentage: 38, color: '#f59e0b' },
  { category: 'food', amount: 31500, percentage: 14, color: '#ef4444' },
  { category: 'shopping', amount: 38000, percentage: 17, color: '#8b5cf6' },
  { category: 'transport', amount: 15000, percentage: 7, color: '#06b6d4' },
  { category: 'utilities', amount: 25000, percentage: 11, color: '#f97316' },
  { category: 'other', amount: 30500, percentage: 13, color: '#64748b' },
]

export const CATEGORY_LABELS: Record<string, string> = {
  salary: 'Salaire',
  freelance: 'Freelance',
  investment: 'Investissement',
  food: 'Alimentation',
  transport: 'Transport',
  housing: 'Logement',
  entertainment: 'Loisirs',
  health: 'Santé',
  education: 'Éducation',
  shopping: 'Shopping',
  utilities: 'Factures',
  other: 'Autre',
}

export const CATEGORY_ICONS: Record<string, string> = {
  salary: '💼',
  freelance: '💻',
  investment: '📈',
  food: '🍽️',
  transport: '🚗',
  housing: '🏠',
  entertainment: '🎬',
  health: '⚕️',
  education: '📚',
  shopping: '🛍️',
  utilities: '⚡',
  other: '📦',
}

export function formatCurrency(amount: number, currency = 'FCFA'): string {
  if (currency === 'FCFA') {
    return new Intl.NumberFormat('fr-SN').format(amount) + ' FCFA'
  }
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function getTotalIncome(transactions: Transaction[]): number {
  return transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
}

export function getTotalExpense(transactions: Transaction[]): number {
  return transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
}

export function getBalance(transactions: Transaction[]): number {
  return getTotalIncome(transactions) - getTotalExpense(transactions)
}
