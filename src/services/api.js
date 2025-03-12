const BASE_URL = "https://momentum.redberryinternship.ge/api";
const TOKEN = "9e69d22c-85b5-454e-a871-48dd9f497777";

async function fetchWithAuth(endpoint, options = {}) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (endpoint !== "/statuses" && endpoint !== "/priorities") {
    headers["Authorization"] = `Bearer ${TOKEN}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}


export const fetchStatuses = () => fetchWithAuth("/statuses");

export const fetchPriorities = () => fetchWithAuth("/priorities");

export const fetchDepartments = () => fetchWithAuth("/departments");

export const fetchEmployees = () => fetchWithAuth("/employees");

export const fetchEmployeesByDepartment = (departmentId) =>
  fetchWithAuth(`/employees?department_id=${departmentId}`);

export const createEmployee = (data) =>
  fetchWithAuth("/employees", {
    method: "POST",
    body: JSON.stringify(data),
  });


export const fetchTasks = () => fetchWithAuth("/tasks");
export const fetchTask = (id) => fetchWithAuth(`/tasks/${id}`);
export const createTask = (data) =>
  fetchWithAuth("/tasks", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateTask = (id, data) =>
  fetchWithAuth(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });


  export const fetchTaskComments = (taskId) =>
  fetchWithAuth(`/tasks/${taskId}/comments`);
  
export const createTaskComment = (taskId, data) =>
  fetchWithAuth(`/tasks/${taskId}/comments`, {
    method: "POST",
    body: JSON.stringify(data),
  });
