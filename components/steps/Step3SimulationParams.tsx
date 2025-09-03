import React, { useState, useEffect } from 'react';
import { Portfolio, SimulationParams, SimulationType, SimulationMethod, AssetWithParams } from '../../types';
import WizardLayout from '../common/WizardLayout';

interface Step3SimulationParamsProps {
  portfolio: Portfolio;
  onNext: (params: Omit<SimulationParams, 'mode'>) => void;
  onBack: () => void;
}

const InputField: React.FC<{ label: string; name: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; step?: string; helpText?: string; }> = 
({ label, name, value, onChange, step = "1", helpText }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-medium">{label}</label>
        <input
            type="number"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            step={step}
            className="mt-1 block w-full bg-slate-dark/50 border-2 border-slate-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-accent/80 focus:border-cyan-accent"
        />
        {helpText && <p className="mt-2 text-xs text-slate-medium">{helpText}</p>}
    </div>
);

const Step3SimulationParams: React.FC<Step3SimulationParamsProps> = ({ portfolio, onNext, onBack }) => {
  const [method, setMethod] = useState<SimulationMethod>(SimulationMethod.MONTE_CARLO);
  const [simulationType, setSimulationType] = useState<SimulationType>(SimulationType.LUMP_SUM);
  
  const [globalParams, setGlobalParams] = useState({
    monteCarloSimulations: 10000,
    timeHorizon: 10,
    initialInvestment: 100000,
    monthlyContribution: 500,
  });

  const [monteCarloParams, setMonteCarloParams] = useState({
    expectedReturn: 8.5,
    volatility: 15,
  });
  
  const [sipmathAssetParams, setSipmathAssetParams] = useState<AssetWithParams[]>([]);

  useEffect(() => {
    // Initialize asset params when portfolio changes
    setSipmathAssetParams(portfolio.assets.map(asset => ({
      ...asset,
      expectedReturn: 8.5, // Default value
      volatility: 15,    // Default value
    })));
  }, [portfolio]);

  const handleGlobalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGlobalParams(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
  };
  
  const handleMonteCarloChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMonteCarloParams(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSipmathAssetChange = (id: string, field: 'expectedReturn' | 'volatility', value: number) => {
    setSipmathAssetParams(prev => prev.map(asset => 
        asset.id === id ? { ...asset, [field]: value } : asset
    ));
  };

  const handleSubmit = () => {
    const finalParams: Omit<SimulationParams, 'mode'> = {
      ...globalParams,
      method,
      type: simulationType,
      monthlyContribution: simulationType === SimulationType.SIP ? globalParams.monthlyContribution : 0,
      expectedReturn: monteCarloParams.expectedReturn,
      volatility: monteCarloParams.volatility,
      assetsWithParams: method === SimulationMethod.SIPMATH ? sipmathAssetParams : undefined,
    };
    onNext(finalParams);
  };

  return (
    <WizardLayout
      title="Step 3: Simulation Parameters"
      description="Define your investment strategy and market assumptions for the portfolio."
      onNext={handleSubmit}
      onBack={onBack}
      nextLabel="Run Simulation"
    >
      <div className="space-y-8">
        {/* Method Selector */}
        <div>
            <label className="block text-lg font-semibold text-slate-light mb-3">Simulation Method</label>
            <div className="flex gap-4 rounded-lg bg-cyber-navy/50 p-1 border border-slate-dark/50">
                {Object.values(SimulationMethod).map(m => (
                    <button
                        key={m}
                        onClick={() => setMethod(m)}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyber-navy-light focus:ring-cyan-accent/80
                            ${method === m ? 'bg-cyan-accent text-cyber-navy' : 'text-slate-medium hover:bg-slate-dark/50'}
                        `}
                    >
                        {m}
                    </button>
                ))}
            </div>
            <p className="text-xs text-slate-medium mt-2">
            {method === SimulationMethod.MONTE_CARLO 
                ? "Uses blended, top-down assumptions for the whole portfolio. Good for quick analysis." 
                : "Models each asset individually for a more granular, bottom-up forecast. Recommended for accuracy."}
            </p>
        </div>
        
        {/* Investment Strategy Selector */}
        <div>
            <label className="block text-lg font-semibold text-slate-light mb-3">Investment Strategy</label>
            <div className="flex gap-4 rounded-lg bg-cyber-navy/50 p-1 border border-slate-dark/50">
                {Object.values(SimulationType).map(type => (
                    <button
                        key={type}
                        onClick={() => setSimulationType(type)}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyber-navy-light focus:ring-cyan-accent/80
                            ${simulationType === type ? 'bg-cyan-accent text-cyber-navy' : 'text-slate-medium hover:bg-slate-dark/50'}
                        `}
                    >
                        {type}
                    </button>
                ))}
            </div>
        </div>
        
        {/* Global & Investment Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InputField label="Initial Investment ($)" name="initialInvestment" value={globalParams.initialInvestment} onChange={handleGlobalChange} />
            {simulationType === SimulationType.SIP && (
                <InputField label="Monthly Contribution ($)" name="monthlyContribution" value={globalParams.monthlyContribution} onChange={handleGlobalChange} />
            )}
            <InputField label="Time Horizon (Years)" name="timeHorizon" value={globalParams.timeHorizon} onChange={handleGlobalChange} />
            <InputField label="Number of Simulations" name="monteCarloSimulations" value={globalParams.monteCarloSimulations} onChange={handleGlobalChange} />
        </div>

        {/* Conditional Parameter Forms */}
        {method === SimulationMethod.MONTE_CARLO && (
            <div className="p-4 border border-cyan-accent/20 rounded-lg space-y-4 bg-cyber-navy/30">
                <h4 className="font-semibold text-cyan-accent">Blended Portfolio Assumptions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InputField label="Annual Expected Return (%)" name="expectedReturn" value={monteCarloParams.expectedReturn} onChange={handleMonteCarloChange} step="0.1" />
                    <InputField label="Annual Volatility (Std. Dev, %)" name="volatility" value={monteCarloParams.volatility} onChange={handleMonteCarloChange} step="0.1" />
                </div>
            </div>
        )}
        {method === SimulationMethod.SIPMATH && (
            <div className="p-4 border border-cyan-accent/20 rounded-lg space-y-4 bg-cyber-navy/30">
                <h4 className="font-semibold text-cyan-accent">Individual Asset Assumptions</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {sipmathAssetParams.map(asset => (
                        <div key={asset.id} className="grid grid-cols-3 gap-3 items-center bg-slate-dark/30 p-2 rounded">
                            <div className="col-span-1">
                                <p className="font-bold text-slate-light text-sm truncate" title={asset.name}>{asset.ticker} ({asset.weight}%)</p>
                            </div>
                            <input type="number" value={asset.expectedReturn} onChange={e => handleSipmathAssetChange(asset.id, 'expectedReturn', parseFloat(e.target.value) || 0)} placeholder="Return %" className="w-full text-sm bg-slate-dark/50 border border-slate-dark rounded py-1 px-2 focus:outline-none focus:ring-1 focus:ring-cyan-accent text-slate-light" />
                            <input type="number" value={asset.volatility} onChange={e => handleSipmathAssetChange(asset.id, 'volatility', parseFloat(e.target.value) || 0)} placeholder="Volatility %" className="w-full text-sm bg-slate-dark/50 border border-slate-dark rounded py-1 px-2 focus:outline-none focus:ring-1 focus:ring-cyan-accent text-slate-light" />
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </WizardLayout>
  );
};

export default Step3SimulationParams;