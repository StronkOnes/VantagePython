
import React, { useState } from 'react';
import { SimulationMode, SimulationParams } from '../types';
import Step1DataSource from './steps/Step1DataSource';
import Step2SingleAssetDefinition from './steps/Step2SingleAssetDefinition';
import Step2FileUploadColumn from './steps/Step2FileUploadColumn';
import Step3SimulationParams from './steps/Step3SimulationParams';
import InvestorReport from './InvestorReport';
import { runSimpleFileSimulation, runSimpleTickerSimulation } from '../services/apiService';
import { CircularProgress, Box, Typography } from '@mui/material';

type Asset = {
  ticker?: string;
  filePath?: string;
  columnName?: string;
};

type WizardStep = 'dataSource' | 'defineAsset' | 'defineColumns' | 'setParams' | 'viewReport';

const LandingPage: React.FC = () => {
  const [step, setStep] = useState<WizardStep>('dataSource');
  const [simulationMode, setSimulationMode] = useState<SimulationMode | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [simulationParams, setSimulationParams] = useState<SimulationParams | null>(null);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDataSourceSelect = (mode: SimulationMode) => {
    setSimulationMode(mode);
    if (mode === 'singleAsset') {
      setStep('defineAsset');
    }
  };

  const handleAssetSelect = (selectedAsset: Asset) => {
    setAsset(selectedAsset);
    if (selectedAsset.filePath) {
      setStep('defineColumns');
    } else {
      setStep('setParams');
    }
  };
  
  const handleColumnSelect = (assetWithColumn: Asset) => {
    setAsset(assetWithColumn);
    setStep('setParams');
  };


  const handleParamsSelect = async (params: SimulationParams) => {
    setSimulationParams(params);
    setIsLoading(true);
    setError(null);

    try {
      let result;
      if (asset?.filePath) {
        result = await runSimpleFileSimulation(asset.filePath, asset.columnName, params.distribution);
      } else if (asset?.ticker) {
        result = await runSimpleTickerSimulation(asset.ticker, 5, params.distribution);
      }

      if (result.error) {
        setError(result.error);
      } else {
        setSimulationResult(result);
        setAiRecommendation(result.ai_recommendation);
        setStep('viewReport');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'defineAsset') setStep('dataSource');
    if (step === 'defineColumns') setStep('defineAsset');
    if (step === 'setParams') {
        if (asset?.filePath) {
            setStep('defineColumns');
        } else {
            setStep('defineAsset');
        }
    }
    if (step === 'viewReport') setStep('setParams');
  };

  const handleReset = () => {
    setStep('dataSource');
    setSimulationMode(null);
    setAsset(null);
    setSimulationParams(null);
    setSimulationResult(null);
    setError(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <video autoPlay loop muted playsInline style={{ width: '100%', maxWidth: '400px' }}>
          <source src="/Loading-Bar-Animation-Uppbeat.mov" type="video/mp4" />
        </video>
        <Typography sx={{ mt: 2 }}>Running simulation, please wait...</Typography>
      </Box>
    );
  }
  
  if (error) {
      return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
              <Typography color="error">{error}</Typography>
              <button onClick={handleReset} className="mt-4 px-4 py-2 bg-cyan-accent text-cyber-navy-dark rounded-md">
                  Start Over
              </button>
          </Box>
      )
  }

  switch (step) {
    case 'dataSource':
      return <Step1DataSource onSelect={handleDataSourceSelect} />;
    case 'defineAsset':
      return <Step2SingleAssetDefinition onNext={handleAssetSelect} onBack={handleBack} />;
    case 'defineColumns':
        return <Step2FileUploadColumn onNext={handleColumnSelect} onBack={handleBack} asset={asset as Asset} />;
    case 'setParams':
      return <Step3SimulationParams onNext={handleParamsSelect} onBack={handleBack} />;
    case 'viewReport':
      return (
        <div>
          <InvestorReport result={simulationResult} aiRecommendation={aiRecommendation} />
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button onClick={handleReset} className="px-4 py-2 bg-cyan-accent text-cyber-navy-dark rounded-md">
              Run Another Simulation
            </button>
          </div>
        </div>
      );
    default:
      return <Step1DataSource onSelect={handleDataSourceSelect} />;
  }
};

export default LandingPage;
