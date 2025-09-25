import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "../../../components/ui/Dialog";

const BASE = "https://dummyjson.com/todos";

export default function TodoList() {
  const [page, setPage] = useState(1);
  const [newTitle, setNewTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingTodo, setEditingTodo] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTodoId, setDeleteTodoId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const todosPerPage = 10;
  const queryClient = useQueryClient();

  const {
    data: todosData = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const cached = localStorage.getItem("todos");
      if (cached) return JSON.parse(cached);

      const res = await fetch(`${BASE}/?limit=150`);
      const data = await res.json();
      localStorage.setItem("todos", JSON.stringify(data.todos));
      return data.todos;
    },
  });

  const createTodo = useMutation({
    mutationFn: async (newTodo) => {
      const res = await fetch(`${BASE}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTodo),
      });
      if (!res.ok) throw new Error("Failed to add todo");
      return res.json();
    },
    onSuccess: (added) => {
      queryClient.setQueryData(["todos"], (old = []) => [added, ...old]);
      setNewTitle("");
    },
  });

  const updateTodo = useMutation({
    mutationFn: async (todo) => {
      const res = await fetch(`${BASE}/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todo),
      });
      if (!res.ok) throw new Error("Failed to update todo");
      return res.json();
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["todos"], (old = []) =>
        old.map((t) => (t.id === updated.id ? updated : t))
      );
      setIsEditOpen(false);
      setEditingTodo(null);
    },
  });

  const deleteTodo = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(["todos"], (old = []) =>
        old.filter((t) => t.id !== id)
      );
      setIsDeleteOpen(false);
      setDeleteTodoId(null);
    },
  });

  const toggleCompleted = useMutation({
    mutationFn: async (todo) => {
      const res = await fetch(`${BASE}/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (!res.ok) throw new Error("Failed to toggle completion");
      return res.json();
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["todos"], (old = []) =>
        old.map((t) => (t.id === updated.id ? updated : t))
      );
    },
  });

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setEditTitle(todo.todo);
    setIsEditOpen(true);
  };
  const handleDelete = (todo) => {
    setDeleteTodoId(todo.id);
    setIsDeleteOpen(true);
  };

  const filtered = todosData.filter((todo) => {
    const matchesSearch = todo.todo
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "completed" && todo.completed) ||
      (filterStatus === "incomplete" && !todo.completed);
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / todosPerPage);
  const start = (page - 1) * todosPerPage;
  const paginated = filtered.slice(start, start + todosPerPage);

  return (
    <main
      role="main"
      className="relative z-10 p-4 min-h-screen pb-32 bg-pink-950 text-white"
      aria-label="Todo App Main Area"
    >
      <section className="mb-6 max-w-6xl mx-auto flex flex-col lg:flex-row justify-between gap-6">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 bg-white p-4 rounded-xl shadow-md w-full max-w-full lg:w-1/2">
          <input
            aria-label="Search Todos"
            placeholder="Search todos..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="flex-1 min-w-0 px-4 py-2 border border-pink-400 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-800 w-full sm:w-auto"
          />
          <select
            aria-label="Filter by status"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-pink-400 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-800 w-full sm:w-auto"
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </div>

        {/* Add Todo */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newTitle.trim()) return;
            createTodo.mutate({ todo: newTitle, completed: false, userId: 1 });
          }}
          className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl shadow-md w-full max-w-full lg:w-1/2"
        >
          <input
            type="text"
            aria-label="Todo input"
            placeholder="Enter a todo..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 px-4 py-2 border border-pink-400 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-800 w-full"
          />
          <Button
            type="submit"
            className="bg-pink-800 text-white px-4 py-2 rounded-md hover:bg-pink-900 focus:outline-none focus:ring-2 focus:ring-pink-500 w-full sm:w-auto"
          >
            Add
          </Button>
        </form>
      </section>

      {/* Todo List */}
      <section aria-live="polite" className="overflow-x-hidden">
        {isLoading ? (
          <p>Loading...</p>
        ) : isError ? (
          <p className="text-red-500">Error loading todos</p>
        ) : (
          <>
            <ul className="space-y-2 max-w-2xl mx-auto px-2">
              {paginated.map((todo) => (
                <li
                  key={todo.id}
                  className="bg-pink-100 border border-pink-300 rounded-lg p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 overflow-x-auto"
                >
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleCompleted.mutate(todo)}
                      className="h-4 w-4 accent-pink-800 focus:outline focus:ring shrink-0"
                      aria-label={`Mark ${todo.todo} as ${
                        todo.completed ? "incomplete" : "completed"
                      }`}
                    />
                    <div className="min-w-0">
                      <Link
                        to={`/todos/${todo.id}`}
                        className="text-pink-800 underline hover:text-pink-900 focus:outline focus:ring break-words"
                      >
                        {todo.todo}
                      </Link>
                      <p className="text-sm text-gray-600 whitespace-nowrap">
                        Status:{" "}
                        {todo.completed ? "✅ Completed" : "❌ Incomplete"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap justify-end">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleEdit(todo)}
                      className="text-pink-800 border border-pink-700 hover:bg-pink-200"
                    >
                      ✏️
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(todo)}
                      className="bg-pink-800 text-white hover:bg-pink-900"
                    >
                      🗑️
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Pagination */}
            <nav
              aria-label="Pagination"
              className="relative z-20 flex justify-center items-center gap-2 mt-6 flex-wrap px-2 overflow-x-auto"
            >
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-pink-950 border border-pink-500 hover:bg-pink-100"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
              >
                Prev
              </Button>

              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  aria-current={page === i + 1 ? "page" : undefined}
                  size="sm"
                  className={`${
                    page === i + 1
                      ? "bg-pink-800 text-white"
                      : "bg-white text-pink-950 border border-pink-500 hover:bg-pink-100"
                  }`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                className="bg-white text-pink-950 border border-pink-500 hover:bg-pink-100"
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </nav>
          </>
        )}
      </section>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="z-50 bg-white rounded-lg p-6 shadow-lg max-h-[90vh] overflow-y-auto max-w-[95vw] sm:max-w-md">
          <DialogTitle className="text-lg font-semibold mb-4">
            Edit Todo
          </DialogTitle>
          <form
            className="space-y-4 mt-4 w-full max-w-full"
            onSubmit={(e) => {
              e.preventDefault();
              updateTodo.mutate({ ...editingTodo, todo: editTitle });
            }}
          >
            <input
              className="border border-pink-500 rounded px-3 py-2 w-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />

            <div className="flex flex-col sm:flex-row justify-end gap-2 w-full">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="text-pink-950 w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="bg-pink-600 text-white hover:bg-pink-700 w-full sm:w-auto"
              >
                Update
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="z-50 bg-white rounded-lg p-6 shadow-lg max-h-[90vh] overflow-y-auto w-full max-w-[95vw] sm:max-w-md">
          <DialogTitle className="text-lg font-semibold">
            Delete Todo?
          </DialogTitle>
          <p className="text-gray-700 my-3">
            Are you sure you want to delete this todo?
          </p>
          <div className="flex justify-end gap-2 mt-4 flex-wrap">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="text-pink-950 w-full sm:w-auto"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={() => deleteTodo.mutate(deleteTodoId)}
              className="bg-pink-800 text-white hover:bg-pink-900 w-full sm:w-auto"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
