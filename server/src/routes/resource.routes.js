const { prisma } = require('../db/prisma')
const { authMiddleware } = require('../middleware/auth.middleware')

const router = require('express').Router()

router.post('/', authMiddleware ,async (req , res , next) => {
    try {
        const { id : uploaderId } = req.user
        const fileUrl = ''
        if(!req.body){
            return res.status(400).json({
                success : false ,
                message : 'Insert the appropriate fields inside the request body'
            })
        }
        const { title, description, resourceType, courseId } = req.body

        if(!title || !resourceType || !courseId ){
            return res.status(400).json({
                success : false ,
                message : 'Insert title , resource Type and courseId '
            })
        }

        const newResource = await prisma.resource.create({
            data : { title, description, resourceType, courseId ,uploaderId , fileUrl}
        })

        return res.status(201).json({
            success : true ,
            message : 'Resource added successfully!',
            data : newResource
        })


    } catch (error) {
        next(error)
    }
})

module.exports = router