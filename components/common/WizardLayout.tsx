import React from 'react';

interface WizardLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  isNextDisabled?: boolean;
  isNextLoading?: boolean;
  hideNext?: boolean;
}

const WizardLayout: React.FC<WizardLayoutProps> = ({
  title,
  description,
  children,
  onNext,
  onBack,
  nextLabel = 'Next Step',
  isNextDisabled = false,
  isNextLoading = false,
  hideNext = false,
}) => {
  return (
    <div className="flex flex-col">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-light">{title}</h2>
        <p className="text-slate-medium mt-2">{description}</p>
      </div>
      
      <div className="flex-grow">{children}</div>

      <div className="mt-10 pt-6 border-t border-slate-dark/50 flex justify-between items-center">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-2 rounded-md font-semibold text-slate-medium bg-transparent hover:bg-slate-dark/30 transition-colors duration-200"
            >
              Back
            </button>
          )}
        </div>
        <div>
          {!hideNext && onNext && (
            <button
              onClick={onNext}
              disabled={isNextDisabled || isNextLoading}
              className="px-8 py-3 rounded-md font-semibold text-cyber-navy bg-cyan-accent hover:bg-cyan-accent-dark disabled:bg-slate-dark disabled:text-slate-medium disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg shadow-cyan-accent/10 disabled:shadow-none flex items-center"
            >
              {isNextLoading && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-cyber-navy" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isNextLoading ? 'Processing...' : nextLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WizardLayout;