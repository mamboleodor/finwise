import Loader from './components/Loader';
import React, { useEffect, useState } from 'react';
import { TrendingUp, PiggyBank, DollarSign, AlertCircle, Edit2 } from 'lucide-react';
import { supabase } from './supabaseClient'; // Adjust path to your supabase client

export default function Dashboard() {
  const [monthlyData, setMonthlyData] = useState({
    totalIncome: 0,
    investments: 0,
    savings: 0,
    spending: 0,
    remaining: 0,
  });

  const [savingsGoal, setSavingsGoal] = useState(null);
  const [budgetSettings, setBudgetSettings] = useState({
    investments: 0,
    savings: 0,
    spending: 0,
  });

  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [spendingBreakdown, setSpendingBreakdown] = useState({});

  // Fetch all data from Supabase
  useEffect(() => {
    fetchMonthlyData();
  }, []);

  const fetchMonthlyData = async () => {
    try {
      setLoading(true);
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        .toISOString()
        .split('T')[0];
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        .toISOString()
        .split('T')[0];

      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      // Fetch earnings for this month
      const { data: earningsData } = await supabase
        .from('earnings')
        .select('amount')
        .eq('user_id', userId)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth);

      const totalIncome = earningsData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

      // Fetch spending for this month
      const { data: spendingData } = await supabase
        .from('spending')
        .select('amount, category')
        .eq('user_id', userId)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth);

      const totalSpending = spendingData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

      // Calculate spending breakdown by category
      const breakdown = {};
      spendingData?.forEach(item => {
        breakdown[item.category] = (breakdown[item.category] || 0) + item.amount;
      });
      setSpendingBreakdown(breakdown);

      // Fetch investments
      const { data: investmentsData } = await supabase
        .from('investments')
        .select('current_value')
        .eq('user_id', userId);

      const totalInvestments = investmentsData?.reduce((sum, item) => sum + (item.current_value || 0), 0) || 0;

      // Fetch savings goals
      const { data: savingsData } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)
        .single();

      const totalSaved = savingsData?.saved || 0;

      const remaining = totalIncome - (totalSpending + totalInvestments + totalSaved);

      setMonthlyData({
        totalIncome,
        investments: totalInvestments,
        savings: totalSaved,
        spending: totalSpending,
        remaining: Math.max(0, remaining),
      });

      setSavingsGoal(savingsData);

      setBudgetSettings({
        investments: totalInvestments,
        savings: totalSaved,
        spending: totalSpending,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalNetWorth = monthlyData.investments + monthlyData.savings;

  const investmentPercent = (budgetSettings.investments / monthlyData.totalIncome) * 100 || 0;
  const savingsPercent = (budgetSettings.savings / monthlyData.totalIncome) * 100 || 0;
  const spendingPercent = (budgetSettings.spending / monthlyData.totalIncome) * 100 || 0;
  const totalAllocated = budgetSettings.investments + budgetSettings.savings + budgetSettings.spending;
  const isOverBudget = totalAllocated > monthlyData.totalIncome;

  const handleBudgetChange = (category, value) => {
    setBudgetSettings(prev => ({
      ...prev,
      [category]: parseInt(value) || 0
    }));
  };

  const saveBudget = async () => {
    if (totalAllocated > monthlyData.totalIncome) {
      alert(`Budget exceeds income!`);
      return;
    }
    setShowBudgetModal(false);
    alert('Budget saved!');
  };

  if (loading) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader />
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Monthly Overview</h1>
            <p className="text-gray-600 text-sm">
              {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => setShowBudgetModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
          >
            <Edit2 className="w-4 h-4" />
            Set Budget
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 mb-8 border border-blue-200">
          <h2 className="text-gray-600 text-sm font-medium mb-2">Total Monthly Income</h2>
          <p className="text-5xl font-bold text-blue-900">
            KES {monthlyData.totalIncome.toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Total Net Worth</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-4xl font-bold text-green-900">
              KES {totalNetWorth.toLocaleString()}
            </p>
            <p className="text-green-700 text-xs mt-2">Investments + Savings</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Remaining Budget</h3>
            <p className="text-4xl font-bold text-purple-900">
              KES {monthlyData.remaining.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h3 className="text-gray-700 font-semibold text-sm mb-4">Investments</h3>
            <p className="text-3xl font-bold text-gray-900">
              KES {monthlyData.investments.toLocaleString()}
            </p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full" 
                style={{ width: `${Math.min(investmentPercent, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h3 className="text-gray-700 font-semibold text-sm mb-4">Savings</h3>
            <p className="text-3xl font-bold text-gray-900">
              KES {monthlyData.savings.toLocaleString()}
            </p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-teal-600 h-2 rounded-full" 
                style={{ width: `${Math.min(savingsPercent, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h3 className="text-gray-700 font-semibold text-sm mb-4">Spending</h3>
            <p className="text-3xl font-bold text-gray-900">
              KES {monthlyData.spending.toLocaleString()}
            </p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full" 
                style={{ width: `${Math.min(spendingPercent, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {Object.keys(spendingBreakdown).length > 0 && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(spendingBreakdown).map(([category, amount]) => (
                <div key={category} className="text-center">
                  <p className="text-gray-600 text-sm capitalize">{category}</p>
                  <p className="text-xl font-bold text-gray-900">KES {amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={() => window.location.href = '/history'}
          className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
        >
          View All Transactions
        </button>
      </div>

      {showBudgetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Set Monthly Budget</h2>
            
            {isOverBudget && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">Budget exceeds income!</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <input
                type="number"
                placeholder="Investments"
                value={budgetSettings.investments}
                onChange={(e) => handleBudgetChange('investments', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                placeholder="Savings"
                value={budgetSettings.savings}
                onChange={(e) => handleBudgetChange('savings', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                placeholder="Spending"
                value={budgetSettings.spending}
                onChange={(e) => handleBudgetChange('spending', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBudgetModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveBudget}
                disabled={isOverBudget}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg disabled:bg-gray-400"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}