import { asyncHandler } from "../utils/asyncHandler"

const verifyJWT = asyncHandler (async(req,res,next)=>{
    req.cookies?.accessToken || req.header("Authorization")?.replace // now we have all cookies ka access
    // ? isliye h quki user customer header bhjra ho in mobile applicaton

})

export const verifyJWT