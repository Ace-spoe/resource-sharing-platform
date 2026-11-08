const multer = require('multer')

// Express recognizes error handlers by their 4 parameters, so keep all 4.
function errorHandler(error, _request, response, _next) {
  // 1. Multer errors
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      // keep this number in sync with the limit in middleware/upload.js
      return response.status(413).json({
        success: false,
        message: 'File is too large. Maximum allowed size is 10MB.',
      })
    }
    // any other multer error (e.g. LIMIT_UNEXPECTED_FILE = wrong field name) is a client mistake
    return response.status(400).json({ success: false, message: 'Invalid file upload' })
  }

  // 2. Custom rejection from the fileFilter in middleware/upload.js
  // (matching on the message is fragile: if you reword it there, change it here)
  if (error.message && error.message.includes('Invalid file type')) {
    return response.status(400).json({ success: false, message: error.message })
  }

  // 3. Prisma errors
  if (error.code === 'P2002') {
    return response.status(409).json({ success: false, message: 'Already exists' })
  }
  if (error.code === 'P2003') {
    return response.status(400).json({
      success: false,
      message: 'A referenced record does not exist (check courseId)',
    })
  }
  // P2023 should be a malformed id like "abc" for a UUID column.
  // I believe that's right but verify with: console.log('ERR:', error.name, error.code)
  if (error.code === 'P2023') {
    return response.status(400).json({ success: false, message: 'Invalid id format' })
  }
  if (error.code === 'P2025') {
    return response.status(404).json({ success: false, message: 'Record not found' })
  }
  // Bad enum value or wrong field type: Prisma throws a validation error with no code.
  // Never forward Prisma's raw message, it exposes internals.
  if (error.name === 'PrismaClientValidationError') {
    return response.status(400).json({ success: false, message: 'Invalid input' })
  }

  // 4. Anything unexpected
  console.error(error)
  return response.status(500).json({ success: false, message: 'Internal server error' })
}

module.exports = errorHandler