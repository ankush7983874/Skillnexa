import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(2, 'Job title required'),
  description: z.string().min(10, 'Detailed job description required (at least 10 characters)'),
  requiredSkills: z.array(z.string()).min(1, 'At least one required skill must be specified'),
  preferredSkills: z.array(z.string()).optional().default([]),
  minCgpa: z.number().min(0).max(10).optional().default(0),
  allowedBranches: z.array(z.string()).optional().default([]),
  allowedGraduationYears: z.array(z.number()).optional().default([]),
  experience: z.string().optional().default('0-2 years'),
  location: z.string().optional().default('Remote'),
  salary: z.string().optional().default('Competitive'),
  employmentType: z.enum(['Full-time', 'Part-time', 'Contract']).optional().default('Full-time'),
  deadline: z.string().or(z.date()).transform((val) => {
    const d = new Date(val);
    if (isNaN(d.getTime())) {
      return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    }
    return d;
  }),
});


export const createInternshipSchema = z.object({
  title: z.string().min(2, 'Internship title required'),
  description: z.string().min(10, 'Detailed internship description required'),
  requiredSkills: z.array(z.string()).min(1, 'At least one required skill must be specified'),
  duration: z.string().default('3 Months'),
  stipend: z.string().default('Stipend Provided'),
  mentor: z.string().optional(),
  mode: z.enum(['Remote', 'On-site', 'Hybrid']).default('Hybrid'),
});

export const companyVerificationRequestSchema = z.object({
  companyName: z.string().min(2, 'Company name required'),
  registrationNumber: z.string().optional(),
  officialEmail: z.string().email('Invalid official email address').optional(),
  website: z.string().url().or(z.literal('')).optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  hrContactName: z.string().optional(),
  hrContactPhone: z.string().optional(),
});
