const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    req.user = jwt.verify(token, jwtSecret, { algorithms: ["HS256"] });
    next();

  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

const adminMiddleware = (req , res, next) => {
    try {
        if(!req.user) return res.status(401).json({error : 'Not authenticated '})
        const { role } = req.user

        if(role == 'admin'){
            next()
        }
        else{
            return res.status(403).json({error : 'Not authorized '})
        }
    } catch (error) {
        next(error)
    }
    
}

module.exports = { authMiddleware , adminMiddleware};