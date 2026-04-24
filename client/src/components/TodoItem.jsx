import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2 }}
      className="group relative flex items-start gap-3 bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Left accent bar */}
      <motion.div
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
        animate={{ backgroundColor: todo.done ? '#e5e7eb' : '#6366f1' }}
        transition={{ duration: 0.35 }}
      />

      {/* Checkbox */}
      <motion.button
        onClick={onToggle}
        whileTap={{ scale: 0.7 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        aria-label={todo.done ? 'Mark as not done' : 'Mark as done'}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          todo.done
            ? 'bg-indigo-500 border-indigo-500'
            : 'border-gray-300 hover:border-indigo-400'
        }`}
      >
        <AnimatePresence>
          {todo.done && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 600, damping: 20 }}
              className="flex items-center justify-center text-white"
            >
              <CheckIcon />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Content */}
      <div className={`flex-1 min-w-0 transition-opacity ${todo.done ? 'opacity-50' : 'opacity-100'}`}>
        <p className={`font-medium leading-snug break-words ${
          todo.done ? 'line-through text-gray-500' : 'text-gray-800'
        }`}>
          {todo.title}
        </p>
        {todo.description && (
          <p className={`text-sm mt-0.5 leading-relaxed break-words ${
            todo.done ? 'line-through text-gray-400' : 'text-gray-500'
          }`}>
            {todo.description}
          </p>
        )}
        <p className="text-xs text-gray-300 mt-1.5">
          {new Date(todo.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {!todo.done && (
          <button
            onClick={onEdit}
            aria-label="Edit todo"
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <EditIcon />
          </button>
        )}
        <AnimatePresence mode="wait">
          {confirmDelete ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1"
            >
              <button
                onClick={onDelete}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="trash"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete todo"
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <TrashIcon />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
