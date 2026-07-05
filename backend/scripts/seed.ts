/**
 * Database Seeder — Generates realistic production-scale data.
 *
 * Generates:
 *   - 1,000 employer profiles (users with role=employer)
 *   - 1,000 companies (one per employer)
 *   - 5,000 worker profiles (users with role=employee)
 *   - 10,000 job listings across 5 cities
 *   - 25,000 applications (workers applying to jobs)
 *   - 2,000 saved jobs
 *   - 3,000 notifications
 *
 * Why?
 *   Anyone can build CRUD that works with 10 records.
 *   This proves the system works at scale with proper indexing.
 *
 * Usage:
 *   npx tsx --require ./src/preload.cjs scripts/seed.ts
 *   npx tsx --require ./src/preload.cjs scripts/seed.ts --drop  (drops existing data first)
 *
 * Performance notes:
 *   - Uses insertMany with ordered:false for max throughput
 *   - Pre-hashes one password and reuses it (bcrypt is slow by design)
 *   - Batches inserts to avoid memory pressure
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { User } from '../src/models/user.model.js';
import { Company } from '../src/models/company.model.js';
import { Job } from '../src/models/job.model.js';
import { Application } from '../src/models/application.model.js';
import { SavedJob } from '../src/models/savedJob.model.js';
import { Notification } from '../src/models/notification.model.js';

dotenv.config();

// ─── Configuration ──────────────────────────────────────────────────────────────
const CONFIG = {
  EMPLOYERS: 1_000,
  WORKERS: 5_000,
  JOBS: 10_000,
  APPLICATIONS: 25_000,
  SAVED_JOBS: 2_000,
  NOTIFICATIONS: 3_000,
  BATCH_SIZE: 500, // Insert in batches to avoid memory pressure
};

const DROP_EXISTING = process.argv.includes('--drop');

// ─── Realistic Indian Data ──────────────────────────────────────────────────────

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad'];

const FIRST_NAMES = [
  'Rahul', 'Amit', 'Vikram', 'Suresh', 'Rajesh', 'Manoj', 'Deepak', 'Sanjay',
  'Arun', 'Vijay', 'Prakash', 'Ramesh', 'Ganesh', 'Ashok', 'Mukesh',
  'Priya', 'Anita', 'Sunita', 'Kavita', 'Meena', 'Rekha', 'Pooja', 'Neha',
  'Ritu', 'Suman', 'Geeta', 'Savita', 'Asha', 'Kamla', 'Lakshmi',
  'Kiran', 'Ajay', 'Sunil', 'Vinod', 'Mohan', 'Ravi', 'Sachin', 'Nitin',
  'Manish', 'Harish', 'Dinesh', 'Naresh', 'Pankaj', 'Rakesh', 'Yogesh',
];

const LAST_NAMES = [
  'Kumar', 'Sharma', 'Singh', 'Yadav', 'Patel', 'Gupta', 'Verma', 'Joshi',
  'Mishra', 'Chauhan', 'Rao', 'Reddy', 'Nair', 'Pillai', 'Iyer',
  'Deshmukh', 'Patil', 'Kulkarni', 'More', 'Jadhav', 'Pawar', 'Shinde',
  'Banerjee', 'Mukherjee', 'Das', 'Ghosh', 'Bose', 'Sen', 'Roy', 'Dutta',
  'Thakur', 'Tiwari', 'Dubey', 'Pandey', 'Saxena', 'Agarwal', 'Jain',
  'Mahajan', 'Kapoor', 'Malhotra', 'Sethi', 'Arora', 'Khanna', 'Mehra',
];

const COMPANY_PREFIXES = [
  'Bharat', 'Desh', 'National', 'Royal', 'Golden', 'Silver', 'Star', 'Metro',
  'City', 'Urban', 'Prime', 'Elite', 'Trust', 'Shri', 'Jai', 'Om',
  'Raj', 'Maha', 'New', 'Super', 'Quick', 'Fast', 'Sure', 'Safe',
];

const COMPANY_SUFFIXES = [
  'Construction', 'Builders', 'Services', 'Solutions', 'Enterprises',
  'Industries', 'Works', 'Engineers', 'Contractors', 'Infrastructure',
  'Electricals', 'Plumbing', 'Transport', 'Logistics', 'Maintenance',
  'Facilities', 'Housekeeping', 'Security', 'Manpower', 'Staffing',
];

const COMPANY_DESCRIPTIONS = [
  'Leading provider of skilled workforce solutions across India.',
  'Trusted construction and infrastructure company with 20+ years of experience.',
  'Delivering quality home maintenance services since 2005.',
  'Premier staffing agency connecting workers with top employers.',
  'Professional facility management and maintenance solutions.',
  'One of India\'s fastest growing blue-collar hiring platforms.',
  'ISO certified company specializing in industrial manpower solutions.',
  'Providing reliable and affordable home repair services.',
  'Expert electrical and plumbing services for residential and commercial projects.',
  'Comprehensive logistics and transport solutions for businesses.',
];

const JOB_TEMPLATES = [
  // Plumbing
  { title: 'Experienced Plumber', skills: ['plumbing', 'pipe fitting', 'leak repair'], type: 'Full-Time', salaryRange: [3, 6] },
  { title: 'Junior Plumber', skills: ['plumbing', 'basic repairs'], type: 'Full-Time', salaryRange: [2, 4] },
  { title: 'Plumbing Supervisor', skills: ['plumbing', 'team management', 'quality inspection'], type: 'Full-Time', salaryRange: [5, 8] },
  // Electrical
  { title: 'Electrician', skills: ['wiring', 'electrical repair', 'circuit installation'], type: 'Full-Time', salaryRange: [3, 7] },
  { title: 'Senior Electrician', skills: ['wiring', 'electrical systems', 'troubleshooting', 'safety protocols'], type: 'Full-Time', salaryRange: [5, 9] },
  { title: 'Electrical Helper', skills: ['basic electrical', 'cable pulling'], type: 'Part-Time', salaryRange: [1.5, 3] },
  // Construction
  { title: 'Mason', skills: ['masonry', 'brick laying', 'plastering'], type: 'Full-Time', salaryRange: [3, 6] },
  { title: 'Carpenter', skills: ['carpentry', 'woodwork', 'furniture making'], type: 'Full-Time', salaryRange: [3, 7] },
  { title: 'Painter', skills: ['painting', 'wall preparation', 'color mixing'], type: 'Full-Time', salaryRange: [2.5, 5] },
  { title: 'Construction Worker', skills: ['construction', 'heavy lifting', 'site safety'], type: 'Full-Time', salaryRange: [2, 4] },
  { title: 'Welding Technician', skills: ['welding', 'metal fabrication', 'arc welding'], type: 'Full-Time', salaryRange: [4, 8] },
  { title: 'Tile Fitter', skills: ['tiling', 'floor installation', 'measurement'], type: 'Full-Time', salaryRange: [3, 6] },
  // Driving
  { title: 'Delivery Driver', skills: ['driving', 'navigation', 'customer service'], type: 'Full-Time', salaryRange: [2.5, 5] },
  { title: 'Heavy Vehicle Driver', skills: ['heavy vehicle driving', 'logistics', 'route planning'], type: 'Full-Time', salaryRange: [4, 8] },
  { title: 'Auto Rickshaw Driver', skills: ['driving', 'city navigation'], type: 'Full-Time', salaryRange: [2, 4] },
  { title: 'Cab Driver', skills: ['driving', 'GPS navigation', 'customer handling'], type: 'Full-Time', salaryRange: [3, 6] },
  // Cleaning / Maintenance
  { title: 'Housekeeping Staff', skills: ['cleaning', 'housekeeping', 'laundry'], type: 'Full-Time', salaryRange: [1.5, 3] },
  { title: 'Office Cleaner', skills: ['cleaning', 'floor mopping', 'waste disposal'], type: 'Part-Time', salaryRange: [1, 2.5] },
  { title: 'AC Technician', skills: ['AC repair', 'HVAC', 'refrigeration'], type: 'Full-Time', salaryRange: [4, 8] },
  { title: 'Maintenance Technician', skills: ['general maintenance', 'repairs', 'equipment handling'], type: 'Full-Time', salaryRange: [3, 6] },
  // Security
  { title: 'Security Guard', skills: ['security', 'surveillance', 'access control'], type: 'Full-Time', salaryRange: [2, 4] },
  { title: 'Night Security Guard', skills: ['security', 'night patrolling'], type: 'Part-Time', salaryRange: [1.5, 3] },
  // Cooking / Food
  { title: 'Cook / Chef', skills: ['cooking', 'food preparation', 'kitchen management'], type: 'Full-Time', salaryRange: [2.5, 6] },
  { title: 'Kitchen Helper', skills: ['dishwashing', 'food prep', 'cleaning'], type: 'Part-Time', salaryRange: [1, 2.5] },
  { title: 'Catering Staff', skills: ['catering', 'serving', 'event setup'], type: 'Part-Time', salaryRange: [1.5, 3] },
  // Tailoring / Garment
  { title: 'Tailor', skills: ['stitching', 'tailoring', 'pattern cutting'], type: 'Full-Time', salaryRange: [2.5, 5] },
  { title: 'Garment Worker', skills: ['sewing', 'garment assembly', 'quality check'], type: 'Full-Time', salaryRange: [2, 4] },
  // Other
  { title: 'Packing Staff', skills: ['packing', 'labeling', 'warehouse'], type: 'Full-Time', salaryRange: [1.5, 3] },
  { title: 'Warehouse Worker', skills: ['warehouse', 'inventory', 'forklift'], type: 'Full-Time', salaryRange: [2, 4] },
  { title: 'Gardener', skills: ['gardening', 'landscaping', 'plant care'], type: 'Full-Time', salaryRange: [1.5, 3.5] },
  { title: 'Salon Assistant', skills: ['hairdressing', 'beauty care', 'customer service'], type: 'Full-Time', salaryRange: [1.5, 3.5] },
];

const JOB_DESCRIPTIONS_TEMPLATES = [
  'We are looking for a skilled {title} to join our team in {city}. The ideal candidate should have {exp}+ years of experience and a strong work ethic. We offer competitive pay, on-time salary, and a supportive work environment.',
  'Hiring {title} for our {city} operations. Must be reliable, punctual, and experienced. Prior experience in similar roles is preferred. Benefits include PF, ESI, and weekly offs.',
  '{company} is seeking a dedicated {title} for immediate joining in {city}. Candidates with {exp}+ years experience will be preferred. We provide accommodation and food for outstation workers.',
  'Urgent requirement for {title} at our {city} site. Good salary package with overtime pay. Must be able to work in a team and follow safety guidelines.',
  'Join {company} as a {title}. We are a growing company with operations across {city}. Looking for hardworking individuals who want to build a long-term career. Training provided for freshers.',
  'Experienced {title} needed for residential/commercial projects in {city}. Minimum {exp} years experience required. Salary negotiable based on skills and experience.',
  'Walk-in interview for {title} position at {company}, {city}. Bring your Aadhaar card and any experience certificates. Immediate joining available.',
];

// ─── Utility Functions ─────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function randomDate(daysBack: number): Date {
  const now = Date.now();
  const past = now - daysBack * 24 * 60 * 60 * 1000;
  return new Date(past + Math.random() * (now - past));
}

// Generate a unique phone number
let phoneCounter = 9000000000;
function nextPhone(): number {
  return phoneCounter++;
}

// ─── Data Generators ────────────────────────────────────────────────────────────

function generateEmployer(index: number, hashedPassword: string) {
  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const fullname = `${firstName} ${lastName}`;
  const username = `emp_${firstName.toLowerCase()}_${index}`;

  return {
    fullname,
    email: `employer${index}@rozgarhub.test`,
    username,
    phoneNumber: nextPhone(),
    password: hashedPassword,
    role: 'employer' as const,
    profile: {
      bio: `Business owner and employer based in ${pick(CITIES)}.`,
      skills: [],
      profilePhoto: '',
    },
    createdAt: randomDate(365),
  };
}

function generateWorker(index: number, hashedPassword: string) {
  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const fullname = `${firstName} ${lastName}`;
  const username = `worker_${firstName.toLowerCase()}_${index}`;
  const numSkills = randomInt(2, 5);
  const allSkills = JOB_TEMPLATES.flatMap((j) => j.skills);
  const skills = [...new Set(pickN(allSkills, numSkills))];

  return {
    fullname,
    email: `worker${index}@rozgarhub.test`,
    username,
    phoneNumber: nextPhone(),
    password: hashedPassword,
    role: 'employee' as const,
    profile: {
      bio: `Experienced ${skills[0]} professional with ${randomInt(1, 15)} years of experience. Based in ${pick(CITIES)}. Looking for stable employment with good pay.`,
      skills,
      profilePhoto: '',
    },
    createdAt: randomDate(365),
  };
}

function generateCompany(index: number, employerId: mongoose.Types.ObjectId) {
  const city = pick(CITIES);
  return {
    name: `${pick(COMPANY_PREFIXES)} ${pick(COMPANY_SUFFIXES)} ${index}`,
    description: pick(COMPANY_DESCRIPTIONS),
    website: `https://company${index}.example.com`,
    location: city,
    logo: '',
    userId: employerId,
    createdAt: randomDate(300),
  };
}

function generateJob(
  companyId: mongoose.Types.ObjectId,
  employerId: mongoose.Types.ObjectId,
  companyName: string,
  companyCity: string,
) {
  const template = pick(JOB_TEMPLATES);
  const city = Math.random() > 0.3 ? companyCity : pick(CITIES);
  const exp = randomInt(0, 5);
  const salary = randomFloat(template.salaryRange[0], template.salaryRange[1]);

  const descTemplate = pick(JOB_DESCRIPTIONS_TEMPLATES);
  const description = descTemplate
    .replace(/\{title\}/g, template.title)
    .replace(/\{city\}/g, city)
    .replace(/\{company\}/g, companyName)
    .replace(/\{exp\}/g, String(exp));

  return {
    title: template.title,
    description,
    requirements: template.skills.join(', '),
    salary,
    experienceLevel: exp,
    location: city,
    jobType: template.type,
    position: randomInt(1, 10),
    company: companyId,
    created_By: employerId,
    applications: [],
    createdAt: randomDate(180),
  };
}

// ─── Insert in Batches ──────────────────────────────────────────────────────────

async function insertBatched<T>(
  model: mongoose.Model<T>,
  docs: Record<string, any>[],
  label: string,
) {
  const total = docs.length;
  let inserted = 0;

  for (let i = 0; i < total; i += CONFIG.BATCH_SIZE) {
    const batch = docs.slice(i, i + CONFIG.BATCH_SIZE);
    await model.insertMany(batch, { ordered: false });
    inserted += batch.length;
    const pct = Math.round((inserted / total) * 100);
    process.stdout.write(`\r  ${label}: ${inserted.toLocaleString()}/${total.toLocaleString()} (${pct}%)`);
  }
  console.log(` ✅`);
}

// ─── Main Seed Function ─────────────────────────────────────────────────────────

async function seed() {
  console.log('\n🌱 RozgarHub Database Seeder');
  console.log('═'.repeat(60));
  console.log(`  Employers:      ${CONFIG.EMPLOYERS.toLocaleString()}`);
  console.log(`  Workers:        ${CONFIG.WORKERS.toLocaleString()}`);
  console.log(`  Jobs:           ${CONFIG.JOBS.toLocaleString()}`);
  console.log(`  Applications:   ${CONFIG.APPLICATIONS.toLocaleString()}`);
  console.log(`  Saved Jobs:     ${CONFIG.SAVED_JOBS.toLocaleString()}`);
  console.log(`  Notifications:  ${CONFIG.NOTIFICATIONS.toLocaleString()}`);
  console.log('═'.repeat(60));

  // Connect
  const mongoUrl = process.env.MONGODB_URL;
  if (!mongoUrl) {
    console.error('❌ MONGODB_URL not set in .env');
    process.exit(1);
  }

  console.log('\n📡 Connecting to MongoDB...');
  await mongoose.connect(mongoUrl);
  console.log('  Connected ✅\n');

  // Drop if requested
  if (DROP_EXISTING) {
    console.log('🗑️  Dropping existing collections...');
    const collections = ['users', 'companies', 'jobs', 'applications', 'savedjobs', 'notifications'];
    for (const name of collections) {
      try {
        await mongoose.connection.db!.dropCollection(name);
        console.log(`  Dropped: ${name}`);
      } catch {
        // Collection might not exist
      }
    }
    console.log('');
  }

  // Ensure all indexes are synced (critical after drop or first run)
  console.log('📑 Syncing indexes...');
  await Promise.all([
    User.syncIndexes(),
    Company.syncIndexes(),
    Job.syncIndexes(),
    Application.syncIndexes(),
    SavedJob.syncIndexes(),
    Notification.syncIndexes(),
  ]);
  console.log('  Indexes synced ✅\n');

  const startTime = Date.now();

  // ─── Step 1: Hash password once ─────────────────────────────────────────
  console.log('🔐 Hashing password...');
  const hashedPassword = await bcrypt.hash('Test@12345', 10);
  console.log('  Done ✅\n');

  // ─── Step 2: Generate & insert employers ────────────────────────────────
  console.log('👔 Generating employers...');
  const employerDocs = Array.from({ length: CONFIG.EMPLOYERS }, (_, i) =>
    generateEmployer(i + 1, hashedPassword),
  );
  await insertBatched(User, employerDocs, 'Employers');

  const employers = await User.find({ role: 'employer' }).select('_id').lean();
  const employerIds = employers.map((e) => e._id as mongoose.Types.ObjectId);

  // ─── Step 3: Generate & insert companies ────────────────────────────────
  console.log('🏢 Generating companies...');
  const companyDocs = employerIds.map((empId, i) =>
    generateCompany(i + 1, empId),
  );
  await insertBatched(Company, companyDocs, 'Companies');

  const companies = await Company.find().select('_id name location userId').lean();
  const companyMap = new Map(companies.map((c) => [c.userId.toString(), c]));

  // ─── Step 4: Generate & insert workers ──────────────────────────────────
  console.log('👷 Generating workers...');
  const workerDocs = Array.from({ length: CONFIG.WORKERS }, (_, i) =>
    generateWorker(i + 1, hashedPassword),
  );
  await insertBatched(User, workerDocs, 'Workers');

  const workers = await User.find({ role: 'employee' }).select('_id').lean();
  const workerIds = workers.map((w) => w._id as mongoose.Types.ObjectId);

  // ─── Step 5: Generate & insert jobs ─────────────────────────────────────
  console.log('📋 Generating jobs...');
  const jobDocs: ReturnType<typeof generateJob>[] = [];
  for (let i = 0; i < CONFIG.JOBS; i++) {
    const empId = pick(employerIds);
    const comp = companyMap.get(empId.toString());
    if (comp) {
      jobDocs.push(generateJob(comp._id as mongoose.Types.ObjectId, empId, comp.name, comp.location || pick(CITIES)));
    } else {
      // Fallback — shouldn't happen but be safe
      const fallbackComp = pick(companies);
      jobDocs.push(generateJob(fallbackComp._id as mongoose.Types.ObjectId, empId, fallbackComp.name, fallbackComp.location || pick(CITIES)));
    }
  }
  await insertBatched(Job, jobDocs, 'Jobs');

  const jobs = await Job.find().select('_id created_By').lean();
  const jobIds = jobs.map((j) => j._id as mongoose.Types.ObjectId);

  // ─── Step 6: Generate & insert applications ────────────────────────────
  console.log('📝 Generating applications...');
  const applicationSet = new Set<string>();
  const applicationDocs: Record<string, any>[] = [];
  const statuses = ['pending', 'accepted', 'rejected'];
  const statusWeights = [0.6, 0.2, 0.2]; // 60% pending, 20% accepted, 20% rejected

  let attempts = 0;
  while (applicationDocs.length < CONFIG.APPLICATIONS && attempts < CONFIG.APPLICATIONS * 3) {
    attempts++;
    const workerId = pick(workerIds);
    const jobId = pick(jobIds);
    const key = `${workerId}-${jobId}`;

    if (!applicationSet.has(key)) {
      applicationSet.add(key);
      const rand = Math.random();
      const status = rand < statusWeights[0]
        ? statuses[0]
        : rand < statusWeights[0] + statusWeights[1]
          ? statuses[1]
          : statuses[2];

      applicationDocs.push({
        job: jobId,
        applicant: workerId,
        status,
        createdAt: randomDate(90),
      });
    }
  }
  await insertBatched(Application, applicationDocs, 'Applications');

  // Update job.applications arrays (batch update for performance)
  console.log('  Linking applications to jobs...');
  const appsByJob = new Map<string, mongoose.Types.ObjectId[]>();
  const applications = await Application.find().select('_id job').lean();
  for (const app of applications) {
    const jobKey = app.job.toString();
    if (!appsByJob.has(jobKey)) appsByJob.set(jobKey, []);
    appsByJob.get(jobKey)!.push(app._id as mongoose.Types.ObjectId);
  }

  const bulkOps = Array.from(appsByJob.entries()).map(([jobId, appIds]) => ({
    updateOne: {
      filter: { _id: new mongoose.Types.ObjectId(jobId) },
      update: { $set: { applications: appIds } },
    },
  }));

  if (bulkOps.length > 0) {
    for (let i = 0; i < bulkOps.length; i += CONFIG.BATCH_SIZE) {
      await Job.bulkWrite(bulkOps.slice(i, i + CONFIG.BATCH_SIZE));
    }
  }
  console.log(`  Linked ${applications.length.toLocaleString()} applications to ${appsByJob.size.toLocaleString()} jobs ✅`);

  // ─── Step 7: Generate saved jobs ────────────────────────────────────────
  console.log('🔖 Generating saved jobs...');
  const savedSet = new Set<string>();
  const savedDocs: Record<string, any>[] = [];

  while (savedDocs.length < CONFIG.SAVED_JOBS) {
    const workerId = pick(workerIds);
    const jobId = pick(jobIds);
    const key = `${workerId}-${jobId}`;
    if (!savedSet.has(key)) {
      savedSet.add(key);
      savedDocs.push({
        userId: workerId,
        jobId,
        createdAt: randomDate(60),
      });
    }
  }
  await insertBatched(SavedJob, savedDocs, 'Saved Jobs');

  // ─── Step 8: Generate notifications ─────────────────────────────────────
  console.log('🔔 Generating notifications...');
  const notifTypes = [
    { type: 'application_received', title: 'New Application', msg: 'You received a new application for your job posting.' },
    { type: 'application_accepted', title: 'Application Accepted', msg: 'Congratulations! Your application has been accepted.' },
    { type: 'application_rejected', title: 'Application Update', msg: 'Your application status has been updated.' },
    { type: 'new_job_match', title: 'New Job Alert', msg: 'A new job matching your skills has been posted.' },
    { type: 'system', title: 'Welcome to RozgarHub!', msg: 'Thank you for joining RozgarHub. Start exploring jobs today!' },
  ];

  const notifDocs = Array.from({ length: CONFIG.NOTIFICATIONS }, () => {
    const template = pick(notifTypes);
    return {
      recipient: pick([...workerIds, ...employerIds]),
      type: template.type,
      title: template.title,
      message: template.msg,
      isRead: Math.random() > 0.4,
      relatedEntity: Math.random() > 0.5
        ? { kind: 'Job', id: pick(jobIds) }
        : undefined,
      createdAt: randomDate(30),
    };
  });
  await insertBatched(Notification, notifDocs, 'Notifications');

  // ─── Summary ──────────────────────────────────────────────────────────────
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n' + '═'.repeat(60));
  console.log('✅ Seeding complete!');
  console.log('═'.repeat(60));
  console.log(`  Time:           ${elapsed}s`);
  console.log(`  Employers:      ${(await User.countDocuments({ role: 'employer' })).toLocaleString()}`);
  console.log(`  Workers:        ${(await User.countDocuments({ role: 'employee' })).toLocaleString()}`);
  console.log(`  Companies:      ${(await Company.countDocuments()).toLocaleString()}`);
  console.log(`  Jobs:           ${(await Job.countDocuments()).toLocaleString()}`);
  console.log(`  Applications:   ${(await Application.countDocuments()).toLocaleString()}`);
  console.log(`  Saved Jobs:     ${(await SavedJob.countDocuments()).toLocaleString()}`);
  console.log(`  Notifications:  ${(await Notification.countDocuments()).toLocaleString()}`);

  // ─── Verify Indexes ───────────────────────────────────────────────────────
  console.log('\n📊 Index verification:');
  const indexCollections = [
    { name: 'users', model: User },
    { name: 'jobs', model: Job },
    { name: 'applications', model: Application },
    { name: 'companies', model: Company },
  ];

  for (const { name, model } of indexCollections) {
    const indexes = await model.collection.indexes();
    console.log(`  ${name}: ${indexes.length} indexes`);
    indexes.forEach((idx) => {
      const fields = Object.entries(idx.key).map(([k, v]) => `${k}:${v}`).join(', ');
      const flags = [
        idx.unique ? 'unique' : '',
        idx.sparse ? 'sparse' : '',
      ].filter(Boolean).join(', ');
      console.log(`    → { ${fields} }${flags ? ` (${flags})` : ''}`);
    });
  }

  // ─── Query Performance Test ───────────────────────────────────────────────
  console.log('\n⚡ Query performance benchmarks (with indexes):');

  const benchmarks = [
    {
      name: 'Job search by text (title)',
      fn: () => Job.find({ $text: { $search: 'plumber' } }).limit(20).lean().exec(),
    },
    {
      name: 'Jobs by location + type',
      fn: () => Job.find({ location: 'Mumbai', jobType: 'Full-Time' }).limit(20).lean().exec(),
    },
    {
      name: 'Jobs by salary range',
      fn: () => Job.find({ salary: { $gte: 3, $lte: 6 } }).sort({ createdAt: -1 }).limit(20).lean().exec(),
    },
    {
      name: 'Employer jobs (by created_By)',
      fn: () => Job.find({ created_By: pick(employerIds) }).sort({ createdAt: -1 }).lean().exec(),
    },
    {
      name: 'Worker applications',
      fn: () => Application.find({ applicant: pick(workerIds) }).sort({ createdAt: -1 }).lean().exec(),
    },
    {
      name: 'Job applicants (by job)',
      fn: () => Application.find({ job: pick(jobIds) }).lean().exec(),
    },
    {
      name: 'Unread notifications count',
      fn: () => Notification.countDocuments({ recipient: pick(workerIds), isRead: false }),
    },
    {
      name: 'User login (by email)',
      fn: () => User.findOne({ email: 'worker1@rozgarhub.test' }).lean().exec(),
    },
    {
      name: 'Pagination: page 50 (offset)',
      fn: () => Job.find().sort({ createdAt: -1 }).skip(490).limit(10).lean().exec(),
    },
    {
      name: 'Aggregation: jobs by city',
      fn: () => Job.aggregate([
        { $group: { _id: '$location', count: { $sum: 1 }, avgSalary: { $avg: '$salary' } } },
        { $sort: { count: -1 } },
      ]).exec(),
    },
  ];

  for (const bench of benchmarks) {
    // Warm up
    await bench.fn();

    // Measure (average of 3 runs)
    const times: number[] = [];
    for (let i = 0; i < 3; i++) {
      const start = performance.now();
      await bench.fn();
      times.push(performance.now() - start);
    }
    const avg = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1);
    const icon = Number(avg) < 10 ? '🟢' : Number(avg) < 50 ? '🟡' : '🔴';
    console.log(`  ${icon} ${bench.name}: ${avg}ms`);
  }

  console.log('\n🔑 Test credentials:');
  console.log('  Employer: employer1@rozgarhub.test / Test@12345');
  console.log('  Worker:   worker1@rozgarhub.test   / Test@12345');
  console.log('');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
