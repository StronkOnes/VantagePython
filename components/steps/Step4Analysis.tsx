import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { SimulationResult } from '../../types';
import WizardLayout from '../common/WizardLayout';

interface Step4AnalysisProps {
  result: SimulationResult | null;
  isLoading: boolean;
  error: string | null;
  onNext: () => void;
  onBack: () => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const MetricCard: React.FC<{ label: string; value: string | number; color?: string; tooltip?: string }> = ({ label, value, color = 'text-slate-light', tooltip }) => (
  <div className="bg-cyber-navy-light/50 p-4 rounded-lg text-center border border-slate-dark/50" title={tooltip}>
    <p className="text-sm text-slate-medium">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

const Step4Analysis: React.FC<Step4AnalysisProps> = ({ result, isLoading, error, onNext, onBack }) => {

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <svg className="animate-spin h-12 w-12 text-cyan-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h3 className="text-xl font-semibold mt-6 text-slate-light">Running Simulation...</h3>
          <p className="text-slate-medium mt-2">The AI is processing thousands of potential market scenarios. This may take a moment.</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h3 className="text-xl font-semibold mt-6 text-red-400">Simulation Failed</h3>
            <p className="text-slate-medium mt-2 max-w-md">{error}</p>
        </div>
      );
    }
    if (result) {
      return (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard label="Risk Score" value={result.riskScore.toFixed(1)} color={result.riskScore > 70 ? 'text-red-400' : result.riskScore > 40 ? 'text-yellow-400' : 'text-cyan-accent'} tooltip="A score from 0 (low risk) to 100 (high risk)" />
            <MetricCard label="Median Outcome" value={formatCurrency(result.medianOutcome)} color="text-cyan-accent" tooltip="The 50th percentile projected portfolio value." />
            <MetricCard label="Sharpe Ratio" value={result.sharpeRatio.toFixed(2)} tooltip="Risk-adjusted return. Higher is better." />
            <MetricCard label="Max Drawdown" value={`${result.maxDrawdown.toFixed(1)}%`} color="text-yellow-400" tooltip="Estimated largest potential peak-to-trough decline." />
            <MetricCard label="CVaR (95%)" value={`${result.cvar.toFixed(1)}%`} color="text-yellow-400" tooltip="Expected loss if the worst 5% of scenarios occur." />
            <MetricCard label="Prob. of Loss (1yr)" value={`${result.probNegativeReturn.toFixed(1)}%`} color="text-yellow-400" tooltip="Probability of a negative return in any single year." />
          </div>

          <div className="bg-cyber-navy/50 p-4 rounded-lg border border-slate-dark/50">
            <h4 className="text-lg font-semibold mb-2 text-slate-light">AI Analysis Summary</h4>
            <p className="text-slate-medium">{result.analysisSummary}</p>
          </div>

          <div className="h-80 w-full">
             <h4 className="text-lg font-semibold mb-4 text-center text-slate-light">Distribution of Potential Outcomes</h4>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={result.scenarioDistribution} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64FFDA" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#64FFDA" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(73, 86, 112, 0.3)" />
                <XAxis dataKey="percentile" unit="th" tick={{ fill: '#8892B0', fontSize: 12 }} />
                <YAxis tickFormatter={(value) => formatCurrency(value as number)} tick={{ fill: '#8892B0', fontSize: 12 }} domain={['dataMin', 'dataMax']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A192F', border: '1px solid #495670', color: '#CCD6F6' }} 
                  labelClassName="font-bold text-slate-light"
                  itemStyle={{ color: '#64FFDA' }}
                  labelFormatter={(label) => `${label}th Percentile`}
                  formatter={(value) => [formatCurrency(value as number), 'Portfolio Value']}
                />
                <Area type="monotone" dataKey="value" stroke="#64FFDA" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <WizardLayout
      title="Step 4: Risk Analysis & Ranking"
      description="Here are the results of the simulation. Analyze the potential outcomes and key risk metrics."
      onNext={onNext}
      onBack={onBack}
      isNextDisabled={!result || isLoading}
      nextLabel="View Full Report"
    >
      {renderContent()}
    </WizardLayout>
  );
};

export default Step4Analysis;