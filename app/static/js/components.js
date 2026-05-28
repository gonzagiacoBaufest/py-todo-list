function formatDate(value) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderApp(state) {
  const stats = buildStats(state.todos);
  const recentTodos = [...state.todos]
    .sort((left, right) => new Date(right.updated_at) - new Date(left.updated_at))
    .slice(0, 2);

  return `
    <div class="page-shell">
      <header class="top-nav">
        <div class="brand-lockup">
          <div class="brand-mark">T</div>
          <div>
            <p class="eyebrow">Todo Workspace</p>
            <span class="brand-name">TaskFlow</span>
          </div>
        </div>
        <div class="header-actions">
          <span class="header-summary">${state.todos.length} tareas</span>
          <button class="button-primary" data-scroll-target="todo-form">Nueva tarea</button>
        </div>
      </header>

      <main>
        <section class="hero-band container">
          <div class="hero-copy">
            <span class="badge-pill">Vista rápida</span>
            <h1>Tus tareas, visibles al instante.</h1>
            <p class="hero-text">
              Revisa el tablero, filtra pendientes y crea nuevas tareas sin perder espacio en la portada.
            </p>
            <div class="hero-actions">
              <button class="button-primary" data-scroll-target="todo-form">Nueva tarea</button>
              <button class="button-secondary" data-scroll-target="todo-board">Ver tablero</button>
            </div>
            <div class="hero-stats">
              ${stats.map(renderStatCard).join("")}
            </div>
          </div>
          <aside class="hero-app-mockup-card">
            <div class="mockup-header">
              <span class="mockup-dot"></span>
              <span class="mockup-dot"></span>
              <span class="mockup-dot"></span>
            </div>
            <div class="mockup-body">
              <div>
                <p class="mockup-kicker">Resumen</p>
                <h2>Últimos cambios</h2>
              </div>
              <div class="mockup-grid">
                ${recentTodos.length > 0 ? recentTodos.map(renderPreviewTile).join("") : renderMockupEmpty()}
              </div>
            </div>
          </aside>
        </section>

        <section class="container board-section board-section-primary" id="todo-board">
          <div class="board-header">
            <div class="section-heading narrow">
              <span class="eyebrow">Tablero</span>
              <h2>Tareas activas</h2>
              <p>Filtra, edita y cambia el estado de cada tarea con acciones directas.</p>
            </div>
            <div class="nav-pill-group" aria-label="Filtro del tablero">
              ${renderBoardFilters(state.filter)}
            </div>
          </div>
          <div class="todo-grid">
            ${state.loading ? renderLoadingState() : renderTodoCollection(state)}
          </div>
        </section>

        <section class="container content-grid">
          <div class="feature-card panel-card" id="todo-form">
            <div class="section-heading">
              <span class="eyebrow">Captura rápida</span>
              <h2>Nueva tarea</h2>
              <p>Crea una tarea con título y descripción. La interfaz mantiene el flujo en una sola pantalla.</p>
            </div>
            ${renderComposer(state)}
          </div>

          <div class="product-mockup-card panel-card">
            <div class="section-heading">
              <span class="eyebrow">Resumen operativo</span>
              <h2>Estado del tablero</h2>
            </div>
            <div class="insight-list">
              ${renderInsight("Total de tareas", String(state.todos.length))}
              ${renderInsight("Pendientes", String(state.todos.filter((todo) => !todo.completed).length))}
              ${renderInsight("Completadas", String(state.todos.filter((todo) => todo.completed).length))}
              ${renderInsight("Filtro activo", renderFilterLabel(state.filter))}
            </div>
            ${state.error ? `<div class="feedback-banner error">${escapeHtml(state.error)}</div>` : ""}
            ${state.notice ? `<div class="feedback-banner success">${escapeHtml(state.notice)}</div>` : ""}
          </div>
        </section>
      </main>

      <footer class="footer">
        <div class="container footer-grid">
          <div>
            <p class="footer-brand">TaskFlow</p>
            <p class="footer-copy">
              Frontend en HTML, CSS y JavaScript conectado a tu API FastAPI para gestionar tareas.
            </p>
          </div>
          <div>
            <p class="footer-title">Acciones</p>
            <a href="#todo-form">Nueva tarea</a>
            <a href="#todo-board">Tablero</a>
          </div>
          <div>
            <p class="footer-title">Filtros</p>
            <button class="footer-link" data-filter="all">Todas</button>
            <button class="footer-link" data-filter="pending">Pendientes</button>
            <button class="footer-link" data-filter="completed">Completadas</button>
          </div>
          <div>
            <p class="footer-title">Estado</p>
            <p class="footer-copy">${state.todos.length} tareas sincronizadas</p>
            <p class="footer-copy">Última actualización visual inmediata</p>
          </div>
        </div>
      </footer>
    </div>
  `;
}

function buildStats(todos) {
  const completed = todos.filter((todo) => todo.completed).length;
  const pending = todos.length - completed;

  return [
    { label: "Total", value: todos.length },
    { label: "Pendientes", value: pending },
    { label: "Completadas", value: completed },
  ];
}

function renderQuickFilter(activeFilter) {
  return [
    ["all", "Todas"],
    ["pending", "Pendientes"],
    ["completed", "Hechas"],
  ]
    .map(
      ([value, label]) => `
        <button
          class="category-tab ${activeFilter === value ? "category-tab-active" : ""}"
          data-filter="${value}"
        >
          ${label}
        </button>
      `
    )
    .join("");
}

function renderBoardFilters(activeFilter) {
  return renderQuickFilter(activeFilter);
}

function renderStatCard(stat) {
  return `
    <article class="feature-icon-card stat-card">
      <span class="stat-label">${stat.label}</span>
      <strong class="stat-value">${stat.value}</strong>
    </article>
  `;
}

function renderPreviewTile(todo) {
  return `
    <article class="preview-tile ${todo.completed ? "is-complete" : ""}">
      <div class="preview-topline">
        <span class="badge-pill ${todo.completed ? "badge-success" : ""}">
          ${todo.completed ? "Completa" : "Pendiente"}
        </span>
        <span class="preview-time">${formatDate(todo.updated_at)}</span>
      </div>
      <h3>${escapeHtml(todo.title)}</h3>
      <p>${escapeHtml(todo.description || "Sin descripción")}</p>
    </article>
  `;
}

function renderMockupEmpty() {
  return `
    <article class="preview-tile">
      <div class="preview-topline">
        <span class="badge-pill">Listo para empezar</span>
      </div>
      <h3>Crea tu primera tarea</h3>
      <p>El mockup mostrará aquí tus tareas más recientes.</p>
    </article>
  `;
}

function renderComposer(state) {
  return `
    <form class="todo-form" id="composer-form">
      <label>
        <span>Título</span>
        <input
          class="text-input"
          type="text"
          name="title"
          placeholder="Ej. Preparar demo"
          value="${escapeHtml(state.form.title)}"
          required
        />
      </label>
      <label>
        <span>Descripción</span>
        <textarea
          class="text-input text-area"
          name="description"
          placeholder="Añade contexto o próximos pasos"
          rows="4"
        >${escapeHtml(state.form.description)}</textarea>
      </label>
      <button class="button-primary" type="submit" ${state.saving ? "disabled" : ""}>
        ${state.saving ? "Guardando..." : "Guardar tarea"}
      </button>
    </form>
  `;
}

function renderInsight(label, value) {
  return `
    <div class="insight-row">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `;
}

function renderLoadingState() {
  return `
    <article class="feature-card empty-state">
      <p class="eyebrow">Sincronizando</p>
      <h3>Cargando tareas...</h3>
    </article>
  `;
}

function renderTodoCollection(state) {
  if (state.todos.length === 0) {
    return `
      <article class="feature-card empty-state">
        <p class="eyebrow">Sin tareas</p>
        <h3>No hay elementos en este filtro.</h3>
        <p>Crea una tarea nueva o cambia el filtro para ver más contenido.</p>
      </article>
    `;
  }

  return state.todos.map((todo) => renderTodoCard(todo, state.editingId)).join("");
}

function renderTodoCard(todo, editingId) {
  const isEditing = editingId === todo.id;

  return `
    <article class="feature-card todo-card ${todo.completed ? "todo-card-complete" : ""}">
      <div class="todo-card-top">
        <span class="badge-pill ${todo.completed ? "badge-success" : ""}">
          ${todo.completed ? "Completada" : "En progreso"}
        </span>
        <div class="todo-actions">
          <button
            class="button-icon"
            data-action="toggle-complete"
            data-id="${todo.id}"
            aria-label="${todo.completed ? "Marcar como pendiente" : "Marcar como completada"}"
          >
            ${todo.completed ? "↺" : "✓"}
          </button>
          <button
            class="button-icon"
            data-action="edit"
            data-id="${todo.id}"
            aria-label="${isEditing ? "Cancelar edición" : "Editar tarea"}"
          >
            ${isEditing ? "×" : "✎"}
          </button>
          <button
            class="button-icon danger"
            data-action="delete"
            data-id="${todo.id}"
            aria-label="Eliminar tarea"
          >
            🗑
          </button>
        </div>
      </div>
      ${
        isEditing
          ? renderEditForm(todo)
          : `
            <div class="todo-copy">
              <h3>${escapeHtml(todo.title)}</h3>
              <p>${escapeHtml(todo.description || "Sin descripción")}</p>
            </div>
          `
      }
      <div class="todo-meta">
        <span>Creada ${formatDate(todo.created_at)}</span>
        <span>Actualizada ${formatDate(todo.updated_at)}</span>
      </div>
    </article>
  `;
}

function renderEditForm(todo) {
  return `
    <form class="todo-edit-form" data-action="save-edit" data-id="${todo.id}">
      <label>
        <span>Título</span>
        <input class="text-input" type="text" name="title" value="${escapeHtml(todo.title)}" required />
      </label>
      <label>
        <span>Descripción</span>
        <textarea class="text-input text-area" name="description" rows="3">${escapeHtml(todo.description || "")}</textarea>
      </label>
      <label class="checkbox-row">
        <input type="checkbox" name="completed" ${todo.completed ? "checked" : ""} />
        <span>Marcar como completada</span>
      </label>
      <div class="inline-actions">
        <button class="button-primary" type="submit">Guardar cambios</button>
        <button class="button-secondary" type="button" data-action="edit" data-id="${todo.id}">Cancelar</button>
      </div>
    </form>
  `;
}

function renderFilterLabel(filter) {
  if (filter === "pending") {
    return "Pendientes";
  }
  if (filter === "completed") {
    return "Completadas";
  }
  return "Todas";
}
