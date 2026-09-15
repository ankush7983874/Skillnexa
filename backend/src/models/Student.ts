import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPrivacySettings {
  publicPortfolio: boolean;
  companyVisiblePortfolio: boolean;
  resumeVisibility: boolean;
  certificateVisibility: boolean;
  projectVisibility: boolean;
}

export interface ISkillEntry {
  _id?: string;
  name: string;
  category: string;
  score: number; // 0-100 score from self or assessment
  verified: boolean;
  verificationSource?: 'ASSESSMENT' | 'CERTIFICATE' | 'INSTITUTION' | 'COMPANY' | 'ADMIN';
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface IProject {
  _id?: string;
  title: string;
  description: string;
  techStack: string[];
  role?: string;
  startDate?: string;
  endDate?: string;
  demoUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  teamSize?: number;
  achievements?: string[];
}

export interface ICertificate {
  _id?: string;
  certificateName: string;
  issuingOrganization: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  certificateFile?: string;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface IInternship {
  _id?: string;
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  description?: string;
  mentor?: string;
  skillsUsed?: string[];
  completionStatus?: 'ONGOING' | 'COMPLETED' | 'DROPPED';
  certificate?: string;
}

export interface IAchievement {
  _id?: string;
  title: string;
  description: string;
  organization: string;
  date?: string;
  credential?: string;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface IStudent extends Document {
  user: mongoose.Types.ObjectId;
  college: string;
  degree: string;
  branch: string;
  semester: number;
  cgpa: number;
  graduationYear: number;
  skills: ISkillEntry[];
  softSkills: string[];
  interests: string[];
  projects: IProject[];
  certificates: ICertificate[];
  internships: IInternship[];
  achievements: IAchievement[];
  resumeUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  profileCompletionPercentage: number;
  privacySettings: IPrivacySettings;
  calculateCompletionPercentage(): number;
}

const studentSchema = new Schema<IStudent>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    college: { type: String, default: '' },
    degree: { type: String, default: '' },
    branch: { type: String, default: '' },
    semester: { type: Number, default: 1 },
    cgpa: { type: Number, default: 0 },
    graduationYear: { type: Number, default: new Date().getFullYear() + 2 },
    skills: [
      {
        name: { type: String, required: true },
        category: { type: String, default: 'General' },
        score: { type: Number, default: 0 },
        verified: { type: Boolean, default: false },
        verificationSource: { type: String, enum: ['ASSESSMENT', 'CERTIFICATE', 'INSTITUTION', 'COMPANY', 'ADMIN'] },
        verificationStatus: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' }
      },
    ],
    softSkills: [{ type: String }],
    interests: [{ type: String }],
    projects: [
      {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        techStack: [{ type: String }],
        role: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        demoUrl: { type: String, default: '' },
        projectUrl: { type: String, default: '' },
        githubUrl: { type: String, default: '' },
        teamSize: { type: Number },
        achievements: [{ type: String }]
      },
    ],
    certificates: [
      {
        certificateName: { type: String, required: true },
        issuingOrganization: { type: String, default: '' },
        issueDate: { type: String, default: '' },
        expiryDate: { type: String, default: '' },
        credentialId: { type: String, default: '' },
        credentialUrl: { type: String, default: '' },
        certificateFile: { type: String, default: '' },
        verificationStatus: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' }
      },
    ],
    internships: [
      {
        company: { type: String, required: true },
        role: { type: String, required: true },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        duration: { type: String, default: '' },
        description: { type: String, default: '' },
        mentor: { type: String, default: '' },
        skillsUsed: [{ type: String }],
        completionStatus: { type: String, enum: ['ONGOING', 'COMPLETED', 'DROPPED'], default: 'ONGOING' },
        certificate: { type: String, default: '' }
      },
    ],
    achievements: [
      {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        organization: { type: String, default: '' },
        date: { type: String, default: '' },
        credential: { type: String, default: '' },
        verificationStatus: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' }
      }
    ],
    resumeUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
    profileCompletionPercentage: { type: Number, default: 20 },
    privacySettings: {
      publicPortfolio: { type: Boolean, default: false },
      companyVisiblePortfolio: { type: Boolean, default: true },
      resumeVisibility: { type: Boolean, default: true },
      certificateVisibility: { type: Boolean, default: true },
      projectVisibility: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

studentSchema.methods.calculateCompletionPercentage = function (): number {
  let score = 0;

  // 1. Basic Profile (10%)
  if (this.githubUrl || this.linkedinUrl || this.portfolioUrl) {
    score += 10;
  } else {
    score += 5; // Has the base user model created
  }

  // 2. Academic Info (10%)
  if (this.college && this.degree && this.branch && this.cgpa > 0) {
    score += 10;
  } else if (this.college || this.degree) {
    score += 5;
  }

  // 3. Skills (15%)
  if (this.skills && this.skills.length >= 3) {
    score += 15;
  } else if (this.skills && this.skills.length > 0) {
    score += 7;
  }

  // 4. Projects (15%)
  if (this.projects && this.projects.length >= 2) {
    score += 15;
  } else if (this.projects && this.projects.length === 1) {
    score += 8;
  }

  // 5. Certificates (10%)
  if (this.certificates && this.certificates.length > 0) {
    score += 10;
  }

  // 6. Internships (10%)
  if (this.internships && this.internships.length > 0) {
    score += 10;
  }
  
  // 7. Achievements (5%)
  if (this.achievements && this.achievements.length > 0) {
    score += 5;
  }

  // 8. Resume (15%)
  if (this.resumeUrl) {
    score += 15;
  }
  
  // 9. Professional Links (10%)
  let linksCount = 0;
  if (this.githubUrl) linksCount++;
  if (this.linkedinUrl) linksCount++;
  if (this.portfolioUrl) linksCount++;
  
  if (linksCount >= 2) {
    score += 10;
  } else if (linksCount === 1) {
    score += 5;
  }

  return Math.min(100, Math.max(10, score));
};

export const Student: Model<IStudent> = mongoose.models.Student || mongoose.model<IStudent>('Student', studentSchema);
