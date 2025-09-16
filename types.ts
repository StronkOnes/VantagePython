export enum DataSource {
    API = 'Public Market API',
    CSV = 'CSV/XLSX Upload',
    MANUAL = 'Manual Entry',
}

export type SimulationMode = 'singleAsset';

export interface SimulationParams {
    timeHorizon: number;
    monteCarloSimulations: number;
    distribution: string;
}
