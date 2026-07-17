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
  // Blue-collar worker fields
  primaryTrade?: string;
  experienceYears?: number;
  expectedWage?: number;
  expectedWageType?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'fixed';
  available?: boolean;
  preferredLocation?: string;
  languagesSpoken?: string[];
  toolsOwned?: string[];
  workPhotos?: string[];
  credentials?: ICredential[];
}

export type CredentialType = 'driving_license' | 'certificate' | 'other';

export interface ICredential {
  _id?: Types.ObjectId;
  type: CredentialType;
  number: string;
  documentUrl?: string;
  status: 'submitted' | 'verified' | 'rejected';
  createdAt?: Date;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  fullname: string;
  username: string;
  email?: string;
  phoneNumber: number;
  password?: string;
  role: UserRole;
  employerType?: 'individual' | 'business';
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
  requiredCredential?: 'driving_license' | 'certificate';
  position: number;
  company?: Types.ObjectId | ICompany;
  created_By: Types.ObjectId | IUser;
  applications: Types.ObjectId[];
  flagged: boolean;
  reportCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Job translation (cached MT of employer-typed content) ────────────────────

export interface IJobTranslation extends Document {
  _id: Types.ObjectId;
  job: Types.ObjectId | IJob;
  lang: string;
  title: string;
  description: string;
  requirements?: string;
  // The posting company's description — shown on the same job page, so it's
  // translated and cached together with the job's own content.
  companyDescription?: string;
  sourceHash: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Application ───────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'started'
  | 'completed'
  | 'paid';

export type PaymentMethod = 'cash' | 'upi' | 'bank';

export interface IApplication extends Document {
  _id: Types.ObjectId;
  job: Types.ObjectId | IJob;
  applicant: Types.ObjectId | IUser;
  status: ApplicationStatus;
  paidAmount?: number;
  paymentMethod?: PaymentMethod;
  paymentConfirmed: boolean;
  paymentConfirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
