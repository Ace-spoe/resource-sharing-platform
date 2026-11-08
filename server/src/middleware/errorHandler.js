function errorHandler(error, _request, response, _next) {
  if (error.code === 'P2002') {
    return response.status(409).json({ success: false, message: 'Already exists' })
  }
  if (error.code === 'P2003') {
    return response.status(400).json({
      success: false,
      message: 'A referenced record does not exist (check courseId)',
    })
  }
  if (error.code === 'P2025') {
    return response.status(404).json({ success: false, message: 'Record not found' })
  }

  console.error(error)
  response.status(500).json({ success: false, message: 'Internal server error' })
}

module.exports = errorHandler