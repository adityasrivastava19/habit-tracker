import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, subDays, isSameDay, startOfDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, LogOut, Flame, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const [habits, setHabits] = useState([]);
    const [newHabit, setNewHabit] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [showAnalytics, setShowAnalytics] = useState(false);
    const { user, logout } = useAuth();

    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));

    useEffect(() => {
        fetchHabits();
    }, []);

    const fetchHabits = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/habits');
            setHabits(data);
        } catch (error) {
            console.error(error);
        }
    };

    const createHabit = async (e) => {
        e.preventDefault();
        if (!newHabit.trim()) return;
        try {
            const { data } = await axios.post('http://localhost:5000/api/habits', {
                name: newHabit,
                scheduledTime: scheduledTime || null
            });
            setHabits([...habits, data]);
            setNewHabit('');
            setScheduledTime('');
        } catch (error) {
            console.error(error);
        }
    };

    const toggleHabit = async (habitId, date) => {
        const habit = habits.find(h => h._id === habitId);
        const dateStr = format(date, 'yyyy-MM-dd');
        const isCompleted = habit.logs.some(log => log.date === dateStr && log.completed);

        try {
            const updatedHabits = habits.map(h => {
                if (h._id === habitId) {
                    const newLogs = isCompleted
                        ? h.logs.filter(l => l.date !== dateStr)
                        : [...h.logs, { date: dateStr, completed: true }];
                    return { ...h, logs: newLogs };
                }
                return h;
            });
            setHabits(updatedHabits);

            await axios.put(`http://localhost:5000/api/habits/${habitId}`, {
                date: dateStr,
                completed: !isCompleted
            });
        } catch (error) {
            fetchHabits();
        }
    };

    const deleteHabit = async (id) => {
        if (!confirm('Delete this habit?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/habits/${id}`);
            setHabits(habits.filter(h => h._id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    const getStreak = (habit) => {
        let streak = 0;
        const sortedLogs = [...habit.logs].sort((a, b) => new Date(b.date) - new Date(a.date));
        const todayStr = format(today, 'yyyy-MM-dd');
        const doneToday = sortedLogs.find(l => l.date === todayStr && l.completed);
        let currentDate = doneToday ? today : subDays(today, 1);

        while (true) {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            const log = habit.logs.find(l => l.date === dateStr && l.completed);
            if (log) {
                streak++;
                currentDate = subDays(currentDate, 1);
            } else {
                break;
            }
        }
        return streak;
    };

    // Prepare Data for Chart
    const getAnalyticsData = () => {
        return last7Days.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const completedCount = habits.reduce((acc, habit) => {
                return acc + (habit.logs.some(l => l.date === dateStr && l.completed) ? 1 : 0);
            }, 0);
            return {
                name: format(date, 'EEE'),
                completed: completedCount
            };
        });
    };

    return (
        <div className="page-container" style={{ paddingBottom: '4rem' }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '3rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <h1 style={{
                        fontSize: 'clamp(2rem, 5vw, 2.5rem)',
                        background: 'linear-gradient(to right, #7c3aed, #ec4899)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        HabitFlow
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Hello, {user?.username}</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => setShowAnalytics(!showAnalytics)}
                        className="glass-panel"
                        style={{
                            padding: '0.5rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: showAnalytics ? 'var(--primary)' : 'var(--text-muted)'
                        }}
                    >
                        <BarChart2 size={18} /> <span className="hide-mobile">Analytics</span>
                    </button>
                    <button onClick={logout} className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                        <LogOut size={18} /> <span className="hide-mobile">Logout</span>
                    </button>
                </div>
            </header>

            {/* Analytics Section */}
            <AnimatePresence>
                {showAnalytics && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden', marginBottom: '3rem' }}
                    >
                        <div className="glass-panel" style={{ padding: '2rem', height: '300px' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Weekly Completion Rate</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={getAnalyticsData()}>
                                    <defs>
                                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#94a3b8" />
                                    <YAxis allowDecimals={false} stroke="#94a3b8" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ color: '#1e293b' }}
                                    />
                                    <Area type="monotone" dataKey="completed" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCompleted)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={createHabit} style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Add a new habit..."
                            className="input-field"
                            style={{ paddingRight: '1rem' }}
                            value={newHabit}
                            onChange={(e) => setNewHabit(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                            type="time"
                            className="input-field"
                            style={{ width: '130px' }}
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            title="When do you plan to do this habit?"
                        />
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ whiteSpace: 'nowrap', padding: '0.75rem 1.5rem' }}
                        >
                            <Plus size={20} style={{ marginRight: '0.5rem' }} /> Add
                        </button>
                    </div>
                </div>
            </form>

            <motion.div layout className="grid-habits">
                <AnimatePresence>
                    {habits.map(habit => (
                        <motion.div
                            key={habit._id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass-panel"
                            style={{ padding: '1.5rem' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>{habit.name}</h3>
                                    {habit.scheduledTime && (
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            ⏰ Target: {format(new Date(`2000-01-01T${habit.scheduledTime}`), 'h:mm a')}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => deleteHabit(habit._id)}
                                    style={{ color: 'var(--error)', opacity: 0.7, background: 'none' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                                <Flame size={18} fill="currentColor" />
                                <span style={{ fontWeight: 'bold' }}>{getStreak(habit)} Day Streak</span>
                            </div>

                            {habit.logs.filter(l => l.completed && l.timestamp).length > 0 && (
                                <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: 'var(--accent-bg)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>Recent Completions:</div>
                                    {habit.logs
                                        .filter(l => l.completed && l.timestamp)
                                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                        .slice(0, 3)
                                        .map((log, idx) => (
                                            <div key={idx} style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span>📅 {format(new Date(log.date), 'MMM dd')} at {format(new Date(log.timestamp), 'h:mm a')}</span>
                                                {log.onTime !== undefined && (
                                                    <span style={{
                                                        fontSize: '0.7rem',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        background: log.onTime ? '#d1fae5' : '#fee2e2',
                                                        color: log.onTime ? '#065f46' : '#991b1b',
                                                        fontWeight: '600'
                                                    }}>
                                                        {log.onTime ? '✓ On Time' : '⏰ Late'}
                                                    </span>
                                                )}
                                            </div>
                                        ))
                                    }
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                                {last7Days.map((date, i) => {
                                    const dateStr = format(date, 'yyyy-MM-dd');
                                    const isCompleted = habit.logs.some(log => log.date === dateStr && log.completed);
                                    const isToday = isSameDay(date, today);
                                    const isPast = date < startOfDay(today);
                                    const log = habit.logs.find(l => l.date === dateStr);
                                    const timestamp = log?.timestamp;

                                    return (
                                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{format(date, 'EEEEE')}</span>
                                            <button
                                                onClick={() => !isPast && toggleHabit(habit._id, date)}
                                                disabled={isPast}
                                                title={timestamp ? `Completed at ${format(new Date(timestamp), 'h:mm a')}` : ''}
                                                style={{
                                                    width: '2rem',
                                                    height: '2rem',
                                                    borderRadius: '50%',
                                                    background: isCompleted ? 'var(--success)' : (isToday ? 'rgba(255,255,255,0.1)' : 'transparent'),
                                                    border: isCompleted ? 'none' : '1px solid var(--border)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    transition: 'all 0.2s',
                                                    cursor: isPast ? 'not-allowed' : 'pointer',
                                                    opacity: isPast ? 0.5 : 1
                                                }}
                                            >
                                                {isCompleted && <Check size={14} />}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
