import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext.jsx';

const TITLE_MAX = 200;
const DESC_MAX = 1000;

function CharCount({ value, max }) {
  const remaining = max - value.length;
  const pct = value.length / max;
  const color = pct >= 1 ? 'text-red-500' : pct >= 0.85 ? 'text-amber-500' : 'text-gray-300';
  if (value.length === 0) return null;
  return <span className={`text-xs tabular-nums transition-colors ${color}`}>{remaining}</span>;
}

function CalendarIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

export default function TodoForm({ onSubmit, isLoading }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const { theme } = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    if (title.trim().length > TITLE_MAX) { setError(`Title cannot exceed ${TITLE_MAX} characters`); return; }
    if (description.trim().length > DESC_MAX) { setError(`Description cannot exceed ${DESC_MAX} characters`); return; }
    setError('');
    onSubmit({ title: title.trim(), description: description.trim() });
    setTitle('');
    setDescription('');
    setExpanded(false);
  };

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Input row */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0 flex items-center justify-center text-gray-400 hover:border-gray-400 transition-colors text-sm leading-none"
            >
              +
            </button>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(''); }}
              onFocus={() => setExpanded(true)}
              placeholder="Add a new task..."
              maxLength={TITLE_MAX}
              className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-sm bg-transparent"
              disabled={isLoading}
            />
            <CharCount value={title} max={TITLE_MAX} />
            <button type="button" className="p-1.5 text-gray-300 hover:text-gray-400 transition-colors flex-shrink-0">
              <CalendarIcon />
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className={`px-5 py-2 text-white rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex-shrink-0 ${theme.btn}`}
            >
              {isLoading ? 'Adding…' : 'Create'}
            </button>
          </div>

          {/* Expandable description */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden border-t border-gray-50"
              >
                <div className="flex items-start gap-2 px-4 pb-3 pt-2 pl-14">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add description (optional)..."
                    rows={2}
                    maxLength={DESC_MAX}
                    className="flex-1 outline-none text-sm text-gray-600 placeholder-gray-400 resize-none bg-transparent"
                  />
                  <div className="pt-1">
                    <CharCount value={description} max={DESC_MAX} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-red-500 text-xs mt-1.5 pl-1"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
