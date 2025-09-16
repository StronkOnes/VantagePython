import React from 'react';
import WizardLayout from '../common/WizardLayout';
import { SimulationParams } from '../../types';

interface Step3SimulationParamsProps {
  onNext: (params: SimulationParams) => void;
  onBack: () => void;
}

const Step3SimulationParams: React.FC<Step3SimulationParamsProps> = ({ onNext, onBack }) => {
  const [timeHorizon, setTimeHorizon] = React.useState(10);
  const [monteCarloSimulations, setMonteCarloSimulations] = React.useState(1000);
  const [distribution, setDistribution] = React.useState("Normal"); // New state for distribution

  const handleNext = () => {
    onNext({ timeHorizon, monteCarloSimulations, distribution }); // Pass distribution
  };

  return (
    <WizardLayout
      title="Step 3: Configure Simulation"
      description="Set the parameters for the Monte Carlo simulation."
      onNext={handleNext}
      onBack={onBack}
    >
      <div className="space-y-6">
        <div>
          <label htmlFor="time-horizon" className="block text-sm font-medium text-slate-medium mb-1">
            Time Horizon (Years)
          </label>
          <input
            type="number"
            id="time-horizon"
            value={timeHorizon}
            onChange={(e) => setTimeHorizon(parseInt(e.target.value, 10))}
            className="block w-full bg-slate-dark/50 border-2 border-slate-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-accent/80 focus:border-cyan-accent"
          />
        </div>
        <div>
          <label htmlFor="mc-simulations" className="block text-sm font-medium text-slate-medium mb-1">
            Monte Carlo Simulations
          </label>
          <input
            type="number"
            id="mc-simulations"
            value={monteCarloSimulations}
            onChange={(e) => setMonteCarloSimulations(parseInt(e.target.value, 10))}
            className="block w-full bg-slate-dark/50 border-2 border-slate-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-accent/80 focus="
          />
        </div>
        {/* New Distribution Selector */}
        <div>
          <label htmlFor="distribution-selector" className="block text-sm font-medium text-slate-medium mb-1">
            Distribution Type
          </label>
          <select
            id="distribution-selector"
            value={distribution}
            onChange={(e) => setDistribution(e.target.value)}
            className="block w-full bg-slate-dark/50 border-2 border-slate-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-accent/80 focus:border-cyan-accent"
          >
            <option value="Normal">Normal Distribution</option>
            <option value="Log-Normal">Lognormal Distribution</option>
            <option value="Uniform">Uniform Distribution</option>
            <option value="Beta">Beta Distribution</option>
            <option value="Empirical">Historical Distribution (Non-parametric)</option>
          </select>
        </div>
      </div>
    </WizardLayout>
  );
};

export default Step3SimulationParams;
