import React, { useEffect, useState, useRef } from 'react';
import { analyticsApi } from '../services/analyticsApi';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ErrorState from '../components/ui/ErrorState';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  CreditCard,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Zap,
  Wallet,
  Activity,
  IndianRupee,
} from 'lucide-react';

/* ─── Palette ────────────────────────────────────────────────── */
const PIE_COLORS = [
  '#14b8a6', '#6366f1', '#f59e0b', '#10b981',
  '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4',
];

/* ─── Animated counter hook ─────────────────────────────────── */
function useCountUp(target: number, duration = 900, active = true) {
  const [val, setVal] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active || target === 0) { setVal(target); return; }
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
      else setVal(target);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [target, duration, active]);

  return val;
}

/* ─── KPI Card with animated counter ───────────────────────── */
interface KpiProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: number;
  active: boolean;
}
const KpiCard: React.FC<KpiProps> = ({ label, value, prefix = '', suffix = '', icon, iconBg, trend, active }) => {
  const animated = useCountUp(value, 900, active);
  const formatted = animated.toLocaleString('en-IN');
  const positive = (trend ?? 0) >= 0;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-1 rounded-full ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-800 font-outfit mt-1">
          {prefix}{formatted}{suffix}
        </p>
      </div>
    </div>
  );
};

/* ─── Section Header ────────────────────────────────────────── */
const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle: string }> = ({ icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="h-9 w-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div>
      <h3 className="text-sm font-black text-slate-800 font-outfit">{title}</h3>
      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{subtitle}</p>
    </div>
  </div>
);

/* ─── Custom tooltip (light theme) ─────────────────────────── */
const LightTooltip = ({ active, payload, label, formatter }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-xs">
      {label && <p className="font-bold text-slate-500 mb-2">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 font-semibold text-slate-700">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span>{p.name}:</span>
          <span className="font-black">{formatter ? formatter(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Empty State ───────────────────────────────────────────── */
const EmptyChart: React.FC<{ message: string }> = ({ message }) => (
  <div className="h-56 flex flex-col items-center justify-center gap-3 text-slate-400">
    <div className="h-12 w-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center">
      <Activity className="h-6 w-6 text-slate-300" />
    </div>
    <p className="text-xs font-semibold text-slate-400">{message}</p>
  </div>
);

/* ─── Custom Pie Legend ─────────────────────────────────────── */
const PieLegend: React.FC<{ data: any[]; formatter: (v: number) => string }> = ({ data, formatter }) => (
  <div className="grid grid-cols-2 gap-2 mt-4 px-2">
    {data.map((entry, i) => (
      <div key={i} className="flex items-center gap-2 text-[10px] font-semibold text-slate-600 truncate">
        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
        <span className="truncate">{entry.name}</span>
        <span className="font-black text-slate-800 ml-auto">{formatter(entry.value)}</span>
      </div>
    ))}
  </div>
);

/* ─── Main Page ─────────────────────────────────────────────── */
export const Analytics: React.FC = () => {
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(false);
  const [trends, setTrends]             = useState<any[]>([]);
  const [categories, setCategories]     = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [kpiReady, setKpiReady]         = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(false);
      setKpiReady(false);
      const [trendsRes, categoriesRes, methodsRes] = await Promise.all([
        analyticsApi.getMonthlyTrend(),
        analyticsApi.getCategories(),
        analyticsApi.getPaymentMethods(),
      ]);
      if (trendsRes.success)     setTrends(trendsRes.data.trend);
      if (categoriesRes.success) setCategories(categoriesRes.data.categories);
      if (methodsRes.success)    setPaymentMethods(methodsRes.data.distribution);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setTimeout(() => setKpiReady(true), 100);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  if (loading) return (
    <div className="space-y-6">
      <LoadingSkeleton type="stats" count={3} />
      <LoadingSkeleton type="chart" count={2} />
    </div>
  );

  if (error) return <ErrorState onRetry={fetchAnalytics} />;

  /* KPI computations */
  const totalIncome  = trends.reduce((s, r) => s + (r.income  ?? 0), 0);
  const totalExpense = trends.reduce((s, r) => s + (r.expense ?? 0), 0);
  const netSurplus   = totalIncome - totalExpense;
  const txnCount     = paymentMethods.reduce((s, m) => s + (m.count ?? 0), 0);

  const formatINR = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const formatShort = (v: number) => {
    if (v >= 10_00_000) return `₹${(v / 10_00_000).toFixed(1)}L`;
    if (v >= 1_000)     return `₹${(v / 1_000).toFixed(1)}K`;
    return `₹${v}`;
  };

  /* Area chart data — blend income/expense into gradient areas */
  const areaData = trends.map(t => ({
    month: t.month,
    Income: t.income ?? 0,
    Expenses: t.expense ?? 0,
    Surplus: Math.max(0, (t.income ?? 0) - (t.expense ?? 0)),
  }));

  return (
    <div className="space-y-7 text-left font-sans antialiased max-w-5xl mx-auto">

      {/* ── Page Header ── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight font-outfit">Analytics Hub</h2>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Deep analysis of cash flows, payment distributions, and spending behaviors.</p>
          </div>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-600 hover:text-teal-700 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Income"
          value={totalIncome}
          prefix="₹"
          icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-50 border border-emerald-100"
          trend={+5}
          active={kpiReady}
        />
        <KpiCard
          label="Total Expenses"
          value={totalExpense}
          prefix="₹"
          icon={<TrendingDown className="h-5 w-5 text-rose-500" />}
          iconBg="bg-rose-50 border border-rose-100"
          trend={-3}
          active={kpiReady}
        />
        <KpiCard
          label="Net Surplus"
          value={netSurplus}
          prefix="₹"
          icon={<IndianRupee className="h-5 w-5 text-teal-600" />}
          iconBg="bg-teal-50 border border-teal-100"
          active={kpiReady}
        />
        <KpiCard
          label="Transactions"
          value={txnCount}
          icon={<Layers className="h-5 w-5 text-violet-600" />}
          iconBg="bg-violet-50 border border-violet-100"
          active={kpiReady}
        />
      </div>

      {/* ── Cashflow Area Chart ── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
        <SectionHeader
          icon={<Activity className="h-4 w-4 text-teal-600" />}
          title="Cashflow Comparison"
          subtitle="Monthly income vs monthly expenditure aggregates"
        />
        {areaData.length === 0 ? (
          <EmptyChart message="No cashflow data recorded yet." />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={areaData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradSurplus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatShort} />
              <Tooltip content={<LightTooltip formatter={formatINR} />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#64748b', paddingTop: '12px' }}
              />
              <Area type="monotone" dataKey="Income"   stroke="#10b981" strokeWidth={2.5} fill="url(#gradIncome)"  dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2.5} fill="url(#gradExpense)" dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="Surplus"  stroke="#14b8a6" strokeWidth={1.5} fill="url(#gradSurplus)" strokeDasharray="5 3" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Category Pie + Payment Methods ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Spending Categorization */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
          <SectionHeader
            icon={<PieIcon className="h-4 w-4 text-violet-600" />}
            title="Spending Categorization"
            subtitle="Proportional breakdown of this month's expenses"
          />
          {categories.length === 0 ? (
            <EmptyChart message="No expenditure recorded this cycle." />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={900}
                  >
                    {categories.map((_e, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<LightTooltip formatter={formatINR} />} />
                </PieChart>
              </ResponsiveContainer>
              <PieLegend data={categories} formatter={formatINR} />
            </>
          )}
        </div>

        {/* Payment Instruments */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
          <SectionHeader
            icon={<CreditCard className="h-4 w-4 text-indigo-600" />}
            title="Payment Instruments"
            subtitle="Total volume of transactions mapped to payment tools"
          />
          {paymentMethods.length === 0 ? (
            <EmptyChart message="No transactions recorded yet." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={paymentMethods} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradBar" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatShort}
                />
                <YAxis
                  dataKey="method"
                  type="category"
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip content={<LightTooltip formatter={formatINR} />} />
                <Bar
                  dataKey="volume"
                  name="Transaction Volume"
                  fill="url(#gradBar)"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={22}
                  animationBegin={0}
                  animationDuration={900}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Monthly surplus bar chart ── */}
      {areaData.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
          <SectionHeader
            icon={<Zap className="h-4 w-4 text-amber-500" />}
            title="Monthly Surplus Trend"
            subtitle="Net income surplus remaining after all expenditure per month"
          />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={areaData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradSurplusBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatShort} />
              <Tooltip content={<LightTooltip formatter={formatINR} />} />
              <Bar
                dataKey="Surplus"
                name="Monthly Surplus"
                fill="url(#gradSurplusBar)"
                radius={[6, 6, 0, 0]}
                maxBarSize={44}
                animationBegin={0}
                animationDuration={900}
              />
            </BarChart>
          </ResponsiveContainer>

          {/* Insight strip */}
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4">
            {[
              { label: 'Avg Monthly Income',  val: formatShort(Math.round(totalIncome / Math.max(trends.length, 1))),  icon: <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> },
              { label: 'Avg Monthly Expense', val: formatShort(Math.round(totalExpense / Math.max(trends.length, 1))), icon: <TrendingDown className="h-3.5 w-3.5 text-rose-500" /> },
              { label: 'Payment Methods',     val: `${paymentMethods.length}`,                                          icon: <Wallet className="h-3.5 w-3.5 text-violet-500" /> },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  {item.icon}
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                </div>
                <span className="text-base font-black text-slate-800 font-outfit">{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
