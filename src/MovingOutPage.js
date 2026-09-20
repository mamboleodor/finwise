import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const CATEGORIES = [
  'Living Room / General',
  'Bedroom',
  'Bathroom',
  'Kitchen',
  'Cleaning & Maintenance',
];

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

export default function MovingOutPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('moving_out_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching moving out items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (category, item_name) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('moving_out_items')
        .insert([{ user_id: user.id, category, item_name, is_packed: false }]);
      if (error) throw error;
      await fetchItems();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const updateItem = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('moving_out_items')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
      await fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const deleteItem = async (id) => {
    try {
      const { error } = await supabase
        .from('moving_out_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const toggleChecked = (item) => updateItem(item.id, { is_packed: !item.is_packed });

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666666', fontSize: '14px' }}>
        Loading your moving out list...
      </div>
    );
  }

  const totalCount = items.length;
  const packedCount = items.filter((i) => i.is_packed).length;

  return (
    <div style={{ padding: '24px 40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#194342', marginBottom: '8px' }}>Moving Out List</h1>
      <p style={{ fontSize: '12px', color: '#666666', marginBottom: '24px' }}>Track everything you need for your new place</p>

      <Card style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '12px', color: '#666666', marginBottom: '8px' }}>Progress</p>
        <p style={{ fontSize: '24px', fontWeight: '600', color: '#1D9E75', margin: 0 }}>
          {packedCount} / {totalCount} packed
        </p>
      </Card>

      <button
        onClick={() => { setEditingItem(null); setShowForm(true); }}
        style={{ marginBottom: '16px', padding: '10px 20px', background: '#f5f5f5', border: '1px solid #E0E0E0', borderRadius: '8px', color: '#194342', cursor: 'pointer', fontSize: '13px' }}
      >
        + Add Item
      </button>

      {CATEGORIES.map((category) => {
        const categoryItems = items.filter((i) => i.category === category);
        if (categoryItems.length === 0) return null;
        return (
          <Card key={category} title={category} style={{ marginBottom: '16px' }}>
            {categoryItems.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={item.is_packed}
                    onChange={() => toggleChecked(item)}
                    style={{ width: '16px', height: '16px', accentColor: '#1D9E75', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', color: item.is_packed ? '#999999' : '#194342', textDecoration: item.is_packed ? 'line-through' : 'none' }}>
                    {item.item_name}
                  </span>
                </label>
                <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
                  <button
                    onClick={() => { setEditingItem(item); setShowForm(true); }}
                    style={{ background: 'none', border: 'none', color: '#194342', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    style={{ background: 'none', border: 'none', color: '#E24B4A', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </Card>
        );
      })}

      {items.length === 0 && (
        <Card>
          <p style={{ color: '#666666', fontSize: '13px' }}>No items yet. Add your first one, or run the seed_data.sql to import your original list.</p>
        </Card>
      )}

      {showForm && (
        <Modal title={editingItem ? 'Edit Item' : 'Add Item'} onClose={() => setShowForm(false)}>
          <ItemForm
            initial={editingItem}
            onSave={async (category, item_name) => {
              if (editingItem) {
                await updateItem(editingItem.id, { category, item_name });
              } else {
                await addItem(category, item_name);
              }
              setShowForm(false);
              setEditingItem(null);
            }}
            onCancel={() => { setShowForm(false); setEditingItem(null); }}
          />
        </Modal>
      )}
    </div>
  );
}

const ItemForm = ({ initial, onSave, onCancel }) => {
  const [category, setCategory] = useState(initial?.category || CATEGORIES[0]);
  const [itemName, setItemName] = useState(initial?.item_name || '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <input
        style={inputStyle}
        type="text"
        placeholder="Item name"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
      />
      <button
        style={{ ...saveButtonStyle, opacity: itemName.trim() ? 1 : 0.5 }}
        disabled={!itemName.trim()}
        onClick={() => onSave(category, itemName.trim())}
      >
        Save
      </button>
      <button
        style={{ ...saveButtonStyle, background: '#f5f5f5', color: '#194342', marginTop: 0 }}
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  );
};