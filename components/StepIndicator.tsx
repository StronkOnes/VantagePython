import React from 'react';
import { SimulationMode } from '../types';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  simulationMode: SimulationMode | null;
}

const portfolioSteps = [
  "Sim Type",
  "Portfolio",
  "Parameters",
  "Analysis",
  "Report"
];

const singleAssetSteps = [
  "Sim Type",
  "Setup",
  "Analysis",
  "Report"
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps, simulationMode }) => {
  const steps = simulationMode === 'singleAsset' ? singleAssetSteps : portfolioSteps;
  const effectiveTotalSteps = steps.length;

  return (
    <div className="w-full">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;

          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 relative
                    ${isCompleted ? 'bg-cyan-accent text-cyber-navy' : ''}
                    ${isActive ? 'bg-cyan-accent text-cyber-navy shadow-cyan-glow' : ''}
                    ${!isCompleted && !isActive ? 'bg-slate-dark text-slate-medium' : ''}
                  `}
                >
                  {isCompleted ? '✔' : stepNumber}
                </div>
                <p className={`mt-2 text-xs sm:text-sm font-semibold transition-colors duration-300 w-24
                  ${isActive ? 'text-cyan-accent' : 'text-slate-medium'}
                  ${isCompleted ? 'text-slate-light' : ''}`}>
                  {step}
                </p>
              </div>
              {stepNumber < effectiveTotalSteps && (
                <div className={`flex-1 h-1 rounded transition-colors duration-500 mx-2 sm:mx-4 ${currentStep > stepNumber ? 'bg-cyan-accent' : 'bg-slate-dark'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;