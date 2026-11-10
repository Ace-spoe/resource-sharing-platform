const router = require('express').Router()
const { prisma } = require('../db/prisma')

router.get('/', async (req, res, next) => {
  try {
    const { course, type, tag } = req.query
    const where = {}

    if (typeof course === 'string' && course) {
        where.courseId = course
    }
    if (typeof type === 'string' && type) {
        where.resourceType = type
    }
    // filter by tag: normalize the same way tags are stored (trim + lowercase)
    if (typeof tag === 'string' && tag.trim()) {
    where.tags = { some: { tag: { name: tag.trim().toLowerCase() } } }
    }

    const tags = await prisma.tag.findMany({
      where,
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    })

   return res.json({
      success: true,
      message: tags.length ? 'Tags retrieved successfully!' : 'No tags found',
      data: tags,
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router