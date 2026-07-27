import React, { useState, useEffect, useRef } from 'react';
import MDEditor from '@uiw/react-md-editor';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from './supabaseClient';

const CATEGORIES = [
  { label: 'Personal', value: 'personal', color: '#7F77DD' },
  { label: 'Finance', value: 'finance', color: '#1D9E75' },
  { label: 'Goals', value: 'goals', color: '#639922' },
  { label: 'Random Thoughts', value: 'random', color: '#BA7517' },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const getCategoryColor = (value) => {
  const cat = CATEGORIES.find(c => c.value === value);
  return cat ? cat.color : '#194342';
};

const IdeasPage = ({ user }) => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIdea, setEditingIdea] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setIdeas(data);
    setLoading(false);
  };

  const deleteIdea = async (id) => {
    await supabase.from('ideas').delete().eq('id', id);
    setIdeas(ideas.filter(i => i.id !== id));
  };

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (idea.content && idea.content.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDate = selectedDate ? idea.date === selectedDate : true;
    return matchesSearch && matchesDate;
  });

  const ideasByDate = ideas.reduce((acc, idea) => {
    if (!acc[idea.date]) acc[idea.date] = [];
    acc[idea.date].push(idea);
    return acc;
  }, {});

  return (
    <div style={{ padding: '24px 40px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Greeting */}
   <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: '800', color: '#194342', marginBottom: '4px', letterSpacing: '-1px' }}>
          Define My Goals
        </h1>
        <p style={{ fontSize: '16px', fontWeight: '600', color: '#1D9E75', margin: '0 0 4px' }}>
          {getGreeting()}
        </p>
        <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Search + Calendar + Add */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search your diary..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', color: '#194342' }}
        />
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          style={{ padding: '10px 16px', background: showCalendar ? '#194342' : '#f5f5f5', color: showCalendar ? 'white' : '#194342', border: '1px solid #E0E0E0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
        >
          Calendar
        </button>
        {selectedDate && (
          <button
            onClick={() => setSelectedDate(null)}
            style={{ padding: '10px 16px', background: '#f5f5f5', color: '#E24B4A', border: '1px solid #E0E0E0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
          >
            Clear date
          </button>
        )}
        <button
          onClick={() => { setEditingIdea(null); setShowForm(true); }}
          style={{ padding: '10px 20px', background: '#194342', color: '#dae8b3', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
        >
          + New Entry
        </button>
      </div>

      {/* Calendar Popup */}
      {showCalendar && (
        <CalendarPopup
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          ideasByDate={ideasByDate}
          selectedDate={selectedDate}
          setSelectedDate={(date) => { setSelectedDate(date); setShowCalendar(false); }}
          onClose={() => setShowCalendar(false)}
        />
      )}

      {/* Category Legend */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <div key={cat.value} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: cat.color }} />
            <span style={{ fontSize: '12px', color: '#666666' }}>{cat.label}</span>
          </div>
        ))}
      </div>

      {/* Ideas List */}
      {loading ? (
        <p style={{ color: '#666666' }}>Loading your diary...</p>
      ) : filteredIdeas.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', border: '1px solid #E0E0E0' }}>
          <p style={{ color: '#666666', fontSize: '14px' }}>
            {searchQuery ? 'No entries found for your search' : selectedDate ? 'No entries for this date' : 'No diary entries yet. Write your first entry!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredIdeas.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onEdit={() => { setEditingIdea(idea); setShowForm(true); }}
              onDelete={() => deleteIdea(idea.id)}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <IdeaForm
          user={user}
          idea={editingIdea}
          onSave={() => { fetchIdeas(); setShowForm(false); setEditingIdea(null); }}
          onClose={() => { setShowForm(false); setEditingIdea(null); }}
        />
      )}
    </div>
  );
};

const IdeaCard = ({ idea, onEdit, onDelete }) => {
  const cardRef = useRef();
  const color = getCategoryColor(idea.category);
  const category = CATEGORIES.find(c => c.value === idea.category);

  const exportPDF = async () => {
    const element = cardRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${idea.title}.pdf`);
  };

  return (
    <div ref={cardRef} style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E0E0E0', borderLeft: `4px solid ${color}` }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#194342', margin: '0 0 4px' }}>{idea.title}</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#999999' }}>
              {new Date(idea.created_at).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} at {idea.time}
            </span>
            <span style={{ fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '20px', background: `${color}20`, color }}>
              {category?.label}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onEdit} style={{ padding: '6px 12px', background: '#f5f5f5', border: '1px solid #E0E0E0', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#194342' }}>Edit</button>
          <button onClick={exportPDF} style={{ padding: '6px 12px', background: '#f5f5f5', border: '1px solid #E0E0E0', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#194342' }}>Export PDF</button>
          <button onClick={onDelete} style={{ padding: '6px 12px', background: '#f5f5f5', border: '1px solid #E0E0E0', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#E24B4A' }}>Delete</button>
        </div>
      </div>

      {/* Content */}
      <div data-color-mode="light" style={{ marginBottom: idea.photos?.length > 0 ? '16px' : '0' }}>
        <MDEditor.Markdown source={idea.content} style={{ fontSize: '14px', color: '#2D3142', lineHeight: '1.6', background: 'transparent' }} />
      </div>

      {/* Photos */}
      {idea.photos && idea.photos.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
          {idea.photos.map((url, idx) => (
            <img key={idx} src={url} alt={`entry-${idx}`} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E0E0E0' }} />
          ))}
        </div>
      )}
    </div>
  );
};

const IdeaForm = ({ user, idea, onSave, onClose }) => {
  const [title, setTitle] = useState(idea?.title || '');
  const [content, setContent] = useState(idea?.content || '');
  const [category, setCategory] = useState(idea?.category || 'personal');
  const [photos, setPhotos] = useState(idea?.photos || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

 

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    const uploadedUrls = [];
    for (const file of files) {
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('ideas-photos')
        .upload(fileName, file);

      if (!error) {
        const { data: urlData } = supabase.storage
          .from('ideas-photos')
          .getPublicUrl(fileName);
        uploadedUrls.push(urlData.publicUrl);
      }
    }

    setPhotos([...photos, ...uploadedUrls]);
    setUploading(false);
  };

  const removePhoto = (idx) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);

    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];

    if (idea) {
      await supabase.from('ideas').update({
        title, content, category, photos, updated_at: now.toISOString()
      }).eq('id', idea.id);
    } else {
      await supabase.from('ideas').insert([{
        user_id: user.id, title, content, category, photos, date, time
      }]);
    }

    setSaving(false);
    onSave();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#194342', margin: 0 }}>
            {idea ? 'Edit Entry' : 'New Diary Entry'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999999' }}>x</button>
        </div>

        {/* Title */}
        <input
          type="text"
          placeholder="Entry title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ width: '100%', padding: '12px 14px', border: '1px solid #E0E0E0', borderRadius: '8px', fontSize: '16px', fontWeight: '500', color: '#194342', marginBottom: '16px', boxSizing: 'border-box' }}
        />

        {/* Category */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: `2px solid ${cat.color}`,
                background: category === cat.value ? cat.color : 'transparent',
                color: category === cat.value ? 'white' : cat.color,
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

       {/* Rich Text Editor */}
        <div style={{ marginBottom: '16px' }} data-color-mode="light">
          <MDEditor
            value={content}
            onChange={setContent}
            height={200}
            preview="edit"
          />
        </div>

        {/* Photo Upload */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', color: '#194342', display: 'block', marginBottom: '8px' }}>Photos</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            style={{ fontSize: '13px', color: '#666666' }}
          />
          {uploading && <p style={{ fontSize: '12px', color: '#666666', marginTop: '4px' }}>Uploading photos...</p>}

          {photos.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
              {photos.map((url, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <img src={url} alt={`upload-${idx}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E0E0E0' }} />
                  <button
                    onClick={() => removePhoto(idx)}
                    style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#E24B4A', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            style={{ flex: 1, padding: '12px', background: '#194342', color: '#dae8b3', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '14px', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Saving...' : idea ? 'Update Entry' : 'Save Entry'}
          </button>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '12px', background: '#f5f5f5', color: '#194342', border: '1px solid #E0E0E0', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const CalendarPopup = ({ currentMonth, setCurrentMonth, ideasByDate, selectedDate, setSelectedDate, onClose }) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '360px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#194342' }}>{'<'}</button>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#194342', margin: 0 }}>{monthName}</h3>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#194342' }}>{'>'}</button>
        </div>

        {/* Day labels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '11px', color: '#999999', fontWeight: '500' }}>{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {days.map((day, idx) => {
            if (!day) return <div key={idx} />;

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayIdeas = ideasByDate[dateStr] || [];
            const hasEntries = dayIdeas.length > 0;
            const isSelected = selectedDate === dateStr;
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            const dotColors = [...new Set(dayIdeas.map(i => getCategoryColor(i.category)))];

            return (
              <div
                key={idx}
                onClick={() => hasEntries && setSelectedDate(dateStr)}
                style={{
                  textAlign: 'center',
                  padding: '6px 0',
                  borderRadius: '8px',
                  cursor: hasEntries ? 'pointer' : 'default',
                  background: isSelected ? '#194342' : isToday ? 'rgba(25, 67, 66, 0.1)' : 'transparent',
                  border: isToday && !isSelected ? '1px solid #194342' : 'none',
                }}
              >
                <div style={{ fontSize: '13px', color: isSelected ? 'white' : '#194342', fontWeight: isToday ? '600' : '400' }}>{day}</div>
                {hasEntries && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px' }}>
                    {dotColors.slice(0, 3).map((color, i) => (
                      <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: color }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          style={{ width: '100%', marginTop: '16px', padding: '10px', background: '#f5f5f5', border: '1px solid #E0E0E0', borderRadius: '8px', cursor: 'pointer', color: '#194342', fontSize: '13px' }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default IdeasPage;