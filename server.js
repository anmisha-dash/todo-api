const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// serve frontend
app.use(express.static('public'));

// in-memory todos
let todos = [
  { id: 1, title: 'Learn HTML & CSS', completed: true,  priority: 'high',   createdAt: new Date().toISOString() },
  { id: 2, title: 'Learn JavaScript', completed: true,  priority: 'high',   createdAt: new Date().toISOString() },
  { id: 3, title: 'Build 30 projects', completed: false, priority: 'high',  createdAt: new Date().toISOString() },
  { id: 4, title: 'Learn Node.js',    completed: false, priority: 'medium', createdAt: new Date().toISOString() },
  { id: 5, title: 'Build a full stack app', completed: false, priority: 'low', createdAt: new Date().toISOString() },
];

let nextId = 6;

// GET all todos
app.get('/todos', (req, res) => {
  const { status, priority } = req.query;
  let result = todos;

  if (status === 'completed') result = result.filter(t => t.completed);
  if (status === 'pending')   result = result.filter(t => !t.completed);
  if (priority) result = result.filter(t => t.priority === priority);

  res.json({
    total: result.length,
    completed: result.filter(t => t.completed).length,
    pending: result.filter(t => !t.completed).length,
    todos: result
  });
});

// GET single todo
app.get('/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  res.json(todo);
});

// POST — create todo
app.post('/todos', (req, res) => {
  const { title, priority } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const newTodo = {
    id: nextId++,
    title,
    completed: false,
    priority: priority || 'medium',
    createdAt: new Date().toISOString()
  };

  todos.push(newTodo);
  res.status(201).json({ message: 'Todo created!', todo: newTodo });
});

// PUT — update todo
app.put('/todos/:id', (req, res) => {
  const index = todos.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Todo not found' });

  todos[index] = { ...todos[index], ...req.body, id: todos[index].id };
  res.json({ message: 'Todo updated!', todo: todos[index] });
});

// PATCH — toggle complete
app.patch('/todos/:id/toggle', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));
  if (!todo) return res.status(404).json({ error: 'Todo not found' });

  todo.completed = !todo.completed;
  res.json({ message: `Todo marked as ${todo.completed ? 'completed' : 'pending'}`, todo });
});

// DELETE — single todo
app.delete('/todos/:id', (req, res) => {
  const index = todos.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Todo not found' });

  const deleted = todos.splice(index, 1)[0];
  res.json({ message: 'Todo deleted!', todo: deleted });
});

// DELETE — clear completed
app.delete('/todos/clear/completed', (req, res) => {
  const before = todos.length;
  todos = todos.filter(t => !t.completed);
  res.json({ message: `Cleared ${before - todos.length} completed todos`, remaining: todos.length });
});

// GET stats
app.get('/stats', (req, res) => {
  res.json({
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length,
    byPriority: {
      high:   todos.filter(t => t.priority === 'high').length,
      medium: todos.filter(t => t.priority === 'medium').length,
      low:    todos.filter(t => t.priority === 'low').length,
    }
  });
});

app.listen(PORT, () => {
  console.log(`Todo API running at http://localhost:${PORT}`);
  console.log('\nRoutes:');
  console.log('  GET    /todos');
  console.log('  GET    /todos?status=pending&priority=high');
  console.log('  GET    /todos/:id');
  console.log('  POST   /todos');
  console.log('  PUT    /todos/:id');
  console.log('  PATCH  /todos/:id/toggle');
  console.log('  DELETE /todos/:id');
  console.log('  DELETE /todos/clear/completed');
  console.log('  GET    /stats');
});