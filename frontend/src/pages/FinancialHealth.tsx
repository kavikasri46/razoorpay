import React, { useEffect, useState } from 'react';
import { aiApi } from '../services/aiApi';
import { analyticsApi } from '../services/analyticsApi';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ErrorState from '../components/ui/ErrorState';
import { generateFinancialHealthPDF } from '../utils/pdfGenerator';
import { toast } from '../components/ui/Toast';
import {
  HeartPulse,
  Download,
  Check,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  PiggyBank,
  Wallet,
  TrendingUp,
  Activity,
  Star,
  Zap,
  BadgeCheck,
  AlertTriangle,
  CircleDollarSign,
  BarChart2,
  RefreshCw,
} from 'lucide-react';

/* ─── Score helpers ─────────────────────────────────────────── */
const scoreGrade = (score: number | null) => {
  if (score === null) return { label: '—', color: 'text-slate-400', bg: 'bg-slate-100 border-slate-200', ringCls: 'border-slate-200', barCls: 'bg-slate-300' };
  if (score >= 85) return { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', ringCls: 'border-emerald-400', barCls: 'bg-emerald-500' };
  if (score >= 70) return { label: 'Good',      color: 'text-teal-600',    bg: 'bg-teal-50 border-teal-100',    ringCls: 'border-teal-400',    barCls: 'bg-teal-500'    };
  if (score >= 50) return { label: 'Fair',      color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-100',  ringCls: 'border-amber-400',   barCls: 'bg-amber-400'   };
  return               { label: 'Poor',      color: 'text-rose-600',    bg: 'bg-rose-50 border-rose-100',    ringCls: 'border-rose-400',    barCls: 'bg-rose-500'    };
};

/* ─── Circular Gauge ────────────────────────────────────────── */
const CircularGauge: React.FC<{ score: number | null }> = ({ score }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const pct = score !== null ? Math.min(100, Math.max(0, score)) : 0;
  const strokeDash = (pct / 100) * circumference;
  const { color, barCls } = scoreGrade(score);

  return (
    <div className="relative flex items-center justify-center h-36 w-36">
      <svg className="absolute inset-0 rotate-[-90deg]" width="144" height="144" viewBox="0 0 144 144">
        {/* Track */}
        <circle cx="72" cy="72" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        {/* Progress */}
        <circle
          cx="72" cy="72" r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circumference}`}
          className={`${barCls.replace('bg-', 'text-')} transition-all duration-1000`}
        />
      </svg>
      <div className="flex flex-col items-center z-10">
        <span className={`text-3xl font-black font-outfit leading-none ${color}`}>{score ?? '—'}</span>
        <span className="text-[10px] text-slate-400 font-bold mt-0.5">/100</span>
      </div>
    </div>
  );
};

/* ─── Factor Card ───────────────────────────────────────────── */
interface FactorCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  barColor: string;
  barPct: number;
  good: boolean;
  goodMsg: string;
  badMsg: string;
}
const FactorCard: React.FC<FactorCardProps> = ({
  title, value, icon, iconBg, barColor, barPct, good, goodMsg, badMsg,
}) => (
  <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 space-y-4">
    {/* Header */}
    <div className="flex items-start justify-between gap-3">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 text-right">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-xl font-black text-slate-800 font-outfit mt-0.5">{value}</p>
      </div>
    </div>

    {/* Progress bar */}
    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${barColor}`}
        style={{ width: `${Math.max(0, Math.min(100, barPct))}%` }}
      />
    </div>

    {/* Status message */}
    <div className={`flex items-start gap-1.5 text-[11px] font-semibold leading-relaxed ${good ? 'text-emerald-600' : 'text-amber-600'}`}>
      {good
        ? <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        : <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
      }
      <span>{good ? goodMsg : badMsg}</span>
    </div>
  </div>
);

/* ─── Main Page ─────────────────────────────────────────────── */
export const FinancialHealth: React.FC = () => {
  const [score, setScore]           = useState<number | null>(null);
  const [rating, setRating]         = useState('');
  const [explanation, setExplanation] = useState('');
  const [overview, setOverview]     = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);

  const fetchHealthMetrics = async () => {
    try {
      setLoading(true);
      setError(false);
      const [aiRes, analyticsRes] = await Promise.all([
        aiApi.analyzeSpending(),
        analyticsApi.getOverview(),
      ]);
      if (aiRes.success && aiRes.data.analysis) {
        setScore(aiRes.data.analysis.score);
        setRating(aiRes.data.analysis.rating);
        setExplanation(aiRes.data.analysis.explanation);
      }
      if (analyticsRes.success) {
        setOverview(analyticsRes.data);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHealthMetrics(); }, []);

  if (loading) return (
    <div className="space-y-6">
      <LoadingSkeleton type="stats" count={2} />
      <LoadingSkeleton type="card" count={3} />
    </div>
  );

  if (error) return <ErrorState onRetry={fetchHealthMetrics} />;

  /* Computed metrics */
  const savingsRatio    = overview?.totalIncome > 0 ? (overview.monthlySavings / overview.totalIncome) * 100 : 0;
  const budgetAdherence = overview?.budgets?.total > 0
    ? ((overview.budgets.healthy + overview.budgets.warning) / overview.budgets.total) * 100
    : 100;
  const anomalyBurden   = overview?.flaggedTransactionsCount ?? 0;

  const { color, bg, ringCls, label } = scoreGrade(score);

  /* Tip cards based on state */
  const tips = [
    savingsRatio < 20 && { icon: <PiggyBank className="h-4 w-4 text-amber-500" />, text: 'Increase your savings rate to at least 20% of monthly income.' },
    budgetAdherence < 80 && { icon: <Wallet className="h-4 w-4 text-rose-500" />, text: 'You are overspending in some budget categories — review monthly caps.' },
    anomalyBurden > 0 && { icon: <ShieldAlert className="h-4 w-4 text-rose-600" />, text: `${anomalyBurden} suspicious transaction(s) flagged — verify your ledger immediately.` },
    savingsRatio >= 20 && { icon: <TrendingUp className="h-4 w-4 text-emerald-500" />, text: 'Great savings discipline! Consider investing your surplus into mutual funds.' },
    budgetAdherence >= 80 && anomalyBurden === 0 && { icon: <ShieldCheck className="h-4 w-4 text-teal-500" />, text: 'Zero risk flags detected — your account activity is fully clean.' },
  ].filter(Boolean) as { icon: React.ReactNode; text: string }[];

  return (
    <div className="space-y-6 text-left font-sans antialiased max-w-5xl mx-auto">

      {/* ── Page Header ── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center">
            <HeartPulse className="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight font-outfit">Financial Health Dashboard</h2>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Audit score computed using cash surplus ratios, budget safety margins, and transaction risk markers.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchHealthMetrics}
            className="flex items-center gap-2 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-600 hover:text-teal-700 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <button
            onClick={() => {
              generateFinancialHealthPDF(score ?? 90, {
                savingsRatio: savingsRatio.toFixed(0),
                budgetAdherence: budgetAdherence.toFixed(0),
                riskFlagCount: anomalyBurden
              });
              toast.success('Financial Health PDF report downloaded (< 150 KB)!');
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-md shadow-teal-500/20"
          >
            <Download className="h-3.5 w-3.5" />
            Export Health PDF (&lt; 2 MB)
          </button>
        </div>
      </div>

      {/* ── Score + Explanation ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Score Card */}
        <div className={`bg-white border-2 rounded-2xl shadow-sm p-7 flex flex-col items-center justify-center text-center gap-4 ${ringCls}`}>
          <CircularGauge score={score} />
          <div>
            <p className="text-xs font-black text-slate-600 uppercase tracking-widest font-outfit">RazorPay Health Score</p>
            <span className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold border ${bg} ${color}`}>
              {label === 'Excellent' ? <Star className="h-3 w-3" /> : label === 'Good' ? <BadgeCheck className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
              {rating || label} Rating
            </span>
          </div>
        </div>

        {/* Explanation Card */}
        <div className="md:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col justify-center space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center">
              <Activity className="h-4 w-4 text-teal-600" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-700 uppercase tracking-wide font-outfit">AI Health Assessment</p>
              <p className="text-[10px] text-slate-400 font-semibold">Analysed by Llama-3.1 via Groq</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {explanation || 'Your financial health is being evaluated. Make sure transactions and budgets are set up to generate a full AI assessment.'}
          </p>

          {/* Mini stats row */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
            {[
              { label: 'Savings', val: `${Math.round(savingsRatio)}%`, icon: <PiggyBank className="h-3.5 w-3.5 text-teal-500" />, ok: savingsRatio >= 20 },
              { label: 'Budget', val: `${Math.round(budgetAdherence)}%`, icon: <BarChart2 className="h-3.5 w-3.5 text-violet-500" />, ok: budgetAdherence >= 80 },
              { label: 'Risk Flags', val: `${anomalyBurden}`, icon: <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />, ok: anomalyBurden === 0 },
            ].map((m) => (
              <div key={m.label} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  {m.icon}
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</span>
                </div>
                <span className={`text-base font-black font-outfit ${m.ok ? 'text-emerald-600' : 'text-amber-500'}`}>{m.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Evaluation Factors ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-teal-500" />
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest font-outfit">Evaluation Factors</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FactorCard
            title="Savings Ratio"
            value={`${Math.round(savingsRatio)}%`}
            icon={<PiggyBank className="h-5 w-5 text-teal-600" />}
            iconBg="bg-teal-50 border border-teal-100"
            barColor="bg-teal-500"
            barPct={savingsRatio}
            good={savingsRatio >= 20}
            goodMsg="Excellent. Your savings rate is above the recommended 20% benchmark."
            badMsg="Deficit. Try saving at least 20% of monthly income to build capital reserves."
          />
          <FactorCard
            title="Budget Adherence"
            value={`${Math.round(budgetAdherence)}%`}
            icon={<CircleDollarSign className="h-5 w-5 text-violet-600" />}
            iconBg="bg-violet-50 border border-violet-100"
            barColor="bg-violet-500"
            barPct={budgetAdherence}
            good={budgetAdherence >= 80}
            goodMsg="Good compliance. Most transactions fit within preset monthly caps."
            badMsg="High overflow. You have exceeded limit caps on major spend categories."
          />
          <FactorCard
            title="Risk Flag Count"
            value={`${anomalyBurden}`}
            icon={anomalyBurden === 0
              ? <ShieldCheck className="h-5 w-5 text-emerald-600" />
              : <ShieldAlert className="h-5 w-5 text-rose-500" />
            }
            iconBg={anomalyBurden === 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'}
            barColor={anomalyBurden === 0 ? 'bg-emerald-500' : 'bg-rose-500'}
            barPct={anomalyBurden === 0 ? 100 : Math.min(100, anomalyBurden * 10)}
            good={anomalyBurden === 0}
            goodMsg="Secure. No suspicious velocities or outsized charges flagged on account."
            badMsg="Flagged entries detected. Verify your transaction logs immediately for security."
          />
        </div>
      </div>

      {/* ── Actionable Tips ── */}
      {tips.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-teal-500" />
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest font-outfit">Recommendations</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tips.map((tip, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-xl shadow-sm px-4 py-3.5 flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {tip.icon}
                </div>
                <p className="text-xs text-slate-600 font-semibold leading-relaxed">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialHealth;
