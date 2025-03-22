import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const verifyJWT = (req, res, next) => {
    //Extract token from authorization cookie
    const token = req.cookies.jwt;

    if(!token){
        return res.status(401).json({ message: 'Access denied, no token provided' });
    }

    try{
        //Verify token
        const userPayload = jwt.verify(token, process.env.JWT_SECRET);

        //Attach payload to req.user
        req.user = userPayload;

        //call next 
        next();
    } catch (error){
        res.status(403).json({ message: "Invalid or expired token" });
    }
}

export default verifyJWT;