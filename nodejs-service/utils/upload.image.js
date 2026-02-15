import cloudinary from "../config/cloudinary.js";

export const uploadImage = async (fileBuffer, mimeType) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "circlo",
        resource_type: "image",
        transformation: [{ width: 1000, crop: "limit" }],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};