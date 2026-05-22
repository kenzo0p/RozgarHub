import DataUriParser from 'datauri/parser.js';
import path from 'path';

/**
 * Converts an in-memory file buffer to a Data URI string.
 * Used with Multer's memory storage to prepare files for Cloudinary upload
 * without writing temporary files to disk.
 */
const getDataUri = (file: Express.Multer.File): DataUriParser => {
  const parser = new DataUriParser();
  const extName = path.extname(file.originalname).toString();
  return parser.format(extName, file.buffer);
};

export default getDataUri;
