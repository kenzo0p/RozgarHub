/**
 * Job type is a stored enum ("Full-Time" | "Part-Time" | "Contract"), so the
 * DB value stays English while the label shown to the user is translated.
 * Unknown values (old data) fall back to the raw string.
 */
const JOB_TYPE_KEYS = {
  "Full-Time": "jobType.fullTime",
  "Part-Time": "jobType.partTime",
  Contract: "jobType.contract",
};

export function jobTypeLabel(type, t) {
  const key = JOB_TYPE_KEYS[type];
  return key ? t(key) : type;
}
