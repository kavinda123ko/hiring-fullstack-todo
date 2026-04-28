import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext.jsx';

export default function TodoItem({ todo, index = 0, onToggle, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { theme } = useTheme();

  const timeStr = new Date(todo.createdAt).toLocaleTimeString(undefined, {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="group bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all mb-3"
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <motion.button
          onClick={onToggle}
          whileTap={{ scale: 0.7 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          aria-label={todo.done ? 'Mark as not done' : 'Mark as done'}
          style={todo.done ? { backgroundColor: theme.accent, borderColor: theme.accent } : {}}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
            todo.done ? '' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <AnimatePresence>
            {todo.done && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 600, damping: 20 }}
                className="text-white flex items-center justify-center"
              >
                <CheckIcon />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Content */}
        <div className={`flex-1 min-w-0 transition-opacity ${todo.done ? 'opacity-50' : ''}`}>
          <p className={`font-semibold leading-snug break-words ${
            todo.done ? 'line-through text-gray-400' : 'text-gray-800'
          }`}>
            {todo.title}
          </p>
          {todo.description && (
            <p className={`text-sm mt-1 leading-relaxed break-words ${
              todo.done ? 'line-through text-gray-300' : 'text-gray-500'
            }`}>
              {todo.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1">
          {!todo.done && (
            <button
              onClick={onEdit}
              aria-label="Edit task"
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
                aria-label="Delete task"
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <TrashIcon />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Metadata row */}
      <div className="flex items-center gap-4 mt-2.5 pl-8">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <ClockIcon />
          {timeStr}
        </span>
        {!todo.done && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${theme.accent}18`, color: theme.accent }}
          >
            Active
          </span>
        )}
      </div>
    </motion.div>
  );
}

function CheckIcon() {
  return <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
}
function EditIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
}
function TrashIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
}
function ClockIcon() {
  return <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
