import crypto from 'crypto';
import { Job } from '../models/job.model.js';
import { JobTranslation } from '../models/jobTranslation.model.js';
import { NotFoundError, ValidationError } from '../utils/ApiError.js';
import { translateText } from '../utils/mt.js';
import { SUPPORTED_LANGUAGES, type Language } from '../utils/constants.js';

export interface JobTranslationResult {
  translated: boolean;
  lang: Language;
  title?: string;
  description?: string;
  requirements?: string;
  companyDescription?: string;
}

/**
 * Serves a job's employer-typed content (title/description/requirements, plus
 * the posting company's description shown on the same page) in the worker's
 * language. Each (job, language) pair is machine-translated once and cached
 * in Mongo; a hash of the English source invalidates the cache when the
 * employer edits the job or company. When the MT provider is unavailable the
 * response is `translated: false` and the client keeps showing the original.
 */
class TranslationService {
  async getJobTranslation(jobId: string, lang: string): Promise<JobTranslationResult> {
    if (lang === 'en' || !SUPPORTED_LANGUAGES.includes(lang as Language)) {
      throw new ValidationError(`lang must be one of: ${SUPPORTED_LANGUAGES.filter((l) => l !== 'en').join(', ')}`);
    }
    const target = lang as Language;

    // Individual jobs have no company; companySource stays ''.
    const job = await Job.findById(jobId)
      .select('title description requirements company')
      .populate({ path: 'company', select: 'description' })
      .lean()
      .exec();
    if (!job) {
      throw new NotFoundError('Job');
    }
    const companySource =
      (job.company as { description?: string } | null | undefined)?.description ?? '';

    const sourceHash = crypto
      .createHash('sha1')
      .update(
        [job.title, job.description, job.requirements ?? '', companySource].join(' '),
      )
      .digest('hex');

    const cached = await JobTranslation.findOne({ job: jobId, lang: target })
      .lean()
      .exec();
    if (cached && cached.sourceHash === sourceHash) {
      return {
        translated: true,
        lang: target,
        title: cached.title,
        description: cached.description,
        requirements: cached.requirements,
        companyDescription: cached.companyDescription,
      };
    }

    const [title, description, requirements, companyDescription] = await Promise.all([
      translateText(job.title, target),
      translateText(job.description, target),
      job.requirements ? translateText(job.requirements, target) : Promise.resolve(''),
      companySource ? translateText(companySource, target) : Promise.resolve(''),
    ]);

    // Provider unavailable — don't cache a partial result; the client keeps
    // the original English and can retry on the next visit.
    if (
      title == null ||
      description == null ||
      requirements == null ||
      companyDescription == null
    ) {
      return { translated: false, lang: target };
    }

    await JobTranslation.findOneAndUpdate(
      { job: jobId, lang: target },
      { title, description, requirements, companyDescription, sourceHash },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).exec();

    return {
      translated: true,
      lang: target,
      title,
      description,
      requirements,
      companyDescription,
    };
  }
}

export const translationService = new TranslationService();
