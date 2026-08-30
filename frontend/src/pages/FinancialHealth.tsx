import React, { useEffect, useState } from 'react';
import { aiApi } from '../services/aiApi';
import { analyticsApi } from '../services/analyticsApi';
import Card from '../components/ui/Card';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ErrorState from '../components/ui/ErrorState';
import Badge from '../components/ui/Badge';
import { HeartPulse, Check, AlertCircle, ShieldAlert } from 'lucide-react';

export const FinancialHealth: React.FC = () => {
  const [score, setScore] = useState<number | null>(null);
  const [rating, setRating] = useState('');
  const [explanation, setExplanation] = useState('');
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
    } catch (err) {
      console.error('Failed to fetch health metrics:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthMetrics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="stats" count={2} />
        <LoadingSkeleton type="card" count={2} />
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={fetchHealthMetrics} />;
  }

  // Calculate specific ratios for rendering
  const savingsRatio = overview?.totalIncome > 0 ? (overview.monthlySavings / overview.totalIncome) * 100 : 0;
  const budgetAdherence = overview?.budgets?.total > 0 
    ? ((overview.budgets.healthy + overview.budgets.warning) / overview.budgets.total) * 100 
    : 100;
  const anomalyBurden = overview?.flaggedTransactionsCount || 0;

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Financial Health Dashboard</h2>
        <p className="text-xs text-slate-450 mt-1">Audit score computed using cash surplus ratios, budget safety margins, and transaction risk markers.</p>
      </div>

      {/* Main Score Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center justify-center text-center p-8 bg-slate-900 border-slate-850">
          <div className="h-32 w-32 rounded-full border-4 border-slate-950 flex items-center justify-center relative mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin duration-[4s]" />
            <span className="text-4xl font-extrabold text-white">{score}<span className="text-xs text-slate-500 font-normal">/100</span></span>
          </div>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase mb-1">RazorPay Health Score</h3>
          <Badge variant={
            rating === 'Excellent' || rating === 'Good' ? 'success' :
            rating === 'Fair' ? 'warning' : 'danger'
          }>
            {rating} Rating
          </Badge>
        </Card>

        {/* Explanation Card */}
        <Card className="md:col-span-2 bg-slate-900 border-slate-850 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
            <HeartPulse className="h-4.5 w-4.5 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Medical Chart</h3>
          </div>
          <p className="text-sm text-slate-350 leading-relaxed">
            {explanation}
          </p>
        </Card>
      </div>

      {/* Audit Factor Ratios */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Evaluation Factors</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Savings Ratio Factor */}
          <Card className="bg-slate-900 border-slate-850 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Savings Ratio</span>
              <span className="text-sm font-bold text-white">{Math.round(savingsRatio)}%</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
              <div 
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${Math.max(0, Math.min(100, savingsRatio))}%` }}
              />
            </div>
            <div className="flex gap-2 text-[10px] text-slate-500 leading-normal">
              {savingsRatio >= 20 ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Excellent. Your savings rate is above the recommended 20% limit.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Deficit. Try saving at least 20% of monthly income to build capital reserves.</span>
                </>
              )}
            </div>
          </Card>

          {/* Budget Adherence Factor */}
          <Card className="bg-slate-900 border-slate-850 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Budget Adherence</span>
              <span className="text-sm font-bold text-white">{Math.round(budgetAdherence)}%</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
              <div 
                className="bg-cyan-500 h-full rounded-full"
                style={{ width: `${budgetAdherence}%` }}
              />
            </div>
            <div className="flex gap-2 text-[10px] text-slate-500 leading-normal">
              {budgetAdherence >= 80 ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Good compliance. Most transactions fit within preset monthly caps.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                  <span>High overflow. You have exceeded limit caps on major categories.</span>
                </>
              )}
            </div>
          </Card>

          {/* Anomaly Factor */}
          <Card className="bg-slate-900 border-slate-850 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Risk Flag Count</span>
              <span className={`text-sm font-bold ${anomalyBurden > 0 ? 'text-red-400' : 'text-white'}`}>{anomalyBurden}</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
              <div 
                className={`h-full rounded-full ${anomalyBurden > 0 ? 'bg-red-500' : 'bg-slate-800'}`}
                style={{ width: `${anomalyBurden > 0 ? 100 : 0}%` }}
              />
            </div>
            <div className="flex gap-2 text-[10px] text-slate-500 leading-normal">
              {anomalyBurden === 0 ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Secure. No suspicious velocities or outsized charges flagged on account.</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                  <span>Flagged entries detected. Verify transaction logs immediately for security.</span>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default FinancialHealth;
