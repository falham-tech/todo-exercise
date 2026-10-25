// To-dos are saved in the browser's localStorage so they survive a page reload.
const STORAGE_KEY = "todos";
// The priority last chosen when adding a task, so the dropdown keeps it.
const PRIORITY_KEY = "lastPriority";
// Sort order for the list: lower number comes first.
const PRIORITY_RANK = { hoch: 0, mittel: 1, niedrig: 2 };

let todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
// Older tasks may lack these fields: priority defaults to "mittel",
// prioritySetAt falls back to the id (which is also a Date.now() timestamp).
todos = todos.map((t) => ({
  ...t,
  priority: t.priority || "mittel",
  prioritySetAt: t.prioritySetAt ?? t.id,
}));
let filter = "all";

const form = document.getElementById("new-todo-form");
const input = document.getElementById("new-todo-input");
const prioritySelect = document.getElementById("new-todo-priority");
const lastPriority = localStorage.getItem(PRIORITY_KEY);
if (Object.hasOwn(PRIORITY_RANK, lastPriority)) prioritySelect.value = lastPriority;
const list = document.getElementById("todo-list");
const count = document.getElementById("count");

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// Swaps a task's text for an edit field and a priority dropdown.
// Enter saves both; Escape or clicking elsewhere restores the old row.
function startEdit(li, textSpan, todo) {
  const editor = document.createElement("span");
  editor.className = "edit";

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "edit-input";
  editInput.value = todo.text;

  const editPriority = document.createElement("select");
  editPriority.className = "edit-priority";
  for (const p of Object.keys(PRIORITY_RANK)) {
    const option = document.createElement("option");
    option.value = p;
    option.textContent = p;
    editPriority.append(option);
  }
  editPriority.value = todo.priority;

  editor.append(editInput, editPriority);
  textSpan.replaceWith(editor);
  li.querySelector(".priority-label")?.remove();

  // render() removes the editor, which can fire focusout; only finish once.
  let finished = false;

  function commit() {
    if (finished) return;
    finished = true;
    const text = editInput.value.trim();
    // An empty text leaves the task unchanged.
    if (text) {
      todo.text = text;
      // Only a changed priority moves the task; a text-only edit keeps its place.
      if (editPriority.value !== todo.priority) {
        todo.priority = editPriority.value;
        todo.prioritySetAt = Date.now();
      }
      save();
    }
    render();
  }

  function cancel() {
    if (finished) return;
    finished = true;
    render();
  }

  editor.addEventListener("keydown", (e) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") cancel();
  });

  // Moving focus between the field and the dropdown is fine; anywhere else cancels.
  editor.addEventListener("focusout", (e) => {
    if (!editor.contains(e.relatedTarget)) cancel();
  });

  editInput.focus();
  editInput.select();
}

function render() {
  list.innerHTML = "";

  const visible = todos.filter((t) =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done
  );
  // Open before done, then hoch > mittel > niedrig, then most recently prioritized first.
  visible.sort(
    (a, b) =>
      a.done - b.done ||
      PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
      b.prioritySetAt - a.prioritySetAt
  );

  for (const todo of visible) {
    const li = document.createElement("li");
    li.classList.add("priority-" + todo.priority);
    if (todo.done) li.classList.add("done");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", () => {
      todo.done = checkbox.checked;
      save();
      render();
    });

    const text = document.createElement("span");
    text.textContent = todo.text;
    // Only open tasks can be edited.
    if (!todo.done) {
      text.addEventListener("dblclick", () => startEdit(li, text, todo));
    }

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "×";
    del.title = "Delete";
    del.addEventListener("click", () => {
      todos = todos.filter((t) => t.id !== todo.id);
      save();
      render();
    });

    li.append(checkbox, text);

    // "mittel" is the default, so only "hoch" and "niedrig" get a label.
    if (todo.priority !== "mittel") {
      const label = document.createElement("small");
      label.className = "priority-label";
      label.textContent = todo.priority;
      li.append(label);
    }

    li.append(del);
    list.append(li);
  }

  const left = todos.filter((t) => !t.done).length;
  count.textContent = `${left} item${left === 1 ? "" : "s"} left`;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  const now = Date.now();
  todos.push({ id: now, text, done: false, priority: prioritySelect.value, prioritySetAt: now });
  input.value = "";
  localStorage.setItem(PRIORITY_KEY, prioritySelect.value);
  save();
  render();
});

document.querySelectorAll(".filters button").forEach((btn) => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    document.querySelectorAll(".filters button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    render();
  });
});

document.getElementById("clear-done").addEventListener("click", () => {
  todos = todos.filter((t) => !t.done);
  save();
  render();
});

render();
