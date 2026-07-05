import { userRepository } from '../repositories/user.repository.js';
import { uploadService } from './upload.service.js';
import { User } from '../models/user.model.js';
import { NotFoundError, ConflictError } from '../utils/ApiError.js';
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
    // Changing email/username must not collide with another account
    if (data.email || data.username) {
      const existing = await userRepository.findByEmailOrUsername(
        data.email || '',
        data.username || '',
      );
      if (existing && existing._id.toString() !== userId) {
        throw new ConflictError('Email or username is already taken');
      }
    }

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

    return userDoc.toJSON() as unknown as SafeUser;
  }
}

export const userService = new UserService();
