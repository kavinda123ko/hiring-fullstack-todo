import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext.jsx';
import TodoItem from './TodoItem';

const EMPTY = {
  all:       { icon: '✓',  title: 'No tasks yet',         sub: 'Add a task above to get started.' },
  active:    { icon: '🎉', title: 'Nothing left to do!',  sub: 'All your tasks are completed.' },
  completed: { icon: '📋', title: 'No completed tasks',   sub: 'Complete a task to see it here.' },
};

export default function TodoList({ todos, filter = 'all', onToggle, onEdit, onDelete }) {
  const { theme } = useTheme();

  if (todos.length === 0) {
    const { icon, title, sub } = EMPTY[filter];
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 select-none"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.4, ease: 'easeInOut' }}
          className="text-5xl mb-3"
        >
          {icon}
        </motion.div>
        <p className={`font-semibold ${theme.tab}`}>{title}</p>
        <p className="text-sm text-gray-400 mt-1">{sub}</p>
      </motion.div>
    );
  }

  const pending = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  return (
    <div>
      <AnimatePresence initial={false}>
        {pending.map((todo, i) => (
          <TodoItem
            key={todo._id}
            todo={todo}
            index={i}
            onToggle={() => onToggle(todo._id)}
            onEdit={() => onEdit(todo)}
            onDelete={() => onDelete(todo._id)}
          />
        ))}
      </AnimatePresence>

      {done.length > 0 && (
        <>
          <p className="text-xs text-gray-400 uppercase tracking-wider pt-4 pb-2 px-1 font-medium">
            Completed ({done.length})
          </p>
          <AnimatePresence initial={false}>
            {done.map((todo, i) => (
              <TodoItem
                key={todo._id}
                todo={todo}
                index={i}
                onToggle={() => onToggle(todo._id)}
                onEdit={() => onEdit(todo)}
                onDelete={() => onDelete(todo._id)}
              />
            ))}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
