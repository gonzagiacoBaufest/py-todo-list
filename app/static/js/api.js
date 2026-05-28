const TODOS_ENDPOINT = "/todos/";

async function request(path = "", options = {}) {
  const response = await fetch(`${TODOS_ENDPOINT}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = "No se pudo completar la solicitud.";

    try {
      const payload = await response.json();
      message = payload.detail ?? message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const todosApi = {
  list(filter = "all") {
    const query = filter === "all" ? "" : `?completed=${filter === "completed"}`;
    return request(query);
  },
  create(payload) {
    return request("", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update(todoId, payload) {
    return request(String(todoId), {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  remove(todoId) {
    return request(String(todoId), {
      method: "DELETE",
    });
  },
};
