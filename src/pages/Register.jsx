import { useState } from "react"
import {
  registerUser,
} from "../services/api"

function Register({
  onRegister,
  onShowLogin,
}) {
  const [
    name,
    setName,
  ] = useState("")

  const [
    email,
    setEmail,
  ] = useState("")

  const [
    password,
    setPassword,
  ] = useState("")

  const [
    confirmPassword,
    setConfirmPassword,
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

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      )

      return
    }

    setLoading(true)

    try {
      const result =
        await registerUser(
          name,
          email,
          password
        )

      onRegister(
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
          Create your ANZEN account
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Your reports and activity can be associated with your account.
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <label className="mt-6 block text-sm font-medium text-gray-700">
          Name
        </label>

        <input
          type="text"
          value={name}
          onChange={(event) =>
            setName(
              event.target.value
            )
          }
          required
          minLength={2}
          maxLength={120}
          className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          placeholder="Your name"
        />

        <label className="mt-4 block text-sm font-medium text-gray-700">
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
          minLength={8}
          className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          placeholder="At least 8 characters"
        />

        <label className="mt-4 block text-sm font-medium text-gray-700">
          Confirm password
        </label>

        <input
          type="password"
          value={
            confirmPassword
          }
          onChange={(event) =>
            setConfirmPassword(
              event.target.value
            )
          }
          required
          minLength={8}
          className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          placeholder="Repeat password"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-black px-4 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {loading
            ? "Creating account..."
            : "Create Account"}
        </button>

        <button
          type="button"
          onClick={
            onShowLogin
          }
          className="mt-4 w-full text-sm text-gray-600 hover:text-black"
        >
          Already have an account?{" "}
          <span className="font-semibold">
            Login
          </span>
        </button>
      </form>
    </div>
  )
}

export default Register