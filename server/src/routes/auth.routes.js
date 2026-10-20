const router = require('express').Router()
const { register, login } = require('../controller/auth.controller')



router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body ?? {};

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    const newUser = await register(name, email, password);
    const { hashedPassword, ...safeUser } = newUser;

    return res.status(201).json({ success: true, data: safeUser });
  } catch (error) {
    next(error);
  }
});

router.post('/login' , async (req , res , next) => {
    try {
        const {email , password } = req.body ?? {}

        if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Enter email and password",
        });
        }

        const {token , user} = await login(email , password) 

        return res.json({
            success : true ,
            message : "Logged In Successfully!",
            data : {token , user}
        })
        
    } catch (error) {
        next(error)
    }

})




module.exports = router
 
