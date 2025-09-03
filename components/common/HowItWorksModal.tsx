import React from 'react';

const Step: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-cyan-accent/10 text-cyan-accent flex items-center justify-center border-2 border-cyan-accent/20">
            {icon}
        </div>
        <div>
            <h4 className="text-xl font-bold text-slate-light">{title}</h4>
            <div className="text-slate-medium mt-1 space-y-2">{children}</div>
        </div>
    </div>
);

const HowItWorksModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const iconProps = {
        className: "w-6 h-6",
        strokeWidth: 2
    };

    return (
        <div 
            className="fixed inset-0 bg-cyber-navy/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="how-it-works-title"
        >
            <div 
                className="bg-cyber-navy-light border border-slate-dark/50 rounded-xl shadow-2xl shadow-cyber-navy w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative animate-fadeInUp"
                onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-slate-medium hover:text-slate-light transition-colors"
                    aria-label="Close modal"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <header className="text-center mb-8">
                    <h2 id="how-it-works-title" className="text-3xl font-bold text-cyan-accent">How Vantage Works</h2>
                    <p className="text-slate-medium mt-2">A detailed guide to forecasting your financial future.</p>
                </header>
                <div className="space-y-8">
                     <Step
                        icon={<svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /></svg>}
                        title="1. Choose Your Analysis Type"
                    >
                        <p>Vantage offers two powerful ways to analyze your investments. You'll start by choosing one:</p>
                        <div className="pl-4 border-l-2 border-slate-dark/50 space-y-2">
                           <p><strong className="text-slate-light">Portfolio Simulation (5 Steps):</strong> Choose this to analyze a complete portfolio of multiple assets. It's ideal for understanding diversification, overall risk, and how different assets interact with each other.</p>
                           <p><strong className="text-slate-light">Single Asset Forecast (4 Steps):</strong> Choose this for a streamlined deep-dive into one specific stock, ETF, or cryptocurrency. It's perfect for evaluating a new potential investment quickly.</p>
                       </div>
                    </Step>
                     <Step
                        icon={<svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.11-1.227l.07-.027a1.125 1.125 0 011.126 0l.07.027c.55.22 1.02.685 1.11 1.227l.068.402a1.125 1.125 0 001.07 1.07l.402.068c.542.09.98.502 1.227 1.05l.027.07c.22.55.22 1.157 0 1.708l-.027.07a1.125 1.125 0 01-1.05 1.227l-.402.068a1.125 1.125 0 00-1.07 1.07l-.068.402a1.125 1.125 0 01-1.227 1.05l-.07.027a1.125 1.125 0 01-1.708 0l-.07-.027a1.125 1.125 0 01-1.05-1.227l-.068-.402a1.125 1.125 0 00-1.07-1.07l-.402-.068a1.125 1.125 0 01-1.227-1.05l-.027-.07a1.125 1.125 0 010-1.708l.027-.07c.247-.548.687-1.02 1.227-1.11l.402-.068a1.125 1.125 0 001.07-1.07l.068-.402zM12 15a3 3 0 100-6 3 3 0 000 6z" /></svg>}
                        title="2. Setup & Define Assumptions"
                    >
                       <p>Next, you'll provide the details for the simulation. If you chose a portfolio, you'll add multiple assets and their weights, then set market assumptions in a separate step.</p>
                       <p>For the streamlined <strong className="text-slate-light">Single Asset Forecast</strong>, you'll do this all on one screen: select your asset, define your investment strategy (Lump Sum or SIP), set the time horizon, and provide its expected annual return and volatility.</p>
                    </Step>
                     <Step
                        icon={<svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 100 15 7.5 7.5 0 000-15zM21 21l-5.197-5.197" /></svg>}
                        title="3. Unleash the AI Simulation"
                    >
                       <p>Once you've set the stage, our AI gets to work. It takes your inputs and assumptions and runs thousands of 'what-if' scenarios. Think of each scenario as a possible future for the market over your chosen time horizon. In one scenario, the market might boom; in another, it might face a downturn. By running 10,000 or more of these unique simulations, the AI builds a comprehensive picture of the range of possible outcomes—not just a single, simple prediction.</p>
                    </Step>
                     <Step
                        icon={<svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3m-15.75 0h15.75M3.75 3A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25A2.25 2.25 0 0018 3H3.75z" /></svg>}
                        title="4. Understand Your Results"
                    >
                       <p>The results are presented in an easy-to-understand dashboard. Instead of overwhelming you with raw data, we focus on key insights:</p>
                        <ul className="list-disc list-inside space-y-1 pl-2">
                            <li><strong className="text-slate-light">Distribution Chart:</strong> See the full range of potential final values, from the most optimistic (best-case) to the most pessimistic (worst-case).</li>
                            <li><strong className="text-slate-light">Risk Score:</strong> A simple 0-100 score that summarizes the overall risk level of your strategy. Higher scores mean more uncertainty.</li>
                            <li><strong className="text-slate-light">Key Metrics:</strong> We calculate institutional-grade metrics like the Sharpe Ratio (return earned for risk taken) and Max Drawdown (biggest potential drop) for a professional-level assessment.</li>
                            <li><strong className="text-slate-light">AI Summary:</strong> Finally, Gemini provides a plain-English summary of the results, explaining the key takeaways for your investment plan.</li>
                        </ul>
                    </Step>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
                .animate-fadeInUp { animation: fadeInUp 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default HowItWorksModal;