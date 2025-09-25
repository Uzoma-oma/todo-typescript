import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import RootLayout from "../layout/AppLayout";
import TodoList from "../features/todos/pages/TodoList";
import TodoDetail from "../features/todos/pages/TodoDetails";
import NotFound from "../features/todos/pages/NotFound";
import TestError from "../features/errors/TestError";



// 🧩 Root Route
const rootRoute = createRootRoute({
  component: RootLayout,
});

// ✅ Todo List Route (home)
const todoListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: TodoList,
});

// ✅ Todo Detail Route
const todoDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/todos/$id",
  component: TodoDetail,
});

// 🔥 Error Test Route
const errorTestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/error",
  component: () => {
    throw new Error("Intentional test error");
  },
});


// ❌ 404 Not Found Route
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: NotFound,
});

// 📦 Combine Routes
const routeTree = rootRoute.addChildren([
  todoListRoute,
  todoDetailRoute,
  errorTestRoute,
  notFoundRoute,
]);

// 🌐 Create Router
export const router = createRouter({ routeTree });
