# Design Spec: Spending Jars, Budget Planner, and Wealth Vault

**Date:** 2026-07-25  
**Topic:** Comprehensive Wealth Management and Budgeting System  
**Status:** Draft

## 1. Overview
Transform FinWise from a basic transaction tracker into a comprehensive wealth management platform. The system will introduce unified custom categories, automated budgeting via the Spending Jars method, a "Wealth & Assets Vault" for tracking Sacco, MMF, Stocks, and Credit, and a robust data import/automation engine.

## 2. Core Features

### A. Unified Category & Jar System
*   **Custom Categories:** Users can define, edit, and delete categories (e.g., "M-Pesa Business", "Sacco Deposit").
*   **Jar Allocation:** Every category maps to one of the 6 Spending Jars (Necessities, FFA, LTSS, Education, Play, Give).
*   **Budgeting:** Set Monthly and Yearly limits per category.
*   **Detailed Overview:** A "Pro-level" transaction list replacing the old History page, featuring bulk actions, advanced filters, and import/export capabilities.

### B. Wealth & Assets Vault
A dedicated dashboard tracking net worth through four quadrants:
*   **Sacco:** Deposits, share capital, and dividends.
*   **MMF (Money Market Fund):** Principal vs. daily interest tracking.
*   **Stocks:** Portfolio value (Invested vs. Current) and ticker list.
*   **Credit:** Limit, utilization, and due date tracking.
*   **Net Worth Header:** Real-time calculation: `(Sacco + MMF + Stocks) - Credit`.

### C. Automation & Intelligence
*   **Smart Import:** Upload CSV/Excel statements (M-Pesa, Bank).
*   **Rule Engine:** Automated categorization based on merchant names (e.g., "NAIVAS" -> "Groceries").
*   **Recurring Transactions:** Automated logging for regular bills (Rent, Subscriptions) with optional manual approval.
*   **Deep Analysis:**
    *   Burn rate calculation.
    *   Spending breakdown by Jar and Category.
    *   12-month wealth forecasting.

## 3. Data Model (Supabase)

### New/Updated Tables:
*   `categories`: `id`, `user_id`, `name`, `icon`, `color`, `jar_id`, `monthly_budget`, `yearly_budget`.
*   `wealth_assets`: `id`, `user_id`, `type` (sacco, mmf, stocks, credit), `name`, `principal`, `current_value`, `interest_rate`, `last_updated`.
*   `import_rules`: `id`, `user_id`, `match_string`, `category_id`.
*   `recurring_transactions`: `id`, `user_id`, `name`, `amount`, `category_id`, `frequency`, `next_date`, `auto_approve` (bool).
*   `profiles`: Add `jar_ratios` (JSON: e.g., `{"NEC": 0.55, "FFA": 0.10, ...}`).

## 4. UI/UX Design

### Layout Structure
*   **Dashboard (Home):** Summary cards + Net Worth + Quick Actions.
*   **Wealth Vault (New):** The 4-quadrant assets view.
*   **Planner (New):** Jar configuration + Budget setting + Recurring bills.
*   **Detailed Overview (History):** The advanced transaction table + Import/Export bar.
*   **Insights:** Charts, Forecasts, and PDF Report generator.

### Design Tokens
*   **Colors:** Maintain existing palette (#194342, #1D9E75) but add status colors for Credit (Warning Red) and MMF Growth (Vibrant Green).

## 5. Success Criteria
*   Users can import a bank statement and have >80% of transactions auto-categorized after 3 imports.
*   Net Worth is accurately calculated across all 4 asset types.
*   Users can generate a monthly financial PDF report in under 5 seconds.
*   Monthly/Yearly budgets show real-time progress bars based on transactions.
