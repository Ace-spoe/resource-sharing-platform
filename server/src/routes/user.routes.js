const { getUserData } = require("../controller/user.controller")
const { authMiddleware } = require("../middleware/auth.middleware")

const router = require("express").Router()


router.get('/me' , authMiddleware , async (req , res , next) => {
    try {
        const userData = await getUserData(req.user.id)
        if (!userData) return res.status(404).json({error : "No user with this ID was found!"})
    res.json({
        success : true ,
        data : userData
    })
    } catch (error) {
      next(error)
    }
})

module.exports = router