import React, { useState } from 'react';
import WizardLayout from '../common/WizardLayout';
import { SimulationParams, SimulationType, SimulationMethod, Portfolio } from '../../types';

// Mock stock data for the selector
const stockData = [
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corporation' },
  { ticker: 'GOOGL', name: 'Alphabet Inc. (Class A)' },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation' },
  { ticker: 'TSLA', name: 'Tesla, Inc.' },
  { ticker: 'VOO', name: 'Vanguard S&P 500 ETF' },
  { ticker: 'VXUS', name: 'Vanguard Total International Stock ETF' },
  { ticker: 'BND', name: 'Vanguard Total Bond Market ETF' },
  { ticker: 'ARKK', name: 'ARK Innovation ETF' },
  { ticker: 'GLD', name: 'SPDR Gold Shares' },
  { ticker: 'BTC-USD', name: 'Bitcoin USD' },
];

interface Step2SingleAssetParamsProps {
  onNext: (params: Omit<SimulationParams, 'mode'>, portfolio: Portfolio) => void;
  onBack: () => void;
}

const InputField: React.FC<{ label: string; name: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; step?: string; }> = 
({ label, name, value, onChange, step = "1" }) => (
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
    </div>
);


const Step2SingleAssetParams: React.FC<Step2SingleAssetParamsProps> = ({ onNext, onBack }) => {
  const [selectedAsset, setSelectedAsset] = useState<{ ticker: string, name: string } | null>({ ticker: 'VOO', name: 'Vanguard S&P 500 ETF' });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{ticker: string, name: string}[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [simulationType, setSimulationType] = useState<SimulationType>(SimulationType.LUMP_SUM);
  const [globalParams, setGlobalParams] = useState({
    monteCarloSimulations: 10000,
    timeHorizon: 10,
    initialInvestment: 10000,
    monthlyContribution: 250,
  });
  const [assetParams, setAssetParams] = useState({
    expectedReturn: 8.5,
    volatility: 15,
  });

  const isNextDisabled = !selectedAsset;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 0) {
      setSearchResults(stockData.filter(stock => stock.ticker.toLowerCase().includes(term.toLowerCase()) || stock.name.toLowerCase().includes(term.toLowerCase())));
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectStock = (stock: {ticker: string, name: string}) => {
    setSelectedAsset(stock);
    setSearchTerm('');
    setSearchResults([]);
    setIsSearchFocused(false);
  };

  const handleGlobalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGlobalParams(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
  };

  const handleAssetParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAssetParams(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };
  
  const handleSubmit = () => {
    if (!selectedAsset) return;

    const singleAssetPortfolio: Portfolio = {
      assets: [{ ...selectedAsset, id: '1', quantity: 100 }]
    };

    const finalParams: Omit<SimulationParams, 'mode'> = {
      ...globalParams,
      type: simulationType,
      method: SimulationMethod.MONTE_CARLO, // Only method for single asset
      monthlyContribution: simulationType === SimulationType.SIP ? globalParams.monthlyContribution : 0,
      expectedReturn: assetParams.expectedReturn,
      volatility: assetParams.volatility,
    };
    onNext(finalParams, singleAssetPortfolio);
  };

  return (
    <WizardLayout
      title="Step 2: Setup Single Asset Forecast"
      description="Select an asset and define your investment strategy and market assumptions."
      onNext={handleSubmit}
      onBack={onBack}
      isNextDisabled={isNextDisabled}
      nextLabel="Run Forecast"
    >
        <div className="space-y-8">
            {/* Asset Selection */}
            <div>
                 <h3 className="text-lg font-semibold text-slate-light mb-3">Select Asset</h3>
                 <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                        placeholder="Search ticker or name (e.g., AAPL)"
                        className="block w-full bg-slate-dark/50 border-2 border-slate-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-accent/80 focus:border-cyan-accent"
                    />
                    {isSearchFocused && searchResults.length > 0 && (
                        <ul className="absolute z-10 w-full bg-cyber-navy-light border border-slate-dark rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                            {searchResults.map(stock => (
                            <li key={stock.ticker} onMouseDown={() => handleSelectStock(stock)} className="px-4 py-2 cursor-pointer hover:bg-slate-dark/50 text-slate-light">
                                <span className="font-bold">{stock.ticker}</span> - {stock.name}
                            </li>
                            ))}
                        </ul>
                    )}
                </div>
                {selectedAsset && (
                    <div className="mt-4 bg-cyber-navy/50 p-4 rounded-lg border border-slate-dark/50 flex items-center justify-between">
                        <div>
                            <p className="text-lg font-bold text-cyan-accent">{selectedAsset.ticker}</p>
                            <p className="text-sm text-slate-medium">{selectedAsset.name}</p>
                        </div>
                        <button onClick={() => setSelectedAsset(null)} className="text-xs text-red-400 hover:text-red-500 transition-colors">
                            Clear
                        </button>
                    </div>
                )}
            </div>

            {/* Investment Strategy */}
            <div>
                <label className="block text-lg font-semibold text-slate-light mb-3">Investment Strategy</label>
                <div className="flex gap-4 rounded-lg bg-cyber-navy/50 p-1 border border-slate-dark/50">
                    {Object.values(SimulationType).map(type => (
                        <button key={type} onClick={() => setSimulationType(type)} className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyber-navy-light focus:ring-cyan-accent/80 ${simulationType === type ? 'bg-cyan-accent text-cyber-navy' : 'text-slate-medium hover:bg-slate-dark/50'}`}>
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

            {/* Asset-specific assumptions */}
            <div className="p-4 border border-cyan-accent/20 rounded-lg space-y-4 bg-cyber-navy/30">
                <h4 className="font-semibold text-cyan-accent">Asset Assumptions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InputField label="Annual Expected Return (%)" name="expectedReturn" value={assetParams.expectedReturn} onChange={handleAssetParamChange} step="0.1" />
                    <InputField label="Annual Volatility (Std. Dev, %)" name="volatility" value={assetParams.volatility} onChange={handleAssetParamChange} step="0.1" />
                </div>
            </div>
        </div>
    </WizardLayout>
  );
};

export default Step2SingleAssetParams;
