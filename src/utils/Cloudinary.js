import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
try {
  if (!localFilePath)console.log("couldn't find the path" );
 const response = await cloudinary.uploader.upload(localFilePath , {
     resource_type:"auto"
  })
  return response;
} catch (error) {
  fs.unlinkSync(localFilePath) // remove locally saved temp file as the upload op is failed
}
}

export {uploadOnCloudinary}