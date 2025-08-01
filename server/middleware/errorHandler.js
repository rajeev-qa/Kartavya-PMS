const errorHandler = (err, req, res, next) => {
  console.error(err.stack)

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      details: err.message,
    })
  }

  if (err.code === "P2002") {
    return res.status(400).json({
      error: "Duplicate entry",
      details: "A record with this information already exists",
    })
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      error: "Record not found",
      details: "The requested resource was not found",
    })
  }

  res.status(500).json({
    error: "Internal Server Error",
    details: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  })
}

module.exports = errorHandler
