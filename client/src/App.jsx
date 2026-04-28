import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getTodos, createTodo, updateTodo, toggleDone, deleteTodo, clearCompleted } from './api/todos';
import { useTheme, themes } from './context/ThemeContext.jsx';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import EditModal from './components/EditModal';

const FILTERS = ['all', 'active', 'completed'];

/* ── Animated counter ──────────────────────────────────── */
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current === value) return;
    const start = prev.current;
    prev.current = value;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / 400, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + (value - start) * e));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span>{display}</span>;
}

/* ── Sidebar icons ─────────────────────────────────────── */
function LightningIcon() {
  return <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>;
}
function PersonIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
}
function BriefcaseIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
}
function ShoppingIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
}
function SettingsIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
}
function HelpIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function SearchIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
}
function BellIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
}

/* ── NavItem ───────────────────────────────────────────── */
function NavItem({ icon, label, active, theme }) {
  return (
    <div className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-all select-none ${
      active ? `${theme.statBg} ${theme.tab} font-semibold` : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
    }`}>
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full" style={{ backgroundColor: theme.accent }} />
      )}
      <span className="flex-shrink-0 ml-1">{icon}</span>
      {label}
    </div>
  );
}

/* ── Sidebar ───────────────────────────────────────────── */
function Sidebar({ theme, setTheme, themeId }) {
  return (
    <aside className="w-60 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 ${theme.iconBg} rounded-xl flex items-center justify-center shadow-sm ${theme.iconShadow}`}>
            <LightningIcon />
          </div>
          <span className="font-bold text-gray-900 text-base tracking-tight">ZenTask</span>
        </div>
      </div>

      {/* Focus Mode banner */}
      <div className="px-3 pt-4">
        <div className={`flex items-center gap-3 p-3 rounded-xl ${theme.statBg}`}>
          <div className={`w-9 h-9 ${theme.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <LightningIcon />
          </div>
          <div>
            <p className={`text-sm font-semibold ${theme.tab}`}>Focus Mode</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Stay Productive</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-4 space-y-0.5">
        <NavItem icon={<PersonIcon />} label="Personal" active theme={theme} />
        <NavItem icon={<BriefcaseIcon />} label="Work" theme={theme} />
        <NavItem icon={<ShoppingIcon />} label="Shopping" theme={theme} />
        <div className="pt-3">
          <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl hover:border-gray-300 hover:text-gray-500 transition-colors">
            <span className="text-base leading-none">+</span>
            Create Category
          </button>
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3 space-y-0.5">
        <NavItem icon={<SettingsIcon />} label="Settings" theme={theme} />
        <NavItem icon={<HelpIcon />} label="Help" theme={theme} />
        <div className="flex items-center gap-2 px-3 pt-3">
          <span className="text-xs text-gray-400 mr-0.5">Theme</span>
          {Object.values(themes).map((t) => (
            <motion.button
              key={t.id}
              onClick={() => setTheme(t.id)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.85 }}
              title={t.label}
              className={`w-4 h-4 rounded-full transition-all ${themeId === t.id ? 'ring-2 ring-offset-1 ring-gray-300 scale-110' : 'opacity-40 hover:opacity-100'}`}
              style={{ backgroundColor: t.dot }}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

/* ── Skeleton ──────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded-full w-3/4" />
          <div className="h-3 bg-gray-100 rounded-full w-1/2" />
        </div>
      </div>
    </div>
  );
}

/* ── App ───────────────────────────────────────────────── */
export default function App() {
  const [editingTodo, setEditingTodo] = useState(null);
  const [filter, setFilter] = useState('all');
  const { theme, setTheme, themeId } = useTheme();
  const queryClient = useQueryClient();

  const { data: todos = [], isLoading, isError } = useQuery({ queryKey: ['todos'], queryFn: getTodos });

  const snapshot = () => queryClient.getQueryData(['todos']);
  const rollback = (prev) => queryClient.setQueryData(['todos'], prev);
  const sync = () => queryClient.invalidateQueries({ queryKey: ['todos'] });

  const createMutation = useMutation({
    mutationFn: createTodo,
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previous = snapshot();
      queryClient.setQueryData(['todos'], [{ _id: `temp-${Date.now()}`, ...newTodo, done: false, createdAt: new Date().toISOString() }, ...previous]);
      return { previous };
    },
    onError: (err, _, ctx) => { rollback(ctx.previous); toast.error(err.response?.data?.error || 'Failed to create todo'); },
    onSuccess: () => { sync(); toast.success('Task added!'); },
  });

  const updateMutation = useMutation({
    mutationFn: updateTodo,
    onMutate: async (updated) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previous = snapshot();
      queryClient.setQueryData(['todos'], previous.map((t) => t._id === updated.id ? { ...t, ...updated } : t));
      return { previous };
    },
    onError: (err, _, ctx) => { rollback(ctx.previous); toast.error(err.response?.data?.error || 'Failed to update'); },
    onSuccess: () => { sync(); setEditingTodo(null); toast.success('Task updated!'); },
  });

  const toggleMutation = useMutation({
    mutationFn: toggleDone,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previous = snapshot();
      queryClient.setQueryData(['todos'], previous.map((t) => t._id === id ? { ...t, done: !t.done } : t));
      return { previous };
    },
    onError: (err, _, ctx) => { rollback(ctx.previous); toast.error('Failed to update task'); },
    onSuccess: () => sync(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previous = snapshot();
      queryClient.setQueryData(['todos'], previous.filter((t) => t._id !== id));
      return { previous };
    },
    onError: (err, _, ctx) => { rollback(ctx.previous); toast.error('Failed to delete task'); },
    onSuccess: () => { sync(); toast.success('Task deleted'); },
  });

  const clearMutation = useMutation({
    mutationFn: clearCompleted,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previous = snapshot();
      queryClient.setQueryData(['todos'], previous.filter((t) => !t.done));
      return { previous };
    },
    onError: (err, _, ctx) => { rollback(ctx.previous); toast.error('Failed to clear completed'); },
    onSuccess: () => { sync(); toast.success('Cleared completed tasks'); },
  });

  const activeCount = todos.filter((t) => !t.done).length;
  const completedCount = todos.filter((t) => t.done).length;
  const pct = todos.length ? Math.round((completedCount / todos.length) * 100) : 0;
  const allDone = todos.length > 0 && completedCount === todos.length;

  const visibleTodos =
    filter === 'active' ? todos.filter((t) => !t.done) :
    filter === 'completed' ? todos.filter((t) => t.done) :
    todos;

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  }).toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar theme={theme} setTheme={setTheme} themeId={themeId} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-end px-6 gap-1.5 flex-shrink-0">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><SearchIcon /></button>
          <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <BellIcon />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full" />
          </button>
          <div className={`w-8 h-8 rounded-full ${theme.iconBg} flex items-center justify-center ml-1 shadow-sm`}>
            <span className="text-white text-xs font-bold">K</span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Task area */}
          <main className="flex-1 overflow-y-auto px-8 py-6">
            {/* Heading */}
            <div className="mb-6">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-xs font-bold uppercase tracking-widest mb-1 ${theme.statColor}`}
              >
                {dateStr}
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-gray-900 mb-3"
              >
                Today's Focus
              </motion.h2>

              <AnimatePresence mode="wait">
                {todos.length > 0 && (
                  <motion.div
                    key={allDone ? 'done' : 'bar'}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-4"
                  >
                    {allDone ? (
                      <motion.p
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: 2, duration: 0.4 }}
                        className="text-sm font-semibold text-emerald-500"
                      >
                        🎉 All done — great work!
                      </motion.p>
                    ) : (
                      <>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden w-56">
                          <motion.div
                            className={`h-full rounded-full ${theme.progress}`}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">{pct}% complete</span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Form */}
            <TodoForm
              onSubmit={(data) => createMutation.mutate(data)}
              isLoading={createMutation.isPending}
            />

            {/* Filter pills */}
            <AnimatePresence>
              {todos.length > 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 mb-5"
                >
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full transition-all capitalize ${
                        filter === f
                          ? `text-white ${theme.btn} shadow-sm`
                          : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {f}{f === 'active' && activeCount > 0 ? ` (${activeCount})` : ''}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* List */}
            {isLoading ? (
              <div>{[0, 1, 2].map((i) => <SkeletonCard key={i} />)}</div>
            ) : isError ? (
              <div className="text-center py-16 space-y-3">
                <p className="text-red-400 text-sm">Could not reach the server.</p>
                <button
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['todos'] })}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  Try again →
                </button>
              </div>
            ) : (
              <TodoList
                todos={visibleTodos}
                filter={filter}
                onToggle={(id) => toggleMutation.mutate(id)}
                onEdit={setEditingTodo}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            )}
          </main>

          {/* Focus Stats panel */}
          <aside className="w-72 flex-shrink-0 bg-white border-l border-gray-100 overflow-y-auto">
            <div className="p-5">
              <h3 className="font-semibold text-gray-800 text-base mb-5">Focus Stats</h3>

              {/* Productivity score */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Productivity Score</span>
                  <span className={`font-bold text-sm ${theme.statColor}`}>{pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${theme.progress}`}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Done / Left */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-medium">Done</p>
                  <p className="text-3xl font-bold text-gray-800 tabular-nums">
                    <AnimatedNumber value={completedCount} />
                  </p>
                </div>
                <div className={`rounded-2xl p-4 border ${theme.statBg}`}>
                  <p className={`text-xs uppercase tracking-wider mb-2 font-medium ${theme.statColor} opacity-70`}>Left</p>
                  <p className={`text-3xl font-bold tabular-nums ${theme.statColor}`}>
                    <AnimatedNumber value={activeCount} />
                  </p>
                </div>
              </div>

              {/* Total */}
              {todos.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-5">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-medium">Total</p>
                  <p className="text-3xl font-bold text-gray-700 tabular-nums">
                    <AnimatedNumber value={todos.length} />
                  </p>
                </div>
              )}

              {/* Clear completed */}
              <AnimatePresence>
                {completedCount > 0 && (
                  <motion.button
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onClick={() => clearMutation.mutate()}
                    disabled={clearMutation.isPending}
                    className="w-full text-sm text-gray-400 hover:text-red-400 transition-colors py-2 border border-dashed border-gray-200 rounded-xl hover:border-red-200 disabled:opacity-40"
                  >
                    {clearMutation.isPending ? 'Clearing…' : `Clear ${completedCount} completed`}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {editingTodo && (
          <EditModal
            todo={editingTodo}
            onClose={() => setEditingTodo(null)}
            onSave={(data) => updateMutation.mutate({ id: editingTodo._id, ...data })}
            isLoading={updateMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
