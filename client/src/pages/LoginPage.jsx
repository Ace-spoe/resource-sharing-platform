import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setError(null);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(formData.email, formData.password);
      navigate("/courses");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-10 w-full max-w-sm rounded-xl bg-white p-8 shadow">
      <h1 className="mb-6 text-2xl font-semibold text-slate-800">Log in</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
         required placeholder="Email"
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="current-password"
         required placeholder="Password"
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Logging in..." : "Log in"}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      <p className="mt-4 text-sm text-slate-600">
        No account?{" "}
        <Link to="/signup" className="font-medium text-indigo-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;