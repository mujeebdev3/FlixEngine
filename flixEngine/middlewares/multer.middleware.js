import multer from "multer";
import fs from "fs";
import path from "path";

// Ensure the 'public/temp' directory exists in the current working directory
const ensureDirectoryExistence = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Define the storage engine for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use process.cwd() to get the current working directory
    const dirPath = path.join(process.cwd(), "public/temp");
    ensureDirectoryExistence(dirPath);
    cb(null, dirPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Initialize multer with the defined storage
export const upload = multer({
  storage,
});
