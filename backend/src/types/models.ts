import { Types, Document } from 'mongoose';

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
  email: string;
  phoneNumber: number;
  password: string;
  role: UserRole;
  profile: IUserProfile;
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
  logo?: string;
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
  experienceLevel: number;
  location: string;
  jobType: string;
  position: number;
  company: Types.ObjectId | ICompany;
  created_By: Types.ObjectId;
  applications: Types.ObjectId[];
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
