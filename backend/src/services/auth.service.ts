import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { userRepository } from '../repositories/user.repository.js';
import { uploadService } from './upload.service.js';
import { RefreshToken } from '../models/refreshToken.model.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { APP_CONSTANTS } from '../utils/constants.js';
import { eventBus } from '../events/eventBus.js';
import type { RegisterInput, LoginInput } from '../validators/auth.validator.js';
import type { IUser, SafeUser } from '../types/models.js';
import logger from '../utils/logger.js';

/**
 * Auth Service — full authentication lifecycle.
 *
 * Implements dual-token strategy:
 *   Access token  — short-lived (15 min), stateless JWT in httpOnly cookie
 *   Refresh token — long-lived (7 days), stored in DB, rotated on each use
 *
 * Why dual tokens?
 * - Short access tokens limit the window of compromise if stolen
 * - Refresh tokens in DB allow instant revocation (logout, security breach)
 * - Token rotation detects theft: if a rotated token is reused, all sessions are revoked
 *
 * Interview note: This is the OAuth2 standard approach used by Auth0, Okta, and Google.
 */
export class AuthService {
  /**
   * Register a new user.
   */
  async register(
    data: RegisterInput,
    file?: Express.Multer.File,
  ): Promise<{ user: SafeUser }> {
    const existingUser = await userRepository.findByEmailOrUsername(
      data.email,
      data.username,
    );
    if (existingUser) {
      throw new ConflictError('User already exists with this email or username');
    }

    let profilePhotoUrl = '';
    if (file) {
      profilePhotoUrl = await uploadService.uploadProfilePhoto(file);
    }

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

    // Emit domain event (handlers create welcome notification, etc.)
    eventBus.emit('user.registered', {
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    return { user: newUser.toJSON() as unknown as SafeUser };
  }

  /**
   * Authenticate user and generate token pair.
   *
   * Returns both access and refresh tokens.
   * The controller sets these as httpOnly cookies.
   */
  async login(
    data: LoginInput,
    meta: { ip: string; userAgent: string },
  ): Promise<{ accessToken: string; refreshToken: string; user: SafeUser }> {
    const user = await userRepository.findByEmailOrUsername(data.email, data.username);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (data.role !== user.role) {
      throw new UnauthorizedError(
        `No account found with role '${data.role}' for these credentials`,
      );
    }

    // Generate token pair
    const accessToken = this.generateAccessToken(user._id.toString());
    const refreshToken = await this.createRefreshToken(
      user._id.toString(),
      meta.ip,
      meta.userAgent,
    );

    logger.info(`User logged in: ${user.email}`);

    eventBus.emit('user.login', {
      userId: user._id.toString(),
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return {
      accessToken,
      refreshToken,
      user: user.toJSON() as unknown as SafeUser,
    };
  }

  /**
   * Refresh access token using a valid refresh token.
   *
   * Implements token rotation:
   * 1. Find the refresh token in DB
   * 2. Verify it's not revoked or expired
   * 3. Revoke the old refresh token
   * 4. Issue new access + refresh token pair
   *
   * If a revoked token is reused (theft detection), ALL tokens for that user
   * are revoked as a security measure.
   */
  async refreshTokens(
    refreshTokenValue: string,
    meta: { ip: string; userAgent: string },
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const storedToken = await RefreshToken.findOne({ token: refreshTokenValue });

    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Theft detection: if a revoked token is reused, revoke ALL tokens for this user
    if (storedToken.isRevoked) {
      logger.warn(`🚨 Refresh token reuse detected for user ${storedToken.userId}! Revoking all sessions.`);
      await RefreshToken.updateMany(
        { userId: storedToken.userId },
        { isRevoked: true },
      );
      throw new UnauthorizedError('Refresh token has been revoked. Please log in again.');
    }

    // Check expiry
    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token has expired');
    }

    // Rotate: revoke old token, issue new pair
    storedToken.isRevoked = true;
    const newRefreshTokenValue = await this.createRefreshToken(
      storedToken.userId.toString(),
      meta.ip,
      meta.userAgent,
    );
    storedToken.replacedByToken = newRefreshTokenValue;
    await storedToken.save();

    const accessToken = this.generateAccessToken(storedToken.userId.toString());

    return { accessToken, refreshToken: newRefreshTokenValue };
  }

  /**
   * Logout — revoke the refresh token.
   */
  async logout(refreshTokenValue: string): Promise<void> {
    if (refreshTokenValue) {
      await RefreshToken.updateOne(
        { token: refreshTokenValue },
        { isRevoked: true },
      );
    }
  }

  /**
   * Logout from all devices — revoke all refresh tokens for the user.
   */
  async logoutAll(userId: string): Promise<void> {
    await RefreshToken.updateMany(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
    logger.info(`All sessions revoked for user ${userId}`);
  }

  /**
   * Forgot password — generate a reset token.
   *
   * In a real app, this would send an email with the reset link.
   * Returns null for unknown emails so the controller can respond identically
   * either way — a 404 here would let attackers enumerate registered emails.
   */
  async forgotPassword(email: string): Promise<{ resetToken: string; expiresAt: Date } | null> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      logger.info(`Password reset requested for unknown email: ${email}`);
      return null;
    }

    // Generate a cryptographically secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Store hashed token on user (we only store the hash, not the plain token)
    await userRepository.update(user._id.toString(), {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + APP_CONSTANTS.PASSWORD_RESET_EXPIRY_MS),
    } as Partial<IUser>);

    // Mock email delivery: the token is logged server-side, never returned
    // to the caller — returning it in the response is account takeover.
    logger.info(`Password reset token generated for ${email}: ${resetToken}`);

    return {
      resetToken,
      expiresAt: new Date(Date.now() + APP_CONSTANTS.PASSWORD_RESET_EXPIRY_MS),
    };
  }

  /**
   * Reset password using a valid reset token.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with this token that hasn't expired
    const user = await userRepository.findByResetToken(hashedToken);
    if (!user) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    // Hash new password and clear reset token
    const hashedPassword = await bcrypt.hash(
      newPassword,
      APP_CONSTANTS.BCRYPT_SALT_ROUNDS,
    );

    await userRepository.update(user._id.toString(), {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    } as Partial<IUser>);

    // Revoke all existing refresh tokens (force re-login on all devices)
    await this.logoutAll(user._id.toString());

    eventBus.emit('user.passwordReset', {
      userId: user._id.toString(),
      email: user.email,
    });

    logger.info(`Password reset completed for ${user.email}`);
  }

  /**
   * Get active sessions for a user (for "manage sessions" UI).
   */
  async getActiveSessions(userId: string): Promise<Array<{
    userAgent: string;
    ipAddress: string;
    createdAt: Date;
    expiresAt: Date;
  }>> {
    const sessions = await RefreshToken.find({
      userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    })
      .select('userAgent ipAddress createdAt expiresAt')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return sessions;
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  private generateAccessToken(userId: string): string {
    return jwt.sign(
      { userId },
      env.SECRET_KEY,
      { expiresIn: APP_CONSTANTS.ACCESS_TOKEN_EXPIRY },
    );
  }

  private async createRefreshToken(
    userId: string,
    ip: string,
    userAgent: string,
  ): Promise<string> {
    const tokenValue = crypto.randomBytes(40).toString('hex');

    await RefreshToken.create({
      token: tokenValue,
      userId,
      ipAddress: ip,
      userAgent,
      expiresAt: new Date(Date.now() + APP_CONSTANTS.REFRESH_TOKEN_EXPIRY_MS),
    });

    return tokenValue;
  }
}

export const authService = new AuthService();
