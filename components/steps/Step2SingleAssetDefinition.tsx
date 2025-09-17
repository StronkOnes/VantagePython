import React, { useState } from 'react';
import WizardLayout from '../common/WizardLayout';
import FileUpload from '../common/FileUpload';
import { uploadFile } from '../../services/apiService';
import TickerSelector from '../TickerSelector';
import { Card, CardContent, Typography, Button } from '@mui/material';

interface Step2SingleAssetDefinitionProps {
  onNext: (asset: { ticker?: string; name: string; filePath?: string }) => void;
  onBack: () => void;
}

type InputMode = 'ticker' | 'upload';

const Step2SingleAssetDefinition: React.FC<Step2SingleAssetDefinitionProps> = ({ onNext, onBack }) => {
  const [inputMode, setInputMode] = useState<InputMode>('ticker');
  const [selectedAsset, setSelectedAsset] = useState<{ ticker: string; name: string } | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ filePath: string; filename: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isNextDisabled = inputMode === 'ticker' ? !selectedAsset : !uploadedFile;

  const handleSelectTicker = (ticker: string) => {
    // In a real app, you might want to fetch the full name of the ticker.
    // For this example, we'll just use the ticker as the name.
    setSelectedAsset({ ticker, name: ticker });
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const result = await uploadFile(file);
      setUploadedFile(result);
    } catch (error) {
      console.error("File upload failed:", error);
      // You might want to show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (inputMode === 'ticker' && selectedAsset) {
      onNext(selectedAsset);
    } else if (inputMode === 'upload' && uploadedFile) {
      onNext({ name: uploadedFile.filename, filePath: uploadedFile.filePath });
    }
  };

  return (
    <WizardLayout
      title="Step 2: Define Your Asset"
      description="Select a standard asset or upload your own data file."
      onNext={handleNext}
      onBack={onBack}
      isNextDisabled={isNextDisabled}
    >
      <div className="space-y-6">
        {/* Input Mode Toggle */}
        <div className="flex justify-center">
          <div className="bg-slate-dark/50 p-1 rounded-lg flex space-x-1">
            <button
              onClick={() => setInputMode('ticker')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                inputMode === 'ticker' ? 'bg-cyan-accent text-cyber-navy-dark' : 'text-slate-light hover:bg-slate-dark'
              }`}
            >
              Select Ticker
            </button>
            <button
              onClick={() => setInputMode('upload')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                inputMode === 'upload' ? 'bg-cyan-accent text-cyber-navy-dark' : 'text-slate-light hover:bg-slate-dark'
              }`}
            >
              Upload CSV
            </button>
          </div>
        </div>

        {inputMode === 'ticker' ? (
          <>
            <TickerSelector onSelect={handleSelectTicker} />
            
            {/* Selected Asset Display */}
            {selectedAsset && (
              <Card sx={{ mt: 2, backgroundColor: '#2d3748' }}>
                <CardContent>
                  <Typography variant="h6">Selected Asset</Typography>
                  <Typography variant="h4" component="div" sx={{ color: '#63b3ed' }}>
                    {selectedAsset.ticker}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {selectedAsset.name}
                  </Typography>
                  <Button size="small" onClick={() => setSelectedAsset(null)}>Clear Selection</Button>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-slate-light">Upload Custom Data</h3>
            <FileUpload onFileUpload={handleFileUpload} />
            {isLoading && <p className="text-center text-slate-medium mt-4">Uploading...</p>}
          </div>
        )}
      </div>
    </WizardLayout>
  );
};

export default Step2SingleAssetDefinition;