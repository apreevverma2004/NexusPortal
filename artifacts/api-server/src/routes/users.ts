import { Router, type IRouter } from "express";
import { sessions, usersStore } from "./auth.js";

const router: IRouter = Router();

let nextId = 6;

function requireAdmin(
  req: import("express").Request,
  res: import("express").Response
): boolean {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token || !sessions.has(token)) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }

  const userId = sessions.get(token)!;
  const user = usersStore.get(userId);

  if (!user || user.role !== "Admin") {
    res.status(403).json({ error: "Admin access required" });
    return false;
  }

  return true;
}

router.get("/admin/users", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const users = Array.from(usersStore.values()).map((u) => ({
    id: u.id,
    userId: u.userId,
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department,
    createdAt: u.createdAt,
    status: u.status,
  }));

  res.json({ users, total: users.length });
});

router.post("/admin/users", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const { userId, password, name, email, role, department, status } =
    req.body as {
      userId?: string;
      password?: string;
      name?: string;
      email?: string;
      role?: string;
      department?: string;
      status?: string;
    };

  if (!userId || !password || !name || !email || !role || !department) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  if (usersStore.has(userId.toLowerCase())) {
    res.status(409).json({ error: "User ID already exists" });
    return;
  }

  const newUser = {
    id: nextId++,
    userId: userId.toLowerCase(),
    password,
    name,
    email,
    role,
    department,
    createdAt: new Date().toISOString().split("T")[0] as string,
    status: (status as "active" | "inactive") ?? "active",
  };

  usersStore.set(newUser.userId, newUser);

  req.log.info({ userId: newUser.userId }, "Admin created user");

  res.status(201).json({
    id: newUser.id,
    userId: newUser.userId,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    department: newUser.department,
    createdAt: newUser.createdAt,
    status: newUser.status,
  });
});

router.put("/admin/users/:userId", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const rawUserId = Array.isArray(req.params["userId"])
    ? req.params["userId"][0]
    : req.params["userId"];

  if (!rawUserId) {
    res.status(400).json({ error: "userId param required" });
    return;
  }

  const user = usersStore.get(rawUserId.toLowerCase());
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const { name, email, role, department, password, status } = req.body as {
    name?: string;
    email?: string;
    role?: string;
    department?: string;
    password?: string;
    status?: string;
  };

  const updated = {
    ...user,
    ...(name != null && { name }),
    ...(email != null && { email }),
    ...(role != null && { role }),
    ...(department != null && { department }),
    ...(password != null && { password }),
    ...(status != null && { status: status as "active" | "inactive" }),
  };

  usersStore.set(rawUserId.toLowerCase(), updated);

  req.log.info({ userId: rawUserId }, "Admin updated user");

  res.json({
    id: updated.id,
    userId: updated.userId,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    department: updated.department,
    createdAt: updated.createdAt,
    status: updated.status,
  });
});

router.delete("/admin/users/:userId", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const rawUserId = Array.isArray(req.params["userId"])
    ? req.params["userId"][0]
    : req.params["userId"];

  if (!rawUserId) {
    res.status(400).json({ error: "userId param required" });
    return;
  }

  if (rawUserId.toLowerCase() === "admin") {
    res.status(403).json({ error: "Cannot delete the admin account" });
    return;
  }

  const user = usersStore.get(rawUserId.toLowerCase());
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  usersStore.delete(rawUserId.toLowerCase());
  req.log.info({ userId: rawUserId }, "Admin deleted user");

  res.sendStatus(204);
});

export default router;
