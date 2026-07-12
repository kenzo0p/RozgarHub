import { Types, Document } from 'mongoose';
import type { Language } from '../utils/constants.js';

// ─── User ──────────────────────────────────────────────────────────────────────

export type UserRole = 'employee' | 'employer';

export interface IUserProfile {
  bio?: string;
  skills: string[];
  resume?: string;
  resumeOriginalName?: string;
  company?: Types.ObjectId;
  profilePhoto: string;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  fullname: string;
  username: string;
  email?: string;
  phoneNumber: number;
  password?: string;
  role: UserRole;
  language: Language;
  profile: IUserProfile;
  ratingAverage: number;
  ratingCount: number;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  idType?: 'aadhaar';
  idLast4?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User data safe for client consumption (password stripped).
 */
export type SafeUser = Omit<IUser, 'password'>;

// ─── Company ───────────────────────────────────────────────────────────────────

export interface ICompany extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  website?: string;
  location?: string;
  contactPhone?: string;
  logo?: string;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  gstNumber?: string;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Job ───────────────────────────────────────────────────────────────────────

export interface IJob extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  requirements: string;
  salary: number;
  wageType: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'fixed';
  experienceLevel: number;
  location: string;
  geo?: { type: 'Point'; coordinates: [number, number] };
  jobType: string;
  position: number;
  company: Types.ObjectId | ICompany;
  created_By: Types.ObjectId;
  applications: Types.ObjectId[];
  flagged: boolean;
  reportCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Application ───────────────────────────────────────────────────────────────

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

export interface IApplication extends Document {
  _id: Types.ObjectId;
  job: Types.ObjectId | IJob;
  applicant: Types.ObjectId | IUser;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}
