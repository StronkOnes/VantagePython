import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Portfolio, SimulationParams, SimulationResult, SimulationType } from '../../types';
import WizardLayout from '../common/WizardLayout';

interface Step5ReportProps {
  result: SimulationResult | null;
  portfolio: Portfolio;
  simulationParams: SimulationParams | null;
  onRestart: () => void;
  onBack: () => void;
}

const ReportItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="flex justify-between py-3 border-b border-slate-dark/50">
        <dt className="text-slate-medium">{label}</dt>
        <dd className="font-semibold text-slate-light">{value}</dd>
    </div>
);

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const Step5Report: React.FC<Step5ReportProps> = ({ result, portfolio, simulationParams, onRestart, onBack }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  
  const handleDownload = async () => {
    if (!reportRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Higher scale for better quality
        backgroundColor: '#112240', // Match card background
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight); // with margin
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save('Vantage_Report.pdf');

    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Sorry, there was an error creating the PDF report.");
    } finally {
      setIsDownloading(false);
    }
  };
  
  const handleEmail = () => {
      alert("Email reporting functionality is not yet implemented.");
      console.log("Emailing report...");
  }

  if (!result || !simulationParams) {
    return (
      <WizardLayout
        title="Step 5: Report"
        description="No report data available. Please complete the simulation first."
        onBack={onBack}
        hideNext={true}
      >
        <p className="text-center text-slate-medium">There seems to be no data for the report. Please go back and run a simulation.</p>
      </WizardLayout>
    );
  }

  return (
    <WizardLayout
      title="Step 5: Final Report"
      description="A summary of your portfolio simulation. You can now export this report or start a new simulation."
      onBack={onBack}
      hideNext={true}
    >
        <div ref={reportRef} className="grid grid-cols-1 md:grid-cols-2 gap-10 p-4 bg-cyber-navy-light rounded-lg">
            {/* Left Column: Summary */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-cyan-accent mb-4">Simulation Summary</h3>
                    <dl className="space-y-1">
                        <ReportItem label="Portfolio Risk Score" value={result.riskScore.toFixed(1)} />
                        <ReportItem label="Median Outcome" value={formatCurrency(result.medianOutcome)} />
                        <ReportItem label="Best Case (95th %)" value={formatCurrency(result.bestCase)} />
                        <ReportItem label="Worst Case (5th %)" value={formatCurrency(result.worstCase)} />
                        <ReportItem label="Sharpe Ratio" value={result.sharpeRatio.toFixed(2)} />
                        <ReportItem label="Max Drawdown" value={`${result.maxDrawdown.toFixed(1)}%`} />
                        <ReportItem label="CVaR (95%)" value={`${result.cvar.toFixed(1)}%`} />
                        <ReportItem label="Prob. of Loss (1yr)" value={`${result.probNegativeReturn.toFixed(1)}%`} />
                    </dl>
                </div>
                <div className="bg-cyber-navy/50 p-4 rounded-lg border border-slate-dark/50">
                    <h4 className="font-semibold text-slate-light">AI Analyst Conclusion</h4>
                    <p className="text-sm text-slate-medium mt-2">{result.analysisSummary}</p>
                </div>
            </div>

            {/* Right Column: Portfolio & Actions */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-cyan-accent mb-4">Simulation Inputs</h3>
                     <dl className="space-y-1 mb-6">
                        <ReportItem label="Investment Strategy" value={simulationParams.type} />
                        <ReportItem label="Initial Investment" value={formatCurrency(simulationParams.initialInvestment)} />
                        {simulationParams.type === SimulationType.SIP && (
                            <ReportItem label="Monthly Contribution" value={formatCurrency(simulationParams.monthlyContribution)} />
                        )}
                        <ReportItem label="Time Horizon" value={`${simulationParams.timeHorizon} Years`} />
                    </dl>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-cyan-accent mb-4">Portfolio Allocation</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {portfolio.assets.map(asset => (
                            <div key={asset.id} className="flex justify-between bg-slate-dark/30 p-2 rounded">
                                <span className="text-sm text-slate-light">{asset.ticker} - {asset.name}</span>
                                <span className="font-bold text-slate-medium text-sm">{asset.weight}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-dark/50">
            <h3 className="text-xl font-bold text-cyan-accent mb-4">Export & Actions</h3>
            <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={handleDownload} disabled={isDownloading} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-semibold text-cyber-navy bg-cyan-accent hover:bg-cyan-accent-dark transition-colors duration-200 disabled:bg-slate-dark disabled:text-slate-medium disabled:cursor-not-allowed">
                    {isDownloading ? (
                        <>
                           <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           Generating...
                        </>
                    ) : (
                         <>
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                           Download PDF
                        </>
                    )}
                </button>
                <button onClick={handleEmail} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-semibold text-slate-light bg-slate-dark/50 hover:bg-slate-dark/80 transition-colors duration-200">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Email Report
                </button>
            </div>
             <button onClick={onRestart} className="w-full mt-4 py-3 rounded-md font-bold text-cyan-accent hover:bg-cyan-accent/10 transition-colors duration-200">
                Start New Simulation
            </button>
        </div>
    </WizardLayout>
  );
};

export default Step5Report;