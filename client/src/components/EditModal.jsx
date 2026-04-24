import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TITLE_MAX = 200;
const DESC_MAX = 1000;

function CharCount({ value, max }) {
  const remaining = max - value.length;
  const pct = value.length / max;
  const color = pct >= 1 ? 'text-red-500' : pct >= 0.85 ? 'text-amber-500' : 'text-gray-400';
  if (value.length === 0) return null;
  return <span className={`text-xs tabular-nums transition-colors ${color}`}>{remaining} left</span>;
}

export default function EditModal({ todo, onClose, onSave, isLoading }) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || '');
  const [error, setError] = useState('');

  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (title.trim().length > TITLE_MAX) {
      setError(`Title cannot exceed ${TITLE_MAX} characters`);
      return;
    }
    if (description.trim().length > DESC_MAX) {
      setError(`Description cannot exceed ${DESC_MAX} characters`);
      return;
    }
    onSave({ title: title.trim(), description: description.trim() });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-5">Edit Todo</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">
                Title <span className="text-red-400">*</span>
              </label>
              <CharCount value={title} max={TITLE_MAX} />
            </div>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(''); }}
              maxLength={TITLE_MAX}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Todo title"
              disabled={isLoading}
            />
            <AnimatePresence>
              {error && (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-500 text-xs mt-1"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <CharCount value={description} max={DESC_MAX} />
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={DESC_MAX}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              placeholder="Optional description"
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
