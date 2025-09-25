import { Outlet } from "@tanstack/react-router";
import logo from "../assets/logo.png";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-pink-950 text-white">
      <header className="w-full bg-pink-50 py-6 px-4 text-center">
        <img
          src={logo}
          alt="Todo App Logo"
          className="h-10 sm:h-12 mx-auto mb-3 sm:mb-4"
        />
        <h1 className="text-3xl sm:text-5xl font-bold text-pink-950">Todo App</h1>
      </header>

      <section className="p-4">
        <Outlet />
      </section>
    </div>
  );
}
