import multer from 'multer';
import { APP_CONSTANTS } from '../utils/constants.js';

/**
 * Multer file upload configuration using memory storage.
 *
 * Memory storage is used because files are immediately uploaded to Cloudinary
 * — no need to write to disk first. For high-throughput scenarios, switch
 * to disk storage or stream directly to cloud storage.
 */
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void => {
  const allowedTypes: string[] = [
    ...APP_CONSTANTS.ALLOWED_IMAGE_TYPES,
    ...APP_CONSTANTS.ALLOWED_RESUME_TYPES,
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type '${file.mimetype}' is not allowed`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: APP_CONSTANTS.MAX_FILE_SIZE,
  },
});

export const singleUpload = upload.single('file');
