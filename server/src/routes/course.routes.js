const express = require('express');
const { prisma } = require('../db/prisma');
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

module.exports = router