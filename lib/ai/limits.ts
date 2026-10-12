// Input caps for anything sent to the model, so a single request can't run
// up an outsized prompt. Generous for real resumes and job postings.
export const MAX_RESUME_CHARS = 30_000;
export const MAX_JOB_DESCRIPTION_CHARS = 15_000;
export const MAX_SECTION_NOTES_CHARS = 5_000;
