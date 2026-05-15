let currentFilter = 'all';

async function loadTodos() {
  const url = currentFilter === 'all'
    ? '/todos'
    : `/todos?status=${currentFilter}`;

  const res  = await fetch(url);
  const data = await res.json();

  renderTodos(data.todos);
  loadStats();
}

async function loadStats() {
  const res  = await fetch('/stats');
  const data = await res.json();

  document.getElementById('statsRow').innerHTML = `
    <div class="stat-card">
      <span class="stat-num">${data.total}</span>
      <span class="stat-label">Total</span>
    </div>
    <div class="stat-card">
      <span class="stat-num" style="color:#1D9E75">${data.completed}</span>
      <span class="stat-label">Done</span>
    </div>
    <div class="stat-card">
      <span class="stat-num" style="color:#D85A30">${data.pending}</span>
      <span class="stat-label">Pending</span>
    </div>
  `;
}

function renderTodos(todos) {
  const list = document.getElementById('todosList');

  if (todos.length === 0) {
    list.innerHTML = `<div class="empty-state">No todos here!</div>`;
    return;
  }

  list.innerHTML = todos.map(todo => `
    <div class="todo-item ${todo.completed ? 'completed' : ''}">
      <div class="todo-check ${todo.completed ? 'done' : ''}"
        onclick="toggleTodo(${todo.id})">
        ${todo.completed ? '✓' : ''}
      </div>
      <span class="todo-title">${todo.title}</span>
      <span class="priority-badge priority-${todo.priority}">${todo.priority}</span>
      <button class="todo-delete" onclick="deleteTodo(${todo.id})">✕</button>
    </div>
  `).join('');
}

async function addTodo() {
  const title    = document.getElementById('todoInput').value.trim();
  const priority = document.getElementById('prioritySelect').value;
  if (!title) return;

  await fetch('/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, priority })
  });

  document.getElementById('todoInput').value = '';
  loadTodos();
}

async function toggleTodo(id) {
  await fetch(`/todos/${id}/toggle`, { method: 'PATCH' });
  loadTodos();
}

async function deleteTodo(id) {
  await fetch(`/todos/${id}`, { method: 'DELETE' });
  loadTodos();
}

async function clearCompleted() {
  await fetch('/todos/clear/completed', { method: 'DELETE' });
  loadTodos();
}

function setFilter(btn, filter) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = filter;
  loadTodos();
}

document.getElementById('todoInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTodo();
});

loadTodos();