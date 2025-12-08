import React, { useState } from 'react';
import { BookOpen, FileText, Brain, HelpCircle, Link as LinkIcon, Upload, Plus, Search, Star, Trash2, Edit, Play } from 'lucide-react';
import toast from 'react-hot-toast';

export const StudyResources: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'files' | 'flashcards' | 'quizzes' | 'bookmarks'>('files');
  
  // Files state
  const [files, setFiles] = useState<any[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  
  // Flashcards state
  const [decks, setDecks] = useState<any[]>([
    {
      id: '1',
      name: 'Matematika Dasar',
      subject: 'Matematika',
      color: 'blue',
      cardCount: 25,
      lastStudied: '2024-12-07',
    },
    {
      id: '2',
      name: 'English Vocabulary',
      subject: 'Bahasa Inggris',
      color: 'green',
      cardCount: 50,
      lastStudied: '2024-12-06',
    },
  ]);

  
  // Quiz state
  const [quizzes] = useState<any[]>([
    {
      id: '1',
      title: 'Kalkulus 1 - Midterm',
      subject: 'Matematika',
      questions: 20,
      timeLimit: 60,
      attempts: 2,
      bestScore: 85,
    },
    {
      id: '2',
      title: 'Algoritma & Struktur Data',
      subject: 'Informatika',
      questions: 15,
      timeLimit: 45,
      attempts: 1,
      bestScore: 92,
    },
  ]);

  
  // Bookmarks state
  const [bookmarks, setBookmarks] = useState<any[]>([
    {
      id: '1',
      title: 'Khan Academy - Calculus',
      url: 'https://www.khanacademy.org/math/calculus-1',
      category: 'Learning',
      tags: ['math', 'calculus'],
      isFavorite: true,
    },
    {
      id: '2',
      title: 'MDN Web Docs',
      url: 'https://developer.mozilla.org',
      category: 'Reference',
      tags: ['web', 'programming'],
      isFavorite: false,
    },
  ]);
  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate file upload
      const newFile = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type.includes('pdf') ? 'pdf' : 'document',
        size: file.size,
        uploadedAt: new Date().toISOString(),
        subject: 'General',
      };
      setFiles([...files, newFile]);
      toast.success('File berhasil diupload!');
      setShowFileUpload(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleCreateDeck = () => {
    const newDeck = {
      id: Date.now().toString(),
      name: 'New Deck',
      subject: 'General',
      color: 'purple',
      cardCount: 0,
      lastStudied: new Date().toISOString(),
    };
    setDecks([...decks, newDeck]);
    toast.success('Deck baru berhasil dibuat!');
  };

  const handleStudyDeck = (deck: any) => {
    toast.success(`Memulai belajar: ${deck.name}`);
  };

  const handleCreateQuiz = () => {
    toast.success('Quiz creator akan segera dibuka!');
  };

  const handleTakeQuiz = (quiz: any) => {
    toast.success(`Memulai quiz: ${quiz.title}`);
  };

  const handleAddBookmark = () => {
    toast.success('Bookmark berhasil ditambahkan!');
    setShowAddBookmark(false);
  };

  const toggleFavorite = (id: string) => {
    setBookmarks(bookmarks.map(b => 
      b.id === id ? { ...b, isFavorite: !b.isFavorite } : b
    ));
  };

  const filteredBookmarks = bookmarks.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[40px] font-bold notion-heading leading-tight flex items-center gap-2">
            <BookOpen size={32} />
            Study Resources & Tools
          </h2>
          <p className="notion-text-secondary text-sm mt-2">Manage your study materials and learning tools</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('files')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === 'files'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 notion-text'
              : 'bg-white/10 notion-text-secondary hover:bg-white/20'
          }`}
        >
          <FileText size={18} className="inline mr-2" />
          Files & Documents
        </button>
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === 'flashcards'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 notion-text'
              : 'bg-white/10 notion-text-secondary hover:bg-white/20'
          }`}
        >
          <Brain size={18} className="inline mr-2" />
          Flashcards
        </button>
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === 'quizzes'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 notion-text'
              : 'bg-white/10 notion-text-secondary hover:bg-white/20'
          }`}
        >
          <HelpCircle size={18} className="inline mr-2" />
          Quizzes
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === 'bookmarks'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 notion-text'
              : 'bg-white/10 notion-text-secondary hover:bg-white/20'
          }`}
        >
          <LinkIcon size={18} className="inline mr-2" />
          Bookmarks
        </button>
      </div>

      {/* Files Tab */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold notion-heading">My Files</h3>
            <button
              onClick={() => setShowFileUpload(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 notion-text px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center gap-2"
            >
              <Upload size={18} />
              Upload File
            </button>
          </div>

          {showFileUpload && (
            <div className="notion-card p-6">
              <h4 className="notion-text font-bold mb-4">Upload New File</h4>
              <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center">
                <Upload className="mx-auto notion-text/50 mb-4" size={48} />
                <p className="notion-text-secondary mb-4">Drag & drop or click to upload</p>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png"
                />
                <label
                  htmlFor="file-upload"
                  className="bg-white/20 hover:bg-white/30 notion-text px-6 py-2 rounded-lg cursor-pointer inline-block transition-all"
                >
                  Choose File
                </label>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowFileUpload(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 notion-text py-2 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.length === 0 && (
              <div className="col-span-full text-center py-12">
                <FileText size={48} className="notion-text/30 mx-auto mb-4" />
                <p className="notion-text-secondary">No files uploaded yet</p>
              </div>
            )}
            {files.map((file) => (
              <div
                key={file.id}
                className="notion-card p-4 hover:bg-white/15 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <FileText className="text-blue-400" size={32} />
                  <button className="notion-text-secondary hover:text-red-400 transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
                <h4 className="notion-text font-bold mb-1 truncate">{file.name}</h4>
                <p className="notion-text-secondary text-sm">{formatFileSize(file.size)}</p>
                <p className="notion-text-secondary text-xs mt-2">{file.subject}</p>
                <button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 notion-text py-2 rounded-lg font-medium transition-all">
                  Open
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flashcards Tab */}
      {activeTab === 'flashcards' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold notion-heading">Flashcard Decks</h3>
            <button
              onClick={handleCreateDeck}
              className="notion-button-primary notion-text px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              Create Deck
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className={`bg-gradient-to-br from-${deck.color}-500/20 to-${deck.color}-600/20 backdrop-blur-lg rounded-xl p-6 border border-${deck.color}-500/30 hover:scale-[1.02] transition-all`}
              >
                <div className="flex items-start justify-between mb-4">
                  <Brain className={`text-${deck.color}-400`} size={32} />
                  <button className="notion-text-secondary hover:notion-text transition-all">
                    <Edit size={18} />
                  </button>
                </div>
                <h4 className="notion-text font-bold text-lg mb-2">{deck.name}</h4>
                <p className="notion-text-secondary text-sm mb-4">{deck.subject}</p>
                <div className="flex items-center justify-between text-sm notion-text-secondary mb-4">
                  <span>{deck.cardCount} cards</span>
                  <span>Last: {new Date(deck.lastStudied).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={() => handleStudyDeck(deck)}
                  className={`w-full bg-${deck.color}-600 hover:bg-${deck.color}-700 notion-text py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2`}
                >
                  <Play size={18} />
                  Study Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quizzes Tab */}
      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold notion-heading">My Quizzes</h3>
            <button
              onClick={handleCreateQuiz}
              className="bg-gradient-to-r from-green-600 to-emerald-600 notion-text px-4 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              Create Quiz
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="notion-card p-6 hover:bg-white/15 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <HelpCircle className="text-green-400" size={32} />
                  <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                    {quiz.subject}
                  </span>
                </div>
                <h4 className="notion-text font-bold text-lg mb-2">{quiz.title}</h4>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="notion-card p-2 text-center">
                    <p className="notion-text font-bold">{quiz.questions}</p>
                    <p className="notion-text-secondary text-xs">Questions</p>
                  </div>
                  <div className="notion-card p-2 text-center">
                    <p className="notion-text font-bold">{quiz.timeLimit}m</p>
                    <p className="notion-text-secondary text-xs">Time</p>
                  </div>
                  <div className="notion-card p-2 text-center">
                    <p className="notion-text font-bold">{quiz.bestScore}%</p>
                    <p className="notion-text-secondary text-xs">Best</p>
                  </div>
                </div>
                <p className="notion-text-secondary text-sm mb-4">Attempts: {quiz.attempts}</p>
                <button
                  onClick={() => handleTakeQuiz(quiz)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 notion-text py-2 rounded-lg font-semibold transition-all"
                >
                  Take Quiz
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookmarks Tab */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 notion-text/50" size={20} />
              <input
                type="text"
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 notion-text placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowAddBookmark(true)}
              className="bg-gradient-to-r from-orange-600 to-red-600 notion-text px-4 py-2 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              Add Bookmark
            </button>
          </div>

          {showAddBookmark && (
            <div className="notion-card p-6">
              <h4 className="notion-text font-bold mb-4">Add New Bookmark</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Title"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="url"
                  placeholder="URL"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Tags (comma separated)"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowAddBookmark(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 notion-text py-2 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBookmark}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 notion-text py-2 rounded-lg transition-all"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="notion-card p-4 hover:bg-white/15 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <LinkIcon className="text-orange-400" size={24} />
                  <button
                    onClick={() => toggleFavorite(bookmark.id)}
                    className={`transition-all ${
                      bookmark.isFavorite ? 'text-yellow-400' : 'notion-text/40 hover:text-yellow-400'
                    }`}
                  >
                    <Star size={18} fill={bookmark.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <h4 className="notion-text font-bold mb-1 truncate">{bookmark.title}</h4>
                <p className="notion-text-secondary text-sm mb-3 truncate">{bookmark.url}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {bookmark.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="bg-white/10 notion-text-secondary px-2 py-1 rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-orange-600 hover:bg-orange-700 notion-text py-2 rounded-lg font-medium transition-all text-center"
                >
                  Visit
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
