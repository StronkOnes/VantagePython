<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Vantage for Financial Analysis

This application provides a suite of tools for financial analysis, including Monte Carlo simulation, detailed reporting, and trade planning calculators.

View your app in AI Studio: https://ai.studio/apps/drive/1bIsrHrPYDSXnIqWRL9S0ffgcUCNQ4prL

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `OPENROUTER_API_KEY` in a `.env` file in the `backend` directory to your OpenRouter API key.
3. Run the app:
   `npm run dev`

## Features

### 1. Financial Simulation

The core feature of the application is a powerful Monte Carlo simulation tool. You can upload your own financial data (from a CSV or Excel file) and run thousands of simulations to generate a distribution of potential future outcomes. 

You can model your data using several statistical distributions:
*   Normal
*   Log-Normal
*   Uniform
*   Beta
*   Empirical

For detailed explanations of these distributions and when to use them, please refer to the "How to Use" guide within the application.

### 2. Investor Report

After running a simulation, the application generates a detailed Investor Report with the following components:

*   **Summary Statistics:** A quick overview of the simulation results, including mean, standard deviation, and key percentiles.
*   **Trading Scenarios:** Actionable trading ideas for both long and short positions, with conservative and aggressive strategies. Each strategy includes explicit entry, stop-loss, and take-profit levels.
*   **Volatility Assessment:** An analysis of the data's volatility with strategic recommendations for risk management.

### 3. Turtle Calculator

A position sizing and risk management tool based on the Turtle Trading system. It helps you determine the appropriate position size for a trade based on your account size, risk tolerance, and the asset's volatility (ATR).

## How to Use

Here is a typical workflow for using the application:

1.  **Run a Simulation:** Go to the "Simulation" page, upload your financial data, select the data column and distribution, and run the simulation.
2.  **Analyze the Report:** Review the generated "Investor Report". Pay close attention to the trading scenarios and the volatility assessment to form a trading plan.
3.  **Plan Your Trade:** Use the "Turtle Calculator" to determine your position size and set your stop-loss and take-profit levels based on your trading plan and risk tolerance.
