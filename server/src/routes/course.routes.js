const express = require('express');
const { prisma } = require('../db/prisma');
const { authMiddleware } = require('../middleware/auth.middleware')
const { requireRole } = require('../middleware/requireRole')

const router = express.Router()

router.get('/' , async (req , res , next) => {
    try {
    const courses = await prisma.course.findMany();
    // Model name → accessor: Prisma lowercases the first letter, so model Course gives prisma.course.
    // findMany() returns an array always while findFirst and findUnique returns object / null

    return res.json({
        success : true ,
        message : 'Courses Fetched successfully!',
        data : courses
    })
    } catch (error) {
        next(error)
    }

});

// CREATE a course: logged in AND admin
router.post('/', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const { title, code, department } = req.body ?? {}

    // all three are required non-empty strings
    for (const [name, value] of Object.entries({ title, code, department })) {
      if (typeof value !== 'string' || !value.trim()) {
        return res.status(400).json({
          success: false,
          message: `${name} is required and must be a non-empty string`,
        })
      }
    }

    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        // normalize so "cs301" and "CS301" can't both exist
        code: code.trim().toUpperCase(),
        department: department.trim(),
      },
    })

    return res.status(201).json({
      success: true,
      message: 'Course created successfully!',
      data: course,
    })
  } catch (error) {
    next(error) // a duplicate code throws P2002 -> your handler returns 409
  }
})

module.exports = router