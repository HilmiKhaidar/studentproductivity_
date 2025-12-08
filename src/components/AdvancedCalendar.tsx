import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Clock, Repeat, MapPin, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'task' | 'exam' | 'class' | 'meeting' | 'personal';
  color: string;
  isRecurring: boolean;
  location?: string;
}

export const AdvancedCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Kalkulus 1',
      date: '2024-12-09',
      startTime: '08:00',
      endTime: '10:00',
      type: 'class',
      color: 'blue',
      isRecurring: true,
      location: 'Room 301',
    },
    {
      id: '2',
      title: 'Midterm Exam',
      date: '2024-12-15',
      startTime: '13:00',
      endTime: '15:00',
      type: 'exam',
      color: 'red',
      isRecurring: false,
      location: 'Hall A',
    },
  ]);

  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'personal' as const,
    location: '',
    isRecurring: false,
    recurringPattern: 'weekly',
  });

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.startTime) {
      toast.error('Please fill required fields');
      return;
    }

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: newEvent.date,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      type: newEvent.type,
      color: getColorForType(newEvent.type),
      isRecurring: newEvent.isRecurring,
      location: newEvent.location,
    };

    setEvents([...events, event]);
    toast.success('Event added successfully!');
    setShowAddEvent(false);
    setNewEvent({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      type: 'personal',
      location: '',
      isRecurring: false,
      recurringPattern: 'weekly',
    });
  };

  const getColorForType = (type: string) => {
    const colors: Record<string, string> = {
      task: 'blue',
      exam: 'red',
      class: 'green',
      meeting: 'purple',
      personal: 'orange',
    };
    return colors[type] || 'gray';
  };

  const handleGoogleCalendarSync = () => {
    toast.success('Google Calendar sync coming soon!');
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[40px] font-bold notion-heading leading-tight flex items-center gap-2">
            <CalendarIcon size={32} />
            Advanced Calendar
          </h2>
          <p className="notion-text-secondary text-sm mt-2">Manage your schedule with advanced features</p>
        </div>
        <button
          onClick={handleGoogleCalendarSync}
          className="bg-white notion-text px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center gap-2"
        >
          <CalendarIcon size={18} />
          Sync Google Calendar
        </button>
      </div>

      {/* View Selector & Add Event */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setView('month')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              view === 'month' ? 'bg-white notion-text' : 'bg-white/10 notion-text hover:bg-white/20'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              view === 'week' ? 'bg-white notion-text' : 'bg-white/10 notion-text hover:bg-white/20'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView('day')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              view === 'day' ? 'bg-white notion-text' : 'bg-white/10 notion-text hover:bg-white/20'
            }`}
          >
            Day
          </button>
        </div>
        <button
          onClick={() => setShowAddEvent(true)}
          className="notion-button-primary notion-text px-4 py-2 rounded-lg font-semibold hover:from-gray-700 hover:to-gray-900 transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          Add Event
        </button>
      </div>

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-blue-50 dark:bg-blue-900/10 backdrop-blur-lg rounded-xl p-6 max-w-md w-full border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold notion-heading">Add New Event</h3>
              <button onClick={() => setShowAddEvent(false)} className="notion-text-secondary hover:notion-text">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Event title *"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="personal">Personal</option>
                <option value="task">Task</option>
                <option value="exam">Exam</option>
                <option value="class">Class</option>
                <option value="meeting">Meeting</option>
              </select>
              <input
                type="text"
                placeholder="Location (optional)"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <label className="flex items-center gap-2 notion-text">
                <input
                  type="checkbox"
                  checked={newEvent.isRecurring}
                  onChange={(e) => setNewEvent({ ...newEvent, isRecurring: e.target.checked })}
                  className="w-4 h-4"
                />
                <Repeat size={16} />
                Recurring event
              </label>
              {newEvent.isRecurring && (
                <select
                  value={newEvent.recurringPattern}
                  onChange={(e) => setNewEvent({ ...newEvent, recurringPattern: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 notion-text focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddEvent(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 notion-text py-2 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="flex-1 notion-button-primary hover:from-gray-700 hover:to-gray-900 notion-text py-2 rounded-lg transition-all"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {view === 'month' && (
        <div className="notion-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold notion-heading">
              {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="bg-white/10 notion-text px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="bg-white/10 notion-text px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="bg-white/10 notion-text px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
              >
                Next
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center notion-text-secondary font-semibold py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {getDaysInMonth().map((day, index) => {
              const dayEvents = day ? getEventsForDate(day) : [];
              const isToday = day === new Date().getDate() && 
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

              return (
                <div
                  key={index}
                  className={`min-h-[100px] rounded-lg p-2 transition-all ${
                    day
                      ? isToday
                        ? 'bg-white/20 border-2 border-white'
                        : 'bg-white/5 hover:bg-white/10 cursor-pointer'
                      : 'bg-transparent'
                  }`}
                >
                  {day && (
                    <>
                      <div className="notion-text font-semibold mb-1">{day}</div>
                      <div className="space-y-1">
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs bg-${event.color}-500/30 text-${event.color}-200 px-2 py-1 rounded truncate`}
                          >
                            {event.isRecurring && <Repeat size={10} className="inline mr-1" />}
                            {event.startTime} {event.title}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      <div className="notion-card p-6">
        <h3 className="text-lg font-semibold notion-heading mb-4">Upcoming Events</h3>
        <div className="space-y-3">
          {events.slice(0, 5).map((event) => (
            <div key={event.id} className="flex items-center gap-4 notion-card p-3">
              <div className={`w-1 h-12 bg-${event.color}-500 rounded-full`}></div>
              <div className="flex-1">
                <h4 className="notion-text font-bold">{event.title}</h4>
                <div className="flex items-center gap-3 notion-text-secondary text-sm mt-1">
                  <span className="flex items-center gap-1">
                    <CalendarIcon size={14} />
                    {event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {event.startTime} - {event.endTime}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {event.location}
                    </span>
                  )}
                  {event.isRecurring && (
                    <span className="flex items-center gap-1">
                      <Repeat size={14} />
                      Recurring
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
