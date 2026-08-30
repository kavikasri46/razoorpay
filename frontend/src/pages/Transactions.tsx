import React, { useEffect, useState } from 'react';
import { transactionApi } from '../services/transactionApi';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { toast } from '../components/ui/Toast';
import { useNotifications } from '../context/NotificationContext';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export const Transactions: React.FC = () => {
  const { fetchNotifications } = useNotifications();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  // Form States
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formMethod, setFormMethod] = useState<any>('UPI');
  const [formDate, setFormDate] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await transactionApi.getTransactions({
        page,
        limit,
        search: search || undefined,
        category: category || undefined,
        type: type || undefined,
        status: status || undefined,
        paymentMethod: paymentMethod || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      if (res.success) {
        setTransactions(res.data.transactions);
        setTotal(res.data.pagination.total);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast.error('Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, category, type, status, paymentMethod, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const openAddModal = () => {
    setFormAmount('');
    setFormType('EXPENSE');
    setFormCategory('');
    setFormDescription('');
    setFormMethod('UPI');
    setFormDate(new Date().toISOString().split('T')[0]);
    setIsAddOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || !formCategory || !formDescription) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      setFormLoading(true);
      const payload = {
        amount: parseFloat(formAmount),
        type: formType,
        category: formCategory,
        description: formDescription,
        paymentMethod: formMethod,
        transactionDate: formDate ? new Date(formDate).toISOString() : new Date().toISOString(),
      };

      const res = await transactionApi.createTransaction(payload);
      if (res.success) {
        setIsAddOpen(false);
        toast.success('Transaction added successfully!');
        if (res.data.transaction.status === 'FLAGGED') {
          toast.warning('Warning: Transaction flagged by anomaly detector as suspicious.');
        }
        setPage(1);
        fetchTransactions();
        fetchNotifications();
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to add transaction.';
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (tx: any) => {
    setSelectedTx(tx);
    setFormAmount(tx.amount.toString());
    setFormType(tx.type);
    setFormCategory(tx.category);
    setFormDescription(tx.description);
    setFormMethod(tx.paymentMethod);
    setFormDate(new Date(tx.transactionDate).toISOString().split('T')[0]);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || !formCategory || !formDescription) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      setFormLoading(true);
      const payload = {
        amount: parseFloat(formAmount),
        type: formType,
        category: formCategory,
        description: formDescription,
        paymentMethod: formMethod,
        transactionDate: new Date(formDate).toISOString(),
      };

      const res = await transactionApi.updateTransaction(selectedTx.id, payload);
      if (res.success) {
        setIsEditOpen(false);
        toast.success('Transaction updated successfully.');
        fetchTransactions();
        fetchNotifications();
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to update transaction.';
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const openDeleteModal = (tx: any) => {
    setSelectedTx(tx);
    setIsDeleteOpen(true);
  };

  const handleDeleteSubmit = async () => {
    try {
      setFormLoading(true);
      const res = await transactionApi.deleteTransaction(selectedTx.id);
      if (res.success) {
        setIsDeleteOpen(false);
        toast.success('Transaction deleted successfully.');
        fetchTransactions();
        fetchNotifications();
      }
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to delete transaction.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setType('');
    setStatus('');
    setPaymentMethod('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const categoriesList = ['Salary', 'Freelance', 'Food', 'Travel', 'Shopping', 'Utilities', 'Subscriptions', 'Housing', 'Entertainment', 'Other'];

  return (
    <div className="space-y-6 text-left font-sans text-slate-800 antialiased">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight font-outfit">Transactions Registry</h2>
          <p className="text-xs text-slate-500 mt-1 font-semibold">Audit log of all payments, cash receipts, and anomaly risk flags.</p>
        </div>
        <Button 
          onClick={openAddModal} 
          className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 py-2.5 self-start sm:self-center"
        >
          <Plus className="h-4 w-4" /> Add Transaction
        </Button>
      </div>

      {/* Advanced Filters Panel */}
      <Card className="bg-white border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="flex-1 w-full relative">
              <Input
                placeholder="Search description or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full"
                light
              />
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl px-5 py-2.5 shadow-sm border-0 flex-1 md:flex-none">
                Search
              </Button>
              <Button type="button" onClick={handleResetFilters} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl px-5 py-2.5 shadow-sm border-0 flex-1 md:flex-none flex items-center justify-center gap-1">
                <RotateCcw className="h-3.5 w-3.5 text-slate-500" /> Reset
              </Button>
            </div>
          </div>

          {/* Filters Fields */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white transition-all font-bold cursor-pointer"
              >
                <option value="">All Types</option>
                <option value="INCOME">Income (+)</option>
                <option value="EXPENSE">Expense (-)</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white transition-all font-bold cursor-pointer"
              >
                <option value="">All Categories</option>
                {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white transition-all font-bold cursor-pointer"
              >
                <option value="">All Methods</option>
                <option value="UPI">UPI</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash</option>
                <option value="WALLET">Wallet</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Risk Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white transition-all font-bold cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="PENDING">PENDING</option>
                <option value="FLAGGED">FLAGGED</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white transition-all font-bold cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white transition-all font-bold cursor-pointer"
              />
            </div>
          </div>
        </form>
      </Card>

      {/* Grid of Results */}
      {loading ? (
        <LoadingSkeleton type="table" />
      ) : transactions.length === 0 ? (
        <EmptyState 
          title="No transactions found" 
          description="Try broadening your filters, searching another keyword, or record a new transaction to start." 
          action={
            <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold py-2.5 text-xs shadow-sm border-0" onClick={openAddModal}>Add Transaction</Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm text-slate-650 border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Method</th>
                    <th className="py-4 px-6">Risk</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Amount</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-800">{tx.description}</p>
                        <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                          {new Date(tx.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-semibold">{tx.category}</td>
                      <td className="py-4 px-6 text-slate-400 font-semibold">{tx.paymentMethod}</td>
                      <td className="py-4 px-6">
                        <Badge variant={
                          tx.riskLevel === 'HIGH' ? 'danger' :
                          tx.riskLevel === 'MEDIUM' ? 'warning' : 'neutral'
                        } className="text-[9px] font-bold px-2 py-0.5">
                          {tx.riskLevel}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={
                          tx.status === 'SUCCESS' ? 'success' :
                          tx.status === 'PENDING' ? 'warning' :
                          tx.status === 'FAILED' ? 'danger' : 'warning'
                        } className="text-[9px] font-bold px-2 py-0.5">
                          {tx.status}
                        </Badge>
                      </td>
                      <td className={`py-4 px-6 text-right font-black text-sm font-outfit ${
                        tx.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-800'
                      }`}>
                        {tx.type === 'INCOME' ? '+' : '-'}&nbsp;{formatINR(tx.amount)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => openEditModal(tx)}
                            className="p-2 text-slate-400 hover:text-teal-600 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => openDeleteModal(tx)}
                            className="p-2 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs font-semibold text-slate-400">
                Showing page {page} of {totalPages} ({total} entries)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  className="px-2.5 py-1.5 border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-bold text-slate-700 px-2">{page}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-2.5 py-1.5 border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal - Add Transaction */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Record Transaction">
        <form onSubmit={handleAddSubmit} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount (₹) *"
              type="number"
              step="0.01"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              placeholder="350"
              required
              light
            />
            <div className="text-left">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormType('EXPENSE')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    formType === 'EXPENSE'
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <TrendingDown className="h-3.5 w-3.5" />
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('INCOME')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    formType === 'INCOME'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  Income
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-left">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Category *
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white transition-all font-bold cursor-pointer"
                required
              >
                <option value="">Select Category</option>
                {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="text-left">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Payment Method *
              </label>
              <select
                value={formMethod}
                onChange={(e) => setFormMethod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white transition-all font-bold cursor-pointer"
                required
              >
                <option value="UPI">UPI</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash</option>
                <option value="WALLET">Wallet</option>
              </select>
            </div>
          </div>

          <Input
            label="Description (Merchant / Notes) *"
            type="text"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Swiggy, BESCOM Bill, Salary Credit..."
            required
            light
          />

          <Input
            label="Transaction Date"
            type="date"
            value={formDate}
            onChange={(e) => setFormDate(e.target.value)}
            light
          />

          {/* Quick Info regarding anomaly flag */}
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex gap-3 text-left">
            <AlertTriangle className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              Note: Expense thresholds above ₹30,000 or multiple repeated charges trigger automated high-risk flagged statuses for auditor review.
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-3 border-t border-slate-100 mt-2">
            <Button type="button" onClick={() => setIsAddOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl px-4 py-2 border-0 shadow-none">
              Cancel
            </Button>
            <Button type="submit" loading={formLoading} className="bg-teal-650 hover:bg-teal-750 text-white text-xs font-bold rounded-xl px-4 py-2 shadow-sm border-0">
              Save Transaction
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal - Edit Transaction */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modify Transaction">
        <form onSubmit={handleEditSubmit} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount (₹) *"
              type="number"
              step="0.01"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              required
              light
            />
            <div className="text-left">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormType('EXPENSE')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    formType === 'EXPENSE'
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <TrendingDown className="h-3.5 w-3.5" />
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('INCOME')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    formType === 'INCOME'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  Income
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-left">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Category *
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white transition-all font-bold cursor-pointer"
                required
              >
                {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="text-left">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Payment Method *
              </label>
              <select
                value={formMethod}
                onChange={(e) => setFormMethod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white transition-all font-bold cursor-pointer"
                required
              >
                <option value="UPI">UPI</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash</option>
                <option value="WALLET">Wallet</option>
              </select>
            </div>
          </div>

          <Input
            label="Description (Merchant / Notes) *"
            type="text"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            required
            light
          />

          <Input
            label="Transaction Date"
            type="date"
            value={formDate}
            onChange={(e) => setFormDate(e.target.value)}
            light
          />

          <div className="flex gap-3 justify-end pt-3 border-t border-slate-100 mt-2">
            <Button type="button" onClick={() => setIsEditOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl px-4 py-2 border-0 shadow-none">
              Cancel
            </Button>
            <Button type="submit" loading={formLoading} className="bg-teal-650 hover:bg-teal-750 text-white text-xs font-bold rounded-xl px-4 py-2 shadow-sm border-0">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal - Delete Confirmation */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Transaction">
        <div className="space-y-4 text-left">
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Are you sure you want to delete the transaction for <span className="font-extrabold text-slate-800">"{selectedTx?.description}"</span> (amount: {selectedTx && formatINR(selectedTx.amount)})? This action will adjust any related budget statistics and cannot be undone.
          </p>
          <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
            <Button type="button" onClick={() => setIsDeleteOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl px-4 py-2 border-0 shadow-none">
              Cancel
            </Button>
            <Button loading={formLoading} onClick={handleDeleteSubmit} className="bg-rose-600 hover:bg-rose-750 text-white text-xs font-bold rounded-xl px-4 py-2 shadow-sm border-0">
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Transactions;
