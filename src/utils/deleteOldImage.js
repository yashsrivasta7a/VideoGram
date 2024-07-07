import {v2 as cloudinary} from 'cloudinary';
import { ApiError } from './ApiError';

const deleteOldImage = async (url) => {
    try {
      // Step 1: Split the URL by '/'
      const segments = url.split('/');
      // Step 2: Get the last segment (e.g., 'sample.jpg')
      const lastSegment = segments.pop();
      // Step 3: Split the last segment by '.' and get the first part (e.g., 'sample')
      const [publicId] = lastSegment.split('.');
      // Step 4: Use the publicId to delete the image from Cloudinary
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new ApiError(400,"The OLD URL doesnt Exist")
    }
  };

  export default deleteOldImage

  //const publicId = url.split('/').pop().split('.')[0];