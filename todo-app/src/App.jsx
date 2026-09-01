import { useState } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  const addTodo = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: trimmed, completed: false },
    ])
    setText('')
  }

  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id))
    if (editingId === id) {
      setEditingId(null)
      setEditText('')
    }
  }

  const startEdit = (todo) => {
    setEditingId(todo.id)
    setEditText(todo.text)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const saveEdit = (id) => {
    const trimmed = editText.trim()
    if (!trimmed) return
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: trimmed } : t)),
    )
    setEditingId(null)
    setEditText('')
  }

  const toggleComplete = (id) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    )
  }

  const remaining = todos.filter((t) => !t.completed).length

  return (
    <div className="app">
      <div className="card">
        <header className="header">
          <h1>Todo List</h1>
          <p className="subtitle">Add, edit, and delete your tasks</p>
        </header>

        <form className="add-form" onSubmit={addTodo}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What needs to be done?"
            aria-label="New todo"
            className="input"
          />
          <button type="submit" className="btn btn-primary">
            Add
          </button>
        </form>

        <ul className="todo-list" aria-label="Todo items">
          {todos.length === 0 && (
            <li className="empty">No todos yet. Add one above.</li>
          )}
          {todos.map((todo) => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'done' : ''}`}>
              {editingId === todo.id ? (
                <div className="edit-row">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="input"
                    aria-label="Edit todo"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(todo.id)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => saveEdit(todo.id)}
                  >
                    Save
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <label className="todo-label">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleComplete(todo.id)}
                      aria-label={`Mark "${todo.text}" complete`}
                    />
                    <span className="todo-text">{todo.text}</span>
                  </label>
                  <div className="actions">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => startEdit(todo)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => deleteTodo(todo.id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>

        {todos.length > 0 && (
          <footer className="footer">
            {remaining} item{remaining === 1 ? '' : 's'} left
          </footer>
        )}
      </div>
    </div>
  )
}

export default App
