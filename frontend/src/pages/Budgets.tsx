import React, { useEffect, useState } from 'react';
import { budgetApi } from '../services/budgetApi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { toast } from '../components/ui/Toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export const Budgets: React.FC = () => {
  const { fetchNotifications } = useNotifications();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);

  // Form states
  const [formCategory, setFormCategory] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await budgetApi.getBudgets();
      if (res.success) {
        setBudgets(res.data.budgets);
      }
    } catch (error) {
      console.error('Failed to load budgets:', error);
      toast.error('Failed to load budgets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const openAddModal = () => {
    setFormCategory('');
    setFormAmount('');
    setIsAddOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategory || !formAmount) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      setFormLoading(true);
      const res = await budgetApi.createBudget({
        category: formCategory,
        amount: parseFloat(formAmount),
      });

      if (res.success) {
        setIsAddOpen(false);
        toast.success('Budget category set up successfully.');
        fetchBudgets();
        fetchNotifications();
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to create budget.';
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (budget: any) => {
    setSelectedBudget(budget);
    setFormAmount(budget.amount.toString());
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount) {
      toast.error('Please provide a limit amount.');
      return;
    }

    try {
      setFormLoading(true);
      const res = await budgetApi.updateBudget(selectedBudget.id, parseFloat(formAmount));
      if (res.success) {
        setIsEditOpen(false);
        toast.success('Budget limit updated successfully.');
        fetchBudgets();
        fetchNotifications();
      }
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to update budget.');
    } finally {
      setFormLoading(false);
    }
  };

  const openDeleteModal = (budget: any) => {
    setSelectedBudget(budget);
    setIsDeleteOpen(true);
  };

  const handleDeleteSubmit = async () => {
    try {
      setFormLoading(true);
      const res = await budgetApi.deleteBudget(selectedBudget.id);
      if (res.success) {
        setIsDeleteOpen(false);
        toast.success('Budget category removed.');
        fetchBudgets();
        fetchNotifications();
      }
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to delete budget.');
    } finally {
      setFormLoading(false);
    }
  };

  const getStatus = (spent: number, amount: number) => {
    const ratio = spent / amount;
    if (ratio > 1.0) return { label: 'Exceeded', color: 'danger', percentColor: 'bg-red-500' };
    if (ratio >= 0.9) return { label: 'Danger Warning', color: 'danger', percentColor: 'bg-red-500' };
    if (ratio >= 0.7) return { label: 'Approaching limit', color: 'warning', percentColor: 'bg-amber-500' };
    return { label: 'Healthy', color: 'success', percentColor: 'bg-emerald-500' };
  };

  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const categoriesList = ['Food', 'Travel', 'Shopping', 'Utilities', 'Subscriptions', 'Housing', 'Entertainment', 'Other'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Budgets & Limits</h2>
          <p className="text-xs text-slate-450 mt-1">Set monthly boundaries on specific categories to enforce spending rules.</p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2 self-start sm:self-center">
          <Plus className="h-4 w-4" />
          Create Budget
        </Button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LoadingSkeleton type="card" count={3} />
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState 
          title="No active budgets" 
          description="You haven't set up monthly spending caps yet. Budgets help you keep track of food, utilities, and shopping expenses."
          action={
            <Button size="sm" onClick={openAddModal}>Set Up Budget</Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {budgets.map((b) => {
            const status = getStatus(b.spent, b.amount);
            const percentage = Math.min(100, Math.round((b.spent / b.amount) * 100));
            const remaining = Math.max(0, b.amount - b.spent);

            return (
              <Card key={b.id} className="bg-slate-900 border-slate-850 p-6 flex flex-col justify-between h-56">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-white tracking-wide">{b.category}</span>
                    <div className="flex items-center gap-1">
                      <Badge variant={status.color as any}>{status.label}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Monthly Limit</span>
                      <span className="font-semibold text-white">{formatINR(b.amount)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Spent Current Month</span>
                      <span className="font-semibold text-slate-300">{formatINR(b.spent)}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="pt-2">
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                        <div 
                          className={`h-full ${status.percentColor} rounded-full`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>{percentage}% Used</span>
                        <span>{formatINR(remaining)} Left</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-1 mt-4 pt-3 border-t border-slate-800/30">
                  <button 
                    onClick={() => openEditModal(b)}
                    className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                    title="Edit Limit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => openDeleteModal(b)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                    title="Delete Budget"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal - Add Budget */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Set Up Budget Category">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Category *
            </label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
              required
            >
              <option value="">Select Category</option>
              {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <Input
            label="Monthly Limit Amount (₹) *"
            type="number"
            value={formAmount}
            onChange={(e) => setFormAmount(e.target.value)}
            placeholder="15000"
            required
          />

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-800/40">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={formLoading}>
              Save Budget
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal - Edit Budget */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Update Limit: ${selectedBudget?.category}`}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Updated Limit Amount (₹) *"
            type="number"
            value={formAmount}
            onChange={(e) => setFormAmount(e.target.value)}
            required
          />

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-800/40">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={formLoading}>
              Save Limit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal - Delete Budget Confirmation */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Budget">
        <div className="space-y-4">
          <p className="text-sm text-slate-350 text-left">
            Are you sure you want to delete the budget for <span className="font-semibold text-white">"{selectedBudget?.category}"</span>? Monthly spendings will no longer be capped or warnings triggered for this category.
          </p>
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-800/40">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={formLoading} onClick={handleDeleteSubmit}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default Budgets;
