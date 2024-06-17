import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";  
import { response } from "express";

const registerUser = asyncHandler ( async (req,res)=>{

const {fullName,email,username,password}  =  req.body
console.log(fullName,email,username,password);
// if(fullName === ""){
//     throw new ApiError(400,"Full Name is Required")
//  USE EITHER THIS CODE OR USE }

if (
    [fullName,email,username,password].some((field)=>field?.trim() === "")
) 
{
    throw new ApiError(400,"Full Name is Required")
}
if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

const existingUser = User.findOne({
    $or: [{username},{email}]
})
  if(existingUser){
    throw new ApiError(409,'User with email or username already exist')
  }

 const avatarLocalPath = req.files?.avatar[0]?.path;
 const coverLocalPath = req.files?.coverImage[0]?.path;

 if(!avatarLocalPath){
  throw new ApiError(400,"Avatar is needed")
 }

 const avatar = await uploadOnCloudinary(avatarLocalPath)
 const coverImage = await uploadOnCloudinary(coverLocalPath)

 if(!avatar){
  throw new ApiError(400,"Avatar is needed")
 }

  const user = await User.create({
  fullName,
  avatar: avatar.url,
  coverImage : coverImage?.url || "",
  username: username.toLowerCase(),
  password,
  email,
 })
 const finalUser = await User.findById(user._id).select(// automatically generate hota _id
 "-password -refreshToken"
 )

 if (!finalUser){
  throw new ApiError(500,"Something went wrong in registration")
 }

//  return res.status(201).json({finalUser}) can use like this
 return res.status(201).json(
  new ApiResponse(200, finalUser, "User Registered Successfully")
 )
})




export { registerUser, } 
