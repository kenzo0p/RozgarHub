import getDataUri from '../utils/dataUri.js';
import cloudinary from '../config/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Upload Service — abstracts file upload logic.
 *
 * Controllers don't need to know about Cloudinary, data URIs, etc.
 * If we switch from Cloudinary to S3 later, only this service changes.
 */
export class UploadService {
  async uploadFile(file: Express.Multer.File, folder: string = 'rozgarhub'): Promise<string> {
    try {
      const fileUri = getDataUri(file);
      if (!fileUri.content) {
        throw new ApiError(500, 'Failed to process file for upload');
      }

      const result = await cloudinary.uploader.upload(fileUri.content, {
        folder,
        resource_type: 'auto',
      });

      if (!result?.secure_url) {
        throw new ApiError(500, 'File upload failed — no URL returned');
      }

      logger.info(`File uploaded successfully: ${result.secure_url}`);
      return result.secure_url;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Cloudinary upload error:', error);
      throw new ApiError(500, 'File upload failed');
    }
  }

  async uploadProfilePhoto(file: Express.Multer.File): Promise<string> {
    return this.uploadFile(file, 'rozgarhub/profiles');
  }

  async uploadResume(file: Express.Multer.File): Promise<string> {
    return this.uploadFile(file, 'rozgarhub/resumes');
  }

  async uploadCompanyLogo(file: Express.Multer.File): Promise<string> {
    return this.uploadFile(file, 'rozgarhub/companies');
  }
}

export const uploadService = new UploadService();
