import { IStudent } from '../models/Student';
import { IJob } from '../models/Job';

export interface SubScore {
  score: number;
  maxScore: number;
  percentage: number;
}

export interface MatchBreakdown {
  technicalSkills: SubScore & {
    matchedSkills: string[];
    missingSkills: string[];
  };
  academicPerformance: SubScore & {
    cgpa: number;
    minCgpaRequired: number;
    isEligible: boolean;
  };
  assessmentScore: SubScore & {
    averageScore: number;
  };
  projects: SubScore & {
    projectCount: number;
  };
  certifications: SubScore & {
    count: number;
  };
  experience: SubScore & {
    internshipCount: number;
  };
  softSkills: SubScore & {
    count: number;
  };
}

export interface MatchResult {
  studentId: string;
  userId: string;
  candidateName: string;
  email: string;
  college: string;
  degree: string;
  branch: string;
  cgpa: number;
  matchScore: number;
  breakdown: MatchBreakdown;
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
}

/**
 * Normalizes a skill string into a standard key for case-insensitive and synonym matching.
 */
export const normalizeSkillName = (skill: string): string => {
  if (!skill) return '';
  let cleaned = skill.trim().toLowerCase().replace(/[^a-z0-9+#\/\.\s-]/g, '');

  // Synonym dictionary mapping
  const synonyms: Record<string, string> = {
    'js': 'javascript',
    'javascript': 'javascript',
    'ecmascript': 'javascript',
    'py': 'python',
    'python': 'python',
    'python3': 'python',
    'cpp': 'c++',
    'c++': 'c++',
    'c': 'c',
    'java': 'java',
    'dsa': 'dsa',
    'data structures': 'dsa',
    'algorithms': 'dsa',
    'data structures & algorithms': 'dsa',
    'data structures and algorithms': 'dsa',
    'ds and algo': 'dsa',
    'dbms': 'dbms',
    'database': 'dbms',
    'database management': 'dbms',
    'database management system': 'dbms',
    'rdbms': 'dbms',
    'sql': 'sql',
    'structured query language': 'sql',
    'mysql': 'sql',
    'postgresql': 'sql',
    'postgres': 'sql',
    'sqlite': 'sql',
    'oracle sql': 'sql',
    'web dev': 'web development',
    'web development': 'web development',
    'html/css': 'web development',
    'frontend': 'web development',
    'backend': 'web development',
    'full stack': 'web development',
    'cloud': 'cloud',
    'cloud computing': 'cloud',
    'aws': 'cloud',
    'amazon web services': 'cloud',
    'azure': 'cloud',
    'gcp': 'cloud',
    'google cloud': 'cloud',
    'ai/ml': 'ai/ml',
    'ai': 'ai/ml',
    'ml': 'ai/ml',
    'machine learning': 'ai/ml',
    'artificial intelligence': 'ai/ml',
    'deep learning': 'ai/ml',
    'react': 'react',
    'reactjs': 'react',
    'react.js': 'react',
    'node': 'node',
    'nodejs': 'node',
    'node.js': 'node',
    'express': 'express',
    'expressjs': 'express',
    'express.js': 'express',
    'spring boot': 'spring boot',
    'springboot': 'spring boot',
  };

  return synonyms[cleaned] || cleaned;
};

/**
 * Calculates a comprehensive and explainable AI Job Match score for a candidate against a job.
 */
export const calculateCandidateMatch = (student: IStudent, job: IJob, candidateUserObj?: any): MatchResult => {
  const reqSkills = job.requiredSkills || [];
  const prefSkills = job.preferredSkills || [];
  const allJobSkills = Array.from(new Set([...reqSkills, ...prefSkills])).filter(Boolean);

  // Aggregated candidate skills dictionary (key -> { originalName, score, verified })
  const candidateSkillMap: Map<string, { originalName: string; score: number; verified: boolean }> = new Map();

  // 1. Explicit Skills from profile
  (student.skills || []).forEach((sk) => {
    if (!sk.name) return;
    const norm = normalizeSkillName(sk.name);
    candidateSkillMap.set(norm, {
      originalName: sk.name.trim(),
      score: sk.score || (sk.verified ? 85 : 70),
      verified: Boolean(sk.verified),
    });
  });

  // 2. Aggregate skills from Projects techStack
  (student.projects || []).forEach((proj) => {
    (proj.techStack || []).forEach((tech) => {
      if (!tech) return;
      const norm = normalizeSkillName(tech);
      if (!candidateSkillMap.has(norm)) {
        candidateSkillMap.set(norm, {
          originalName: tech.trim(),
          score: 75,
          verified: false,
        });
      }
    });
  });

  // 3. Aggregate skills from Internships skillsUsed
  (student.internships || []).forEach((intern) => {
    (intern.skillsUsed || []).forEach((sk) => {
      if (!sk) return;
      const norm = normalizeSkillName(sk);
      if (!candidateSkillMap.has(norm)) {
        candidateSkillMap.set(norm, {
          originalName: sk.trim(),
          score: 80,
          verified: true,
        });
      }
    });
  });

  // 4. Aggregate skills from Certificates
  (student.certificates || []).forEach((cert) => {
    if (!cert.certificateName) return;
    const norm = normalizeSkillName(cert.certificateName);
    if (!candidateSkillMap.has(norm)) {
      candidateSkillMap.set(norm, {
        originalName: cert.certificateName.trim(),
        score: 85,
        verified: true,
      });
    }
  });

  // Calculate Technical Skills Match (Max 40 points)
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  let techRawPoints = 0;

  if (allJobSkills.length > 0) {
    const pointsPerSkill = 40 / allJobSkills.length;
    allJobSkills.forEach((jobSkill) => {
      const normJobSkill = normalizeSkillName(jobSkill);
      let matchFound = candidateSkillMap.get(normJobSkill);

      // Flexible partial check if exact normalized match not found
      if (!matchFound) {
        for (const [candNorm, candData] of candidateSkillMap.entries()) {
          if (candNorm.includes(normJobSkill) || normJobSkill.includes(candNorm)) {
            matchFound = candData;
            break;
          }
        }
      }

      if (matchFound) {
        matchedSkills.push(jobSkill);
        let proficiencyFactor = Math.max(0.6, matchFound.score / 100);
        if (matchFound.verified) proficiencyFactor = Math.min(1.0, proficiencyFactor * 1.25);
        techRawPoints += pointsPerSkill * proficiencyFactor;
      } else {
        missingSkills.push(jobSkill);
      }
    });
  } else {
    techRawPoints = 32; // Default fallback if job specifies no skill array
  }
  const techScore = Math.min(40, Math.round(techRawPoints * 10) / 10);
  const techPercentage = allJobSkills.length > 0
    ? Math.round((matchedSkills.length / allJobSkills.length) * 100)
    : 80;

  // 2. Academic Performance / Education (Max 20 points)
  const minCgpa = job.minCgpa || 0;
  const studentCgpa = student.cgpa || 0;
  const isCgpaEligible = studentCgpa >= minCgpa;

  let academicScore = Math.min(20, Math.round((studentCgpa / 10) * 20 * 10) / 10);
  if (!isCgpaEligible && minCgpa > 0) {
    academicScore = Math.max(0, academicScore - 6);
  }
  const academicPercentage = studentCgpa > 0 ? Math.round((studentCgpa / 10) * 100) : 70;

  // 3. Assessment Performance (Max 15 points)
  const verifiedList = Array.from(candidateSkillMap.values()).filter((s) => s.verified);
  let avgAssessmentScore = 0;
  if (verifiedList.length > 0) {
    const total = verifiedList.reduce((acc, s) => acc + s.score, 0);
    avgAssessmentScore = total / verifiedList.length;
  } else if (candidateSkillMap.size > 0) {
    const total = Array.from(candidateSkillMap.values()).reduce((acc, s) => acc + s.score, 0);
    avgAssessmentScore = (total / candidateSkillMap.size) * 0.85;
  } else {
    avgAssessmentScore = 65;
  }
  const assessmentScore = Math.min(15, Math.round((avgAssessmentScore / 100) * 15 * 10) / 10);
  const assessmentPercentage = Math.round(avgAssessmentScore);

  // 4. Technical Projects (Max 10 points)
  const projectCount = student.projects ? student.projects.length : 0;
  let projectScore = 0;
  if (projectCount >= 2) projectScore = 10;
  else if (projectCount === 1) projectScore = 7;
  else projectScore = 3;
  const projectsPercentage = Math.round((projectScore / 10) * 100);

  // 5. Certifications (Max 5 points)
  const certCount = student.certificates ? student.certificates.length : 0;
  const certScore = certCount >= 2 ? 5 : certCount === 1 ? 3 : 1;
  const certPercentage = Math.round((certScore / 5) * 100);

  // 6. Experience / Internships (Max 5 points)
  const internshipCount = student.internships ? student.internships.length : 0;
  const expScore = internshipCount >= 2 ? 5 : internshipCount === 1 ? 3 : 1;
  const expPercentage = Math.round((expScore / 5) * 100);

  // 7. Soft Skills (Max 5 points)
  const softCount = student.softSkills ? student.softSkills.length : 0;
  const softScore = softCount >= 2 ? 5 : softCount === 1 ? 3 : 2;
  const softPercentage = Math.round((softScore / 5) * 100);

  // Final Composite Score (0 - 100)
  const totalMatchScore = Math.min(
    100,
    Math.round(techScore + academicScore + assessmentScore + projectScore + certScore + expScore + softScore)
  );

  const candidateName = candidateUserObj?.name || (student.user as any)?.name || 'Student Candidate';
  const email = candidateUserObj?.email || (student.user as any)?.email || '';

  // Generate Explainable Summary Text
  let summary = '';
  if (matchedSkills.length > 0) {
    summary = `Your ${matchedSkills.slice(0, 3).join(', ')} skills strongly match the job requirements.`;
  } else {
    summary = `Matching calculated based on academic profile, CGPA (${studentCgpa}/10), and technical project readiness.`;
  }
  if (missingSkills.length > 0) {
    summary += ` Acquire ${missingSkills.slice(0, 2).join(' and ')} to further boost compatibility.`;
  }

  return {
    studentId: student._id.toString(),
    userId: student.user?._id ? student.user._id.toString() : student.user ? student.user.toString() : student._id.toString(),
    candidateName,
    email,
    college: student.college || 'N/A',
    degree: student.degree || 'N/A',
    branch: student.branch || 'N/A',
    cgpa: studentCgpa,
    matchScore: totalMatchScore,
    matchedSkills,
    missingSkills,
    breakdown: {
      technicalSkills: {
        score: techScore,
        maxScore: 40,
        percentage: techPercentage,
        matchedSkills,
        missingSkills,
      },
      academicPerformance: {
        score: academicScore,
        maxScore: 20,
        percentage: academicPercentage,
        cgpa: studentCgpa,
        minCgpaRequired: minCgpa,
        isEligible: isCgpaEligible,
      },
      assessmentScore: {
        score: assessmentScore,
        maxScore: 15,
        percentage: assessmentPercentage,
        averageScore: Math.round(avgAssessmentScore),
      },
      projects: {
        score: projectScore,
        maxScore: 10,
        percentage: projectsPercentage,
        projectCount,
      },
      certifications: {
        score: certScore,
        maxScore: 5,
        percentage: certPercentage,
        count: certCount,
      },
      experience: {
        score: expScore,
        maxScore: 5,
        percentage: expPercentage,
        internshipCount,
      },
      softSkills: {
        score: softScore,
        maxScore: 5,
        percentage: softPercentage,
        count: softCount,
      },
    },
    summary,
  };
};

