import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from './supabaseClient';

const COLORS = {
  Food: '#E24B4A',
  Transport: '#BA7517',
  Health: '#1D9E75',
  Entertainment: '#7F77DD',
  Utilities: '#378ADD',
  Other: '#639922',
};

const InsightsPage = ({ user }) => {
  const [spending, setSpending] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [jars, setJars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth());
  const [activeYear] = useState(new Date().getFullYear());

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [spendingRes, earningsRes, jarsRes] = await Promise.all([
      supabase.from('spending').select('*').order('date', { ascending: false }),
      supabase.from('earnings').select('*').order('date', { ascending: false }),
      supabase.from('spending_jars').select('*'),
    ]);
    if (!spendingRes.error) setSpending(spendingRes.data);
    if (!earningsRes.error) setEarnings(earningsRes.data);
    if (!jarsRes.error) setJars(jarsRes.data);
    setLoading(false);
  };

  const filteredSpending = spending.filter(s => {
    const date = new Date(s.date);
    return date.getMonth() === activeMonth && date.getFullYear() === activeYear;
  });

  const filteredEarnings = earnings.filter(e => {
    const date = new Date(e.date);
    return date.getMonth() === activeMonth && date.getFullYear() === activeYear;
  });

  const totalSpending = filteredSpending.reduce((sum, s) => sum + parseFloat(s.amount), 0);
  const totalEarnings = filteredEarnings.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const savings = totalEarnings - totalSpending;

  const spendingByCategory = filteredSpending.reduce((acc, s) => {
    const existing = acc.find(c => c.name === s.category);
    if (existing) existing.value += parseFloat(s.amount);
    else acc.push({ name: s.category, value: parseFloat(s.amount) });
    return acc;
  }, []);

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      name: MONTHS[d.getMonth()],
      month: d.getMonth(),
      year: d.getFullYear(),
    };
  }).map(m => {
    const monthSpending = spending
      .filter(s => {
        const date = new Date(s.date);
        return date.getMonth() === m.month && date.getFullYear() === m.year;
      })
      .reduce((sum, s) => sum + parseFloat(s.amount), 0);

    const monthEarnings = earnings
      .filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === m.month && date.getFullYear() === m.year;
      })
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    return { name: m.name, Spending: monthSpending, Earnings: monthEarnings };
  });

  if (loading) return <div style={{ padding: '40px', color: '#666666' }}>Loading insights...</div>;

  return (
    <div style={{ padding: '24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: '800', color: '#194342', margin: '0 0 4px', letterSpacing: '-1px' }}>
          Visual Insights
        </h1>
        <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>Deep analysis of your finances</p>
      </div>

      {/* Month Selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {MONTHS.map((month, idx) => (
          <button
            key={month}
            onClick={() => setActiveMonth(idx)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: `1px solid ${activeMonth === idx ? '#194342' : '#E0E0E0'}`,
              background: activeMonth === idx ? '#194342' : 'white',
              color: activeMonth === idx ? 'white' : '#666666',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: activeMonth === idx ? '600' : '400',
            }}
          >
            {month}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <SummaryCard label="Total Earned" amount={totalEarnings} color="#639922" />
        <SummaryCard label="Total Spent" amount={totalSpending} color="#E24B4A" />
        <SummaryCard label="Net Savings" amount={savings} color={savings >= 0 ? '#1D9E75' : '#E24B4A'} />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Donut Chart */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E0E0E0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#194342', margin: '0 0 20px' }}>
            Spending by Category
          </h3>
          {spendingByCategory.length === 0 ? (
            <p style={{ color: '#666666', fontSize: '13px' }}>No spending data for this month</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={spendingByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {spendingByCategory.map((entry, index) => (
                      <Cell key={index} fill={COLORS[entry.name] || '#194342'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `KES ${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px' }}>
                {spendingByCategory.map((cat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[cat.name] || '#194342' }} />
                    <span style={{ fontSize: '12px', color: '#666666' }}>{cat.name}</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#194342' }}>
                      {Math.round((cat.value / totalSpending) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bar Chart */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E0E0E0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#194342', margin: '0 0 20px' }}>
            Earnings vs Spending (6 months)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={last6Months}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `KES ${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="Earnings" fill="#639922" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Spending" fill="#E24B4A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Spending Jars */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E0E0E0', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#194342', margin: 0 }}>Spending Jars</h3>
        </div>

        {jars.length === 0 ? (
          <div>
            <p style={{ color: '#666666', fontSize: '13px', marginBottom: '16px' }}>No spending jars yet. Set up your jars to manage your money better.</p>
            <DefaultJars user={user} onJarsCreated={fetchData} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {jars.map(jar => (
              <JarCard key={jar.id} jar={jar} />
            ))}
          </div>
        )}
      </div>

      {/* Category Breakdown Table */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E0E0E0' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#194342', margin: '0 0 20px' }}>
          Category Breakdown
        </h3>
        {spendingByCategory.length === 0 ? (
          <p style={{ color: '#666666', fontSize: '13px' }}>No spending data for this month</p>
        ) : (
          <div>
            {spendingByCategory.sort((a, b) => b.value - a.value).map((cat, idx) => (
              <div key={idx} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#194342' }}>{cat.name}</span>
                  <span style={{ fontSize: '13px', color: '#666666' }}>KES {cat.value.toLocaleString()} ({Math.round((cat.value / totalSpending) * 100)}%)</span>
                </div>
                <div style={{ height: '8px', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(cat.value / totalSpending) * 100}%`, background: COLORS[cat.name] || '#194342', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ label, amount, color }) => (
  <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #E0E0E0' }}>
    <p style={{ fontSize: '12px', color: '#666666', margin: '0 0 8px' }}>{label}</p>
    <p style={{ fontSize: '28px', fontWeight: '700', color, margin: 0 }}>KES {parseFloat(amount).toLocaleString()}</p>
  </div>
);

const JarCard = ({ jar }) => {
  const percentage = jar.allocated > 0 ? Math.min((jar.spent / jar.allocated) * 100, 100) : 0;
  const remaining = jar.allocated - jar.spent;

  return (
    <div style={{ background: '#f5f5f5', borderRadius: '12px', padding: '20px', border: `2px solid ${jar.color}20` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: jar.color }} />
        <p style={{ fontWeight: '600', color: '#194342', margin: 0, fontSize: '14px' }}>{jar.name}</p>
      </div>
      <p style={{ fontSize: '22px', fontWeight: '700', color: jar.color, margin: '0 0 4px' }}>
        KES {parseFloat(jar.spent).toLocaleString()}
      </p>
      <p style={{ fontSize: '11px', color: '#666666', margin: '0 0 12px' }}>
        of KES {parseFloat(jar.allocated).toLocaleString()} allocated
      </p>
      <div style={{ height: '6px', background: '#E0E0E0', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
        <div style={{ height: '100%', width: `${percentage}%`, background: jar.color, borderRadius: '3px' }} />
      </div>
      <p style={{ fontSize: '11px', color: remaining >= 0 ? '#1D9E75' : '#E24B4A', margin: 0 }}>
        {remaining >= 0 ? `KES ${remaining.toLocaleString()} remaining` : `KES ${Math.abs(remaining).toLocaleString()} over budget`}
      </p>
    </div>
  );
};

const DefaultJars = ({ user, onJarsCreated }) => {
  const [creating, setCreating] = useState(false);

  const defaultJars = [
    { name: 'Necessities', allocated: 0, color: '#194342' },
    { name: 'Food', allocated: 0, color: '#E24B4A' },
    { name: 'Transport', allocated: 0, color: '#BA7517' },
    { name: 'Entertainment', allocated: 0, color: '#7F77DD' },
    { name: 'Savings', allocated: 0, color: '#1D9E75' },
    { name: 'Health', allocated: 0, color: '#378ADD' },
  ];

  const createDefaultJars = async () => {
    setCreating(true);
    await supabase.from('spending_jars').insert(
      defaultJars.map(jar => ({ ...jar, user_id: user.id, spent: 0, is_custom: false }))
    );
    setCreating(false);
    onJarsCreated();
  };

  return (
    <button
      onClick={createDefaultJars}
      disabled={creating}
      style={{ padding: '12px 24px', background: '#194342', color: '#dae8b3', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}
    >
      {creating ? 'Setting up...' : 'Set up default jars'}
    </button>
  );
};

export default InsightsPage;