import React, { useState, useEffect } from 'react';
import WizardLayout from '../common/WizardLayout';
import { getCsvColumns } from '../../services/apiService';

interface Step2FileUploadColumnProps {
  onNext: (asset: { name: string; filePath: string; columnName: string }) => void;
  onBack: () => void;
  asset: { name: string; filePath: string; };
}

const Step2FileUploadColumn: React.FC<Step2FileUploadColumnProps> = ({ onNext, onBack, asset }) => {
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const fetchedColumns = await getCsvColumns(asset.filePath);
        setColumns(fetchedColumns);
        if (fetchedColumns.length > 0) {
          setSelectedColumn(fetchedColumns[0]);
        }
      } catch (err) {
        setError('Failed to load columns from the CSV file.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchColumns();
  }, [asset.filePath]);

  const handleNext = () => {
    if (selectedColumn) {
      onNext({ ...asset, columnName: selectedColumn });
    }
  };

  return (
    <WizardLayout
      title="Step 2b: Select Data Column"
      description={`Select the column from ${asset.name} that contains the price data for the simulation.`}
      onNext={handleNext}
      onBack={onBack}
      isNextDisabled={!selectedColumn || isLoading}
    >
      <div className="space-y-6">
        {isLoading ? (
          <p className="text-center text-slate-medium">Loading columns...</p>
        ) : error ? (
          <p className="text-center text-red-400">{error}</p>
        ) : (
          <div>
            <label htmlFor="column-select" className="block text-sm font-medium text-slate-medium mb-1">
              Price Column
            </label>
            <select
              id="column-select"
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="block w-full bg-slate-dark/50 border-2 border-slate-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-accent/80 focus:border-cyan-accent"
            >
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </WizardLayout>
  );
};

export default Step2FileUploadColumn;
