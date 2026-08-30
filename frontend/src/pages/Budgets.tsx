import React, { useEffect, useState } from 'react';
import { budgetApi } from '../services/budgetApi';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { toast } from '../components/ui/Toast';
import {
  Plus,
  Edit2,
  Trash2,
  Wallet,
  ShoppingBag,
  Utensils,
  Plane,
  Zap,
  Home,
  Music,
  MoreHorizontal,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Target,
  IndianRupee,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

/* ─── Category icon/color map ───────────────────────────────── */
const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; gradient: string; ring: string; iconBg: string }> = {
  Food:          { icon: <Utensils className="h-5 w-5 text-orange-500"  />, gradient: 'from-orange-50 to-amber-50',    ring: 'border-orange-100',  iconBg: 'bg-orange-50 border-orange-100'  },
  Travel:        { icon: <Plane className="h-5 w-5 text-sky-500"        />, gradient: 'from-sky-50 to-indigo-50',      ring: 'border-sky-100',     iconBg: 'bg-sky-50 border-sky-100'        },
  Shopping:      { icon: <ShoppingBag className="h-5 w-5 text-pink-500" />, gradient: 'from-pink-50 to-rose-50',       ring: 'border-pink-100',    iconBg: 'bg-pink-50 border-pink-100'      },
  Utilities:     { icon: <Zap className="h-5 w-5 text-yellow-500"       />, gradient: 'from-yellow-50 to-amber-50',    ring: 'border-yellow-100',  iconBg: 'bg-yellow-50 border-yellow-100'  },
  Subscriptions: { icon: <Music className="h-5 w-5 text-violet-500"     />, gradient: 'from-violet-50 to-purple-50',   ring: 'border-violet-100',  iconBg: 'bg-violet-50 border-violet-100'  },
  Housing:       { icon: <Home className="h-5 w-5 text-teal-600"        />, gradient: 'from-teal-50 to-emerald-50',    ring: 'border-teal-100',    iconBg: 'bg-teal-50 border-teal-100'      },
  Entertainment: { icon: <Music className="h-5 w-5 text-indigo-500"     />, gradient: 'from-indigo-50 to-blue-50',     ring: 'border-indigo-100',  iconBg: 'bg-indigo-50 border-indigo-100'  },
  Other:         { icon: <MoreHorizontal className="h-5 w-5 text-slate-500" />, gradient: 'from-slate-50 to-gray-50', ring: 'border-slate-100',   iconBg: 'bg-slate-50 border-slate-100'    },
};

const getCategoryConfig = (category: string) =>
  CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG['Other'];

/* ─── Status helpers ────────────────────────────────────────── */
const getStatus = (spent: number, amount: number) => {
  const ratio = amount > 0 ? spent / amount : 0;
  if (ratio > 1.0)  return { label: 'Exceeded',        bar: 'bg-rose-500',   text: 'text-rose-600',   bg: 'bg-rose-50 border-rose-100',   icon: <XCircle      className="h-3.5 w-3.5 text-rose-500"   /> };
  if (ratio >= 0.9) return { label: 'Danger Zone',     bar: 'bg-rose-400',   text: 'text-rose-500',   bg: 'bg-rose-50 border-rose-100',   icon: <AlertTriangle className="h-3.5 w-3.5 text-rose-400"  /> };
  if (ratio >= 0.7) return { label: 'Approaching',     bar: 'bg-amber-400',  text: 'text-amber-600',  bg: 'bg-amber-50 border-amber-100', icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> };
  return               { label: 'Healthy',         bar: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> };
};

const formatINR = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

/* ─── Animated progress bar ─────────────────────────────────── */
const AnimatedBar: React.FC<{ pct: number; colorClass: string }> = ({ pct, colorClass }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 80);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
};

/* ─── Ripple button ─────────────────────────────────────────── */
const RippleButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }> = ({
  children, className = '', onClick, ...rest
}) => {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples(prev => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
    onClick?.(e);
  };

  return (
    <button
      {...rest}
      onClick={handleClick}
      className={`relative overflow-hidden ${className}`}
    >
      {ripples.map(r => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/30 animate-ping pointer-events-none"
          style={{ left: r.x - 16, top: r.y - 16, width: 32, height: 32, animationDuration: '600ms' }}
        />
      ))}
      {children}
    </button>
  );
};

/* ─── Budget Card ───────────────────────────────────────────── */
const BudgetCard: React.FC<{ budget: any; onEdit: () => void; onDelete: () => void }> = ({
  budget: b, onEdit, onDelete,
}) => {
  const cfg        = getCategoryConfig(b.category);
  const status     = getStatus(b.spent, b.amount);
  const percentage = Math.min(100, Math.round((b.spent / b.amount) * 100));
  const remaining  = Math.max(0, b.amount - b.spent);

  return (
    <div className={`group bg-white border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${cfg.ring}`}>
      {/* Top gradient strip */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${cfg.gradient.replace('from-', 'from-').replace('to-', 'to-')}`}
        style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }}
      />

      <div className="p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
              {cfg.icon}
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800 font-outfit">{b.category}</h4>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border mt-0.5 ${status.bg} ${status.text}`}>
                {status.icon}
                {status.label}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <button
              onClick={onEdit}
              className="h-7 w-7 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-100 hover:border-teal-200 text-slate-400 hover:text-teal-600 flex items-center justify-center transition-all duration-150"
              title="Edit Limit"
            >
              <Edit2 className="h-3 w-3" />
            </button>
            <button
              onClick={onDelete}
              className="h-7 w-7 rounded-lg bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-200 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-all duration-150"
              title="Delete Budget"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Amount row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Monthly Limit</p>
            <p className="text-sm font-black text-slate-800 font-outfit mt-0.5">{formatINR(b.amount)}</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Spent</p>
            <p className={`text-sm font-black font-outfit mt-0.5 ${status.text}`}>{formatINR(b.spent)}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <AnimatedBar pct={percentage} colorClass={status.bar} />
          <div className="flex justify-between text-[10px] font-bold">
            <span className={status.text}>{percentage}% Used</span>
            <span className="text-slate-400">{formatINR(remaining)} left</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Empty State ───────────────────────────────────────────── */
const EmptyBudgets: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-16 px-8 flex flex-col items-center justify-center text-center gap-5">
    <div className="h-16 w-16 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center">
      <Target className="h-8 w-8 text-teal-500" />
    </div>
    <div>
      <h3 className="text-sm font-black text-slate-800 font-outfit">No active budgets</h3>
      <p className="text-xs text-slate-400 font-semibold mt-1.5 max-w-xs leading-relaxed">
        You haven't set up monthly spending caps yet. Budgets help you keep track of food, utilities, and shopping expenses.
      </p>
    </div>
    <RippleButton
      onClick={onAdd}
      className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl px-5 py-2.5 shadow-md shadow-teal-600/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
    >
      <Plus className="h-4 w-4" />
      Set Up Budget
    </RippleButton>
  </div>
);

/* ─── Main Page ─────────────────────────────────────────────── */
const CATEGORIES_LIST = ['Food', 'Travel', 'Shopping', 'Utilities', 'Subscriptions', 'Housing', 'Entertainment', 'Other'];

export const Budgets: React.FC = () => {
  const { fetchNotifications } = useNotifications();
  const [budgets, setBudgets]         = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [isAddOpen, setIsAddOpen]     = useState(false);
  const [isEditOpen, setIsEditOpen]   = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [formCategory, setFormCategory] = useState('');
  const [formAmount, setFormAmount]   = useState('');
  const [formLoading, setFormLoading] = useState(false);

  /* Derived KPIs */
  const totalLimit = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overBudget = budgets.filter(b => b.spent > b.amount).length;

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await budgetApi.getBudgets();
      if (res.success) setBudgets(res.data.budgets);
    } catch { toast.error('Failed to load budgets.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBudgets(); }, []);

  const openAdd  = () => { setFormCategory(''); setFormAmount(''); setIsAddOpen(true); };
  const openEdit = (b: any) => { setSelectedBudget(b); setFormAmount(b.amount.toString()); setIsEditOpen(true); };
  const openDel  = (b: any) => { setSelectedBudget(b); setIsDeleteOpen(true); };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategory || !formAmount) { toast.error('Please fill in all fields.'); return; }
    try {
      setFormLoading(true);
      const res = await budgetApi.createBudget({ category: formCategory, amount: parseFloat(formAmount) });
      if (res.success) { setIsAddOpen(false); toast.success('Budget created!'); fetchBudgets(); fetchNotifications(); }
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to create budget.'); }
    finally { setFormLoading(false); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount) { toast.error('Please enter an amount.'); return; }
    try {
      setFormLoading(true);
      const res = await budgetApi.updateBudget(selectedBudget.id, parseFloat(formAmount));
      if (res.success) { setIsEditOpen(false); toast.success('Budget updated!'); fetchBudgets(); fetchNotifications(); }
    } catch { toast.error('Failed to update budget.'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    try {
      setFormLoading(true);
      const res = await budgetApi.deleteBudget(selectedBudget.id);
      if (res.success) { setIsDeleteOpen(false); toast.success('Budget removed.'); fetchBudgets(); fetchNotifications(); }
    } catch { toast.error('Failed to delete budget.'); }
    finally { setFormLoading(false); }
  };

  return (
    <div className="space-y-6 text-left font-sans antialiased max-w-5xl mx-auto">

      {/* ── Page Header ── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center">
            <Wallet className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight font-outfit">Budgets & Limits</h2>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Set monthly boundaries on specific categories to enforce spending rules.</p>
          </div>
        </div>
        <RippleButton
          onClick={openAdd}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl px-5 py-2.5 shadow-md shadow-teal-600/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
        >
          <Plus className="h-4 w-4" />
          Create Budget
        </RippleButton>
      </div>

      {/* ── KPI Summary Strip ── */}
      {!loading && budgets.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Limit',    val: formatINR(totalLimit), icon: <IndianRupee className="h-4 w-4 text-teal-600"   />, bg: 'bg-teal-50 border-teal-100'   },
            { label: 'Total Spent',    val: formatINR(totalSpent), icon: <TrendingUp   className="h-4 w-4 text-violet-600" />, bg: 'bg-violet-50 border-violet-100' },
            { label: 'Over Budget',    val: `${overBudget} categories`, icon: <AlertTriangle className="h-4 w-4 text-rose-500" />, bg: 'bg-rose-50 border-rose-100' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 flex items-center gap-3">
              <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${kpi.bg}`}>
                {kpi.icon}
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                <p className="text-sm font-black text-slate-800 font-outfit mt-0.5">{kpi.val}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Budget Cards Grid / Empty State ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <LoadingSkeleton type="card" count={3} />
        </div>
      ) : budgets.length === 0 ? (
        <EmptyBudgets onAdd={openAdd} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              onEdit={() => openEdit(b)}
              onDelete={() => openDel(b)}
            />
          ))}

          {/* Add new card CTA */}
          <RippleButton
            onClick={openAdd}
            className="bg-white border-2 border-dashed border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-teal-600 transition-all duration-300 cursor-pointer min-h-[180px] group"
          >
            <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-teal-50 group-hover:border-teal-100 flex items-center justify-center transition-all duration-200">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold">Add Budget Category</span>
          </RippleButton>
        </div>
      )}

      {/* ── Modal: Add Budget ── */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Set Up Budget Category">
        <form onSubmit={handleAdd} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Category <span className="text-teal-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES_LIST.map((cat) => {
                const cfg = getCategoryConfig(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormCategory(cat)}
                    className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-[10px] font-bold transition-all duration-150 cursor-pointer
                      ${formCategory === cat
                        ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm scale-[1.03]'
                        : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-white'
                      }`}
                  >
                    {cfg.icon}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Monthly Limit Amount (₹) *"
            type="number"
            value={formAmount}
            onChange={(e) => setFormAmount(e.target.value)}
            placeholder="e.g. 15000"
            required
          />

          <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors">
              Cancel
            </button>
            <RippleButton
              type="submit"
              disabled={formLoading || !formCategory}
              className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            >
              {formLoading ? 'Saving…' : 'Save Budget'}
            </RippleButton>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Edit Budget ── */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Update Limit: ${selectedBudget?.category}`}>
        <form onSubmit={handleEdit} className="space-y-5">
          {selectedBudget && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${getCategoryConfig(selectedBudget.category).iconBg}`}>
                {getCategoryConfig(selectedBudget.category).icon}
              </div>
              <div>
                <p className="text-xs font-black text-slate-800">{selectedBudget.category}</p>
                <p className="text-[10px] text-slate-400 font-semibold">Current limit: {formatINR(selectedBudget.amount)}</p>
              </div>
            </div>
          )}

          <Input
            label="New Limit Amount (₹) *"
            type="number"
            value={formAmount}
            onChange={(e) => setFormAmount(e.target.value)}
            required
          />

          <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors">
              Cancel
            </button>
            <RippleButton
              type="submit"
              disabled={formLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            >
              {formLoading ? 'Saving…' : 'Save Limit'}
            </RippleButton>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Delete Confirm ── */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Budget">
        <div className="space-y-5">
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Are you sure you want to delete the budget for{' '}
              <span className="font-black text-slate-800">"{selectedBudget?.category}"</span>?
              Monthly spendings will no longer be capped or warnings triggered for this category.
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsDeleteOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors">
              Cancel
            </button>
            <RippleButton
              onClick={handleDelete}
              disabled={formLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {formLoading ? 'Deleting…' : 'Confirm Delete'}
            </RippleButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Budgets;
