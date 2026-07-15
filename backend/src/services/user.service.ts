import { userRepository } from '../repositories/user.repository.js';
import { uploadService } from './upload.service.js';
import { User } from '../models/user.model.js';
import { NotFoundError, ConflictError, ValidationError } from '../utils/ApiError.js';
import type { UpdateProfileInput } from '../validators/auth.validator.js';
import type { SafeUser, CredentialType, IUserProfile } from '../types/models.js';
import { APP_CONSTANTS, type Language } from '../utils/constants.js';
import logger from '../utils/logger.js';

// Escape regex metacharacters in user input before building $regex filters.
function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface WorkerSearchFilters {
  q?: string;
  trade?: string;
  location?: string;
  availableOnly?: boolean;
  minRating?: number;
}

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

    // ─── Blue-collar worker fields ──────────────────────────────────────────
    if (data.primaryTrade !== undefined) userDoc.profile.primaryTrade = data.primaryTrade;
    if (data.experienceYears !== undefined) {
      userDoc.profile.experienceYears = data.experienceYears;
    }
    if (data.expectedWage !== undefined) userDoc.profile.expectedWage = data.expectedWage;
    if (data.expectedWageType !== undefined) {
      userDoc.profile.expectedWageType = data.expectedWageType;
    }
    if (data.available !== undefined) userDoc.profile.available = data.available;
    if (data.preferredLocation !== undefined) {
      userDoc.profile.preferredLocation = data.preferredLocation;
    }
    // Comma-separated → trimmed, non-empty array (mirrors skills handling)
    if (data.languagesSpoken !== undefined) {
      userDoc.profile.languagesSpoken = data.languagesSpoken
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    if (data.toolsOwned !== undefined) {
      userDoc.profile.toolsOwned = data.toolsOwned
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
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

  /**
   * Persist the user's preferred language. The UI language lives in the
   * browser, but notifications and SMS are generated server-side, so we store
   * the choice to reach the user in their own language when they are offline.
   */
  async updateLanguage(userId: string, language: Language): Promise<SafeUser> {
    const userDoc = await User.findById(userId);
    if (!userDoc) {
      throw new NotFoundError('User');
    }
    userDoc.language = language;
    await userDoc.save();
    return userDoc.toJSON() as unknown as SafeUser;
  }

  /**
   * Verify a worker's identity from an Aadhaar number — the worker-side
   * counterpart to employer GST verification.
   *
   * DEMO: this trusts a valid Aadhaar *format* and marks the user verified.
   * Production must call an Aadhaar/DigiLocker KYC provider to confirm. We
   * store only the last 4 digits — never the full national ID.
   */
  async verifyIdentity(userId: string, idNumber: string): Promise<SafeUser> {
    const userDoc = await User.findById(userId);
    if (!userDoc) {
      throw new NotFoundError('User');
    }
    userDoc.idType = 'aadhaar';
    userDoc.idLast4 = idNumber.slice(-4);
    userDoc.verificationStatus = 'verified';
    await userDoc.save();

    logger.info(`User identity verified: ${userId} (aadhaar …${userDoc.idLast4})`);
    return userDoc.toJSON() as unknown as SafeUser;
  }

  /**
   * Add work-portfolio photos. Uploads each image and appends its URL, capped
   * at MAX_WORK_PHOTOS so the portfolio stays a highlight reel, not a dump.
   */
  async addWorkPhotos(userId: string, files: Express.Multer.File[]): Promise<SafeUser> {
    const userDoc = await User.findById(userId);
    if (!userDoc) {
      throw new NotFoundError('User');
    }
    if (!files || files.length === 0) {
      throw new ValidationError('No photos provided');
    }
    const current = userDoc.profile.workPhotos || [];
    if (current.length + files.length > APP_CONSTANTS.MAX_WORK_PHOTOS) {
      throw new ValidationError(
        `You can have at most ${APP_CONSTANTS.MAX_WORK_PHOTOS} work photos`,
      );
    }

    const urls = await Promise.all(files.map((f) => uploadService.uploadWorkPhoto(f)));
    userDoc.profile.workPhotos = [...current, ...urls];
    await userDoc.save();

    logger.info(`User ${userId} added ${urls.length} work photo(s)`);
    return userDoc.toJSON() as unknown as SafeUser;
  }

  /** Remove a single work photo by its URL. */
  async removeWorkPhoto(userId: string, url: string): Promise<SafeUser> {
    const userDoc = await User.findById(userId);
    if (!userDoc) {
      throw new NotFoundError('User');
    }
    userDoc.profile.workPhotos = (userDoc.profile.workPhotos || []).filter((u) => u !== url);
    await userDoc.save();
    return userDoc.toJSON() as unknown as SafeUser;
  }

  /**
   * Add an occupation credential (driving licence, trade certificate, …).
   *
   * DEMO verification, same shape as GST/Aadhaar: a driving licence is accepted
   * on a valid format and marked 'verified'; production would confirm it with
   * the issuing authority (Parivahan/DigiLocker). An optional photo of the
   * document can be attached.
   */
  async addCredential(
    userId: string,
    input: { type: CredentialType; number: string },
    file?: Express.Multer.File,
  ): Promise<SafeUser> {
    const userDoc = await User.findById(userId);
    if (!userDoc) {
      throw new NotFoundError('User');
    }

    let number = input.number.trim();
    if (input.type === 'driving_license') {
      // Indian DL: 2-letter state + 2-digit RTO + 4-digit year + 7 digits.
      const normalized = number.replace(/[\s-]/g, '').toUpperCase();
      if (!/^[A-Z]{2}\d{13}$/.test(normalized)) {
        throw new ValidationError('Enter a valid driving licence number');
      }
      number = normalized;
    }

    const documentUrl = file ? await uploadService.uploadFile(file, 'rozgarhub/credentials') : undefined;

    userDoc.profile.credentials = [
      ...(userDoc.profile.credentials || []),
      { type: input.type, number, documentUrl, status: 'verified' },
    ] as IUserProfile['credentials'];
    await userDoc.save();

    logger.info(`User ${userId} added credential: ${input.type}`);
    return userDoc.toJSON() as unknown as SafeUser;
  }

  /** Remove a credential by its subdocument id. */
  async removeCredential(userId: string, credentialId: string): Promise<SafeUser> {
    const userDoc = await User.findById(userId);
    if (!userDoc) {
      throw new NotFoundError('User');
    }
    userDoc.profile.credentials = (userDoc.profile.credentials || []).filter(
      (c) => c._id?.toString() !== credentialId,
    ) as IUserProfile['credentials'];
    await userDoc.save();
    return userDoc.toJSON() as unknown as SafeUser;
  }

  /**
   * Employer-facing worker discovery. Turns the pull-only model (workers apply,
   * employers wait) into a two-sided marketplace: an employer can search
   * "plumbers in Pune, available now" and reach out.
   *
   * Privacy: email is never returned, and a worker's phone is revealed only
   * when they are marked available (i.e. opted into being contacted for work).
   */
  async searchWorkers(
    filters: WorkerSearchFilters,
    page = 1,
    limit = 12,
  ): Promise<{ workers: unknown[]; total: number }> {
    // Discovery only ever surfaces identity-verified workers — an employer
    // hiring a stranger into their home or site should never see an unverified
    // profile. Verification is a hard filter, not an optional toggle.
    const q: Record<string, unknown> = { role: 'employee', verificationStatus: 'verified' };

    if (filters.availableOnly) q['profile.available'] = { $ne: false };
    if (filters.trade) {
      q['profile.primaryTrade'] = { $regex: escapeRegex(filters.trade), $options: 'i' };
    }
    if (filters.location) {
      q['profile.preferredLocation'] = { $regex: escapeRegex(filters.location), $options: 'i' };
    }
    if (typeof filters.minRating === 'number' && filters.minRating > 0) {
      q.ratingAverage = { $gte: filters.minRating };
    }
    if (filters.q) {
      const kw = escapeRegex(filters.q);
      q.$or = [
        { fullname: { $regex: kw, $options: 'i' } },
        { 'profile.primaryTrade': { $regex: kw, $options: 'i' } },
        { 'profile.skills': { $regex: kw, $options: 'i' } },
      ];
    }

    const [docs, total] = await Promise.all([
      User.find(q)
        .select(
          'fullname profile ratingAverage ratingCount verificationStatus phoneNumber createdAt',
        )
        .sort({ ratingAverage: -1, ratingCount: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      User.countDocuments(q).exec(),
    ]);

    const workers = (docs as unknown as Array<Record<string, unknown>>).map((d) => {
      const profile = (d.profile || {}) as Record<string, unknown>;
      const available = profile.available !== false;
      return {
        _id: d._id,
        fullname: d.fullname,
        ratingAverage: d.ratingAverage,
        ratingCount: d.ratingCount,
        verificationStatus: d.verificationStatus,
        profile: {
          bio: profile.bio,
          skills: profile.skills,
          profilePhoto: profile.profilePhoto,
          primaryTrade: profile.primaryTrade,
          experienceYears: profile.experienceYears,
          expectedWage: profile.expectedWage,
          expectedWageType: profile.expectedWageType,
          available,
          preferredLocation: profile.preferredLocation,
          languagesSpoken: profile.languagesSpoken,
          toolsOwned: profile.toolsOwned,
          workPhotos: profile.workPhotos,
        },
        // Contact is revealed only for workers open to work.
        phone: available && d.phoneNumber ? String(d.phoneNumber) : null,
      };
    });

    return { workers, total };
  }
}

export const userService = new UserService();
