import React from 'react';
import { StatCard, Card, ProgressBar } from './components';

const Dashboard = ({ balance, totalEarnings, totalSpending, savingsGoals, spending, reminders, onAddReminder }) => {
  return (
    <div style={{ padding: '24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ borderRadius: '12px', padding: '32px', color: 'white', marginBottom: '24px', background: 'linear-gradient(135deg, #194342 0%, #1D9E75 100%)' }}>
        <p style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>Total Balance</p>
        <p style={{ fontSize: '36px', fontWeight: '600', marginBottom: '8px' }}>KES {balance.toLocaleString()}</p>
        <p style={{ fontSize: '12px', opacity: 0.8 }}>This month</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <StatCard label="Earned" amount={totalEarnings} color="#639922" />
        <StatCard label="Spent" amount={totalSpending} color="#E24B4A" />
        <StatCard label="Saved" amount={savingsGoals.reduce((sum, g) => sum + parseFloat(g.saved || 0), 0)} color="#1D9E75" />
        <StatCard label="Budget" amount={15000} color="#378ADD" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <Card title="Spending by Category">
          {spending.length === 0 ? (
            <p style={{ color: '#666666', fontSize: '13px' }}>No spending recorded yet</p>
          ) : (
            spending.slice(0, 4).map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '13px', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ color: '#666666' }}>{s.category}</span>
                <span style={{ color: '#194342', fontWeight: '500' }}>KES {parseFloat(s.amount).toLocaleString()}</span>
              </div>
            ))
          )}
        </Card>

        <Card title="Top Savings Goal">
          {savingsGoals.length === 0 ? (
            <p style={{ color: '#666666', fontSize: '13px' }}>No savings goals yet</p>
          ) : (
            <div>
              <p style={{ fontWeight: '600', color: '#194342', margin: '0 0 8px', fontSize: '14px' }}>{savingsGoals[0].name}</p>
              <ProgressBar value={savingsGoals[0].saved} max={savingsGoals[0].target} />
              <p style={{ fontSize: '11px', color: '#666666', marginTop: '8px' }}>KES {parseFloat(savingsGoals[0].saved).toLocaleString()} of KES {parseFloat(savingsGoals[0].target).toLocaleString()}</p>
            </div>
          )}
        </Card>

        <Card title="Recent Transactions">
          {spending.length === 0 ? (
            <p style={{ color: '#666666', fontSize: '13px' }}>No transactions yet</p>
          ) : (
            spending.slice(0, 3).map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '12px' }}>
                <span style={{ color: '#666666' }}>{s.merchant}</span>
                <span style={{ color: '#E24B4A' }}>-KES {parseFloat(s.amount).toLocaleString()}</span>
              </div>
            ))
          )}
        </Card>
      </div>

      <Card title="Smart Reminders" style={{ marginTop: '16px' }}>
        <button onClick={onAddReminder} style={{ marginBottom: '12px', padding: '8px 16px', background: '#f5f5f5', border: '1px solid #E0E0E0', borderRadius: '8px', color: '#194342', cursor: 'pointer', fontSize: '13px' }}>+ Add Reminder</button>
        {reminders.length === 0 ? (
          <p style={{ color: '#666666', fontSize: '13px' }}>No reminders yet</p>
        ) : (
          reminders.map(r => (
            <div key={r.id} style={{ background: 'rgba(218, 232, 179, 0.3)', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
              <p style={{ fontWeight: '600', color: '#194342', margin: 0 }}>{r.title}</p>
              <p style={{ fontSize: '11px', color: '#666666', marginTop: '4px' }}>Next: {r.date} ({r.frequency})</p>
            </div>
          ))
        )}
      </Card>
    </div>
  );
};

export default Dashboard;