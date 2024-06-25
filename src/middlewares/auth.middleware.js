import { asyncHandler } from "../utils/asyncHandler"
import {ApiError} from "../utils/ApiError"
import { jwt } from "jsonwebtoken"
import User from "../models/user.model"



try {
    const verifyJWT = asyncHandler (async(req,res,next)=>{
       const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","") // now we have all cookies ka access
        // ? isliye h quki user customer header bhjra ho in mobile applicaton
        if(!token){
            throw new ApiError ( 401,"unauthorized request")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findbyId(decodedToken?._id).select("-password -refreshToken ")
        if(!user){
            throw new ApiError(401,"Invalid Access Token")
        }
    
        req.user = user;
        next()
    
    })
} catch (error) {
    throw new ApiError(401,error?.message || " invalid access token")
}

export default verifyJWT