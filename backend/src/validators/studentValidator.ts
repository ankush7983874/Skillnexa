import { z } from 'zod';

export const updateStudentProfileSchema = z.object({
  college: z.string().optional(),
  degree: z.string().optional(),
  branch: z.string().optional(),
  semester: z.number().min(1).max(12).optional(),
  cgpa: z.number().min(0).max(10).optional(),
  graduationYear: z.number().min(2000).max(2100).optional(),
  yearOfGraduation: z.number().min(2000).max(2100).optional(), // alias
  phone: z.string().optional(),
  bio: z.string().optional(),
  softSkills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  resumeUrl: z.string().url().or(z.literal('')).optional(),
  githubUrl: z.string().url().or(z.literal('')).optional(),
  linkedinUrl: z.string().url().or(z.literal('')).optional(),
  portfolioUrl: z.string().url().or(z.literal('')).optional(),
  skills: z
    .array(
      z.object({
        name: z.string().min(1, 'Skill name required'),
        category: z.string().default('General'),
        score: z.number().min(0).max(100).default(50),
        verified: z.boolean().default(false),
      })
    )
    .optional(),
});

export const addProjectSchema = z.object({
  title: z.string().min(2, 'Project title required'),
  description: z.string().default(''),
  techStack: z.array(z.string()).default([]),
  projectUrl: z.string().url().or(z.literal('')).optional(),
  githubUrl: z.string().url().or(z.literal('')).optional(),
});

export const addCertificationSchema = z.object({
  title: z.string().min(2, 'Certification title required'),
  issuer: z.string().default(''),
  issueDate: z.string().default(''),
  credentialUrl: z.string().url().or(z.literal('')).optional(),
});

export const addInternshipSchema = z.object({
  company: z.string().min(2, 'Company name required'),
  role: z.string().min(2, 'Role required'),
  duration: z.string().default(''),
  description: z.string().default(''),
});

export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;
export type AddProjectInput = z.infer<typeof addProjectSchema>;
export type AddCertificationInput = z.infer<typeof addCertificationSchema>;
export type AddInternshipInput = z.infer<typeof addInternshipSchema>;
