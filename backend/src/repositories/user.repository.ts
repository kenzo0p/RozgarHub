import { User } from '../models/user.model.js';
import type { IUser } from '../types/models.js';
import type { FilterQuery, UpdateQuery } from 'mongoose';

/**
 * User Repository — Data Access Layer.
 *
 * All database queries for the User model go through here.
 * This separation means:
 * 1. Services never import Mongoose directly — easier to swap DB later
 * 2. Query optimization is centralized (no scattered .select() / .lean() calls)
 * 3. Unit testing services is simple — just mock the repository
 */
export class UserRepository {
  async findById(id: string, selectFields?: string): Promise<IUser | null> {
    const query = User.findById(id);
    if (selectFields) query.select(selectFields);
    return query.lean().exec() as Promise<IUser | null>;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).exec();
  }

  async findByEmailOrUsername(email: string, username: string): Promise<IUser | null> {
    return User.findOne({ $or: [{ email }, { username }] }).exec();
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    return User.create(userData);
  }

  async findByIdAndUpdate(id: string, update: UpdateQuery<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, update, { new: true, runValidators: true }).exec();
  }

  async findByFilter(filter: FilterQuery<IUser>): Promise<IUser[]> {
    return User.find(filter).lean().exec() as Promise<IUser[]>;
  }

  /**
   * Find user by ID with full document (including password).
   * Only used during authentication — never in normal API responses.
   */
  async findByIdWithPassword(id: string): Promise<IUser | null> {
    return User.findById(id).select('+password').exec();
  }

  /**
   * Find user by password reset token (hashed) that hasn't expired.
   */
  async findByResetToken(hashedToken: string): Promise<IUser | null> {
    return User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).exec();
  }

  /**
   * Generic update by ID.
   */
  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, data, { new: true }).exec();
  }
}

export const userRepository = new UserRepository();
