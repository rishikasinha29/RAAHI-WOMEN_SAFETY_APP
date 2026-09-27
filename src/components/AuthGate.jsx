import { useEffect, useState } from "react"

import Login from "../pages/Login"
import Register from "../pages/Register"

import {
  getCurrentUser,
  logoutUser,
} from "../services/api"

function AuthGate({
  children,
}) {
  const [
    user,
    setUser,
  ] = useState(null)

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    showRegister,
    setShowRegister,
  ] = useState(false)

  useEffect(() => {
    async function restoreSession() {
      const token =
        localStorage.getItem(
          "anzen_user_token"
        )

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const result =
          await getCurrentUser()

        setUser(
          result.user
        )
      } catch (error) {
        console.error(
          "Session restoration failed:",
          error
        )

        logoutUser()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  function handleLogin(
    loggedInUser
  ) {
    setUser(
      loggedInUser
    )
  }

  function handleRegister(
    registeredUser
  ) {
    setUser(
      registeredUser
    )
  }

  function handleLogout() {
    logoutUser()
    setUser(null)
    setShowRegister(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-sm text-gray-600">
          Loading ANZEN...
        </div>
      </div>
    )
  }

  if (!user) {
    if (showRegister) {
      return (
        <Register
          onRegister={
            handleRegister
          }
          onShowLogin={() =>
            setShowRegister(
              false
            )
          }
        />
      )
    }

    return (
      <Login
        onLogin={
          handleLogin
        }
        onShowRegister={() =>
          setShowRegister(
            true
          )
        }
      />
    )
  }

  return (
    <>
      {children({
        user,
        onLogout:
          handleLogout,
      })}
    </>
  )
}

export default AuthGate