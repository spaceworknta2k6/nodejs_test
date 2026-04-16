const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");

module.exports = (buffer, folder = "products") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      },
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};
