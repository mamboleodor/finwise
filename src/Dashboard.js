import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import {
  Eye, EyeOff, Plus, ArrowUp, ArrowDown, TrendingUp, Moon, Sun,
  Wallet, Target, AlertCircle, CheckCircle, Settings
} from 'lucide-react';

export default function Dashboard({ balance, totalEarnings, totalSpending, savingsGoals, spending, reminders, onAddReminder }) {
  const [darkMode, setDarkMode] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  // Use props from App.js instead of mock data
  const financialData = {
    totalBalance: balance || 0,
    earned: totalEarnings || 0,
    spent: totalSpending || 0,
    saved: (totalEarnings - totalSpending) || 0,
    budget: 15000,
    lastMonthSpent: 14200,
  };

  // Calculate spending by category from real data
  const categoryColorMap = {
    'Food': '#F97316',
    'Transport': '#06B6D4',
    'Entertainment': '#8B5CF6',
    'Utilities': '#10B981',
    'Health': '#EC4899',
    'Other': '#6B7280',
  };

  const spendingByCategory = spending && spending.length > 0
    ? Object.entries(
        spending.reduce((acc, s) => {
          acc[s.category] = (acc[s.category] || 0) + parseFloat(s.amount);
          return acc;
        }, {})
      ).map(([category, value]) => ({
        name: category,
        value,
        color: categoryColorMap[category] || '#6B7280',
      }))
    : [
        { name: 'Groceries', value: 0, color: '#F97316' },
        { name: 'Transport', value: 0, color: '#06B6D4' },
        { name: 'Entertainment', value: 0, color: '#8B5CF6' },
        { name: 'Utilities', value: 0, color: '#10B981' },
      ];

  // Get recent transactions from spending prop (latest 5)
  const categoryIcons = {
    'Food': '🛒',
    'Transport': '🚗',
    'Entertainment': '🎬',
    'Utilities': '⚡',
    'Health': '🏥',
    'Other': '💳',
  };

  const recentTransactions = spending && spending.length > 0
    ? spending.slice(0, 5).map(s => ({
        id: s.id,
        name: s.merchant,
        category: s.category,
        amount: -parseFloat(s.amount),
        date: s.date,
        icon: categoryIcons[s.category] || '💳',
      }))
    : [];

  // Use savings goals from props if available
  const displayedSavingsGoals = savingsGoals && savingsGoals.length > 0
    ? savingsGoals
    : [
        { id: 1, name: 'Germany Trip', target: 50000, saved: 0, deadline: '6 months' },
        { id: 2, name: 'Emergency Fund', target: 100000, saved: 0, deadline: 'Ongoing' },
      ];

  // Generate dynamic alerts based on real data
  const generateAlerts = () => {
    const alerts = [];
    const savedAmount = totalEarnings - totalSpending;

    // Alert about savings
    if (savedAmount > 0) {
      alerts.push({
        id: 1,
        type: 'success',
        icon: CheckCircle,
        message: `You have saved KES ${savedAmount.toLocaleString()} this month! Great progress 🎉`,
      });
    }

    // Alert about budget status
    const budgetPercentage = (totalSpending / 15000) * 100;
    if (budgetPercentage > 80) {
      alerts.push({
        id: 2,
        type: 'warning',
        icon: AlertCircle,
        message: `Your spending is at ${budgetPercentage.toFixed(0)}% of your monthly budget. Be mindful of your expenses.`,
      });
    } else if (budgetPercentage < 50) {
      alerts.push({
        id: 2,
        type: 'success',
        icon: CheckCircle,
        message: `You are doing great! Only ${budgetPercentage.toFixed(0)}% of your budget spent.`,
      });
    }

    // Alert about savings goals
    if (displayedSavingsGoals && displayedSavingsGoals.length > 0) {
      const germanTrip = displayedSavingsGoals.find(g => g.name.toLowerCase().includes('germany'));
      if (germanTrip) {
        const progress = (germanTrip.saved / germanTrip.target) * 100;
        alerts.push({
          id: 3,
          type: 'success',
          icon: CheckCircle,
          message: `You are ${progress.toFixed(0)}% towards your Germany trip! Keep going!`,
        });
      }
    }

    return alerts.length > 0 ? alerts : [
      { id: 1, type: 'success', icon: CheckCircle, message: "Start tracking your finances to see insights here!" },
    ];
  };

  const alerts = generateAlerts();

  const spendingTrend = [
    { month: 'Jun', spent: 13500 },
    { month: 'Jul', spent: 12890 },
  ];

  const categoryColors = {
    'Food': '#F97316',
    'Transport': '#06B6D4',
    'Entertainment': '#8B5CF6',
    'Utilities': '#10B981',
    'Health': '#EC4899',
    'Income': '#059669',
    'Other': '#6B7280',
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode
        ? 'bg-slate-950 text-white'
        : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Navigation Bar */}
      <nav className={`sticky top-0 z-40 backdrop-blur-sm border-b transition-colors ${
        darkMode
          ? 'bg-slate-900/80 border-slate-800'
          : 'bg-white/80 border-slate-200'
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-500" />
            <h1 className="text-xl font-semibold">FinWise</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? 'bg-slate-800 hover:bg-slate-700'
                  : 'bg-slate-200 hover:bg-slate-300'
              }`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? 'bg-slate-800 hover:bg-slate-700'
                  : 'bg-slate-200 hover:bg-slate-300'
              }`}
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Financial Summary */}
      <section className={`py-12 px-6 ${
        darkMode
          ? 'bg-gradient-to-b from-emerald-950 to-slate-900'
          : 'bg-gradient-to-b from-emerald-600 to-emerald-50'
      }`}>
        <div className="max-w-6xl mx-auto">
          {/* Total Balance Hero */}
          <div className="mb-12">
            <p className={`text-sm font-medium mb-2 ${
              darkMode ? 'text-emerald-300' : 'text-emerald-700'
            }`}>
              Total Balance
            </p>
            <div className="flex items-baseline gap-4 mb-6">
              <h2 className="text-5xl font-bold">
                {showBalance ? `KES ${financialData.totalBalance.toLocaleString()}` : '••••••'}
              </h2>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className={`p-2 rounded transition-colors ${
                  darkMode
                    ? 'bg-emerald-900/50 hover:bg-emerald-800'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label="Toggle balance visibility"
              >
                {showBalance ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-medium hover:bg-slate-100 transition-colors flex items-center gap-2 shadow-sm">
                <Plus className="w-5 h-5" />
                Add Transaction
              </button>
              <button className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                darkMode
                  ? 'bg-emerald-900/50 hover:bg-emerald-800 text-white'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}>
                Set Budget
              </button>
              <button className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                darkMode
                  ? 'bg-emerald-900/50 hover:bg-emerald-800 text-white'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}>
                Create Goal
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Earned', value: financialData.earned, icon: ArrowDown, color: 'emerald' },
              { label: 'Spent', value: financialData.spent, icon: ArrowUp, color: 'orange' },
              { label: 'Saved', value: financialData.saved, icon: Target, color: 'blue' },
              { label: 'Budget', value: financialData.budget, icon: Wallet, color: 'purple' },
            ].map((stat, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg backdrop-blur-sm ${
                  darkMode
                    ? 'bg-slate-800/50 border border-slate-700'
                    : 'bg-white/30 border border-white/50'
                }`}
              >
                <p className={`text-xs font-medium mb-2 opacity-75`}>{stat.label}</p>
                <p className="text-xl font-bold">KES {stat.value.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Spending Comparison */}
        <section className={`mb-12 p-6 rounded-lg border transition-colors ${
          darkMode
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200'
        }`}>
          <h3 className="text-lg font-semibold mb-6">This Month vs. Last Month</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <div className={`h-32 rounded flex items-end justify-center gap-2 ${
                  darkMode ? 'bg-slate-800' : 'bg-slate-100'
                }`}>
                  <div className="w-12 h-24 bg-emerald-500 rounded-t"></div>
                  <div className="w-12 h-20 bg-orange-500 rounded-t opacity-60"></div>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">This month</p>
                <p className="text-2xl font-bold text-emerald-600">↓ 9%</p>
                <p className="text-xs text-slate-500 mt-2">vs. last month</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">This month</span>
                  <span className="font-semibold">KES {financialData.spent.toLocaleString()}</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${
                  darkMode ? 'bg-slate-800' : 'bg-slate-200'
                }`}>
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                    style={{ width: `${(financialData.spent / financialData.budget) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Last month</span>
                  <span className="font-semibold">KES {financialData.lastMonthSpent.toLocaleString()}</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${
                  darkMode ? 'bg-slate-800' : 'bg-slate-200'
                }`}>
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                    style={{ width: `${(financialData.lastMonthSpent / financialData.budget) * 100}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-emerald-600 font-medium mt-4">
                ✓ You're on track! Keep up the good spending habits.
              </p>
            </div>
          </div>
        </section>

        {/* Spending by Category */}
        <section className={`mb-12 p-6 rounded-lg border transition-colors ${
          darkMode
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200'
        }`}>
          <h3 className="text-lg font-semibold mb-6">Spending by Category</h3>
          {spendingByCategory && spendingByCategory.length > 0 && totalSpending > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={spendingByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {spendingByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                        border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        color: darkMode ? '#f1f5f9' : '#1e293b',
                      }}
                      formatter={(value) => `KES ${value.toLocaleString()}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-4">
                {spendingByCategory.map((category, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div
                      className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{category.name}</span>
                        <span className="font-semibold">KES {category.value.toLocaleString()}</span>
                      </div>
                      <div className={`h-1.5 rounded-full overflow-hidden ${
                        darkMode ? 'bg-slate-800' : 'bg-slate-200'
                      }`}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: category.color,
                            width: `${totalSpending > 0 ? (category.value / totalSpending) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {totalSpending > 0 ? ((category.value / totalSpending) * 100).toFixed(0) : 0}% of total spending
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className={`text-center py-8 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              No spending recorded yet. Start logging your expenses to see the breakdown.
            </p>
          )}
        </section>

        {/* Savings Goals Progress */}
        <section className={`mb-12 p-6 rounded-lg border transition-colors ${
          darkMode
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Your Savings Goals</h3>
            <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Goal
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {displayedSavingsGoals.map((goal) => {
              const progress = (goal.saved / goal.target) * 100;
              return (
                <div
                  key={goal.id}
                  className={`p-5 rounded-lg border transition-colors ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <h4 className="font-semibold mb-2">{goal.name}</h4>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {goal.deadline}
                  </p>

                  <div className={`h-3 rounded-full overflow-hidden mb-3 ${
                    darkMode ? 'bg-slate-700' : 'bg-slate-200'
                  }`}>
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-slate-500">Saved</p>
                      <p className="text-lg font-bold">KES {(goal.saved || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-600">{progress.toFixed(0)}%</p>
                      <p className="text-xs text-slate-500">of {(goal.target || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Alerts & Nudges */}
        <section className="mb-12 space-y-4">
          <h3 className="text-lg font-semibold">Smart Insights</h3>
          {alerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border flex gap-4 transition-colors ${
                  alert.type === 'success'
                    ? darkMode
                      ? 'bg-emerald-900/30 border-emerald-700'
                      : 'bg-emerald-50 border-emerald-200'
                    : darkMode
                    ? 'bg-amber-900/30 border-amber-700'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    alert.type === 'success'
                      ? 'text-emerald-600'
                      : 'text-amber-600'
                  }`}
                />
                <p className={`text-sm ${
                  alert.type === 'success'
                    ? darkMode
                      ? 'text-emerald-200'
                      : 'text-emerald-900'
                    : darkMode
                    ? 'text-amber-200'
                    : 'text-amber-900'
                }`}>
                  {alert.message}
                </p>
              </div>
            );
          })}
        </section>

        {/* Recent Transactions */}
        <section className={`mb-12 p-6 rounded-lg border transition-colors ${
          darkMode
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
              View all →
            </button>
          </div>

          {recentTransactions && recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => {
                const isIncome = transaction.amount > 0;
                const categoryColor = categoryColors[transaction.category] || '#6B7280';

                return (
                  <div
                    key={transaction.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                      darkMode
                        ? 'bg-slate-800 hover:bg-slate-700'
                        : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                        style={{
                          backgroundColor: categoryColor + '20',
                        }}
                      >
                        {transaction.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{transaction.name}</p>
                        <p className={`text-xs ${
                          darkMode ? 'text-slate-500' : 'text-slate-500'
                        }`}>
                          {transaction.category} • {transaction.date}
                        </p>
                      </div>
                    </div>

                    <p className={`font-semibold text-right ${
                      isIncome
                        ? 'text-emerald-600'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}>
                      {isIncome ? '+' : '-'} KES {Math.abs(transaction.amount).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={`text-center py-8 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              No transactions yet. Log your first expense to get started!
            </p>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className={`border-t transition-colors ${
        darkMode
          ? 'bg-slate-900 border-slate-800'
          : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex justify-between items-center">
          <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-600'}`}>
            Last updated: Today at 2:45 PM
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-emerald-600 hover:text-emerald-700">Privacy</a>
            <a href="#" className="text-emerald-600 hover:text-emerald-700">Terms</a>
            <a href="#" className="text-emerald-600 hover:text-emerald-700">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}