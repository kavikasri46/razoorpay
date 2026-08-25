import React, { useEffect, useState } from 'react';
import { aiApi, AISpendingReport } from '../services/aiApi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ErrorState from '../components/ui/ErrorState';
import Badge from '../components/ui/Badge';
import { toast } from '../components/ui/Toast';
import { Sparkles, ShieldAlert, Coins, CheckCircle, RefreshCw } from 'lucide-react';

export const AIInsights: React.FC = () => {
  const [report, setReport] = useState<AISpendingReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await aiApi.analyzeSpending();
      if (res.success && res.data.analysis) {
        setReport(res.data.analysis);
      }
    } catch (err) {
      console.error('Failed to run AI spending analysis:', err);
      setError(true);
      toast.error('AI Spending Auditor request failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={3} />
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={fetchAnalysis} message="Failed to trigger AISpendingAuditor. Ensure GROQ_API_KEY is configured." />;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">AI Spending Auditor</h2>
          <p className="text-xs text-slate-450 mt-1">Intelligent scanning of monthly expenditures to extract risk and opportunity models.</p>
        </div>
        <Button 
          onClick={fetchAnalysis} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2 self-start sm:self-center"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Re-Analyze Profile
        </Button>
      </div>

      {/* Main Score Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 flex flex-col items-center justify-center text-center p-8 bg-slate-900 border-slate-850">
          <div className="relative flex items-center justify-center mb-4">
            {/* Outer Circular border representation */}
            <div className="h-28 w-28 rounded-full border-4 border-slate-950 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin duration-[3s]" />
              <span className="text-3xl font-extrabold text-white">{report?.score}<span className="text-xs text-slate-500 font-normal">/100</span></span>
            </div>
          </div>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase mb-1">Financial Fitness Score</h3>
          <Badge variant={
            report?.rating === 'Excellent' || report?.rating === 'Good' ? 'success' :
            report?.rating === 'Fair' ? 'warning' : 'danger'
          }>
            {report?.rating} Rating
          </Badge>
        </Card>

        <Card className="md:col-span-2 bg-slate-900 border-slate-850 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Auditor Summary</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed text-left">
            {report?.explanation}
          </p>
        </Card>
      </div>

      {/* Insights Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        {/* Identified Risks */}
        <Card className="bg-slate-900 border-slate-850 p-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800/30">
            <ShieldAlert className="h-4.5 w-4.5 text-red-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Identified Risk Areas</h4>
          </div>
          <ul className="space-y-3">
            {report?.risks.map((risk, idx) => (
              <li key={idx} className="flex gap-2.5 items-start">
                <span className="h-1.5 w-1.5 bg-red-400 rounded-full shrink-0 mt-1.5" />
                <span className="text-xs text-slate-400 leading-relaxed">{risk}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Savings Opportunities */}
        <Card className="bg-slate-900 border-slate-850 p-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800/30">
            <Coins className="h-4.5 w-4.5 text-amber-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Savings Opportunities</h4>
          </div>
          <ul className="space-y-3">
            {report?.opportunities.map((opp, idx) => (
              <li key={idx} className="flex gap-2.5 items-start">
                <span className="h-1.5 w-1.5 bg-amber-400 rounded-full shrink-0 mt-1.5" />
                <span className="text-xs text-slate-400 leading-relaxed">{opp}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Direct Action Recommendations */}
        <Card className="bg-slate-900 border-slate-850 p-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800/30">
            <CheckCircle className="h-4.5 w-4.5 text-cyan-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Auditor Recommendations</h4>
          </div>
          <ul className="space-y-3">
            {report?.recommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-2.5 items-start">
                <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full shrink-0 mt-1.5" />
                <span className="text-xs text-slate-400 leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};
export default AIInsights;
