import React from 'react';
import { SimulationMode } from '../../types';
import WizardLayout from '../common/WizardLayout';

interface Step1DataSourceProps {
  onSelect: (mode: SimulationMode) => void;
}

const ModeCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}> = ({ icon, title, description, onClick }) => (
    <button
        onClick={onClick}
        className="w-full p-6 border rounded-lg text-left transition-all duration-300 flex items-start space-x-6 border-slate-dark/50 hover:border-cyan-accent/50 hover:bg-cyber-navy-light/50 cursor-pointer transform hover:-translate-y-1"
    >
        <div className="text-cyan-accent mt-1">{icon}</div>
        <div>
            <h3 className="text-xl font-bold text-slate-light">{title}</h3>
            <p className="text-slate-medium mt-1">{description}</p>
        </div>
    </button>
);


const Step1DataSource: React.FC<Step1DataSourceProps> = ({ onSelect }) => {
  const iconProps = {
    className: "w-12 h-12 flex-shrink-0"
  };

  return (
    <WizardLayout
      title="Step 1: Choose Simulation Type"
      description="Select the type of analysis you want to perform."
      hideNext={true}
    >
      <div className="grid grid-cols-1 gap-6">
        <ModeCard
          icon={<svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.098 19.902a3.75 3.75 0 005.304 0l6.402-6.402M6.75 21A3.75 3.75 0 013 17.25V4.5A2.25 2.25 0 015.25 2.25h13.5A2.25 2.25 0 0121 4.5v12.75a3.75 3.75 0 01-3.75 3.75h-2.25M6.75 21h4.5M16.5 21h-4.5" /></svg>}
          title="Portfolio Simulation"
          description="Analyze a diversified portfolio with multiple assets. Model complex interactions and correlations using Monte Carlo or SIPmath methods."
          onClick={() => onSelect('portfolio')}
        />
        <ModeCard
          icon={<svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.95 14.95 0 00-5.84-2.56m0 0a14.95 14.95 0 01-5.84 2.56m5.84-2.56V4.72a6 6 0 0112 0v2.65a6 6 0 01-5.84 7.38z" /></svg>}
          title="Single Asset Forecast"
          description="Focus on one specific stock, ETF, or cryptocurrency. Run a detailed forecast to understand its individual risk and return profile."
          onClick={() => onSelect('singleAsset')}
        />
      </div>
    </WizardLayout>
  );
};

export default Step1DataSource;