import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    const like = await Like.findOne({
        video: videoId,
        likeBy: req.user?._id
    })

    if(!like){
        await Like.create({
            video : videoId,
            likedBy: req.user?._id
        })
        return res.status(201).json(new ApiResponse(200, likedVideo, "Like Added Successfully"))
    }
    const deleteLike = await like.deleteOne()
    return res.status(200).json(new ApiResponse(200, {}, "Like Removed Successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }

    const like = await Like.findOne({
        comment: commentId,
        likedBy:req.user?._id
    })

    if(!like){
        await Like.create({
            comment: commentId,
            likedBy: req.user?._id
        })
        return res.status(201).json(new ApiResponse(200, likedComment, "Comment Added Successfully"))

    }
    const deleteLike = await like.deleteOne()
    return res.status(200).json(new ApiResponse(200, {}, "Like Removed Successfully"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet ID")
    }
    const like = await Like.findOne({
        tweet : tweetId,
        likedBy : req.user?._id
    })

    if(!like){
        await Like.create({
            tweet: tweetId,
            likedBy: req.user?._id
        })
        return res.status(201).json(new ApiResponse(200, likedTweet, "Tweet Added Successfully"))
    }
    const deleteLike = await like.deleteOne()
    return res.status(200).json(new ApiResponse(200, {}, "Like Removed Successfully"))
    })


const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likes = await Like.find({ 
        likedBy: req.user?._id, 
        video: { $ne: null } 
    })
    .populate("video");

    const likedVideos = likes
    .filter(like => like.video) // filters all the video with likes
    .map(like => like.video); // creates an array form of videos with likes
    // to get the name of the videos with likes use like.names instead
    
    if (likedVideos.length === 0) {
      return res.status(200)
      .json(new ApiResponse(200, {}, "You haven't liked any videos yet"));
    }
    
    return res.status(200)
    .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
    
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}