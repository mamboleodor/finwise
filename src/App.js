import Loader from './components/Loader';
import { Button } from './components/ui/button'
import React, { useState, useEffect } from 'react';
import IdeasPage from './IdeasPage';
import Dashboard from './Dashboard';
import InsightsPage from './InsightsPage';
import BudgetPlanner from './BudgetPlanner';
import './App.css';
import { supabase } from './supabaseClient';
import Auth from './Auth';
import useFinanceData from './useFinanceData';
import MovingOutPage from './MovingOutPage';
import MealPlanPage from './MealPlanPage';

const FinWise = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setIsAuthenticated(true);
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
  };

  if (!isAuthenticated) {
    return <Auth onLogin={(user) => { setUser(user); setIsAuthenticated(true); }} />;
  }

  return <AppContent user={user} onLogout={handleLogout} currentPage={currentPage} setCurrentPage={setCurrentPage} />;
};

const AppContent = ({ user, onLogout, currentPage, setCurrentPage }) => {
  const {
    earnings, addEarning, deleteEarning,
    spending, addSpending, deleteSpending,
    savingsGoals, addSavingsGoal, deleteSavingsGoal,
    investments, addInvestment, deleteInvestment,
    ideas, addIdea, deleteIdea,
    reminders, addReminder, deleteReminder,
    loading,
  } = useFinanceData(user);

  const [showAddEarning, setShowAddEarning] = useState(false);
  const [showAddSpending, setShowAddSpending] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [showAddIdea, setShowAddIdea] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);

  const totalEarnings = earnings.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalSpending = spending.reduce((sum, s) => sum + parseFloat(s.amount), 0);
  const balance = totalEarnings - totalSpending;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '20px', fontWeight: '600', color: '#194342' }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Header user={user} onLogout={onLogout} />

      <div className="flex-1 overflow-y-auto pb-24">
        {currentPage === 'dashboard' && (
          <Dashboard
            balance={balance}
            totalEarnings={totalEarnings}
            totalSpending={totalSpending}
            savingsGoals={savingsGoals}
            spending={spending}
            reminders={reminders}
            onAddReminder={() => setShowAddReminder(true)}
          />
        )}
        {currentPage === 'earnings' && (
          <EarningsPage
            earnings={earnings}
            totalEarnings={totalEarnings}
            onAdd={() => setShowAddEarning(true)}
            onDelete={deleteEarning}
          />
        )}
        {currentPage === 'spending' && (
          <SpendingPage
            spending={spending}
            totalSpending={totalSpending}
            onAdd={() => setShowAddSpending(true)}
            onDelete={deleteSpending}
          />
        )}
        {currentPage === 'savings' && (
          <SavingsPage
            goals={savingsGoals}
            onAdd={() => setShowAddGoal(true)}
            onDelete={deleteSavingsGoal}
          />
        )}
        {currentPage === 'investments' && (
          <InvestmentsPage
            investments={investments}
            onAdd={() => setShowAddInvestment(true)}
            onDelete={deleteInvestment}
          />
        )}
        {currentPage === 'ideas' && (
          <IdeasPage user={user} />
        )}
        {currentPage === 'transactions' && (
          <TransactionsPage spending={spending} earnings={earnings} />
        )}
        {currentPage === 'insights' && (
          <InsightsPage
            earnings={earnings}
            spending={spending}
            savingsGoals={savingsGoals}
          />
        )}
{currentPage === 'movingout' && <MovingOutPage />}
{currentPage === 'mealplan' && <MealPlanPage />}
      </div>

      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />

      {showAddEarning && (
        <Modal title="Add Earnings" onClose={() => setShowAddEarning(false)}>
          <EarningForm onSave={async (source, amount, date, category) => { await addEarning(source, amount, date, category); setShowAddEarning(false); }} onCancel={() => setShowAddEarning(false)} />
        </Modal>
      )}

      {showAddSpending && (
        <Modal title="Log Spending" onClose={() => setShowAddSpending(false)}>
          <SpendingForm onSave={async (merchant, amount, date, category) => { await addSpending(merchant, amount, date, category); setShowAddSpending(false); }} onCancel={() => setShowAddSpending(false)} />
        </Modal>
      )}

      {showAddGoal && (
        <Modal title="Create Savings Goal" onClose={() => setShowAddGoal(false)}>
          <GoalForm onSave={async (name, target, deadline) => { await addSavingsGoal(name, target, deadline); setShowAddGoal(false); }} onCancel={() => setShowAddGoal(false)} />
        </Modal>
      )}

      {showAddInvestment && (
        <Modal title="Add Investment" onClose={() => setShowAddInvestment(false)}>
          <InvestmentForm onSave={async (name, amount, date) => { await addInvestment(name, amount, date); setShowAddInvestment(false); }} onCancel={() => setShowAddInvestment(false)} />
        </Modal>
      )}

      {showAddIdea && (
        <Modal title="Add Idea" onClose={() => setShowAddIdea(false)}>
          <IdeaForm onSave={async (title, description) => { await addIdea(title, description); setShowAddIdea(false); }} onCancel={() => setShowAddIdea(false)} />
        </Modal>
      )}

      {showAddReminder && (
        <Modal title="Add Reminder" onClose={() => setShowAddReminder(false)}>
          <ReminderForm onSave={async (title, amount, date, frequency) => { await addReminder(title, amount, date, frequency); setShowAddReminder(false); }} onCancel={() => setShowAddReminder(false)} />
        </Modal>
      )}
    </div>
  );
};

const Header = ({ user, onLogout }) => (
  <div style={{ background: 'white', borderBottom: '1px solid #E0E0E0', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#194342', margin: 0 }}>FinWise</h1>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <p style={{ fontSize: '14px', fontWeight: '500', color: '#194342', margin: 0 }}>Welcome, {user?.user_metadata?.name || user?.email}</p>
      <button onClick={onLogout} style={{ background: 'none', border: 'none', color: '#194342', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}>Sign out</button>
    </div>
  </div>
);

const StatCard = ({ label, amount, color }) => (
  <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid #E0E0E0' }}>
    <p style={{ fontSize: '11px', color: '#666666', marginBottom: '8px' }}>{label}</p>
    <p style={{ fontSize: '24px', fontWeight: '600', color, margin: 0 }}>KES {parseFloat(amount).toLocaleString()}</p>
  </div>
);

const Card = ({ title, children, style }) => (
  <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #E0E0E0', ...style }}>
    {title && <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#194342', margin: '0 0 12px' }}>{title}</h3>}
    {children}
  </div>
);

const ProgressBar = ({ value, max }) => (
  <div style={{ width: '100%', height: '6px', background: '#E0E0E0', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
    <div style={{ height: '100%', borderRadius: '3px', width: `${Math.min((value / max) * 100, 100)}%`, background: '#1D9E75' }} />
  </div>
);

const EarningsPage = ({ earnings, totalEarnings, onAdd, onDelete }) => (
  <div style={{ padding: '24px 40px', maxWidth: '1000px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#194342', marginBottom: '8px' }}>Earnings</h1>
    <p style={{ fontSize: '12px', color: '#666666', marginBottom: '24px' }}>Track all income sources</p>
    <Card>
      <p style={{ fontSize: '12px', color: '#666666', marginBottom: '8px' }}>This Month Total</p>
      <p style={{ fontSize: '32px', fontWeight: '600', color: '#639922' }}>KES {totalEarnings.toLocaleString()}</p>
    </Card>
    <button onClick={onAdd} style={{ margin: '16px 0', padding: '10px 20px', background: '#f5f5f5', border: '1px solid #E0E0E0', borderRadius: '8px', color: '#194342', cursor: 'pointer', fontSize: '13px' }}>+ Add Earnings</button>
    <Card>
      <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#194342', margin: '0 0 12px' }}>Income Sources</h3>
      {earnings.length === 0 ? (
        <p style={{ color: '#666666', fontSize: '13px' }}>No earnings recorded yet</p>
      ) : (
        earnings.map(e => (
          <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
            <div>
              <p style={{ color: '#194342', fontWeight: '500', margin: '0 0 4px', fontSize: '14px' }}>{e.source}</p>
              <p style={{ color: '#666666', fontSize: '11px', margin: 0 }}>{e.date} | {e.category}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <p style={{ color: '#639922', fontWeight: '500', margin: 0 }}>KES {parseFloat(e.amount).toLocaleString()}</p>
              <button onClick={() => onDelete(e.id)} style={{ background: 'none', border: 'none', color: '#E24B4A', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
            </div>
          </div>
        ))
      )}
    </Card>
  </div>
);

const SpendingPage = ({ spending, totalSpending, onAdd, onDelete }) => (
  <div style={{ padding: '24px 40px', maxWidth: '1000px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#194342', marginBottom: '8px' }}>Spending</h1>
    <p style={{ fontSize: '12px', color: '#666666', marginBottom: '24px' }}>Manage your expenses</p>
    <Card>
      <p style={{ fontSize: '12px', color: '#666666', marginBottom: '8px' }}>This Month Total</p>
      <p style={{ fontSize: '32px', fontWeight: '600', color: '#E24B4A', marginBottom: '12px' }}>KES {totalSpending.toLocaleString()}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '12px', color: '#666666' }}>Budget: KES 15,000</span>
        <span style={{ fontSize: '12px', fontWeight: '500', color: '#194342' }}>{Math.round((totalSpending / 15000) * 100)}%</span>
      </div>
      <ProgressBar value={totalSpending} max={15000} />
    </Card>
    <button onClick={onAdd} style={{ margin: '16px 0', padding: '10px 20px', background: '#f5f5f5', border: '1px solid #E0E0E0', borderRadius: '8px', color: '#194342', cursor: 'pointer', fontSize: '13px' }}>+ Log Spending</button>
    <Card>
      <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#194342', margin: '0 0 12px' }}>Transactions</h3>
      {spending.length === 0 ? (
        <p style={{ color: '#666666', fontSize: '13px' }}>No spending recorded yet</p>
      ) : (
        spending.map(s => (
          <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
            <div>
              <p style={{ color: '#194342', fontWeight: '500', margin: '0 0 4px', fontSize: '14px' }}>{s.merchant}</p>
              <p style={{ color: '#666666', fontSize: '11px', margin: 0 }}>{s.date} | {s.category}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <p style={{ color: '#E24B4A', fontWeight: '500', margin: 0 }}>-KES {parseFloat(s.amount).toLocaleString()}</p>
              <button onClick={() => onDelete(s.id)} style={{ background: 'none', border: 'none', color: '#E24B4A', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
            </div>
          </div>
        ))
      )}
    </Card>
  </div>
);

const SavingsPage = ({ goals, onAdd, onDelete }) => (
  <div style={{ padding: '24px 40px', maxWidth: '1000px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#194342', marginBottom: '8px' }}>Savings Goals</h1>
    <p style={{ fontSize: '12px', color: '#666666', marginBottom: '24px' }}>Build wealth, one goal at a time</p>
    <button onClick={onAdd} style={{ marginBottom: '16px', padding: '10px 20px', background: '#f5f5f5', border: '1px solid #E0E0E0', borderRadius: '8px', color: '#194342', cursor: 'pointer', fontSize: '13px' }}>+ Create Goal</button>
    {goals.length === 0 ? (
      <Card><p style={{ color: '#666666', fontSize: '13px' }}>No savings goals yet</p></Card>
    ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {goals.map(goal => (
          <Card key={goal.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
              <p style={{ fontWeight: '600', color: '#194342', margin: 0, fontSize: '14px' }}>{goal.name}</p>
              <button onClick={() => onDelete(goal.id)} style={{ background: 'none', border: 'none', color: '#E24B4A', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
            </div>
            <p style={{ fontSize: '24px', fontWeight: '600', color: '#1D9E75', margin: '0 0 8px' }}>KES {parseFloat(goal.saved).toLocaleString()}</p>
            <ProgressBar value={goal.saved} max={goal.target} />
            <p style={{ fontSize: '11px', color: '#666666', marginTop: '8px' }}>of KES {parseFloat(goal.target).toLocaleString()}</p>
            <p style={{ fontSize: '11px', color: '#666666', marginTop: '4px' }}>Deadline: {goal.deadline}</p>
          </Card>
        ))}
      </div>
    )}
  </div>
);

const InvestmentsPage = ({ investments, onAdd, onDelete }) => {
  const totalInvested = investments.reduce((sum, i) => sum + parseFloat(i.amount), 0);
  const totalValue = investments.reduce((sum, i) => sum + parseFloat(i.current_value), 0);
  return (
    <div style={{ padding: '24px 40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#194342', marginBottom: '8px' }}>Investments</h1>
      <p style={{ fontSize: '12px', color: '#666666', marginBottom: '24px' }}>Track your growing wealth</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Total Invested" amount={totalInvested} color="#378ADD" />
        <StatCard label="Current Value" amount={totalValue} color="#1D9E75" />
      </div>
      <button onClick={onAdd} style={{ marginBottom: '16px', padding: '10px 20px', background: '#f5f5f5', border: '1px solid #E0E0E0', borderRadius: '8px', color: '#194342', cursor: 'pointer', fontSize: '13px' }}>+ Add Investment</button>
      {investments.length === 0 ? (
        <Card><p style={{ color: '#666666', fontSize: '13px' }}>No investments yet</p></Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {investments.map(inv => (
            <Card key={inv.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <p style={{ fontWeight: '600', color: '#194342', margin: 0, fontSize: '14px' }}>{inv.name}</p>
                <button onClick={() => onDelete(inv.id)} style={{ background: 'none', border: 'none', color: '#E24B4A', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: '#666666' }}>
                <span>Invested</span>
                <span style={{ fontWeight: '500', color: '#194342' }}>KES {parseFloat(inv.amount).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: '#666666' }}>
                <span>Current Value</span>
                <span style={{ fontWeight: '500', color: '#1D9E75' }}>KES {parseFloat(inv.current_value).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666666' }}>
                <span>Return</span>
                <span style={{ fontWeight: '500', color: '#639922' }}>+{inv.return_percentage}%</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const TransactionsPage = ({ spending, earnings }) => {
  const allTransactions = [
    ...earnings.map(e => ({ type: 'earning', ...e })),
    ...spending.map(s => ({ type: 'spending', ...s }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div style={{ padding: '24px 40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#194342', marginBottom: '8px' }}>All Transactions</h1>
      <p style={{ fontSize: '12px', color: '#666666', marginBottom: '24px' }}>View all your activity</p>
      <Card>
        {allTransactions.length === 0 ? (
          <p style={{ color: '#666666', fontSize: '13px' }}>No transactions yet</p>
        ) : (
          allTransactions.map((t, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
              <div>
                <p style={{ color: '#194342', fontWeight: '500', margin: '0 0 4px', fontSize: '14px' }}>{t.source || t.merchant}</p>
                <p style={{ color: '#666666', fontSize: '11px', margin: 0 }}>{t.date}</p>
              </div>
              <p style={{ fontWeight: '500', color: t.type === 'earning' ? '#639922' : '#E24B4A', margin: 0 }}>
                {t.type === 'earning' ? '+' : '-'}KES {parseFloat(t.amount).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </Card>
    </div>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#194342', margin: 0 }}>{title}</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999999' }}>x</button>
      </div>
      {children}
    </div>
  </div>
);

const inputStyle = { padding: '10px 12px', border: '1px solid #E0E0E0', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' };
const saveButtonStyle = { padding: '10px 16px', background: '#194342', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', width: '100%', marginTop: '8px', fontSize: '13px' };

const EarningForm = ({ onSave, onCancel }) => {
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Salary');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <input style={inputStyle} type="text" placeholder="Income source" value={source} onChange={e => setSource(e.target.value)} />
      <input style={inputStyle} type="number" placeholder="Amount (KES)" value={amount} onChange={e => setAmount(e.target.value)} />
      <input style={inputStyle} type="date" value={date} onChange={e => setDate(e.target.value)} />
      <select style={inputStyle} value={category} onChange={e => setCategory(e.target.value)}>
        <option>Salary</option>
        <option>Freelance</option>
        <option>Consulting</option>
        <option>Bonus</option>
        <option>Other</option>
      </select>
      <button style={saveButtonStyle} onClick={() => onSave(source, parseFloat(amount), date, category)}>Save</button>
      <button style={{ ...saveButtonStyle, background: '#f5f5f5', color: '#194342', marginTop: 0 }} onClick={onCancel}>Cancel</button>
    </div>
  );
};

const SpendingForm = ({ onSave, onCancel }) => {
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Food');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <input style={inputStyle} type="number" placeholder="Amount (KES)" value={amount} onChange={e => setAmount(e.target.value)} />
      <select style={inputStyle} value={category} onChange={e => setCategory(e.target.value)}>
        <option>Food</option>
        <option>Transport</option>
        <option>Health</option>
        <option>Entertainment</option>
        <option>Utilities</option>
        <option>Other</option>
      </select>
      <input style={inputStyle} type="text" placeholder="Merchant name" value={merchant} onChange={e => setMerchant(e.target.value)} />
      <input style={inputStyle} type="date" value={date} onChange={e => setDate(e.target.value)} />
      <button style={saveButtonStyle} onClick={() => onSave(merchant, parseFloat(amount), date, category)}>Save</button>
      <button style={{ ...saveButtonStyle, background: '#f5f5f5', color: '#194342', marginTop: 0 }} onClick={onCancel}>Cancel</button>
    </div>
  );
};

const GoalForm = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <input style={inputStyle} type="text" placeholder="Goal name" value={name} onChange={e => setName(e.target.value)} />
      <input style={inputStyle} type="number" placeholder="Target amount (KES)" value={target} onChange={e => setTarget(e.target.value)} />
      <input style={inputStyle} type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
      <button style={saveButtonStyle} onClick={() => onSave(name, parseFloat(target), deadline)}>Create</button>
      <button style={{ ...saveButtonStyle, background: '#f5f5f5', color: '#194342', marginTop: 0 }} onClick={onCancel}>Cancel</button>
    </div>
  );
};

const InvestmentForm = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <input style={inputStyle} type="text" placeholder="Investment name" value={name} onChange={e => setName(e.target.value)} />
      <input style={inputStyle} type="number" placeholder="Amount (KES)" value={amount} onChange={e => setAmount(e.target.value)} />
      <input style={inputStyle} type="date" value={date} onChange={e => setDate(e.target.value)} />
      <button style={saveButtonStyle} onClick={() => onSave(name, parseFloat(amount), date)}>Save</button>
      <button style={{ ...saveButtonStyle, background: '#f5f5f5', color: '#194342', marginTop: 0 }} onClick={onCancel}>Cancel</button>
    </div>
  );
};

const IdeaForm = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <input style={inputStyle} type="text" placeholder="Idea title" value={title} onChange={e => setTitle(e.target.value)} />
      <textarea style={{ ...inputStyle, height: '80px', resize: 'none' }} placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      <button style={saveButtonStyle} onClick={() => onSave(title, description)}>Save</button>
      <button style={{ ...saveButtonStyle, background: '#f5f5f5', color: '#194342', marginTop: 0 }} onClick={onCancel}>Cancel</button>
    </div>
  );
};

const ReminderForm = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [frequency, setFrequency] = useState('Weekly');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <input style={inputStyle} type="text" placeholder="Reminder title" value={title} onChange={e => setTitle(e.target.value)} />
      <input style={inputStyle} type="number" placeholder="Amount (KES) - optional" value={amount} onChange={e => setAmount(e.target.value)} />
      <input style={inputStyle} type="date" value={date} onChange={e => setDate(e.target.value)} />
      <select style={inputStyle} value={frequency} onChange={e => setFrequency(e.target.value)}>
        <option>Daily</option>
        <option>Weekly</option>
        <option>Monthly</option>
      </select>
      <button style={saveButtonStyle} onClick={() => onSave(title, parseFloat(amount) || 0, date, frequency)}>Save</button>
      <button style={{ ...saveButtonStyle, background: '#f5f5f5', color: '#194342', marginTop: 0 }} onClick={onCancel}>Cancel</button>
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
  { id: 'movingout', label: 'Moving' },
  { id: 'mealplan', label: 'Meals' },
  { id: 'ideas', label: 'Ideas' },
  { id: 'insights', label: 'Insights' },
  { id: 'transactions', label: 'History' },
];

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #E0E0E0', display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', zIndex: 50 }}>
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          style={{ padding: '12px 8px', textAlign: 'center', border: 'none', background: 'white', cursor: 'pointer', fontSize: '12px', color: currentPage === item.id ? '#194342' : '#999999', borderTop: currentPage === item.id ? '3px solid #194342' : 'none', fontWeight: currentPage === item.id ? '500' : '400' }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default FinWise;