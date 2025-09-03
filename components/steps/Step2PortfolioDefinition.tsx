import React, { useState, useMemo, useCallback } from 'react';
import { Asset, Portfolio } from '../../types';
import WizardLayout from '../common/WizardLayout';

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

interface Step2PortfolioDefinitionProps {
  onNext: (portfolio: Portfolio) => void;
  onBack: () => void;
}

const Step2PortfolioDefinition: React.FC<Step2PortfolioDefinitionProps> = ({ onNext, onBack }) => {
  const [assets, setAssets] = useState<Asset[]>([
    { id: '1', ticker: 'VOO', name: 'Vanguard S&P 500 ETF', weight: 40 },
    { id: '2', ticker: 'VXUS', name: 'Vanguard Total International Stock ETF', weight: 20 },
    { id: '3', ticker: 'BND', name: 'Vanguard Total Bond Market ETF', weight: 20 },
    { id: '4', ticker: 'ARKK', name: 'ARK Innovation ETF', weight: 10 },
    { id: '5', ticker: 'GLD', name: 'SPDR Gold Shares', weight: 10 },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{ticker: string, name: string}[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [weight, setWeight] = useState<string>('');
  
  const totalWeight = useMemo(() => assets.reduce((sum, asset) => sum + asset.weight, 0), [assets]);
  const isNextDisabled = Math.round(totalWeight) !== 100 || assets.length === 0;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 0) {
      setSearchResults(
        stockData.filter(
          stock => stock.ticker.toLowerCase().includes(term.toLowerCase()) || stock.name.toLowerCase().includes(term.toLowerCase())
        )
      );
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectStock = (stock: {ticker: string, name: string}) => {
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
        alert("Please enter a valid weight before selecting an asset.");
        return;
    }
    if (totalWeight + weightNum > 100) {
      alert("Total weight cannot exceed 100%. Please adjust the weight.");
      return;
    }
    
    setAssets([...assets, { id: Date.now().toString(), ...stock, weight: weightNum }]);
    setSearchTerm('');
    setWeight('');
    setSearchResults([]);
    setIsSearchFocused(false);
  };
  
  const handleRemoveAsset = (id: string) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };
  
  const handleWeightChange = (id: string, newWeight: number) => {
    if (newWeight > 100) return;
    const currentAsset = assets.find(a => a.id === id);
    if (!currentAsset) return;

    const otherAssetsWeight = totalWeight - currentAsset.weight;
    if (otherAssetsWeight + newWeight > 100) {
        alert("Total weight cannot exceed 100%.");
        // cap the weight
        const cappedWeight = 100 - otherAssetsWeight;
        setAssets(assets.map(asset => asset.id === id ? { ...asset, weight: cappedWeight } : asset));
        return;
    }
    setAssets(assets.map(asset => asset.id === id ? { ...asset, weight: newWeight } : asset));
  }

  return (
    <WizardLayout
      title="Step 2: Define Your Portfolio"
      description="Search for assets and specify their weight. The total weight must equal 100%."
      onNext={() => onNext({ assets })}
      onBack={onBack}
      isNextDisabled={isNextDisabled}
    >
        {/* Main Content */}
        <div className="space-y-6">
            {/* Add Asset Form */}
            <div className="bg-cyber-navy/50 p-4 rounded-lg border border-slate-dark/50">
                <h3 className="text-lg font-semibold mb-3 text-slate-light">Add New Asset</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                    <div className="md:col-span-3 relative">
                        <label htmlFor="search" className="block text-sm font-medium text-slate-medium mb-1">Search Ticker or Name</label>
                        <input
                            type="text"
                            id="search"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                            placeholder="e.g., AAPL or Apple"
                            className="block w-full bg-slate-dark/50 border-2 border-slate-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-accent/80 focus:border-cyan-accent"
                        />
                        {isSearchFocused && searchResults.length > 0 && (
                            <ul className="absolute z-10 w-full bg-cyber-navy-light border border-slate-dark rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                                {searchResults.map(stock => (
                                <li
                                    key={stock.ticker}
                                    onMouseDown={() => handleSelectStock(stock)}
                                    className="px-4 py-2 cursor-pointer hover:bg-slate-dark/50 text-slate-light"
                                >
                                    <span className="font-bold">{stock.ticker}</span> - {stock.name}
                                </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="weight" className="block text-sm font-medium text-slate-medium mb-1">Weight (%)</label>
                        <input
                            type="number"
                            id="weight"
                            value={weight}
                            onChange={e => setWeight(e.target.value)}
                            placeholder="e.g., 25"
                            min="0.1"
                            step="0.1"
                            className="block w-full bg-slate-dark/50 border-2 border-slate-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-accent/80 focus:border-cyan-accent"
                        />
                    </div>
                </div>
                <p className="text-xs text-slate-medium mt-2">Enter a weight first, then search and select an asset to add it to your portfolio.</p>
            </div>
            
            {/* Asset List */}
            <div>
                <h3 className="text-xl font-semibold mb-4 text-slate-light">Current Portfolio</h3>
                <div className="bg-cyber-navy/50 rounded-lg max-h-96 overflow-y-auto border border-slate-dark/50">
                    {assets.length === 0 ? (
                    <p className="text-slate-medium text-center py-8">No assets added yet.</p>
                    ) : (
                    <div className="divide-y divide-slate-dark/50">
                        {assets.map(asset => (
                        <div key={asset.id} className="flex items-center justify-between p-3">
                            <div className="flex-1">
                                <p className="font-bold text-slate-light">{asset.ticker}</p>
                                <p className="text-xs text-slate-medium">{asset.name}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="number"
                                    value={asset.weight}
                                    onChange={(e) => handleWeightChange(asset.id, parseFloat(e.target.value) || 0)}
                                    className="w-20 text-right bg-slate-dark/50 border border-slate-dark rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-cyan-accent text-slate-light"
                                />
                                <span className="text-slate-medium">%</span>
                            </div>
                            <button onClick={() => handleRemoveAsset(asset.id)} className="ml-4 text-red-400 hover:text-red-500 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                        ))}
                    </div>
                    )}
                </div>
                <div className={`mt-4 text-lg font-bold text-right pr-2 transition-colors ${totalWeight.toFixed(1) === '100.0' ? 'text-cyan-accent' : 'text-yellow-400'}`}>
                    Total Weight: {totalWeight.toFixed(1)}%
                </div>
                {isNextDisabled && assets.length > 0 && <p className="text-red-400 text-sm text-right mt-1 pr-2">Total weight must be exactly 100% to continue.</p>}
            </div>
        </div>
    </WizardLayout>
  );
};

export default Step2PortfolioDefinition;