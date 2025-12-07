import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { id } from 'date-fns/locale';

export const Calendar: React.FC = () => {
  const { tasks, sleepRecords, pomodoroSessions } = useStore();
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const dayData = useMemo(() => {
    const data: Record<string, { tasks: number; completedTasks: number; pomodoros: number; hasSleep: boolean }> = {};

    calendarDays.forEach((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayTasks = tasks.filter((t) => t.dueDate.startsWith(dateStr));
      const completedTasks = dayTasks.filter((t) => t.completed);
      const pomodoros = pomodoroSessions.filter((s) => s.startTime.startsWith(dateStr) && s.completed);
      const hasSleep = sleepRecords.some((r) => r.date === dateStr);

      data[dateStr] = {
        tasks: dayTasks.length,
        completedTasks: completedTasks.length,
        pomodoros: pomodoros.length,
        hasSleep,
      };
    });

    return data;
  }, [calendarDays, tasks, pomodoroSessions, sleepRecords]);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Kalender</h2>
          <p className="text-white/70 mt-1">Lihat aktivitas dan jadwal kamu</p>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">
            {format(currentDate, 'MMMM yyyy', { locale: id })}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={previousMonth}
              className="bg-white/10 text-white p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              Hari Ini
            </button>
            <button
              onClick={nextMonth}
              className="bg-white/10 text-white p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
            <div key={day} className="text-center text-white/70 font-medium text-sm py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const data = dayData[dateStr];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, today);

            return (
              <div
                key={dateStr}
                className={`min-h-[100px] rounded-lg p-2 transition-all ${
                  isToday
                    ? 'bg-white/20 border-2 border-white'
                    : isCurrentMonth
                    ? 'bg-white/5 hover:bg-white/10'
                    : 'bg-white/[0.02] opacity-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm font-medium ${
                      isToday ? 'text-white font-bold' : isCurrentMonth ? 'text-white/90' : 'text-white/40'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {data.hasSleep && <span className="text-xs">🌙</span>}
                </div>

                {isCurrentMonth && (
                  <div className="space-y-1">
                    {data.tasks > 0 && (
                      <div className="text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded">
                        {data.completedTasks}/{data.tasks} tugas
                      </div>
                    )}
                    {data.pomodoros > 0 && (
                      <div className="text-xs bg-purple-500/30 text-purple-200 px-2 py-1 rounded">
                        {data.pomodoros} 🍅
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-white font-bold mb-3">Legenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500/30 rounded"></div>
            <span className="text-white/80 text-sm">Tugas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500/30 rounded"></div>
            <span className="text-white/80 text-sm">Pomodoro</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🌙</span>
            <span className="text-white/80 text-sm">Tidur Tercatat</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white/20 border-2 border-white rounded"></div>
            <span className="text-white/80 text-sm">Hari Ini</span>
          </div>
        </div>
      </div>
    </div>
  );
};
