import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository.js';
import { uploadService } from './upload.service.js';
import { ConflictError, UnauthorizedError, ValidationError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { APP_CONSTANTS } from '../utils/constants.js';
import type { RegisterInput, LoginInput } from '../validators/auth.validator.js';
import type { IUser, SafeUser } from '../types/models.js';
import logger from '../utils/logger.js';

/**
 * Auth Service — business logic for authentication.
 *
 * Extracted from the original user.controller.js which mixed auth logic,
 * profile management, and HTTP concerns in a single file.
 *
 * This service handles:
 * - User registration (with file upload, password hashing)
 * - Login (credential verification, JWT generation)
 * - Logout (cookie clearing is done in controller since it's HTTP-specific)
 */
export class AuthService {
  /**
   * Register a new user.
   *
   * Flow: validate uniqueness → upload photo → hash password → create user
   * Each step can fail independently with a specific error type.
   */
  async register(
    data: RegisterInput,
    file?: Express.Multer.File,
  ): Promise<{ user: SafeUser }> {
    // Check if user already exists (email or username)
    const existingUser = await userRepository.findByEmailOrUsername(
      data.email,
      data.username,
    );
    if (existingUser) {
      throw new ConflictError('User already exists with this email or username');
    }

    // Upload profile photo if provided
    let profilePhotoUrl = '';
    if (file) {
      profilePhotoUrl = await uploadService.uploadProfilePhoto(file);
    }

    // Hash password with configurable salt rounds
    const hashedPassword = await bcrypt.hash(
      data.password,
      APP_CONSTANTS.BCRYPT_SALT_ROUNDS,
    );

    const newUser = await userRepository.create({
      fullname: data.fullname,
      username: data.username,
      email: data.email,
      password: hashedPassword,
      phoneNumber: data.phoneNumber,
      role: data.role,
      profile: {
        profilePhoto: profilePhotoUrl,
        skills: [],
      },
    });

    logger.info(`New user registered: ${newUser.email} (${newUser.role})`);

    // Return user without password (toJSON transform handles this)
    return { user: newUser.toJSON() as SafeUser };
  }

  /**
   * Authenticate user and generate JWT.
   *
   * Returns the JWT token and user data (sans password).
   * Cookie setting is handled by the controller since it's an HTTP concern.
   */
  async login(data: LoginInput): Promise<{ token: string; user: SafeUser }> {
    // Find user by email or username
    const user = await userRepository.findByEmailOrUsername(data.email, data.username);
    if (!user) {
      // Generic message to prevent username enumeration attacks
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify role matches
    if (data.role !== user.role) {
      throw new UnauthorizedError(
        `No account found with role '${data.role}' for these credentials`,
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id.toString() },
      env.SECRET_KEY,
      { expiresIn: APP_CONSTANTS.ACCESS_TOKEN_EXPIRY },
    );

    logger.info(`User logged in: ${user.email}`);

    return {
      token,
      user: user.toJSON() as SafeUser,
    };
  }
}

export const authService = new AuthService();
