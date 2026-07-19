import React, { useState } from 'react';
import './App.css';

const FinWise = () => {
  const [screen, setScreen] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  
  const [earnings, setEarnings] = useState([
    { id: 1, source: 'Freelance Project', amount: 15000, date: '2026-07-15', category: 'Freelance' },
    { id: 2, source: 'Consulting', amount: 8500, date: '2026-07-10', category: 'Consulting' },
  ]);
  
  const [spending, setSpending] = useState([
    { id: 1, merchant: 'Carrefour', amount: 5200, date: '2026-07-15', category: 'Food' },
    { id: 2, merchant: 'Uber', amount: 2100, date: '2026-07-14', category: 'Transport' },
    { id: 3, merchant: 'Nairobi Hospital', amount: 1850, date: '2026-07-12', category: 'Health' },
    { id: 4, merchant: 'Cinema City', amount: 1540, date: '2026-07-10', category: 'Entertainment' },
  ]);
  
  const [savingsGoals, setSavingsGoals] = useState([
    { id: 1, name: 'Emergency Fund', target: 100000, saved: 45000, deadline: '2026-12-15' },
    { id: 2, name: 'Vacation', target: 50000, saved: 15000, deadline: '2026-08-20' },
    { id: 3, name: 'New Laptop', target: 75000, saved: 8500, deadline: '2027-03-31' },
  ]);
  
  const [investments, setInvestments] = useState([
    { id: 1, name: 'NSE Index Fund', amount: 50000, currentValue: 52500, return: 5, date: '2026-03-15' },
    { id: 2, name: 'Treasury Bonds', amount: 30000, currentValue: 31200, return: 4, date: '2026-04-20' },
  ]);
  
  const [ideas, setIdeas] = useState([
    { id: 1, title: 'Start side project', description: 'Launch freelance design service', date: '2026-07-10' },
    { id: 2, title: 'Investment opportunity', description: 'Research real estate crowdfunding', date: '2026-07-08' },
  ]);
  
  const [reminders, setReminders] = useState([
    { id: 1, title: 'Save for emergency fund', amount: 5000, date: '2026-07-20', frequency: 'Weekly' },
    { id: 2, title: 'Review spending', date: '2026-08-01', frequency: 'Monthly' },
  ]);
  
  const handleLogin = (email, password, name, income) => {
    setUser({ email, name, monthlyIncome: income });
    setIsAuthenticated(true);
    setScreen('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setScreen('login');
  };

  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
  const totalSpending = spending.reduce((sum, s) => sum + s.amount, 0);
  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.saved, 0);
  const balance = totalEarnings - totalSpending;

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header user={user} onLogout={handleLogout} />
      
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '100px' }}>
        {currentPage === 'dashboard' && (
          <Dashboard 
            balance={balance}
            totalEarnings={totalEarnings}
            totalSpending={totalSpending}
            savingsGoals={savingsGoals}
            spending={spending}
            reminders={reminders}
          />
        )}
        {currentPage === 'earnings' && <EarningsPage earnings={earnings} totalEarnings={totalEarnings} />}
        {currentPage === 'spending' && <SpendingPage spending={spending} totalSpending={totalSpending} />}
        {currentPage === 'savings' && <SavingsPage goals={savingsGoals} />}
        {currentPage === 'investments' && <InvestmentsPage investments={investments} />}
        {currentPage === 'ideas' && <IdeasPage ideas={ideas} />}
        {currentPage === 'transactions' && <TransactionsPage spending={spending} earnings={earnings} />}
      </div>

      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
};

const AuthScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password, name, parseFloat(monthlyIncome) || 0);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, #194342 0%, #1a5451 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ color: 'white' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '600', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Welcome back</h1>
          <p style={{ fontSize: '14px', opacity: 0.8, margin: 0 }}>Access your FinWise dashboard</p>
        </div>
      </div>

      <div style={{ background: '#dae8b3', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ maxWidth: '400px', width: '100%' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '600', margin: '0 0 8px', color: '#194342', letterSpacing: '-0.5px' }}>Start tracking</h1>
          <p style={{ fontSize: '14px', color: '#194342', opacity: 0.8, margin: '0 0 24px' }}>Create your FinWise account</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(25, 67, 66, 0.2)', background: 'rgba(255, 255, 255, 0.5)', color: '#194342', fontSize: '14px' }} required />
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Sarah Omondi" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(25, 67, 66, 0.2)', background: 'rgba(255, 255, 255, 0.5)', color: '#194342', fontSize: '14px' }} required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="•••••••••" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(25, 67, 66, 0.2)', background: 'rgba(255, 255, 255, 0.5)', color: '#194342', fontSize: '14px' }} required />
            <input type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} placeholder="0" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(25, 67, 66, 0.2)', background: 'rgba(255, 255, 255, 0.5)', color: '#194342', fontSize: '14px' }} required />
            <p style={{ fontSize: '11px', color: 'rgba(25, 67, 66, 0.6)', margin: '0' }}>We'll use this to personalize your dashboard</p>
            <button type="submit" style={{ padding: '12px 20px', background: '#194342', color: '#dae8b3', border: 'none', borderRadius: '8px', fontWeight: '500', fontSize: '14px', cursor: 'pointer', marginTop: '8px' }}>Create account</button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Header = ({ user, onLogout }) => (
  <div style={{ background: 'white', borderBottom: '1px solid #E0E0E0', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#194342', margin: 0 }}>FinWise</h1>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <p style={{ fontSize: '14px', fontWeight: '500', color: '#194342', margin: 0 }}>Welcome, {user?.name}</p>
      <button onClick={onLogout} style={{ background: 'none', border: 'none', color: '#194342', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}>Sign out</button>
    </div>
  </div>
);

const Dashboard = ({ balance, totalEarnings, totalSpending, savingsGoals, spending, reminders }) => (
  <div style={{ padding: '24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
    <div style={{ borderRadius: '12px', padding: '32px', color: 'white', marginBottom: '24px', background: 'linear-gradient(135deg, #194342 0%, #1D9E75 100%)' }}>
      <p style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>Total Balance</p>
      <p style={{ fontSize: '36px', fontWeight: '600', marginBottom: '8px' }}>KES {balance.toLocaleString()}</p>
      <p style={{ fontSize: '12px', opacity: 0.8 }}>This month</p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
      <StatCard label="Earned" amount={totalEarnings} color="#639922" />
      <StatCard label="Spent" amount={totalSpending} color="#E24B4A" />
      <StatCard label="Saved" amount={savingsGoals.reduce((sum, g) => sum + g.saved, 0)} color="#1D9E75" />
      <StatCard label="Budget" amount={15000} color="#378ADD" />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
      <Card title="Spending by Category">
        {spending.slice(0, 3).map(s => (
          <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '13px', borderBottom: '1px solid #f5f5f5' }}>
            <span style={{ color: '#666666' }}>{s.category}</span>
            <span style={{ color: '#194342', fontWeight: '500' }}>KES {s.amount.toLocaleString()}</span>
          </div>
        ))}
      </Card>

      <Card title="Top Savings Goal">
        {savingsGoals.length > 0 && (
          <div>
            <p style={{ fontWeight: '600', color: '#194342', margin: '0 0 8px', fontSize: '14px' }}>{savingsGoals[0].name}</p>
            <ProgressBar value={savingsGoals[0].saved} max={savingsGoals[0].target} />
            <p style={{ fontSize: '11px', color: '#666666', marginTop: '8px' }}>KES {savingsGoals[0].saved.toLocaleString()} of KES {savingsGoals[0].target.toLocaleString()}</p>
          </div>
        )}
      </Card>

      <Card title="Recent Transactions">
        {spending.slice(0, 3).map(s => (
          <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '12px' }}>
            <span style={{ color: '#666666' }}>{s.merchant}</span>
            <span style={{ color: '#E24B4A' }}>-KES {s.amount.toLocaleString()}</span>
          </div>
        ))}
      </Card>
    </div>

    <Card title="Smart Reminders" style={{ marginTop: '16px' }}>
      {reminders.map(r => (
        <div key={r.id} style={{ background: 'rgba(218, 232, 179, 0.3)', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
          <p style={{ fontWeight: '600', color: '#194342', margin: 0 }}>{r.title}</p>
          <p style={{ fontSize: '11px', color: '#666666', marginTop: '4px' }}>Next: {r.date} ({r.frequency})</p>
        </div>
      ))}
    </Card>
  </div>
);

const StatCard = ({ label, amount, color }) => (
  <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid #E0E0E0' }}>
    <p style={{ fontSize: '11px', color: '#666666', marginBottom: '8px' }}>{label}</p>
    <p style={{ fontSize: '24px', fontWeight: '600', color, margin: 0 }}>KES {amount.toLocaleString()}</p>
  </div>
);

const Card = ({ title, children, style }) => (
  <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #E0E0E0', ...style }}>
    <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#194342', margin: '0 0 12px' }}>{title}</h3>
    {children}
  </div>
);

const ProgressBar = ({ value, max }) => (
  <div style={{ width: '100%', height: '6px', background: '#E0E0E0', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
    <div style={{ height: '100%', borderRadius: '3px', width: `${(value / max) * 100}%`, background: '#1D9E75' }} />
  </div>
);

const EarningsPage = ({ earnings, totalEarnings }) => (
  <div style={{ padding: '24px 40px', maxWidth: '1000px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#194342', marginBottom: '8px' }}>Earnings</h1>
    <p style={{ fontSize: '12px', color: '#666666', marginBottom: '24px' }}>Track all income sources</p>

    <Card>
      <p style={{ fontSize: '12px', color: '#666666', marginBottom: '8px' }}>This Month Total</p>
      <p style={{ fontSize: '32px', fontWeight: '600', color: '#639922' }}>KES {totalEarnings.toLocaleString()}</p>
    </Card>

    <Card style={{ marginTop: '16px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#194342', margin: '0 0 12px' }}>Income Sources</h3>
      {earnings.map(e => (
        <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
          <div>
            <p style={{ color: '#194342', fontWeight: '500', margin: '0 0 4px', fontSize: '14px' }}>{e.source}</p>
            <p style={{ color: '#666666', fontSize: '11px', margin: 0 }}>{e.date}</p>
          </div>
          <p style={{ color: '#639922', fontWeight: '500' }}>KES {e.amount.toLocaleString()}</p>
        </div>
      ))}
    </Card>
  </div>
);

const SpendingPage = ({ spending, totalSpending }) => (
  <div style={{ padding: '24px 40px', maxWidth: '1000px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#194342', marginBottom: '8px' }}>Spending</h1>
    <p style={{ fontSize: '12px', color: '#666666', marginBottom: '24px' }}>Manage your expenses</p>

    <Card>
      <p style={{ fontSize: '12px', color: '#666666', marginBottom: '8px' }}>This Month Total</p>
      <p style={{ fontSize: '32px', fontWeight: '600', color: '#E24B4A', marginBottom: '12px' }}>KES {totalSpending.toLocaleString()}</p>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', color: '#666666' }}>Budget: KES 15000</span>
          <span style={{ fontSize: '12px', fontWeight: '500', color: '#194342' }}>{Math.round((totalSpending/15000)*100)}%</span>
        </div>
        <ProgressBar value={totalSpending} max={15000} />
      </div>
    </Card>

    <Card style={{ marginTop: '16px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#194342', margin: '0 0 12px' }}>Transactions</h3>
      {spending.map(s => (
        <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
          <div>
            <p style={{ color: '#194342', fontWeight: '500', margin: '0 0 4px', fontSize: '14px' }}>{s.merchant}</p>
            <p style={{ color: '#666666', fontSize: '11px', margin: 0 }}>{s.date}</p>
          </div>
          <p style={{ color: '#E24B4A', fontWeight: '500' }}>-KES {s.amount.toLocaleString()}</p>
        </div>
      ))}
    </Card>
  </div>
);

const SavingsPage = ({ goals }) => (
  <div style={{ padding: '24px 40px', maxWidth: '1000px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#194342', marginBottom: '8px' }}>Savings Goals</h1>
    <p style={{ fontSize: '12px', color: '#666666', marginBottom: '24px' }}>Build wealth, one goal at a time</p>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
      {goals.map(goal => (
        <Card key={goal.id}>
          <p style={{ fontWeight: '600', color: '#194342', margin: '0 0 8px', fontSize: '14px' }}>{goal.name}</p>
          <p style={{ fontSize: '24px', fontWeight: '600', color: '#1D9E75', margin: '0 0 8px' }}>KES {goal.saved.toLocaleString()}</p>
          <ProgressBar value={goal.saved} max={goal.target} />
          <p style={{ fontSize: '11px', color: '#666666', marginTop: '8px' }}>of KES {goal.target.toLocaleString()}</p>
          <p style={{ fontSize: '11px', color: '#666666', marginTop: '8px' }}>Deadline: {goal.deadline}</p>
        </Card>
      ))}
    </div>
  </div>
);

const InvestmentsPage = ({ investments }) => {
  const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0);
  const totalValue = investments.reduce((sum, i) => sum + i.currentValue, 0);

  return (
    <div style={{ padding: '24px 40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#194342', marginBottom: '8px' }}>Investments</h1>
      <p style={{ fontSize: '12px', color: '#666666', marginBottom: '24px' }}>Track your growing wealth</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Total Invested" amount={totalInvested} color="#378ADD" />
        <StatCard label="Current Value" amount={totalValue} color="#1D9E75" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {investments.map(inv => (
          <Card key={inv.id}>
            <p style={{ fontWeight: '600', color: '#194342', margin: '0 0 12px', fontSize: '14px' }}>{inv.name}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: '#666666' }}>
              <span>Invested</span>
              <span style={{ fontWeight: '500', color: '#194342' }}>KES {inv.amount.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: '#666666' }}>
              <span>Current Value</span>
              <span style={{ fontWeight: '500', color: '#1D9E75' }}>KES {inv.currentValue.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666666' }}>
              <span>Return</span>
              <span style={{ fontWeight: '500', color: '#639922' }}>+{inv.return}%</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const IdeasPage = ({ ideas }) => (
  <div style={{ padding: '24px 40px', maxWidth: '1000px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#194342', marginBottom: '8px' }}>Ideas</h1>
    <p style={{ fontSize: '12px', color: '#666666', marginBottom: '24px' }}>Capture financial ideas and opportunities</p>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
      {ideas.map(idea => (
        <Card key={idea.id}>
          <p style={{ fontWeight: '600', color: '#194342', margin: '0 0 4px', fontSize: '14px' }}>{idea.title}</p>
          <p style={{ color: '#666666', fontSize: '13px', margin: '0 0 8px' }}>{idea.description}</p>
          <p style={{ fontSize: '11px', color: '#999999', margin: 0 }}>{idea.date}</p>
        </Card>
      ))}
    </div>
  </div>
);

const TransactionsPage = ({ spending, earnings }) => {
  const allTransactions = [
    ...earnings.map(e => ({ type: 'earning', ...e, amount: e.amount })),
    ...spending.map(s => ({ type: 'spending', ...s, amount: -s.amount }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div style={{ padding: '24px 40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#194342', marginBottom: '8px' }}>All Transactions</h1>
      <p style={{ fontSize: '12px', color: '#666666', marginBottom: '24px' }}>View all your activity</p>

      <Card>
        {allTransactions.map((t, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
            <div>
              <p style={{ color: '#194342', fontWeight: '500', margin: '0 0 4px', fontSize: '14px' }}>{t.source || t.merchant}</p>
              <p style={{ color: '#666666', fontSize: '11px', margin: 0 }}>{t.date}</p>
            </div>
            <p style={{ fontWeight: '500', color: t.type === 'earning' ? '#639922' : '#E24B4A' }}>
              {t.type === 'earning' ? '+' : '-'}KES {Math.abs(t.amount).toLocaleString()}
            </p>
          </div>
        ))}
      </Card>
    </div>
  );
};

const BottomNav = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home' },
    { id: 'earnings', label: 'Earnings' },
    { id: 'spending', label: 'Spending' },
    { id: 'savings', label: 'Savings' },
    { id: 'investments', label: 'Invest' },
    { id: 'ideas', label: 'Ideas' },
    { id: 'transactions', label: 'History' },
  ];

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #E0E0E0', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', zIndex: 50 }}>
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          style={{
            padding: '12px 8px',
            textAlign: 'center',
            border: 'none',
            background: 'white',
            cursor: 'pointer',
            fontSize: '12px',
            color: currentPage === item.id ? '#194342' : '#999999',
            borderTop: currentPage === item.id ? '3px solid #194342' : 'none',
            fontWeight: currentPage === item.id ? '500' : '400',
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default FinWise;