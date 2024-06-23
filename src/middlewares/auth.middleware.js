import { asyncHandler } from "../utils/asyncHandler"

const verifyJWT = asyncHandler (async(req,res,next)=>{
    req.cookies.accessToken // now we have all cookies ka access

})

export const verifyJWT