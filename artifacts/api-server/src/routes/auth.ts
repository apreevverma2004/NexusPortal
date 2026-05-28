import { Router, type IRouter } from "express";

const router: IRouter = Router();

interface AppUser {
  id: number;
  userId: string;
  password: string;
  role: string;
  name: string;
  email: string;
  department: string;
  createdAt: string;
  status: "active" | "inactive";
}

export const usersStore = new Map<string, AppUser>([
  [
    "admin",
    {
      id: 1,
      userId: "admin",
      password: "admin123",
      role: "Admin",
      name: "System Administrator",
      email: "admin@portal.dev",
      department: "IT Operations",
      createdAt: "2024-01-01",
      status: "active",
    },
  ],
  [
    "alice",
    {
      id: 2,
      userId: "alice",
      password: "user123",
      role: "General User",
      name: "Alice Johnson",
      email: "alice@portal.dev",
      department: "Marketing",
      createdAt: "2024-02-15",
      status: "active",
    },
  ],
  [
    "bob",
    {
      id: 3,
      userId: "bob",
      password: "user123",
      role: "General User",
      name: "Bob Smith",
      email: "bob@portal.dev",
      department: "Engineering",
      createdAt: "2024-03-20",
      status: "active",
    },
  ],
  [
    "carol",
    {
      id: 4,
      userId: "carol",
      password: "user123",
      role: "General User",
      name: "Carol Davis",
      email: "carol@portal.dev",
      department: "Finance",
      createdAt: "2024-04-10",
      status: "active",
    },
  ],
  [
    "dave",
    {
      id: 5,
      userId: "dave",
      password: "user123",
      role: "General User",
      name: "Dave Wilson",
      email: "dave@portal.dev",
      department: "Human Resources",
      createdAt: "2024-05-05",
      status: "inactive",
    },
  ],
]);

export const sessions = new Map<string, string>();

function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function getUserPublic(user: AppUser) {
  return {
    id: user.id,
    userId: user.userId,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    createdAt: user.createdAt,
    status: user.status,
  };
}

router.post("/auth/login", async (req, res): Promise<void> => {
  const { userId, password, role } = req.body as {
    userId?: string;
    password?: string;
    role?: string;
  };

  if (!userId || !password || !role) {
    res.status(400).json({ error: "userId, password, and role are required" });
    return;
  }

  const user = usersStore.get(userId.toLowerCase());

  if (!user || user.password !== password) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (user.role !== role) {
    res
      .status(403)
      .json({
        error: `This account does not have the "${role}" role. Your role is "${user.role}".`,
      });
    return;
  }

  if (user.status === "inactive") {
    res
      .status(403)
      .json({ error: "This account has been deactivated. Contact admin." });
    return;
  }

  const token = generateToken();
  sessions.set(token, user.userId);

  req.log.info({ userId: user.userId, role: user.role }, "User logged in");

  res.json({
    token,
    user: getUserPublic(user),
  });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    const userId = sessions.get(token);
    sessions.delete(token);
    req.log.info({ userId }, "User logged out");
  }
  res.json({ message: "Logged out successfully" });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token || !sessions.has(token)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = sessions.get(token)!;
  const user = usersStore.get(userId);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(getUserPublic(user));
});

export default router;
