import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  const hashedPassword = `${buf.toString("hex")}.${salt}`;
  console.log("Generated hashed password:", {
    salt,
    hash: buf.toString("hex"),
    fullHash: hashedPassword
  });
  return hashedPassword;
}

async function comparePasswords(supplied: string, stored: string) {
  // Verify the stored password has the correct format
  if (!stored || !stored.includes(".")) {
    console.log("Invalid password format:", { stored });
    return false;
  }

  try {
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      console.log("Missing hash or salt:", { hashed, salt });
      return false;
    }

    console.log("Comparing passwords:", {
      storedHash: hashed,
      salt,
      supplied: supplied
    });

    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;

    console.log("Generated supplied hash:", suppliedBuf.toString("hex"));

    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log("Attempting login for username:", username);
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log("User not found");
          return done(null, false);
        }

        console.log("Found user:", {
          username: user.username,
          storedPassword: user.password,
          isAdmin: user.isAdmin,
          isSuperAdmin: user.isSuperAdmin
        });

        const isValid = await comparePasswords(password, user.password);
        console.log("Password validation result:", isValid);

        if (!isValid) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        console.error("Login error:", error);
        return done(error);
      }
    }),
  );

  // Serialización más robusta
  passport.serializeUser((user: Express.User, done) => {
    console.log("Serializing user:", { id: user.id, username: user.username });
    done(null, user.id);
  });

  // Deserialización más robusta con manejo de errores
  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log("Deserializing user with id:", id);
      const user = await storage.getUser(id);
      if (!user) {
        console.log("User not found during deserialization");
        return done(new Error("User not found"));
      }
      console.log("Successfully deserialized user:", { id: user.id, username: user.username });
      done(null, user);
    } catch (error) {
      console.error("Error during deserialization:", error);
      done(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: SelectUser | false) => {
      if (err) {
        console.error("Authentication error:", err);
        return next(err);
      }
      if (!user) {
        console.log("Authentication failed: Invalid credentials");
        return res.status(401).send("Invalid username or password");
      }

      req.login(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return next(err);
        }

        // Forzar guardado de la sesión
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return next(err);
          }
          console.log("User logged in successfully:", { id: user.id, username: user.username });
          res.json(user);
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    const userId = req.user?.id;
    console.log("Attempting to logout user:", userId);

    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return next(err);
      }
      console.log("User logged out successfully:", userId);
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return next(err);
        }
        res.clearCookie('connect.sid');
        res.sendStatus(200);
      });
    });
  });

  app.get("/api/setup-admin", async (_req, res) => {
    try {
      const existingAdmin = await storage.getUserByUsername("soybassito");
      if (!existingAdmin) {
        const hashedPassword = await hashPassword("Nahuel@532");
        console.log("Creating admin user with hashed password:", hashedPassword);
        await storage.createUserWithRole(
          { 
            username: "soybassito", 
            password: hashedPassword 
          },
          true,  // isAdmin
          true   // isSuperAdmin
        );
        res.json({ message: "Admin user created successfully" });
      } else {
        console.log("Existing admin found:", {
          username: existingAdmin.username,
          isAdmin: existingAdmin.isAdmin,
          isSuperAdmin: existingAdmin.isSuperAdmin
        });
        res.json({ message: "Admin user already exists" });
      }
    } catch (error) {
      console.error("Error in setup-admin:", error);
      res.status(500).json({ message: "Error creating admin user" });
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        username: req.body.username,
        password: hashedPassword,
        isAdmin: false,
        isSuperAdmin: false
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Unauthenticated request to /api/user");
      return res.sendStatus(401);
    }
    console.log("Authenticated user request:", { id: req.user.id, username: req.user.username });
    res.json(req.user);
  });
}