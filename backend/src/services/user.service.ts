import { userRepository } from '../repositories/user.repository.js';
import { uploadService } from './upload.service.js';
import { NotFoundError } from '../utils/ApiError.js';
import type { UpdateProfileInput } from '../validators/auth.validator.js';
import type { SafeUser } from '../types/models.js';

/**
 * User Service — profile management business logic.
 *
 * Separated from auth to follow Single Responsibility:
 * - AuthService handles login/register (security domain)
 * - UserService handles profile CRUD (user domain)
 */
export class UserService {
  async getProfile(userId: string): Promise<SafeUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user as SafeUser;
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileInput,
    file?: Express.Multer.File,
  ): Promise<SafeUser> {
    const user = await userRepository.findByEmailOrUsername(
      data.email || '',
      data.username || '',
    );

    // If we find a user with same email/username but different ID, it's a conflict
    if (user && user._id.toString() !== userId) {
      throw new NotFoundError('User');
    }

    const currentUser = await userRepository.findById(userId);
    if (!currentUser) {
      throw new NotFoundError('User');
    }

    // This is a Mongoose document from findById (not lean), so we need to
    // use the actual Mongoose model for the update
    const { User } = await import('../models/user.model.js');
    const userDoc = await User.findById(userId);
    if (!userDoc) {
      throw new NotFoundError('User');
    }

    // Update fields if provided
    if (data.fullname) userDoc.fullname = data.fullname;
    if (data.email) userDoc.email = data.email;
    if (data.username) userDoc.username = data.username;
    if (data.phoneNumber) userDoc.phoneNumber = data.phoneNumber;
    if (data.bio) userDoc.profile.bio = data.bio;
    if (data.skills) {
      userDoc.profile.skills = data.skills.split(',').map((s: string) => s.trim());
    }

    // Upload resume if file is provided
    if (file) {
      const resumeUrl = await uploadService.uploadResume(file);
      userDoc.profile.resume = resumeUrl;
      userDoc.profile.resumeOriginalName = file.originalname;
    }

    await userDoc.save();

    return userDoc.toJSON() as SafeUser;
  }
}

export const userService = new UserService();
