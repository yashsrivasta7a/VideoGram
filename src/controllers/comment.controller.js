import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    const skip = (page - 1) * limit

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const videoComments = await Comment.find({
        video : videoId,
    }).limit(limit).skip(skip) //For example, 
    //to get the results for page 2 with a limit of 10 
    //documents per page, you would skip the first 10 documents (i.e., (page - 1) * limit).

    return res.status(200)
        .json(new ApiResponse(200, comments, "Fetch All Comments Successfully"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    
    const addComment = await Comment.create({
        video: videoId,
        content,
        owner: req.user._id
    })
})


const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content} = req.body

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    if(!content){
        throw new ApiError(400, "content is not filled");
    }

    const updateCommentContent = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content : content
            }
        }
    ,
    {
        new:true
    })
    if(!updateCommentContent){
        throw new ApiError(400, "comment not found or invalid comment id")
    }

    return res.status(200)
    .json(new ApiResponse(200, updateCommentContent, "Comment Updated Successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    await Comment.findByIdAndDelete({
        id: commentId
    })
    return res.status(200)
    .json(new ApiResponse(200, {}, "Comment Deleted Successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }