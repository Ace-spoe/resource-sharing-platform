import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user, loading, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <NavLink
          to="/courses"
          className="text-lg font-semibold text-slate-800 hover:text-indigo-600"
        >
          Study Resources
        </NavLink>

        <nav className="flex items-center gap-4 text-sm">
          {loading ? null : user ? (
            <>
              <span className="text-slate-600">
                {user.name ?? user.email}
              </span>
              <button
                onClick={logout}
                className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="font-medium text-slate-700 hover:text-indigo-600"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white transition hover:bg-indigo-700"
              >
                Signup
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;