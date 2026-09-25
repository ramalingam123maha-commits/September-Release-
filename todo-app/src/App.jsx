import { useEffect, useMemo, useState } from 'react'
import { useLocalStorage } from './useLocalStorage'

const FILTERS = {
  all: () => true,
  active: (todo) => !todo.completed,
  completed: (todo) => todo.completed,
}

export default function App() {
  const [todos, setTodos] = useLocalStorage('todos', [])
  const [theme, setTheme] = useLocalStorage('theme', 'light')
  const [filter, setFilter] = useState('all')
  const [input, setInput] = useState('')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const addTodo = (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setTodos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text, completed: false },
    ])
    setInput('')
  }

  const toggleTodo = (id) =>
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    )

  const deleteTodo = (id) =>
    setTodos((prev) => prev.filter((t) => t.id !== id))

  const clearCompleted = () =>
    setTodos((prev) => prev.filter((t) => !t.completed))

  const visibleTodos = useMemo(
    () => todos.filter(FILTERS[filter]),
    [todos, filter],
  )

  const activeCount = todos.filter((t) => !t.completed).length

  return (
    <div className="app">
      <header className="header">
        <h1>Todos</h1>
        <button
          className="theme-toggle"
          onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          aria-label="Toggle dark mode"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </header>

      <form className="add-form" onSubmit={addTodo}>
        <input
          className="add-input"
          type="text"
          value={input}
          placeholder="What needs to be done?"
          onChange={(e) => setInput(e.target.value)}
          aria-label="New todo"
        />
        <button className="add-btn" type="submit">Add</button>
      </form>

      <div className="filters" role="tablist">
        {Object.keys(FILTERS).map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
            role="tab"
            aria-selected={filter === f}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <ul className="todo-list">
        {visibleTodos.length === 0 && (
          <li className="empty">Nothing here yet.</li>
        )}
        {visibleTodos.map((todo) => (
          <li key={todo.id} className="todo-item">
            <label className="todo-label">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              <span className={todo.completed ? 'done' : ''}>{todo.text}</span>
            </label>
            <button
              className="delete-btn"
              onClick={() => deleteTodo(todo.id)}
              aria-label="Delete todo"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <footer className="footer">
        <span>{activeCount} item{activeCount !== 1 ? 's' : ''} left</span>
        <button className="clear-btn" onClick={clearCompleted}>
          Clear completed
        </button>
      </footer>
    </div>
  )
}
