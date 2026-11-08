const { prisma } = require('../db/prisma')
const { authMiddleware } = require('../middleware/auth.middleware')

const router = require('express').Router()


router.post('/', authMiddleware, async (req, res, next) => {
  try {
    // req.body can be undefined in Express 5 when no JSON body is sent
    const { title, description, resourceType, courseId } = req.body ?? {}

    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'title is required and must be a non-empty string',
      })
    }

    if (typeof resourceType !== 'string' || !resourceType) {
      return res.status(400).json({
        success: false,
        message: 'resourceType is required',
      })
    }

    if (typeof courseId !== 'string' || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'courseId is required',
      })
    }

    if (description != null && typeof description !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'description must be a string',
      })
    }

    const newResource = await prisma.resource.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        resourceType,
        courseId,
        uploaderId: req.user.id, // from the token, never from the body
        fileUrl: '',
      },
    })

    return res.status(201).json({
      success: true,
      message: 'Resource added successfully!',
      data: newResource,
    })
  } catch (error) {
    next(error)
  }
})

router.get('/', async (req, res, next) => {
  try {
    const { course, type } = req.query
    const where = {}

    if (typeof course === 'string' && course) where.courseId = course
    if (typeof type === 'string' && type) where.resourceType = type

    const resources = await prisma.resource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return res.json({
      success: true,
      message: resources.length ? 'Resources retrieved successfully!' : 'No resources found',
      data: resources,
    })
  } catch (error) {
    next(error)
  }
})

router.get('/:id' , async (req , res , next) => {
    try {
        const { id } = req.params
        const resourceById = await prisma.resource.findUnique({
            where: { id },
        include: {
        uploader: {
        select: { id: true, name: true } 
        },
        course: {
        select: { title: true, code: true } 
        }
        }
        }) 


        if(!resourceById) {
            return res.status(404).json({
                success : false ,
                message : "Resource Not Found!"
            })
        }
        return res.json({
            success : true ,
            message : "Resource Found" ,
            data : resourceById
        })

    } catch (error) {
        next(error)
    }
})

router.delete('/:id' , authMiddleware , async (req , res , next) => {

    try {
    const { id } = req.params
    const {id : userId , role } = req.user

    const resourceToDelete = await prisma.resource.findUnique({where : {id}})

     if(!resourceToDelete){
        return res.status(404).json({
            success : false ,
            message : "Resource Not Found"
        })
    }

    if(userId !== resourceToDelete.uploaderId && role !== 'admin') {
        return res.status(403).json({
            success : 'false',
            message : "Unauthorized access , You can not delete this resource"
        })
    }

    await prisma.resource.delete({where : {id}})
    return res.status(204).send()
    } catch (error) {
        next(error)
    }
})

module.exports = router