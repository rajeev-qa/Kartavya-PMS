const request = require("supertest")
const app = require("../app")
const { prisma } = require("./setup")

describe("Authentication", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      }

      const response = await request(app).post("/api/auth/register").send(userData)

      expect(response.status).toBe(201)
      expect(response.body.user.email).toBe(userData.email)
      expect(response.body.token).toBeDefined()
    })

    it("should not register user with existing email", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      }

      // Register first user
      await request(app).post("/api/auth/register").send(userData)

      // Try to register with same email
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          ...userData,
          username: "testuser2",
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain("already exists")
    })
  })

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Create a test user
      await request(app).post("/api/auth/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      })
    })

    it("should login with valid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      })

      expect(response.status).toBe(200)
      expect(response.body.user.email).toBe("test@example.com")
      expect(response.body.token).toBeDefined()
    })

    it("should not login with invalid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      })

      expect(response.status).toBe(401)
      expect(response.body.error).toBe("Invalid credentials")
    })
  })
})
