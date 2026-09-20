import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const WEEKS = [1, 2, 3, 4];

const inputStyle = { padding: '10px 12px', border: '1px solid #E0E0E0', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' };
const saveButtonStyle = { padding: '10px 16px', background: '#194342', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', width: '100%', marginTop: '8px', fontSize: '13px' };

const Card = ({ title, children, style }) => (
  <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #E0E0E0', ...style }}>
    {title && <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#194342', margin: '0 0 12px' }}>{title}</h3>}
    {children}
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#194342', margin: 0 }}>{title}</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999999' }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

export default function MealPlanPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('meal_plan_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('week_number', { ascending: true });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching meal plan entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async (payload) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (editingEntry) {
        const { error } = await supabase
          .from('meal_plan_entries')
          .update(payload)
          .eq('id', editingEntry.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('meal_plan_entries')
          .insert([{ ...payload, user_id: user.id }]);
        if (error) throw error;
      }
      setShowForm(false);
      setEditingEntry(null);
      await fetchEntries();
    } catch (error) {
      console.error('Error saving meal plan entry:', error);
      alert('Could not save. That day may already exist for this week — try editing it instead.');
    }
  };

  const deleteEntry = async (id) => {
    try {
      const { error } = await supabase
        .from('meal_plan_entries')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchEntries();
    } catch (error) {
      console.error('Error deleting meal plan entry:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666666', fontSize: '14px' }}>
        Loading your meal plan...
      </div>
    );
  }

  const weekEntries = entries.filter((e) => e.week_number === activeWeek);
  const orderedWeekEntries = DAYS
    .map((d) => weekEntries.find((e) => e.day === d))
    .filter(Boolean);

  return (
    <div style={{ padding: '24px 40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#194342', marginBottom: '8px' }}>Meal Planning</h1>
      <p style={{ fontSize: '12px', color: '#666666', marginBottom: '24px' }}>Plan your meals week by week</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {WEEKS.map((w) => (
          <button
            key={w}
            onClick={() => setActiveWeek(w)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #E0E0E0',
              background: activeWeek === w ? '#194342' : 'white',
              color: activeWeek === w ? 'white' : '#194342',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
            }}
          >
            Week {w}
          </button>
        ))}
      </div>

      <button
        onClick={() => { setEditingEntry(null); setShowForm(true); }}
        style={{ marginBottom: '16px', padding: '10px 20px', background: '#f5f5f5', border: '1px solid #E0E0E0', borderRadius: '8px', color: '#194342', cursor: 'pointer', fontSize: '13px' }}
      >
        + Add Day
      </button>

      <Card>
        {orderedWeekEntries.length === 0 ? (
          <p style={{ color: '#666666', fontSize: '13px' }}>No meals planned for Week {activeWeek} yet</p>
        ) : (
          orderedWeekEntries.map((entry) => (
            <div key={entry.id} style={{ padding: '14px 0', borderBottom: '1px solid #f5f5f5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <p style={{ fontWeight: '600', color: '#194342', margin: 0, fontSize: '14px' }}>{entry.day}</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => { setEditingEntry(entry); setShowForm(true); }}
                    style={{ background: 'none', border: 'none', color: '#194342', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    style={{ background: 'none', border: 'none', color: '#E24B4A', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '12px' }}>
                <div>
                  <p style={{ color: '#666666', margin: '0 0 2px' }}>Breakfast</p>
                  <p style={{ color: '#194342', margin: 0 }}>{entry.breakfast || '—'}</p>
                </div>
                <div>
                  <p style={{ color: '#666666', margin: '0 0 2px' }}>Lunch</p>
                  <p style={{ color: '#194342', margin: 0 }}>{entry.lunch || '—'}</p>
                </div>
                <div>
                  <p style={{ color: '#666666', margin: '0 0 2px' }}>Supper</p>
                  <p style={{ color: '#194342', margin: 0 }}>{entry.supper || '—'}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </Card>

      {showForm && (
        <Modal title={editingEntry ? 'Edit Meal Plan Day' : 'Add Meal Plan Day'} onClose={() => { setShowForm(false); setEditingEntry(null); }}>
          <MealForm
            initial={editingEntry}
            defaultWeek={activeWeek}
            onSave={saveEntry}
            onCancel={() => { setShowForm(false); setEditingEntry(null); }}
          />
        </Modal>
      )}
    </div>
  );
}

const MealForm = ({ initial, defaultWeek, onSave, onCancel }) => {
  const [week_number, setWeek] = useState(initial?.week_number || defaultWeek);
  const [day, setDay] = useState(initial?.day || DAYS[0]);
  const [breakfast, setBreakfast] = useState(initial?.breakfast || '');
  const [lunch, setLunch] = useState(initial?.lunch || '');
  const [supper, setSupper] = useState(initial?.supper || '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <select style={inputStyle} value={week_number} onChange={(e) => setWeek(parseInt(e.target.value, 10))}>
        {WEEKS.map((w) => (
          <option key={w} value={w}>Week {w}</option>
        ))}
      </select>
      <select style={inputStyle} value={day} onChange={(e) => setDay(e.target.value)}>
        {DAYS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <input style={inputStyle} type="text" placeholder="Breakfast" value={breakfast} onChange={(e) => setBreakfast(e.target.value)} />
      <input style={inputStyle} type="text" placeholder="Lunch" value={lunch} onChange={(e) => setLunch(e.target.value)} />
      <input style={inputStyle} type="text" placeholder="Supper" value={supper} onChange={(e) => setSupper(e.target.value)} />
      <button style={saveButtonStyle} onClick={() => onSave({ week_number, day, breakfast, lunch, supper })}>
        Save
      </button>
      <button style={{ ...saveButtonStyle, background: '#f5f5f5', color: '#194342', marginTop: 0 }} onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
};