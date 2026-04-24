import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TITLE_MAX = 200;
const DESC_MAX = 1000;

function CharCount({ value, max }) {
  const remaining = max - value.length;
  const pct = value.length / max;
  const color = pct >= 1 ? 'text-red-500' : pct >= 0.85 ? 'text-amber-500' : 'text-gray-300';
  if (value.length === 0) return null;
  return <span className={`text-xs tabular-nums transition-colors ${color}`}>{remaining}</span>;
}

export default function TodoForm({ onSubmit, isLoading }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);

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
    setError('');
    onSubmit({ title: title.trim(), description: description.trim() });
    setTitle('');
    setDescription('');
    setExpanded(false);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-indigo-300 flex-shrink-0" />
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setError(''); }}
          onFocus={() => setExpanded(true)}
          placeholder="Add a new todo…"
          maxLength={TITLE_MAX}
          className="flex-1 outline-none text-gray-800 placeholder-gray-400"
          disabled={isLoading}
        />
        <CharCount value={title} max={TITLE_MAX} />
        <button
          type="submit"
          disabled={isLoading || !title.trim()}
          className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Adding…' : 'Add'}
        </button>
      </div>

      <motion.div
        initial={false}
        animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.18 }}
        className="overflow-hidden"
      >
        <div className="mt-3 pl-8 flex items-start gap-2">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            maxLength={DESC_MAX}
            className="flex-1 outline-none text-sm text-gray-600 placeholder-gray-400 resize-none"
          />
          <div className="pt-1">
            <CharCount value={description} max={DESC_MAX} />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-red-500 text-xs mt-1.5 pl-8"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.form>
  );
}
