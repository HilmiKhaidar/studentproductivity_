import React, { useState, useMemo } from 'react';
import { Plus, Search, Pin, Edit2, Trash2, Tag, X, Save } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Note } from '../types';
import toast from 'react-hot-toast';

export const Notes: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, togglePinNote } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: '',
    color: '#8b5cf6',
  });

  const categories = ['all', 'general', 'study', 'assignment', 'exam', 'project', 'personal'];
  const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [notes, searchQuery, selectedCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Judul tidak boleh kosong!');
      return;
    }

    const noteData: Note = {
      id: editingNote?.id || Date.now().toString(),
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      createdAt: editingNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: editingNote?.isPinned || false,
      color: formData.color,
    };

    if (editingNote) {
      updateNote(editingNote.id, noteData);
      toast.success('Catatan berhasil diupdate!');
    } else {
      addNote(noteData);
      toast.success('Catatan berhasil ditambahkan!');
    }

    setIsModalOpen(false);
    setEditingNote(null);
    setFormData({ title: '', content: '', category: 'general', tags: '', color: '#8b5cf6' });
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category,
      tags: note.tags.join(', '),
      color: note.color || '#8b5cf6',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Yakin ingin menghapus catatan ini?')) {
      deleteNote(id);
      toast.success('Catatan berhasil dihapus!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[40px] font-bold notion-heading leading-tight">📝 Notes</h2>
          <p className="notion-text-secondary text-sm mt-2">Catat semua ide dan pembelajaranmu</p>
        </div>
        <button
          onClick={() => {
            setEditingNote(null);
            setFormData({ title: '', content: '', category: 'general', tags: '', color: '#8b5cf6' });
            setIsModalOpen(true);
          }}
          className="notion-button-primary notion-text px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Catatan Baru
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 notion-text/50" size={20} />
          <input
            type="text"
            placeholder="Cari catatan, tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 notion-text placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-600 notion-text'
                  : 'bg-white/10 notion-text-secondary hover:bg-white/20'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="notion-card p-4 hover:bg-white/15 transition-all"
            style={{ borderLeftWidth: '4px', borderLeftColor: note.color }}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold notion-text flex-1">{note.title}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePinNote(note.id)}
                  className={`p-1 rounded transition-colors ${
                    note.isPinned ? 'text-yellow-400' : 'notion-text/50 hover:notion-text'
                  }`}
                >
                  <Pin size={16} />
                </button>
                <button
                  onClick={() => handleEdit(note)}
                  className="notion-text/50 hover:notion-text p-1 rounded transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="notion-text/50 hover:text-red-400 p-1 rounded transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="notion-text-secondary text-sm mb-3 line-clamp-3">{note.content}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {note.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-white/10 rounded text-xs notion-text/80 flex items-center gap-1"
                >
                  <Tag size={12} />
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs notion-text/50">
              <span>{note.category}</span>
              <span>{new Date(note.updatedAt).toLocaleDateString('id-ID')}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <p className="notion-text-secondary text-lg">Belum ada catatan</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-lg rounded-xl p-6 max-w-2xl w-full border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold notion-heading">
                {editingNote ? 'Edit Catatan' : 'Catatan Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="notion-text-secondary hover:notion-text">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block notion-text/80 mb-2">Judul</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Judul catatan..."
                />
              </div>
              <div>
                <label className="block notion-text/80 mb-2">Konten</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Tulis catatanmu di sini..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block notion-text/80 mb-2">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.filter(c => c !== 'all').map((cat) => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block notion-text/80 mb-2">Warna</label>
                  <div className="flex gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block notion-text/80 mb-2">Tags (pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="matematika, ujian, penting"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 notion-button-primary notion-text py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  {editingNote ? 'Update' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 bg-white/10 notion-text py-3 rounded-lg font-semibold hover:bg-white/20 transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
