import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { response } from "express";
import  jwt  from "jsonwebtoken";
import deleteOldImage from "../utils/deleteOldImage.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken; //db m save hua code
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something Went wrong while generating tokens ");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;
  console.log(fullName, email, username, password);
  // if(fullName === ""){
  //     throw new ApiError(400,"Full Name is Required")
  //  USE EITHER THIS CODE OR USE }

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "Full Name is Required");
  }
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    throw new ApiError(409, "User with email or username already exist");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is needed");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is needed");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    username: username.toLowerCase(),
    password,
    email,
  });
  const finalUser = await User.findById(user._id).select(
    // automatically generate hota _id
    "-password -refreshToken"
  );

  if (!finalUser) {
    throw new ApiError(500, "Something went wrong in registration");
  }

  //  return res.status(201).json({finalUser}) can use like this
  return res
    .status(201)
    .json(new ApiResponse(200, finalUser, "User Registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!(username && email)) {
    throw new ApiError(400, " username or email doesn't exist ");
  }
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) {
    throw new ApiError(404, " invalid user ");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(404, "invalid password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  ); // this is an optional step

  const options = {
    // sending cookies
    httpOnly: true,
    secure: true, //when both are true only server can modify it not frontend
  };
  return res
    .status(200) //cookies send krre haii cookie parser use krre
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken, // optional as if user sends its own cookies tb use hota h
        },
        "user logged in Succesfully "
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from the document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User LoggedOut"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken; //if someone is using mobile app so uske liye second wala

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  // verification of error using jwt
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    ); // decoded token milega verify hone ke baad
    const user = await User.findById(decodedToken?._id); // unwrap ?

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    //upr encoded refresh token h so usse match krenge jo user bhjra and jo saved h

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is used or expired");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
    //generate new refresh token
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "access token refreshed successfully "
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || " invalid refresh token ");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Password");
  }
  if (!(newPassword === confirmPassword)) {
    throw new ApiError(400, "Password doesnt match");
  }

  user.password = newPassword; // object m set hua
  await user.save({ validateBeforeSave: false }); // password save

  return res
    .status(200)
    .json(new ApiResponse(200,{},"Password Changed Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User Fetched Successfully "));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "Can't have Empty Fields");
  }

  const user =await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    { new: true } // update hone ke baad info ati h
  ).select("-password"); // find kara object

  return res.status(200)
  .json(new ApiResponse(200,user,"Accounts Details updated successfully"))
});

const updateUserAvatar = asyncHandler(async(req,res)=>{
  const avatarLocalPath =  req.file?.path

  if(!avatarLocalPath){
    throw new ApiError(400,"avatar file is missing")
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  if(!avatar.url){
    throw new ApiError(400,"Error while uploading an Avatar")
  }
 
  const user = await User.findById(req.user?._id);
  if (user.avatar) {
    await deleteOldImage(user.avatar);
  }

  const Updateduser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar: avatar.url
      }
    },
    {new:true}
  ).select("-password")

  return res.status(200)
  .json(
    new ApiResponse(200,Updateduser,"Avatar Updated Successfully")
  )

});

const updateUserCoverimage = asyncHandler(async(req,res)=>{
  const coverLocalPath = req.file?.path
  if(!coverLocalPath){
    throw new ApiError(400,"Cover Image is missing")
  }
  const coverImage = await uploadOnCloudinary(coverLocalPath)
  if(!coverImage.url){
    throw new ApiError(400,"Error while uploading an cover")
  }
  const user = await User.findById(req.user?._id);
  if (user.coverImage) {
    await deleteOldImage(user.coverImage);
  }

  const Updateduser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
      coverImage : coverImage.url
    }
  },
    {new :true}
  ).select("-password")


  return res.status(200)
  .json(
    new ApiResponse(200,Updateduser,"Cover Image Updated Successfully")
  )

});

const getUserChannelProfile = asyncHandler(async(req,res)=>{
  const {username} = req.params // url se nikalne se

  if(!username?.trim()){ // hua toh trim optionally chain krdia
    throw new ApiError(400, "Username is missing")
  }
  // User.find({username}) 
  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedto" // Fix field name to match usage below
      }
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers"
        },
        channelSubscribedToCount: {
          $size: "$subscribedto"
        },
        isSubscribed: {
          $cond: {
            if: { $in: [new mongoose.Types.ObjectId(req.user?._id), "$subscribers.subscriber"] }, // Correct field path
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        avatar: 1,
        coverImage: 1,
        email: 1
      }
    }
  ]);
  
  
  if(!channel?.length){
    throw new ApiError(404, "channel doesnt exist")
  }
  return res.status(200)
  .json(new ApiResponse(400,channel[0],"User Channel fetched successfully"))
});

const getWatchHistory = asyncHandler(async(req,res)=>{
  const user = await User.aggregate(
    [
      {
    $match:{
      _id: new mongoose.Types.ObjectId(req.user._id)
    }},
    {
      $lookup:{
      from:"videos",
      localField:"WatchHistory",
      foreignField:"_id",
      as:"watchHistory",
      pipeline:[
        {
          $lookup:{
            from:"users",
            localField:"owner",
            foreignField:"_id",
            as:"VideoOwner",
            pipeline:
            [
              {
                $project:{
                  fullName:1,
                  avatar:1,
                  username:1,
                }
              }
            ]
          }
        },
        {
          $addFields:{
            owner :{
              $first:"$owner"
            }
          }
        }
      ]
    }
    }
  ])
  return res.status(200)
  .json(
    new ApiResponse(200,
      user[0].watchHistory,"Watch History fetched successfully")
  )
  //req.user?._id // string milti h and find by id wagera use krke mongoose process krleta hai and convert hojata h wo khud
});


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverimage,
  getUserChannelProfile,
  getWatchHistory
};
