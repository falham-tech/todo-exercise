// To-dos are saved in the browser's localStorage so they survive a page reload.
const STORAGE_KEY = "todos";

let todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
// Tasks saved before priorities existed have no priority field; treat them as "mittel".
todos = todos.map((t) => ({ ...t, priority: t.priority || "mittel" }));
let filter = "all";

const form = document.getElementById("new-todo-form");
const input = document.getElementById("new-todo-input");
const prioritySelect = document.getElementById("new-todo-priority");
const list = document.getElementById("todo-list");
const count = document.getElementById("count");

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function render() {
  list.innerHTML = "";

  const visible = todos.filter((t) =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done
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

    if (todo.priority === "hoch") {
      const label = document.createElement("small");
      label.className = "priority-label";
      label.textContent = "hoch";
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
  todos.push({ id: Date.now(), text, done: false, priority: prioritySelect.value });
  input.value = "";
  prioritySelect.value = "mittel";
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
