function requireRole(role) {
  return (req, res, next) => {
    // authMiddleware must run first so req.user exists
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ success: false, message: 'Forbidden' })
    }
    next()
  }
}

module.exports = { requireRole }