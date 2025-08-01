import "@testing-library/jest-dom"
import { server } from "./mocks/server"
import { jest } from "@jest/globals"

// Establish API mocking before all tests
const beforeAll = jest.beforeAll
beforeAll(() => server.listen())

// Reset any request handlers that we may add during the tests
const afterEach = jest.afterEach
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished
const afterAll = jest.afterAll
afterAll(() => server.close())

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock as any
