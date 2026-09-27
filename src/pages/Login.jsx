import { useState } from "react"
import { loginUser } from "../services/api"

function Login({
  onLogin,
  onShowRegister,
}) {
  const [
    email,
    setEmail,
  ] = useState("")

  const [
    password,
    setPassword,
  ] = useState("")

  const [
    loading,
    setLoading,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState("")

  async function handleSubmit(
    event
  ) {
    event.preventDefault()

    setError("")
    setLoading(true)

    try {
      const result =
        await loginUser(
          email,
          password
        )

      onLogin(
        result.user
      )
    } catch (err) {
      setError(
        err.message
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
      >
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome to ANZEN
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Login to continue
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <label className="mt-6 block text-sm font-medium text-gray-700">
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }
          required
          className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          placeholder="you@example.com"
        />

        <label className="mt-4 block text-sm font-medium text-gray-700">
          Password
        </label>

        <input
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(
              event.target.value
            )
          }
          required
          className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          placeholder="••••••••"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-black px-4 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>

        <button
          type="button"
          onClick={
            onShowRegister
          }
          className="mt-4 w-full text-sm text-gray-600 hover:text-black"
        >
          Don't have an account?{" "}
          <span className="font-semibold">
            Create one
          </span>
        </button>
      </form>
    </div>
  )
}

export default Login