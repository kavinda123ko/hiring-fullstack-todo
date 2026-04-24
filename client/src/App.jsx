import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getTodos, createTodo, updateTodo, toggleDone, deleteTodo, clearCompleted } from './api/todos';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import EditModal from './components/EditModal';

const FILTERS = ['all', 'active', 'completed'];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded-full w-3/4" />
          <div className="h-3 bg-gray-100 rounded-full w-1/2" />
        </div>
      </div>
    </div>
  );
}

function ClipboardIcon() {
  return (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

export default function App() {
  const [editingTodo, setEditingTodo] = useState(null);
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: todos = [], isLoading, isError } = useQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
  });

  const snapshot = () => queryClient.getQueryData(['todos']);
  const rollback = (previous) => queryClient.setQueryData(['todos'], previous);
  const sync = () => queryClient.invalidateQueries({ queryKey: ['todos'] });

  const createMutation = useMutation({
    mutationFn: createTodo,
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previous = snapshot();
      const optimistic = { _id: `temp-${Date.now()}`, ...newTodo, done: false, createdAt: new Date().toISOString() };
      queryClient.setQueryData(['todos'], [optimistic, ...previous]);
      return { previous };
    },
    onError: (err, _, ctx) => {
      rollback(ctx.previous);
      toast.error(err.response?.data?.error || 'Failed to create todo');
    },
    onSuccess: () => { sync(); toast.success('Todo added!'); },
  });

  const updateMutation = useMutation({
    mutationFn: updateTodo,
    onMutate: async (updated) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previous = snapshot();
      queryClient.setQueryData(['todos'], previous.map((t) => (t._id === updated.id ? { ...t, ...updated } : t)));
      return { previous };
    },
    onError: (err, _, ctx) => {
      rollback(ctx.previous);
      toast.error(err.response?.data?.error || 'Failed to update todo');
    },
    onSuccess: () => { sync(); setEditingTodo(null); toast.success('Todo updated!'); },
  });

  const toggleMutation = useMutation({
    mutationFn: toggleDone,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previous = snapshot();
      queryClient.setQueryData(['todos'], previous.map((t) => (t._id === id ? { ...t, done: !t.done } : t)));
      return { previous };
    },
    onError: (err, _, ctx) => { rollback(ctx.previous); toast.error('Failed to update todo'); },
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
    onError: (err, _, ctx) => { rollback(ctx.previous); toast.error('Failed to delete todo'); },
    onSuccess: () => { sync(); toast.success('Todo deleted'); },
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
    onSuccess: () => { sync(); toast.success('Cleared completed todos'); },
  });

  const activeCount = todos.filter((t) => !t.done).length;
  const completedCount = todos.filter((t) => t.done).length;
  const allDone = todos.length > 0 && completedCount === todos.length;

  const visibleTodos =
    filter === 'active' ? todos.filter((t) => !t.done) :
    filter === 'completed' ? todos.filter((t) => t.done) :
    todos;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-xl mx-auto px-4 py-12">

        {/* Header */}
        <header className="mb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <ClipboardIcon />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Todos</h1>
          </motion.div>

          <AnimatePresence mode="wait">
            {todos.length > 0 && (
              <motion.div
                key={allDone ? 'all-done' : 'progress'}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center gap-2"
              >
                {allDone ? (
                  <p className="text-sm font-semibold text-emerald-500">🎉 All done — great work!</p>
                ) : (
                  <>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden w-48">
                      <motion.div
                        className="h-full bg-indigo-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round((completedCount / todos.length) * 100)}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      {completedCount} of {todos.length} completed
                    </p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Create form */}
        <TodoForm
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />

        {/* Filter tabs — only when there are todos */}
        <AnimatePresence>
          {todos.length > 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-4"
            >
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm font-medium rounded-lg transition-all capitalize ${
                    filter === f
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {f}
                  {f === 'active' && activeCount > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold transition-colors ${
                      filter === 'active' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {activeCount}
                    </span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* List area */}
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : isError ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-red-400 text-sm">Could not reach the server.</p>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['todos'] })}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
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

        {/* Footer */}
        <AnimatePresence>
          {todos.length > 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between mt-5 px-1 text-xs text-gray-400"
            >
              <span>{activeCount} item{activeCount !== 1 ? 's' : ''} left</span>
              {completedCount > 0 && (
                <button
                  onClick={() => clearMutation.mutate()}
                  disabled={clearMutation.isPending}
                  className="hover:text-red-400 transition-colors disabled:opacity-40"
                >
                  {clearMutation.isPending ? 'Clearing…' : 'Clear completed'}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
