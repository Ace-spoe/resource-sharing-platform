const { prisma } = require('../db/prisma')
const { authMiddleware } = require('../middleware/auth.middleware')
const { recalculate } = require('../utils/recalculate')

const router = require('express').Router({mergeParams: true})


router.get('/' , async (req , res, next) => {
    try {
        const { id } = req.params ?? {}
        
        const resourceWithRatings = await prisma.resource.findUnique({
            where : {id} ,
            select : {
                id : true ,
                title : true ,
                resourceType : true ,
                ratings : {
                    select : {
                        id : true ,
                        user : {
                            select : {
                                name : true
                            }
                        },
                        review : true ,
                        score : true ,
                        createdAt : true
                    } ,
                    orderBy : { createdAt : "desc"}
                }
            }
        })

        if (!resourceWithRatings) {
      return res.status(404).json({ success: false, message: 'Resource not found' })
    }

        return res.json({
            success : true ,
            message : 'Rating of the resource retrieved successfully!',
            data : resourceWithRatings
        })


        
    } catch (error) {
        next(error)
    }


})

router.put('/', authMiddleware, async (req, res, next) => {
  try {
    const { id: resourceId } = req.params
    const { id: userId } = req.user
    const { score, review } = req.body ?? {}

    if (!Number.isInteger(score) || score < 1 || score > 5) {
      return res.status(400).json({ success: false, message: 'Score must be a whole number between 1 and 5' })
    }
    if (review != null && typeof review !== 'string') {
      return res.status(400).json({ success: false, message: 'review must be a string' })
    }

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { id: true },
    })
    if (!resource) {
      return res.status(404).json({ success: false, message: 'The resource does not exist' })
    }

    const cleanReview = review?.trim() || null

    const rating = await prisma.$transaction(async (tx) => {
      const saved = await tx.rating.upsert({
        where: { resourceId_userId: { resourceId, userId } },
        update: { score, review: cleanReview },
        create: { resourceId, userId, score, review: cleanReview },
      })
      await recalculate(tx, resourceId)
      return saved
    })

    return res.json({
        success: true,
        message: 'Rating saved',
        data: rating
    })
  } catch (error) {
    next(error)
  }
})

router.delete('/', authMiddleware, async (req, res, next) => {
  try {
    const { id: resourceId } = req.params
    const { id: userId } = req.user

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { id: true },
    })
    if (!resource) {
      return res.status(404).json({ success: false, message: 'The resource does not exist' })
    }

    await prisma.$transaction(async (tx) => {
      await tx.rating.delete({
        where: { resourceId_userId: { resourceId, userId } },
      })
      await recalculate(tx, resourceId)
    })

    return res.status(204).end()
  } catch (error) {
    next(error)
  }
})

module.exports = router