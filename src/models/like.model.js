import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const likeSchema = new Schema(
    {
        content:{
            type: String,
            required:true
        },
        video:{
            type: Schema.Types.ObjectId,
            ref:"videos"
        },
        comment:{
            type:Schema.Types.ObjectId,
            ref:"Comment"
        }
        ,
        likedBy:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
        ,
        tweet:{
            type:Schema.Types.ObjectId,
            ref:"Tweet"
        }
    },
    {
        timestamps:true
    }
    
)

videoSchema.plugin(mongooseAggregatePaginate);

export const Like =  mongoose.model("Like",likeSchema);

