import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const useFinanceData = (user) => {
  const [earnings, setEarnings] = useState([]);
  const [spending, setSpending] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [spendingJars, setSpendingJars] = useState([]);
  const [monthlyBudgets, setMonthlyBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchEarnings(),
      fetchSpending(),
      fetchSavingsGoals(),
      fetchInvestments(),
      fetchIdeas(),
      fetchReminders(),
      fetchSpendingJars(),
    ]);
    setLoading(false);
  };

  // EARNINGS
  const fetchEarnings = async () => {
    const { data, error } = await supabase
      .from('earnings')
      .select('*')
      .order('date', { ascending: false });
    if (!error) setEarnings(data);
  };

  const addEarning = async (source, amount, date, category) => {
    const { data, error } = await supabase
      .from('earnings')
      .insert([{ user_id: user.id, source, amount, date, category }])
      .select();
    if (!error) setEarnings([...earnings, ...data]);
  };

  const deleteEarning = async (id) => {
    const { error } = await supabase.from('earnings').delete().eq('id', id);
    if (!error) setEarnings(earnings.filter(e => e.id !== id));
  };

  // SPENDING
  const fetchSpending = async () => {
    const { data, error } = await supabase
      .from('spending')
      .select('*')
      .order('date', { ascending: false });
    if (!error) setSpending(data);
  };

  const addSpending = async (merchant, amount, date, category) => {
    const { data, error } = await supabase
      .from('spending')
      .insert([{ user_id: user.id, merchant, amount, date, category }])
      .select();
    if (!error) setSpending([...spending, ...data]);
  };

  const deleteSpending = async (id) => {
    const { error } = await supabase.from('spending').delete().eq('id', id);
    if (!error) setSpending(spending.filter(s => s.id !== id));
  };

  // SAVINGS GOALS
  const fetchSavingsGoals = async () => {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setSavingsGoals(data);
  };

  const addSavingsGoal = async (name, target, deadline) => {
    const { data, error } = await supabase
      .from('savings_goals')
      .insert([{ user_id: user.id, name, target, saved: 0, deadline }])
      .select();
    if (!error) setSavingsGoals([...savingsGoals, ...data]);
  };

  const deleteSavingsGoal = async (id) => {
    const { error } = await supabase.from('savings_goals').delete().eq('id', id);
    if (!error) setSavingsGoals(savingsGoals.filter(g => g.id !== id));
  };

  // SPENDING JARS
  const fetchSpendingJars = async () => {
    const { data, error } = await supabase
      .from('spending_jars')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setSpendingJars(data);
  };

  const addSpendingJar = async (name, target, color) => {
    const { data, error } = await supabase
      .from('spending_jars')
      .insert([{ user_id: user.id, name, target, allocated: 0, color }])
      .select();
    if (!error) setSpendingJars([...spendingJars, ...data]);
  };

  const updateSpendingJarAllocated = async (jarId, allocatedAmount) => {
    const { data, error } = await supabase
      .from('spending_jars')
      .update({ allocated: allocatedAmount })
      .eq('id', jarId)
      .select();
    if (!error) setSpendingJars(spendingJars.map(jar => jar.id === jarId ? { ...jar, allocated: allocatedAmount } : jar));
  };

  const deleteSpendingJar = async (id) => {
    const { error } = await supabase.from('spending_jars').delete().eq('id', id);
    if (!error) setSpendingJars(spendingJars.filter(jar => jar.id !== id));
  };

  // INVESTMENTS
  const fetchInvestments = async () => {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .order('date', { ascending: false });
    if (!error) setInvestments(data);
  };

  const addInvestment = async (name, amount, date) => {
    const { data, error } = await supabase
      .from('investments')
      .insert([{ user_id: user.id, name, amount, current_value: amount, return_percentage: 0, date }])
      .select();
    if (!error) setInvestments([...investments, ...data]);
  };

  const deleteInvestment = async (id) => {
    const { error } = await supabase.from('investments').delete().eq('id', id);
    if (!error) setInvestments(investments.filter(i => i.id !== id));
  };

  // IDEAS
  const fetchIdeas = async () => {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .order('date', { ascending: false });
    if (!error) setIdeas(data);
  };

  const addIdea = async (title, description) => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('ideas')
      .insert([{ user_id: user.id, title, description, date: today }])
      .select();
    if (!error) setIdeas([...ideas, ...data]);
  };

  const deleteIdea = async (id) => {
    const { error } = await supabase.from('ideas').delete().eq('id', id);
    if (!error) setIdeas(ideas.filter(i => i.id !== id));
  };


  // MONTHLY BUDGETS
  const fetchMonthlyBudgets = async (month) => {
    const { data, error } = await supabase
      .from('monthly_budgets')
      .select('*')
      .eq('month', month)
      .eq('user_id', user.id);
    if (!error) setMonthlyBudgets(data);
  };

  const setMonthlyBudget = async (month, category, amount) => {
    // Upsert: insert or update
    const { data, error } = await supabase
      .from('monthly_budgets')
      .upsert({ user_id: user.id, month, category, budgeted_amount: amount }, { onConflict: ['user_id', 'month', 'category'] })
      .select();
    if (!error) {
      setMonthlyBudgets(prev => {
        const existingIndex = prev.findIndex(b => b.month === month && b.category === category);
        if (existingIndex !== -1) {
          const newArray = [...prev];
          newArray[existingIndex] = { ...data[0] };
          return newArray;
        } else {
          return [...prev, ...data];
        }
      });
    }
  };

  const deleteMonthlyBudget = async (id) => {
    const { error } = await supabase.from('monthly_budgets').delete().eq('id', id);
    if (!error) setMonthlyBudgets(monthlyBudgets.filter(budget => budget.id !== id));
  };

  // Helper to get budget vs actual for a given month and category
  const getBudgetVsActual = (month, category) => {
    const budgetItem = monthlyBudgets.find(b => b.month === month && b.category === category);
    const budgeted = budgetItem ? budgetItem.budgeted_amount : 0;
    // Calculate actual spending for this month and category from spending data
    const actual = spending.reduce((sum, s) => {
      if (getYearMonth(s.date) === month && s.category === category) {
        return sum + parseFloat(s.amount);
      }
      return sum;
    }, 0);
    return { budgeted, actual };
  };

  // REMINDERS
  const fetchReminders = async () => {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('date', { ascending: false });
    if (!error) setReminders(data);
  };

  const addReminder = async (title, amount, date, frequency) => {
    const { data, error } = await supabase
      .from('reminders')
      .insert([{ user_id: user.id, title, amount, date, frequency }])
      .select();
    if (!error) setReminders([...reminders, ...data]);
  };

  const deleteReminder = async (id) => {
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    if (!error) setReminders(reminders.filter(r => r.id !== id));
  };

  // Helper function to get YYYY-MM format from date string
  const getYearMonth = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  return {
    earnings, addEarning, deleteEarning,
    spending, addSpending, deleteSpending,
    savingsGoals, addSavingsGoal, deleteSavingsGoal,
    investments, addInvestment, deleteInvestment,
    ideas, addIdea, deleteIdea,
    reminders, addReminder, deleteReminder,
    spendingJars, addSpendingJar, updateSpendingJarAllocated, deleteSpendingJar,
    monthlyBudgets, setMonthlyBudget, getBudgetVsActual, deleteMonthlyBudget,
    loading,
    fetchAllData,
  };
};

export default useFinanceData;