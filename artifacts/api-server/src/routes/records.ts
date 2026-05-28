import { Router, type IRouter } from "express";
import { sessions, usersStore } from "./auth.js";

const router: IRouter = Router();

interface Record {
  id: number;
  title: string;
  category: string;
  status: "pending" | "in-progress" | "completed" | "rejected";
  priority: "low" | "medium" | "high" | "critical";
  owner: string;
  department: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  accessLevel: "public" | "restricted" | "confidential";
}

const allRecords: Record[] = [
  {
    id: 1,
    title: "Q1 Marketing Campaign Review",
    category: "Marketing",
    status: "completed",
    priority: "high",
    owner: "alice",
    department: "Marketing",
    createdAt: "2024-03-01",
    updatedAt: "2024-03-15",
    description: "Review and analysis of Q1 marketing performance metrics.",
    accessLevel: "public",
  },
  {
    id: 2,
    title: "Platform Architecture Upgrade",
    category: "Engineering",
    status: "in-progress",
    priority: "critical",
    owner: "bob",
    department: "Engineering",
    createdAt: "2024-03-10",
    updatedAt: "2024-05-20",
    description: "Migrating backend services to microservices architecture.",
    accessLevel: "restricted",
  },
  {
    id: 3,
    title: "Annual Budget Reconciliation",
    category: "Finance",
    status: "pending",
    priority: "high",
    owner: "carol",
    department: "Finance",
    createdAt: "2024-04-01",
    updatedAt: "2024-05-28",
    description: "End-of-year financial audit and budget reconciliation report.",
    accessLevel: "confidential",
  },
  {
    id: 4,
    title: "Employee Onboarding Workflow Update",
    category: "HR",
    status: "in-progress",
    priority: "medium",
    owner: "dave",
    department: "Human Resources",
    createdAt: "2024-04-15",
    updatedAt: "2024-05-10",
    description:
      "Updating the onboarding process for new hires starting Q3 2024.",
    accessLevel: "restricted",
  },
  {
    id: 5,
    title: "Security Vulnerability Assessment",
    category: "IT Security",
    status: "completed",
    priority: "critical",
    owner: "admin",
    department: "IT Operations",
    createdAt: "2024-02-01",
    updatedAt: "2024-02-28",
    description:
      "Comprehensive security audit of all production systems and networks.",
    accessLevel: "confidential",
  },
  {
    id: 6,
    title: "Social Media Strategy 2024",
    category: "Marketing",
    status: "in-progress",
    priority: "medium",
    owner: "alice",
    department: "Marketing",
    createdAt: "2024-05-01",
    updatedAt: "2024-05-25",
    description:
      "Developing a comprehensive social media strategy for the remainder of 2024.",
    accessLevel: "public",
  },
  {
    id: 7,
    title: "API Rate Limiting Implementation",
    category: "Engineering",
    status: "completed",
    priority: "high",
    owner: "bob",
    department: "Engineering",
    createdAt: "2024-04-20",
    updatedAt: "2024-05-05",
    description: "Implementing rate limiting and throttling for public APIs.",
    accessLevel: "restricted",
  },
  {
    id: 8,
    title: "Vendor Contract Renewals",
    category: "Finance",
    status: "pending",
    priority: "medium",
    owner: "carol",
    department: "Finance",
    createdAt: "2024-05-10",
    updatedAt: "2024-05-10",
    description: "Review and renewal of Q3 vendor contracts and SLAs.",
    accessLevel: "confidential",
  },
  {
    id: 9,
    title: "Performance Review Cycle",
    category: "HR",
    status: "pending",
    priority: "high",
    owner: "dave",
    department: "Human Resources",
    createdAt: "2024-05-15",
    updatedAt: "2024-05-15",
    description:
      "Mid-year performance evaluations for all departments Q2 2024.",
    accessLevel: "restricted",
  },
  {
    id: 10,
    title: "Infrastructure Cost Optimization",
    category: "IT Operations",
    status: "in-progress",
    priority: "high",
    owner: "admin",
    department: "IT Operations",
    createdAt: "2024-03-20",
    updatedAt: "2024-05-28",
    description:
      "Analysis and optimization of cloud infrastructure spend across all environments.",
    accessLevel: "confidential",
  },
  {
    id: 11,
    title: "Brand Refresh Design System",
    category: "Marketing",
    status: "rejected",
    priority: "low",
    owner: "alice",
    department: "Marketing",
    createdAt: "2024-01-15",
    updatedAt: "2024-02-01",
    description: "Proposal for updating brand identity and design tokens.",
    accessLevel: "public",
  },
  {
    id: 12,
    title: "CI/CD Pipeline Automation",
    category: "Engineering",
    status: "completed",
    priority: "medium",
    owner: "bob",
    department: "Engineering",
    createdAt: "2024-02-10",
    updatedAt: "2024-03-01",
    description: "Full automation of build, test and deployment pipelines.",
    accessLevel: "restricted",
  },
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

router.get("/records", async (req, res): Promise<void> => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token || !sessions.has(token)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const rawDelay = req.query["delay"];
  const delay = typeof rawDelay === "string" ? parseInt(rawDelay, 10) : 0;
  const safeDelay = !isNaN(delay) && delay > 0 ? Math.min(delay, 10000) : 0;

  if (safeDelay > 0) {
    req.log.info({ delay: safeDelay }, "Simulating API delay");
    await sleep(safeDelay);
  }

  const userId = sessions.get(token)!;
  const user = usersStore.get(userId);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const records =
    user.role === "Admin"
      ? allRecords
      : allRecords.filter((r) => r.owner === user.userId);

  res.json({
    records,
    total: records.length,
    userRole: user.role,
    delayApplied: safeDelay,
  });
});

export default router;
