import React, { useState, useMemo } from 'react';
import WizardLayout from '../common/WizardLayout';

// Mock stock data for the selector (shared with portfolio definition)
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

interface Step2SingleAssetDefinitionProps {
  onNext: (asset: { ticker: string, name: string }) => void;
  onBack: () => void;
}

const Step2SingleAssetDefinition: React.FC<Step2SingleAssetDefinitionProps> = ({ onNext, onBack }) => {
  const [selectedAsset, setSelectedAsset] = useState<{ ticker: string, name: string } | null>({ ticker: 'VOO', name: 'Vanguard S&P 500 ETF' });

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{ticker: string, name: string}[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const isNextDisabled = !selectedAsset;

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
    setSelectedAsset(stock);
    setSearchTerm('');
    setSearchResults([]);
    setIsSearchFocused(false);
  };

  return (
    <WizardLayout
      title="Step 2: Select Your Asset"
      description="Search for and select the single asset you want to forecast."
      onNext={() => selectedAsset && onNext(selectedAsset)}
      onBack={onBack}
      isNextDisabled={isNextDisabled}
    >
        <div className="space-y-6">
            {/* Search Input */}
            <div className="relative">
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
            
            {/* Selected Asset Display */}
            <div>
                <h3 className="text-xl font-semibold mb-4 text-slate-light">Selected Asset</h3>
                <div className="bg-cyber-navy/50 p-6 rounded-lg border border-slate-dark/50 min-h-[100px] flex items-center justify-center">
                    {selectedAsset ? (
                        <div className="text-center">
                            <p className="text-2xl font-bold text-cyan-accent">{selectedAsset.ticker}</p>
                            <p className="text-slate-medium">{selectedAsset.name}</p>
                            <button onClick={() => setSelectedAsset(null)} className="text-xs text-red-400 hover:text-red-500 transition-colors mt-2">
                                Clear Selection
                            </button>
                        </div>
                    ) : (
                        <p className="text-slate-medium text-center">No asset selected yet. Use the search bar above.</p>
                    )}
                </div>
            </div>
        </div>
    </WizardLayout>
  );
};

export default Step2SingleAssetDefinition;