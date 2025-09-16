import React, { useState } from 'react';
import WizardLayout from '../common/WizardLayout';
import FileUpload from '../common/FileUpload';
import { uploadFile, searchTickers } from '../../services/apiService';
import { Modal, Box, TextField, Button, List, ListItem, ListItemText, Typography } from '@mui/material';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

interface Step2SingleAssetDefinitionProps {
  onNext: (asset: { ticker?: string; name: string; filePath?: string }) => void;
  onBack: () => void;
}

type InputMode = 'ticker' | 'upload';

const Step2SingleAssetDefinition: React.FC<Step2SingleAssetDefinitionProps> = ({ onNext, onBack }) => {
  const [inputMode, setInputMode] = useState<InputMode>('ticker');
  const [selectedAsset, setSelectedAsset] = useState<{ ticker: string; name: string } | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ filePath: string; filename: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{ ticker: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const isNextDisabled = inputMode === 'ticker' ? !selectedAsset : !uploadedFile;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 0) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          setIsLoading(true);
          const results = await searchTickers(term);
          setSearchResults(results);
        } catch (error) {
          console.error("Error searching tickers:", error);
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
    }
  };

  // Clear timeout on unmount
  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectStock = (stock: { ticker: string; name: string }) => {
    setSelectedAsset(stock);
    setSearchTerm('');
    setSearchResults([]);
    setIsModalOpen(false);
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
            <Button onClick={() => setIsModalOpen(true)} variant="contained">Search Ticker</Button>
            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
              <Box sx={style}>
                <Typography variant="h6">Search Ticker</Typography>
                <TextField 
                  fullWidth
                  label="e.g. AAPL or Apple"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <List>
                  {searchResults.map(stock => (
                    <ListItem button key={stock.ticker} onClick={() => handleSelectStock(stock)}>
                      <ListItemText primary={`${stock.ticker} - ${stock.name}`} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Modal>
            
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
