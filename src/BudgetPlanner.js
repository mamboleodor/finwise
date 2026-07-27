import React, { useState } from 'react';
import { StatCard, Card, ProgressBar } from './components';

const PREDEFINED_CATEGORIES = [
  { name: 'Food & Dining', icon: '🍽️' },
  { name: 'Transportation', icon: '🚗' },
  { name: 'Housing', icon: '🏠' },
  { name: 'Utilities', icon: '💡' },
  { name: 'Entertainment', icon: '🎬' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Healthcare', icon: '🏥' },
  { name: 'Education', icon: '📚' },
  { name: 'Travel', icon: '✈️' },
  { name: 'Personal Care', icon: '💆‍♀️' },
  { name: 'Gifts & Donations', icon: '🎁' },
  { name: 'Other', icon: '❓' }
];

const BudgetPlanner = ({ spendingJars, addSpendingJar, updateSpendingJarAllocated, deleteSpendingJar, spending, getBudgetVsActual }) => {
  const [showAddJarModal, setShowAddJarModal] = useState(false);
  const [jarName, setJarName] = useState('');
  const [jarTarget, setJarTarget] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [jarColor, setJarColor] = useState('#194342');

  const handleAddJar = async () => {
    if (!jarName || !jarTarget) return;
    await addSpendingJar(jarName, parseFloat(jarTarget), jarColor);
    setJarName('');
    setJarTarget('');
    setSelectedCategory('');
    setJarColor('#194342');
    setShowAddJarModal(false);
  };

  const handleJarAllocation = async (jarId, amount) => {
    await updateSpendingJarAllocated(jarId, parseFloat(amount));
  };

  const handleDeleteJar = async (id) => {
    await deleteSpendingJar(id);
  };

  // Calculate total allocated vs total spent for each category
  const getJarStatus = () => {
    return spendingJars.map(jar => {
      // Calculate actual spending for this jar's category
      const spent = spending.reduce((sum, item) => {
        if (item.category === jar.name) {
          return sum + parseFloat(item.amount);
        }
        return sum;
      }, 0);

      return {
        ...jar,
        spent,
        remaining: jar.allocated - spent,
        progress: jar.allocated > 0 ? (spent / jar.allocated) * 100 : 0
      };
    });
  };

  const jarStatus = getJarStatus();

  return (
    <div style={{ padding: '24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#194342', marginBottom: '24px' }}>
        Budget Planner & Spending Jars
      </h1>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <StatCard label="Total Budgets" amount={jarStatus.reduce((sum, jar) => sum + jar.allocated, 0)} color="#378ADD" />
        <StatCard label="Total Spent" amount={jarStatus.reduce((sum, jar) => sum + jar.spent, 0)} color="#E24B4A" />
        <StatCard label="Remaining" amount={jarStatus.reduce((sum, jar) => sum + jar.remaining, 0)} color="#1D9E75" />
        <StatCard label="Active Jars" amount={jarStatus.filter(j => j.allocated > 0).length} color="#639922" />
      </div>

      {/* Add Jar Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#194342' }}>Your Budget Jars</h2>
        <button
          onClick={() => setShowAddJarModal(true)}
          style={{
            padding: '10px 20px',
            background: '#194342',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          + Add Jar
        </button>
      </div>

      {/* Jars Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {jarStatus.length > 0 ? jarStatus.map(jar => (
          <div key={jar.id} style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #E0E0E0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{PREDEFINED_CATEGORIES.find(cat => cat.name === jar.name)?.icon || '📦'}</span>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#194342' }}>{jar.name}</h3>
              </div>
              <button
                onClick={() => handleDeleteJar(jar.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#E24B4A',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', color: '#666666', marginBottom: '4px' }}>
                Allocated: KES {jar.allocated.toLocaleString()}
              </p>
              <ProgressBar
                value={Math.min(jar.spent, jar.allocated)}
                max={jar.allocated}
                style={{ height: '8px' }}
              />
              <p style={{
                fontSize: '12px',
                color: jar.spent > jar.allocated ? '#E24B4A' : '#666666',
                marginTop: '4px',
                textAlign: 'right'
              }}>
                {jar.spent > jar.allocated
                  ? `Overspent by KES ${(jar.spent - jar.allocated).toLocaleString()}`
                  : `Remaining: KES ${jar.remaining.toLocaleString()}`}
              </p>
            </div>

            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f5f5f5' }}>
              <p style={{ fontSize: '12px', color: '#666666', marginBottom: '8px' }}>
                Spend against this jar:
              </p>
              <input
                type="number"
                placeholder="Add amount"
                style={{
                  width: '70%',
                  padding: '8px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '4px',
                  fontSize: '13px',
                  marginRight: '8px'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleJarAllocation(jar.id, e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <button
                onClick={() => handleJarAllocation(jar.id, prompt('Enter amount to add to this jar:'))}
                style={{
                  padding: '8px 12px',
                  background: '#f5f5f5',
                  border: '1px solid #E0E0E0',
                  borderRadius: '4px',
                  color: '#194342',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Add
              </button>
            </div>
          </div>
        )) : (
          <p style={{
            textAlign: 'center',
            color: '#666666',
            fontSize: '16px',
            padding: '40px 0'
          }}>
            No budget jars created yet. Click "Add Jar" to get started!
          </p>
        )}
      </div>

      {/* Add Jar Modal */}
      {showAddJarModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <h2 style={{
              marginTop: 0,
              marginBottom: '20px',
              color: '#194342',
              fontSize: '20px',
              textAlign: 'center'
            }}>
              Add New Budget Jar
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#194342' }}>
                Jar Name:
              </label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  if (e.target.value) {
                    setJarName(e.target.value);
                    // Set default color based on category
                    const categoryIndex = PREDEFINED_CATEGORIES.findIndex(cat => cat.name === e.target.value);
                    const colors = ['#194342', '#1D9E75', '#639922', '#E24B4A', '#378ADD', '#f5f5f5'];
                    setJarColor(colors[categoryIndex % colors.length]);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
              >
                <option value="">-- Select a category --</option>
                {PREDEFINED_CATEGORIES.map(category => (
                  <option key={category.name} value={category.name}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#194342' }}>
                Or enter custom name:
              </label>
              <input
                type="text"
                value={!selectedCategory ? jarName : ''}
                onChange={(e) => {
                  if (!selectedCategory) setJarName(e.target.value);
                  if (e.target.value) {
                    setSelectedCategory('');
                    setJarColor('#194342'); // Default color for custom
                  }
                }}
                placeholder="Enter jar name (e.g., Vacation Fund)"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#194342' }}>
                Target Amount (KES):
              </label>
              <input
                type="number"
                value={jarTarget}
                onChange={(e) => setJarTarget(e.target.value)}
                placeholder="Enter target amount"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#194342' }}>
                Jar Color:
              </label>
              <input
                type="color"
                value={jarColor}
                onChange={(e) => setJarColor(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button
                onClick={() => setShowAddJarModal(false)}
                style={{
                  padding: '10px 20px',
                  background: '#f5f5f5',
                  color: '#194342',
                  border: '1px solid #E0E0E0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddJar}
                style={{
                  padding: '10px 20px',
                  background: '#194342',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Add Jar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPlanner;