import { todosApi } from "./api.js";
import { renderApp } from "./components.js";
import { createStore } from "./store.js";

const root = document.querySelector("#app");

const store = createStore({
  todos: [],
  filter: "all",
  loading: true,
  saving: false,
  editingId: null,
  error: "",
  notice: "",
  form: {
    title: "",
    description: "",
  },
});

store.subscribe(render);
render(store.getState());
void loadTodos();

root.addEventListener("submit", handleSubmit);
root.addEventListener("click", handleClick);

function render(state) {
  root.innerHTML = renderApp(state);
}

async function loadTodos(filter = store.getState().filter) {
  store.setState((current) => ({
    ...current,
    loading: true,
    error: "",
    filter,
  }));

  try {
    const todos = await todosApi.list(filter);
    store.setState((current) => ({
      ...current,
      todos,
      loading: false,
      error: "",
    }));
  } catch (error) {
    store.setState((current) => ({
      ...current,
      loading: false,
      error: error.message,
    }));
  }
}

async function handleSubmit(event) {
  const form = event.target;

  if (form.id === "composer-form") {
    event.preventDefault();
    const formData = new FormData(form);
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();

    if (!title) {
      updateNotice("El título es obligatorio.", true);
      return;
    }

    store.setState((current) => ({
      ...current,
      saving: true,
      error: "",
      notice: "",
      form: { title, description },
    }));

    try {
      await todosApi.create({ title, description: description || null });
      store.setState((current) => ({
        ...current,
        saving: false,
        form: { title: "", description: "" },
        notice: "Tarea creada correctamente.",
      }));
      await loadTodos();
    } catch (error) {
      store.setState((current) => ({
        ...current,
        saving: false,
        error: error.message,
      }));
    }
    return;
  }

  if (form.matches('[data-action="save-edit"]')) {
    event.preventDefault();
    const todoId = Number(form.dataset.id);
    const formData = new FormData(form);
    const payload = {
      title: String(formData.get("title") || "").trim(),
      description: String(formData.get("description") || "").trim() || null,
      completed: formData.get("completed") === "on",
    };

    if (!payload.title) {
      updateNotice("El título no puede quedar vacío.", true);
      return;
    }

    try {
      await todosApi.update(todoId, payload);
      store.setState((current) => ({
        ...current,
        editingId: null,
        notice: "Tarea actualizada.",
        error: "",
      }));
      await loadTodos();
    } catch (error) {
      updateNotice(error.message, true);
    }
  }
}

async function handleClick(event) {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  const filter = button.dataset.filter;
  if (filter) {
    await loadTodos(filter);
    return;
  }

  const scrollTarget = button.dataset.scrollTarget;
  if (scrollTarget) {
    document.getElementById(scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const action = button.dataset.action;
  const todoId = Number(button.dataset.id);

  if (action === "edit") {
    store.setState((current) => ({
      ...current,
      editingId: current.editingId === todoId ? null : todoId,
      notice: "",
      error: "",
    }));
    return;
  }

  if (action === "toggle-complete") {
    const todo = store.getState().todos.find((item) => item.id === todoId);
    if (!todo) {
      return;
    }

    try {
      await todosApi.update(todoId, { completed: !todo.completed });
      updateNotice(todo.completed ? "Tarea reabierta." : "Tarea completada.");
      await loadTodos();
    } catch (error) {
      updateNotice(error.message, true);
    }
    return;
  }

  if (action === "delete") {
    try {
      await todosApi.remove(todoId);
      updateNotice("Tarea eliminada.");
      await loadTodos();
    } catch (error) {
      updateNotice(error.message, true);
    }
  }
}

function updateNotice(message, isError = false) {
  store.setState((current) => ({
    ...current,
    notice: isError ? "" : message,
    error: isError ? message : "",
  }));
}
