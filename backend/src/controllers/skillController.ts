import { Request, Response } from 'express';
import { Skill } from '../models/Skill';
import { ApiResponse } from '../utils/ApiResponse';

export const getSkills = async (req: Request, res: Response) => {
  const { category } = req.query;
  const filter = category ? { category: category as string } : {};

  const skills = await Skill.find(filter).sort({ industryDemand: -1, name: 1 });
  return res.status(200).json(ApiResponse.success('Skills retrieved successfully', skills));
};

export const seedSkills = async (req: Request, res: Response) => {
  const defaultSkills = [
    { name: 'Java', category: 'Programming', description: 'Core Java, OOP, JVM', industryDemand: 88 },
    { name: 'Python', category: 'Programming', description: 'Data Science, Backend, Automation', industryDemand: 92 },
    { name: 'C++', category: 'Programming', description: 'High Performance, Systems', industryDemand: 75 },
    { name: 'JavaScript', category: 'Web Development', description: 'ES6+, Full-stack JS', industryDemand: 95 },
    { name: 'TypeScript', category: 'Web Development', description: 'Type-safe JS development', industryDemand: 90 },
    { name: 'React', category: 'Web Development', description: 'Component-based UI Library', industryDemand: 94 },
    { name: 'Node.js', category: 'Web Development', description: 'Event-driven JS backend', industryDemand: 89 },
    { name: 'Spring Boot', category: 'Web Development', description: 'Enterprise Java Framework', industryDemand: 82 },
    { name: 'SQL', category: 'Database', description: 'Relational Database Queries & Schema Design', industryDemand: 91 },
    { name: 'MongoDB', category: 'Database', description: 'NoSQL Document Database', industryDemand: 84 },
    { name: 'PostgreSQL', category: 'Database', description: 'Advanced Relational Database', industryDemand: 88 },
    { name: 'Docker', category: 'DevOps', description: 'Containerization Engine', industryDemand: 87 },
    { name: 'Kubernetes', category: 'DevOps', description: 'Container Orchestration Platform', industryDemand: 85 },
    { name: 'AWS', category: 'Cloud', description: 'Amazon Web Services Cloud Infrastructure', industryDemand: 93 },
    { name: 'GCP', category: 'Cloud', description: 'Google Cloud Platform', industryDemand: 80 },
    { name: 'Data Structures & Algorithms', category: 'Programming', description: 'Problem Solving, Time/Space Complexity', industryDemand: 96 },
    { name: 'System Design', category: 'Web Development', description: 'Distributed Systems & Scalability', industryDemand: 94 },
    { name: 'Machine Learning', category: 'AI/ML', description: 'Scikit-learn, Model Evaluation, Regression', industryDemand: 89 },
    { name: 'Deep Learning', category: 'AI/ML', description: 'Neural Networks, PyTorch, TensorFlow', industryDemand: 85 },
    { name: 'Cybersecurity', category: 'Cybersecurity', description: 'Network Security, OWASP, Vulnerability Audit', industryDemand: 83 },
    { name: 'Flutter', category: 'Mobile Development', description: 'Cross-platform Mobile Framework', industryDemand: 78 },
    { name: 'Communication', category: 'Soft Skills', description: 'Verbal & Written Articulation', industryDemand: 95 },
    { name: 'Problem Solving', category: 'Soft Skills', description: 'Analytical Thinking & Root Cause Analysis', industryDemand: 98 },
    { name: 'Teamwork', category: 'Soft Skills', description: 'Cross-functional Collaboration', industryDemand: 90 },
  ];

  for (const s of defaultSkills) {
    await Skill.findOneAndUpdate({ name: s.name }, s, { upsert: true, new: true });
  }

  const allSkills = await Skill.find().sort({ category: 1, name: 1 });
  return res.status(200).json(ApiResponse.success('Skill taxonomy successfully seeded', allSkills));
};
