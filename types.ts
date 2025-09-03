export enum DataSource {
    API = 'Public Market API',
    CSV = 'CSV/XLSX Upload',
    MANUAL = 'Manual Entry',
}

export interface Asset {
    id: string;
    ticker: string;
    name: string;
    weight: number;
}

export interface Portfolio {
    assets: Asset[];
}

export enum SimulationType {
  LUMP_SUM = 'Lump Sum Investment',
  SIP = 'Systematic Investment Plan (SIP)',
}

export enum SimulationMethod {
  MONTE_CARLO = 'Classic Monte Carlo',
  SIPMATH = 'SIPmath Modeler',
}

export type SimulationMode = 'portfolio' | 'singleAsset';

export interface AssetWithParams extends Asset {
    expectedReturn: number;
    volatility: number;
}

export interface SimulationParams {
    mode: SimulationMode;
    method: SimulationMethod;
    type: SimulationType;
    simulations: number;
    timeHorizon: number; // in years
    initialInvestment: number;
    monthlyContribution: number;
    // For Monte Carlo
    expectedReturn: number; 
    volatility: number;
    // For SIPmath
    assetsWithParams?: AssetWithParams[];
}

export interface ScenarioPoint {
    percentile: number;
    value: number;
}

export interface SimulationResult {
    riskScore: number;
    bestCase: number;
    worstCase: number;
    medianOutcome: number;
    confidenceInterval: {
        lower: number;
        upper: number;
    };
    sharpeRatio: number;
    maxDrawdown: number;
    cvar: number;
    probNegativeReturn: number;
    analysisSummary: string;
    scenarioDistribution: ScenarioPoint[];
}