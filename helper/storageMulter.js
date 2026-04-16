const multer = require("multer");

module.exports = () => {
  return multer.memoryStorage();
};