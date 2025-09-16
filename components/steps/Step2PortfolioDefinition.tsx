import React, { useState } from 'react';

interface Asset {
  ticker: string;
  quantity: number;
}

interface Props {
  portfolio: Asset[];
  setPortfolio: (portfolio: Asset[]) => void;
  onNext: () => void;
}

const Step2PortfolioDefinition: React.FC<Props> = ({ portfolio, setPortfolio, onNext }) => {
  const [newAsset, setNewAsset] = useState<Asset>({ ticker: '', quantity: 1 });

  const handleAddAsset = () => {
    if (newAsset.ticker.trim() !== '') {
      setPortfolio([...portfolio, newAsset]);
      setNewAsset({ ticker: '', quantity: 1 });
    }
  };

  const handleRemoveAsset = (index: number) => {
    const newPortfolio = [...portfolio];
    newPortfolio.splice(index, 1);
    setPortfolio(newPortfolio);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAsset({ ...newAsset, [name]: name === 'quantity' ? parseInt(value, 10) : value });
  };

  return (
    <div className="p-6 bg-slate-light rounded-lg shadow-lg text-white">
      <h3 className="text-2xl font-bold mb-4">Define Your Portfolio</h3>
      <div className="space-y-4 mb-6">
        {portfolio.map((asset, index) => (
          <div key={index} className="flex items-center justify-between bg-slate-dark p-3 rounded-md">
            <span>{asset.ticker.toUpperCase()} - {asset.quantity} shares</span>
            <button
              onClick={() => handleRemoveAsset(index)}
              className="text-red-500 hover:text-red-700 font-semibold"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center space-x-4 mb-6">
        <input
          type="text"
          name="ticker"
          value={newAsset.ticker}
          onChange={handleInputChange}
          placeholder="Ticker (e.g., AAPL)"
          className="block w-full bg-slate-dark/50 border-2 border-slate-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-accent/80 focus:border-cyan-accent"
        />
        <input
          type="number"
          name="quantity"
          value={newAsset.quantity}
          onChange={handleInputChange}
          min="1"
          className="block w-48 bg-slate-dark/50 border-2 border-slate-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-accent/80 focus:border-cyan-accent"
        />
        <button
          onClick={handleAddAsset}
          className="bg-cyan-accent hover:bg-cyan-accent/90 text-white font-bold py-2 px-4 rounded-md"
        >
          Add Asset
        </button>
      </div>
      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={portfolio.length === 0}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-md disabled:bg-gray-500"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Step2PortfolioDefinition;