// Mock router type for testing
interface MockRouter {
  push: (path: string) => void;
  back: () => void;
  forward: () => void;
  refresh: () => void;
  replace: (path: string) => void;
  prefetch: (path: string) => void;
}

process.emitWarning = () => {}

import React from "react"
import { render, screen, act, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import { AuthProvider, useAuth } from "./AuthContext"
import axios from "axios"

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

// Mock axios
jest.mock("axios")

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
})

// Mock router
const mockRouter: MockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
}

// Mock du composant qui utilise useAuth
const TestComponent = () => {
  const { user, isLoading, login, logout, register } = useAuth()
  if (isLoading) return <div>Loading...</div>
  return (
    <div>
      <div>{user ? `Logged in as ${user.username}` : "Not logged in"}</div>
      <button onClick={() => login("test@example.com", "password")}>Login</button>
      <button onClick={() => register("testuser", "test@example.com", "password")}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
  })

  it("provides authentication context to child components", () => {
    render(
      <AuthProvider router={mockRouter as MockRouter}>
        <TestComponent />
      </AuthProvider>,
    )

    expect(screen.getByText("Not logged in")).toBeInTheDocument()
  })

  it("throws an error when useAuth is used outside of AuthProvider", () => {
    const consoleError = console.error
    console.error = jest.fn()

    expect(() => render(<TestComponent />)).toThrow("useAuth must be used within an AuthProvider")

    console.error = consoleError
  })

  it("handles successful login", async () => {
    const mockUser = { id: "1", email: "test@example.com", username: "testuser", isAdmin: false }
    const mockToken = "mockToken"
    ;(axios.post as jest.Mock).mockResolvedValueOnce({ data: { user: mockUser, token: mockToken } })

    render(
      <AuthProvider router={mockRouter as MockRouter}>
        <TestComponent />
      </AuthProvider>,
    )

    await act(async () => {
      screen.getByText("Login").click()
    })

    await waitFor(() => {
      expect(screen.getByText("Logged in as testuser")).toBeInTheDocument()
    })

    expect(localStorage.getItem("token")).toBe(mockToken)
    expect(axios.defaults.headers.common["Authorization"]).toBe(`Bearer ${mockToken}`)
  })

  it("handles successful registration", async () => {
    const mockUser = { id: "1", email: "test@example.com", username: "testuser", isAdmin: false }
    const mockToken = "mockToken"
    ;(axios.post as jest.Mock).mockResolvedValueOnce({ data: { user: mockUser, token: mockToken } })

    render(
      <AuthProvider router={mockRouter as MockRouter}>
        <TestComponent />
      </AuthProvider>,
    )

    await act(async () => {
      screen.getByText("Register").click()
    })

    await waitFor(() => {
      expect(screen.getByText("Logged in as testuser")).toBeInTheDocument()
    })

    expect(localStorage.getItem("token")).toBe(mockToken)
    expect(axios.defaults.headers.common["Authorization"]).toBe(`Bearer ${mockToken}`)
  })

  it("handles logout", async () => {
    const mockUser = { id: "1", email: "test@example.com", username: "testuser", isAdmin: false }
    const mockToken = "mockToken"
    localStorage.setItem("token", mockToken)
    ;(axios.get as jest.Mock).mockResolvedValueOnce({ data: mockUser })

    render(
      <AuthProvider router={mockRouter as MockRouter}>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Logged in as testuser")).toBeInTheDocument()
    })

    await act(async () => {
      screen.getByText("Logout").click()
    })

    expect(screen.getByText("Not logged in")).toBeInTheDocument()
    expect(localStorage.getItem("token")).toBeNull()
    expect(axios.defaults.headers.common["Authorization"]).toBeUndefined()
    expect(mockRouter.push).toHaveBeenCalledWith("/admin/login")
  })

  it("checks auth status on mount when token exists", async () => {
    const mockUser = { id: "1", email: "test@example.com", username: "testuser", isAdmin: false }
    const mockToken = "mockToken"
    localStorage.setItem("token", mockToken)
    ;(axios.get as jest.Mock).mockResolvedValueOnce({ data: mockUser })

    render(
      <AuthProvider router={mockRouter as MockRouter}>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Logged in as testuser")).toBeInTheDocument()
    })

    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("/auth/me"), expect.any(Object))
  })

  it("handles auth check failure", async () => {
    const mockToken = "invalidToken"
    localStorage.setItem("token", mockToken)
    ;(axios.get as jest.Mock).mockRejectedValueOnce(new Error("Invalid token"))

    render(
      <AuthProvider router={mockRouter as MockRouter}>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Not logged in")).toBeInTheDocument()
    })

    expect(localStorage.getItem("token")).toBeNull()
    expect(axios.defaults.headers.common["Authorization"]).toBeUndefined()
    expect(mockRouter.push).toHaveBeenCalledWith("/admin/login")
  })
})

