import express from "express";
import Stripe from 'stripe';
import { PrismaClient } from "@prisma/client";
import { query, pool } from "./lib/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { uploadToStorage } from "./lib/storage.js";

const prisma = new PrismaClient();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwt";

// Handle memory storage for Multer
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });


import { sendEmail } from "./email.js";

async function sendAutomatedEmail(userId: string, type: 'COURSE_PURCHASE' | 'MEMBERSHIP_PURCHASE' | 'EVENT_BOOKING' | 'USER_UPDATE', data: Record<string, string>) {
  try {
     let template = await prisma.emailTemplate.findUnique({ where: { type } });
     if (!template) {
        console.warn(`[Email System] No template found for ${type}, using default.`);
        
        let defaultSubject = "Thank You!";
        let defaultContent = "Hi {{name}},\n\nThank you for your purchase!\n\nDetails:\n{{price}}\n{{date}}";
        
        if (type === 'COURSE_PURCHASE') {
          defaultSubject = "Thank you for enrolling in {{course_name}}!";
          defaultContent = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background-color: #371C3B; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
    <h2 style="color: #ffffff; margin: 0;">Thank you for your purchase!</h2>
  </div>
  <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hi <strong>{{name}}</strong>,</p>
    <p>Thank you for enrolling in <strong>{{course_name}}</strong>! We are excited to have you.</p>
    <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0;"><strong>Order Details:</strong></p>
      <p style="margin: 5px 0;">Amount Paid: <strong>{{price}}</strong></p>
      <p style="margin: 5px 0;">Date: <strong>{{date}}</strong></p>
    </div>
    <p>Enjoy your course and happy learning!</p>
  </div>
</div>`;
        } else if (type === 'MEMBERSHIP_PURCHASE') {
          defaultSubject = "Welcome to {{membership_name}}!";
          defaultContent = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background-color: #371C3B; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
    <h2 style="color: #ffffff; margin: 0;">Welcome to the Club!</h2>
  </div>
  <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hi <strong>{{name}}</strong>,</p>
    <p>Thank you for purchasing the <strong>{{membership_name}}</strong> membership! We are thrilled to have you on board.</p>
    <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0;"><strong>Membership Details:</strong></p>
      <p style="margin: 5px 0;">Amount Paid: <strong>{{price}}</strong></p>
      <p style="margin: 5px 0;">Date: <strong>{{date}}</strong></p>
    </div>
    <p>You can now access all your benefits inside your dashboard.</p>
  </div>
</div>`;
        } else if (type === 'EVENT_BOOKING') {
          defaultSubject = "Booking Confirmation: {{event_name}}";
          defaultContent = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background-color: #371C3B; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
    <h2 style="color: #ffffff; margin: 0;">Booking Confirmation</h2>
  </div>
  <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hi <strong>{{name}}</strong>,</p>
    <p>Thank you for booking <strong>{{event_name}}</strong>!</p>
    <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0;"><strong>Booking Details:</strong></p>
      <p style="margin: 5px 0;">Amount Paid: <strong>{{price}}</strong></p>
      <p style="margin: 5px 0;">Date: <strong>{{date}}</strong></p>
    </div>
    <p>Looking forward to seeing you there.</p>
  </div>
</div>`;
        }

        template = {
          id: 'default',
          type,
          subject: defaultSubject,
          content: defaultContent,
          createdAt: new Date(),
          updatedAt: new Date()
        };
     }
     
     let content = template.content;
     let subject = template.subject;
     
     const user = await prisma.user.findUnique({ where: { id: userId } });
     if(user) {
        content = content.replace(/\{\{name\}\}/g, user.name);
        subject = subject.replace(/\{\{name\}\}/g, user.name);
     }

     // Simple replacement
     for (const [key, val] of Object.entries(data)) {
        content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(val));
        subject = subject.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(val));
     }
     
     console.log(`[Email System] Sending automated email to ${user?.email}: ${subject}`);
     
     if (user?.email) {
       await sendEmail(user.email, subject, content);
     }
     
     await prisma.emailLog.create({
        data: {
           userId,
           status: 'SENT' // Could refine
        }
     });
  } catch(e) {
     console.error("[Email System] Error:", e);
  }
}

// MIDDLEWARE
export const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  let token = "";
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.query.token) {
    token = String(req.query.token);
  } else {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string };
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// --- AUTHENTICATION ---
router.post("/auth/register", async (req, res) => {
  try {
    const { email, name, password, phone } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "Email already in use" });

    const existingCount = await prisma.user.count();
    const role = existingCount === 0 ? "ADMIN" : "USER";

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, phone, passwordHash, role }
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (error) {
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (error) {
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't leak whether user exists or not
      return res.json({ success: true });
    }

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);

    await prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiry: expiry }
    });

    const resetLink = `${req.headers.origin || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    // Look up email template
    const template = await prisma.emailTemplate.findUnique({ where: { type: 'FORGOT_PASSWORD' } });
    
    if (template) {
       // Support both {{userName}} and {{name}} for backward compatibility
       const content = template.content.replace(/\{\{resetLink\}\}/g, resetLink).replace(/\{\{userName\}\}/g, user.name).replace(/\{\{name\}\}/g, user.name);
       await sendEmail(user.email, template.subject, content);
    } else {
       await sendEmail(user.email, "Password Reset Request", `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background-color: #371C3B; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
    <h2 style="color: #ffffff; margin: 0;">Password Reset Request</h2>
  </div>
  <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hi <strong>${user.name}</strong>,</p>
    <p>We received a request to reset your password. Click the button below to set a new password:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" style="background-color: #371C3B; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
    </div>
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #371C3B;"><a href="${resetLink}">${resetLink}</a></p>
    <p style="margin-top: 30px; font-size: 13px; color: #6b7280;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
  </div>
</div>`);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/auth/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal error" });
  }
});

// --- GET CURRENT USER ---
router.get("/auth/me", authMiddleware, async (req, res) => {
  const userId = (req as any).user.userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, phone: true }
  });
  res.json(user);
});

// --- FILE UPLOAD ---
router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'STORAGE_PROVIDERS_CONFIG' } });
    const configStr = setting?.value || "{}";
    let config = JSON.parse(configStr);

    const url = await uploadToStorage(req.file, config);
    res.json({ url });
  } catch (err: any) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});

// --- OAUTH ---
router.get("/auth/:provider/url", async (req, res) => {
  const { provider } = req.params;
  const redirectUri = req.query.redirectUri as string;
  
  const setting = await prisma.setting.findUnique({ where: { key: 'SOCIAL_LOGIN_CONFIG' } });
  if (!setting) return res.status(400).json({ error: "Social login not configured" });
  
  const config = JSON.parse(setting.value);
  
  if (provider === "google") {
    if (!config.googleEnabled || !config.googleClientId) return res.status(400).json({ error: "Google login not enabled via admin panel." });
    
    const params = new URLSearchParams({
      client_id: config.googleClientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'email profile',
      access_type: 'offline',
      prompt: 'consent'
    });
    res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
  } else if (provider === "facebook") {
    if (!config.facebookEnabled || !config.facebookAppId) return res.status(400).json({ error: "Facebook login not enabled via admin panel." });
    
    const params = new URLSearchParams({
      client_id: config.facebookAppId,
      redirect_uri: redirectUri,
      scope: 'email,public_profile'
    });
    res.json({ url: `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}` });
  } else {
    res.status(400).json({ error: "Unknown provider" });
  }
});

router.post("/auth/:provider/callback", async (req, res) => {
  const { provider } = req.params;
  const { code, redirectUri } = req.body;
  
  const setting = await prisma.setting.findUnique({ where: { key: 'SOCIAL_LOGIN_CONFIG' } });
  if (!setting) return res.status(400).json({ error: "Social login not configured" });
  
  const config = JSON.parse(setting.value);
  
  let userInfo: { id: string, name: string, email: string } | null = null;

  try {
    if (provider === "google") {
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: config.googleClientId,
          client_secret: config.googleClientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri
        }).toString()
      });
      
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) throw new Error(tokenData.error_description || "Failed to exchange google token");
      
      const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const userData = await userRes.json();
      if (!userRes.ok) throw new Error("Failed to fetch google user info");
      
      userInfo = {
        id: userData.id,
        name: userData.name || "Google User",
        email: userData.email,
      };
      
    } else if (provider === "facebook") {
      const tokenRes = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${config.facebookAppId}&redirect_uri=${redirectUri}&client_secret=${config.facebookAppSecret}&code=${code}`);
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) throw new Error(tokenData.error?.message || "Failed to exchange facebook token");
      
      const userRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${tokenData.access_token}`);
      const userData = await userRes.json();
      if (!userRes.ok) throw new Error("Failed to fetch facebook user info");
      
      userInfo = {
        id: userData.id,
        name: userData.name || "Facebook User",
        email: userData.email,
      };
    }

    if (!userInfo || !userInfo.email) {
      return res.status(400).json({ error: "Failed to access user email from provider" });
    }

    let user = await prisma.user.findUnique({ where: { email: userInfo.email } });
    if (!user) {
      const existingCount = await prisma.user.count();
      const role = existingCount === 0 ? "ADMIN" : "USER";
      const randomPassword = Math.random().toString(36).slice(-8);
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      user = await prisma.user.create({
        data: { 
          email: userInfo.email, 
          name: userInfo.name, 
          passwordHash,
          role
        }
      });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone || "" } });

  } catch (error: any) {
    console.error(`OAuth error for ${provider}:`, error.message);
    res.status(500).json({ error: error.message || "Authentication failed" });
  }
});

// --- COURSES ---
router.get("/courses", async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        instructor: true,
        category: true,
        lessons: { include: { translations: true }, orderBy: { order: 'asc' } },
        translations: true,
        editions: { include: { translations: true }, orderBy: { date: 'asc' } },
        memberships: true
      }
    });
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

router.get("/courses/active", async (req, res) => {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    include: {
      instructor: true,
      category: true,
      lessons: { include: { translations: true }, orderBy: { order: 'asc' } },
      translations: true,
      editions: { include: { translations: true }, orderBy: { date: 'asc' } },
      memberships: true
    }
  });
  res.json(courses);
});

router.get("/courses/:id", async (req, res) => {
  const course = await prisma.course.findUnique({
    where: { id: req.params.id },
    include: {
      instructor: true,
      category: true,
      memberships: {
        include: { contents: true }
      },
      lessons: {
        include: { translations: true },
        orderBy: { order: 'asc' }
      },
      translations: true,
      editions: { include: { translations: true }, orderBy: { date: 'asc' } }
    }
  });
  res.json(course);
});

// --- MEMBERSHIPS ---
router.get("/memberships", async (req, res) => {
  const memberships = await prisma.membership.findMany({
    include: { contents: true, editions: true, category: true }
  });
  res.json(memberships);
});

router.get("/memberships/:id", async (req, res) => {
  const membership = await prisma.membership.findUnique({
    where: { id: req.params.id },
    include: { contents: true, editions: true, category: true }
  });
  if (!membership) return res.status(404).json({ error: "Not found" });
  res.json(membership);
});

// --- EVENTS (SEAT BOOKING) ---
router.get("/events", async (req, res) => {
  const events = await prisma.event.findMany({
    where: {
      OR: [
        { expiryDate: null },
        { expiryDate: { gt: new Date() } }
      ]
    },
    orderBy: { date: 'asc' },
    include: { translations: true }
  });
  res.json(events);
});

router.get("/events/:id", async (req, res) => {
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: { translations: true }
  });
  if (!event) return res.status(404).json({ error: "Not found" });
  res.json(event);
});

router.post("/admin/events", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  const { title, description, date, endDate, expiryDate, totalSeats, availableSeats, price, realPrice, location, imageUrl, translations, meetingLink, meetingDate, meetingNotes } = req.body;
  const event = await prisma.event.create({
    data: {
      title, description, date: new Date(date), 
      endDate: endDate ? new Date(endDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      totalSeats: totalSeats ? parseInt(totalSeats) : 0,
      availableSeats: availableSeats !== undefined ? parseInt(availableSeats) : (totalSeats ? parseInt(totalSeats) : 0), price: parseFloat(price), 
      realPrice: realPrice !== undefined && realPrice !== null ? parseFloat(realPrice) : null, 
      location, imageUrl,
      meetingLink, meetingDate: meetingDate ? new Date(meetingDate) : null, meetingNotes
    }
  });

  if (translations && translations.length) {
    await prisma.eventTranslation.createMany({
      data: translations.map((t: any) => ({ ...t, eventId: event.id }))
    });
  }
  
  res.json(event);
});

router.put("/admin/events/:id", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  const { title, description, date, endDate, expiryDate, totalSeats, availableSeats, price, realPrice, location, imageUrl, translations, meetingLink, meetingDate, meetingNotes } = req.body;
  const event = await prisma.event.update({
    where: { id: req.params.id },
    data: {
      title, description, date: new Date(date), 
      endDate: endDate ? new Date(endDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      totalSeats: totalSeats ? parseInt(totalSeats) : 0,
      availableSeats: availableSeats !== undefined ? parseInt(availableSeats) : undefined,
      price: parseFloat(price), 
      realPrice: realPrice !== undefined && realPrice !== null ? parseFloat(realPrice) : null,
      location, imageUrl,
      meetingLink, meetingDate: meetingDate ? new Date(meetingDate) : null, meetingNotes
    }
  });

  if (translations !== undefined) {
    await prisma.eventTranslation.deleteMany({ where: { eventId: event.id } });
    if (translations.length) {
      await prisma.eventTranslation.createMany({
        data: translations.map((t: any) => ({ ...t, eventId: event.id }))
      });
    }
  }

  res.json(event);
});

router.delete("/admin/events/:id", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  await prisma.event.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// --- TESTIMONIALS ---
router.get("/testimonials", async (req, res) => {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { createdAt: 'desc' }
  });
  res.json(testimonials);
});

router.post("/admin/testimonials", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  const { name, role, text, image } = req.body;
  const t = await prisma.testimonial.create({
    data: { name, role, text, image }
  });
  res.json(t);
});

router.put("/admin/testimonials/:id", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  const { name, role, text, image } = req.body;
  const t = await prisma.testimonial.update({
    where: { id: req.params.id },
    data: { name, role, text, image }
  });
  res.json(t);
});

router.delete("/admin/testimonials/:id", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  await prisma.testimonial.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

import { google } from "googleapis";

// --- EXTERNAL INTEGRATIONS ---
router.post("/admin/generate-meet", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  
  const { summary, description, startDateTime, endDateTime } = req.body;

   try {
     const setting = await prisma.setting.findUnique({ where: { key: 'GOOGLE_MEET_CONFIG' } });
     let credentialsStr = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
     let calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
     let credentialsObj: any = null;

     if (credentialsStr) {
       try { credentialsObj = JSON.parse(credentialsStr); } catch (e) {}
     }
     
     if (setting) {
       const dbConfig = JSON.parse(setting.value);
       if (dbConfig.clientEmail && dbConfig.privateKey) {
          credentialsObj = {
             client_email: dbConfig.clientEmail,
             private_key: dbConfig.privateKey.replace(/\\n/g, '\n'),
          };
       }
       if (dbConfig.calendarId) calendarId = dbConfig.calendarId;
     }

     if (!credentialsObj) {
        throw new Error("Google Meet Integration missing Service Account JSON. Please configure it in your environment settings or the Admin Panel.");
     }

     const auth = new google.auth.GoogleAuth({
        credentials: credentialsObj,
        scopes: ['https://www.googleapis.com/auth/calendar.events'],
     });

     const calendar = google.calendar({ version: 'v3', auth });
     
     const event = {
        summary: summary || 'Live Class Session',
        description: description || 'Automatic Google Meet generated session',
        start: { dateTime: startDateTime || new Date().toISOString() },
        end: { dateTime: endDateTime || new Date(Date.now() + 60 * 60 * 1000).toISOString() },
        conferenceData: {
           createRequest: {
              requestId: Math.random().toString(36).substring(7),
              conferenceSolutionKey: { type: 'hangoutsMeet' }
           }
        }
     };

     const response = await calendar.events.insert({
        calendarId: calendarId,
        requestBody: event,
        conferenceDataVersion: 1,
     });

     const meetLink = response.data.hangoutLink;
     res.json({ success: true, meetLink, eventId: response.data.id });
  } catch (error: any) {
     console.error("Generate Meet Error:", error);
     res.status(500).json({ error: error.message });
  }
});

// --- SLIDERS ---
router.get("/sliders", async (req, res) => {
  const sliders = await prisma.slider.findMany({
    where: { active: true }
  });
  res.json(sliders);
});

router.post("/admin/sliders", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  const { title, imageUrl, linkUrl, active } = req.body;
  const slider = await prisma.slider.create({ data: { title, imageUrl, linkUrl, active } });
  res.json(slider);
});

router.put("/admin/sliders/:id", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  const { title, imageUrl, linkUrl, active } = req.body;
  const slider = await prisma.slider.update({ where: { id: req.params.id }, data: { title, imageUrl, linkUrl, active } });
  res.json(slider);
});

router.delete("/admin/sliders/:id", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  await prisma.slider.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// --- DASHBOARD (Protected) ---
router.get("/dashboard", authMiddleware, async (req, res) => {
  const userId = (req as any).user.userId;
  
  const userCourses = await prisma.userCourse.findMany({
    where: { userId },
    include: { course: true }
  });
  
  const memberships = await prisma.membershipOrder.findMany({
    where: { userId },
    include: { membership: { include: { contents: true } }, edition: true }
  });

  const validMembershipIds = memberships.map(m => m.membershipId);
  if (validMembershipIds.length > 0) {
    const membershipCourses = await prisma.course.findMany({
      where: { memberships: { some: { id: { in: validMembershipIds } } } }
    });
    
    membershipCourses.forEach(mc => {
      // simulate userCourse object shape for frontend state
      if (!userCourses.find(uc => uc.courseId === mc.id)) {
         userCourses.push({
            id: `mem-course-${mc.id}`,
            userId,
            courseId: mc.id,
            progress: 0,
            expiresAt: null,
            editionId: null,
            createdAt: new Date(),
            course: mc
         } as any);
      }
    });
  }

  // Load pending manual transfer items
  const pendingOrders = await prisma.order.findMany({
    where: { userId, paymentMethod: 'MANUAL', status: 'PENDING' },
    include: { items: true }
  });

  const pendingCourses: any[] = [];
  const pendingMemberships: any[] = [];
  const pendingBookings: any[] = [];

  for (const order of pendingOrders) {
    for (const item of order.items) {
      if (item.itemType === 'COURSE') {
        const c = await prisma.course.findUnique({ where: { id: item.itemId } });
        if (c && !userCourses.some(uc => uc.courseId === c.id) && !pendingCourses.some(pc => pc.courseId === c.id)) {
          pendingCourses.push({
            id: `pending-${item.id}`,
            userId,
            courseId: c.id,
            progress: 0,
            expiresAt: null,
            isPending: true,
            createdAt: order.createdAt,
            course: c
          });
        }
      } else if (item.itemType === 'BUNDLE') {
        const bundle = await prisma.courseBundle.findUnique({
          where: { id: item.itemId },
          include: { courses: { include: { course: true } } }
        });
        if (bundle) {
          for (const bundleItem of bundle.courses) {
            if (bundleItem.course && !userCourses.some(uc => uc.courseId === bundleItem.courseId) && !pendingCourses.some(pc => pc.courseId === bundleItem.courseId)) {
              pendingCourses.push({
                id: `pending-${item.id}-${bundleItem.courseId}`,
                userId,
                courseId: bundleItem.courseId,
                progress: 0,
                expiresAt: null,
                isPending: true,
                createdAt: order.createdAt,
                course: bundleItem.course
              });
            }
          }
        }
      } else if (item.itemType === 'MEMBERSHIP') {
        const m = await prisma.membership.findUnique({
          where: { id: item.itemId },
          include: { contents: true }
        });
        if (m) {
          pendingMemberships.push({
            id: `pending-mem-${item.id}`,
            userId,
            membershipId: m.id,
            expiresAt: null,
            isPending: true,
            createdAt: order.createdAt,
            membership: m
          });
        }
      } else if (item.itemType === 'EVENT') {
        const e = await prisma.event.findUnique({ where: { id: item.itemId } });
        if (e) {
          pendingBookings.push({
            id: `pending-evt-${item.id}`,
            userId,
            eventId: e.id,
            status: 'PENDING Approval',
            isPending: true,
            createdAt: order.createdAt,
            event: e
          });
        }
      }
    }
  }

  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: { event: true }
  });

  userCourses.push(...pendingCourses);
  memberships.push(...pendingMemberships as any);
  bookings.push(...pendingBookings as any);

  // Load rejected manual transfer items
  const rejectedDbOrders = await prisma.order.findMany({
    where: { userId, paymentMethod: 'MANUAL', status: 'REJECTED' },
    include: { items: true }
  });

  const rejectedOrders: any[] = [];
  for (const order of rejectedDbOrders) {
    const itemsList: any[] = [];
    for (const item of order.items) {
      let itemName = "Unknown";
      if (item.itemType === 'COURSE') {
        const c = await prisma.course.findUnique({ where: { id: item.itemId } });
        itemName = c?.title || "Course";
      } else if (item.itemType === 'MEMBERSHIP') {
        const mc = await prisma.membershipContent.findFirst({ where: { membershipId: item.itemId } });
        itemName = mc?.title || "Membership";
      } else if (item.itemType === 'EVENT') {
        const e = await prisma.event.findUnique({ where: { id: item.itemId } });
        itemName = e?.title || "Event";
      } else if (item.itemType === 'BUNDLE') {
        const b = await prisma.courseBundle.findUnique({ where: { id: item.itemId } });
        itemName = b?.title || "Course Bundle";
      }
      itemsList.push({
        id: item.id,
        itemType: item.itemType,
        itemName,
        price: item.price
      });
    }
    rejectedOrders.push({
      id: order.id,
      total: order.total,
      rejectReason: order.rejectReason || "Payment verification failed.",
      createdAt: order.createdAt,
      items: itemsList
    });
  }

  const meetingsData: any[] = [];
  
  const mCourses = await prisma.userCourse.findMany({ where: { userId, course: { meetingLink: { not: null } } }, include: { course: true } });
  mCourses.forEach(uc => meetingsData.push({
     itemType: 'COURSE', itemName: uc.course.title, meetingLink: uc.course.meetingLink, meetingDate: uc.course.meetingDate, meetingNotes: uc.course.meetingNotes
  }));

  const mMemberships = await prisma.membershipOrder.findMany({ where: { userId, membership: { meetingLink: { not: null } } }, include: { membership: { include: { contents: true } } } });
  mMemberships.forEach(mo => meetingsData.push({
     itemType: 'MEMBERSHIP', itemName: mo.membership.contents[0]?.title || mo.membership.label || 'Membership', meetingLink: mo.membership.meetingLink, meetingDate: mo.membership.meetingDate, meetingNotes: mo.membership.meetingNotes
  }));

  const mEvents = await prisma.booking.findMany({ where: { userId, event: { meetingLink: { not: null } } }, include: { event: true } });
  mEvents.forEach(eb => meetingsData.push({
     itemType: 'EVENT', itemName: eb.event.title, meetingLink: eb.event.meetingLink, meetingDate: eb.event.meetingDate, meetingNotes: eb.event.meetingNotes
  }));

  res.json({ courses: userCourses, memberships, bookings, meetings: meetingsData, rejectedOrders });
});

// --- STRIPE CHECKOUT ---
router.post("/stripe/create-checkout-session", authMiddleware, async (req, res) => {
  const userId = (req as any).user.userId;
  const { items, successUrl, cancelUrl } = req.body;

  const stripeSetting = await prisma.setting.findUnique({ where: { key: 'STRIPE_CONFIG' } });
  if (!stripeSetting) return res.status(400).json({ error: 'Stripe is not configured' });
  const stripeConfig = JSON.parse(stripeSetting.value);
  
  if (!stripeConfig.enabled || !stripeConfig.secretKey) {
     return res.status(400).json({ error: 'Stripe is disabled or missing keys' });
  }

  const stripe = new Stripe(stripeConfig.secretKey);
  
  const currencySetting = await prisma.setting.findUnique({ where: { key: 'CURRENCY' } });
  const currency = currencySetting ? JSON.parse(currencySetting.value) : 'USD';

  try {
    const line_items = items.map((it: any) => ({
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: it.title || 'Item',
        },
        unit_amount: Math.round(it.price * 100),
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        items: JSON.stringify(items.map((i:any) => ({ itemType: i.itemType, itemId: i.itemId, editionId: i.editionId, price: i.price }))),
        total: items.reduce((sum: number, it: any) => sum + Number(it.price), 0)
      }
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/stripe/verify-session", authMiddleware, async (req, res) => {
  const userId = (req as any).user.userId;
  const { sessionId } = req.body;

  try {
    const stripeSetting = await prisma.setting.findUnique({ where: { key: 'STRIPE_CONFIG' } });
    if (!stripeSetting) return res.status(400).json({ error: 'Stripe is not configured' });
    const stripeConfig = JSON.parse(stripeSetting.value);

    if (!stripeConfig.enabled || !stripeConfig.secretKey) {
       return res.status(400).json({ error: 'Stripe is disabled' });
    }

    const stripe = new Stripe(stripeConfig.secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
       return res.status(400).json({ error: 'Payment not completed' });
    }

    // Check if order already exists for this session to avoid duplicates
    // We can check if a recent order matches or just trust it.
    // To be perfectly safe we could store sessionId on the Order model, but since we didn't add it to Prisma schema, 
    // we can search for the items created in the last 5 minutes.
    // Instead we will add a unique constraint? We don't have one for sessionId.
    // Let's just create it. The user only calls this once on success page load.

    const metadataItems = JSON.parse(session.metadata?.items || '[]');
    const total = Number(session.metadata?.total || 0);

    if (metadataItems.length === 0) return res.json({ success: true, message: 'No items' });

    // Check if we already processed this by checking if the user already has the first course
    if (metadataItems[0].itemType === 'COURSE') {
       const hasFirst = await prisma.userCourse.findUnique({
          where: { userId_courseId: { userId, courseId: metadataItems[0].itemId } }
       });
       if (hasFirst) return res.json({ success: true, message: 'Already processed' });
    }

    // Reuse the exact same creation logic from /api/orders
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: "COMPLETED",
        paymentMethod: "STRIPE",
        items: {
          create: metadataItems.map((it: any) => ({
            itemType: it.itemType,
            itemId: it.itemId,
            price: Number(it.price) || 0
          }))
        }
      },
      include: { items: true }
    });

    for (const item of order.items) {
      const todayDate = new Date().toLocaleDateString();
      if (item.itemType === "COURSE") {
        const existing = await prisma.userCourse.findUnique({
          where: { userId_courseId: { userId, courseId: item.itemId } }
        });
        if (!existing) {
          const c = await prisma.course.findUnique({ where: { id: item.itemId } });
          await prisma.userCourse.create({ data: { userId, courseId: item.itemId, expiresAt: c?.expiryDate || null } });
          if (c) sendAutomatedEmail(userId, 'COURSE_PURCHASE', { course_name: c.title, price: String(item.price), date: todayDate });
        }
      } else if (item.itemType === "MEMBERSHIP") {
        const membership = await prisma.membership.findUnique({ where: { id: item.itemId } });
        if (membership) {
          await prisma.membershipOrder.create({ data: { userId, membershipId: membership.id, editionId: item.editionId || null, expiresAt: membership.expiryDate || null } });
          if (item.editionId) await prisma.membershipEdition.update({ where: { id: item.editionId }, data: { availableSeats: { decrement: 1 } } });
          sendAutomatedEmail(userId, 'MEMBERSHIP_PURCHASE', { membership_name: membership.label || membership.type, price: String(item.price), date: todayDate });
        }
      } else if (item.itemType === "EVENT") {
        await prisma.booking.create({ data: { userId, eventId: item.itemId } });
        await prisma.event.update({ where: { id: item.itemId }, data: { availableSeats: { decrement: 1 } } });
        const evt = await prisma.event.findUnique({ where: { id: item.itemId } });
        if (evt) sendAutomatedEmail(userId, 'EVENT_BOOKING', { event_name: evt.title, date: todayDate });
      } else if (item.itemType === "BUNDLE") {
        const bundle = await prisma.courseBundle.findUnique({ where: { id: item.itemId }, include: { courses: { include: { course: true } } } });
        if (bundle) {
          for (const bundleItem of bundle.courses) {
            const existing = await prisma.userCourse.findUnique({ where: { userId_courseId: { userId, courseId: bundleItem.courseId } } });
            if (!existing) {
              await prisma.userCourse.create({ data: { userId, courseId: bundleItem.courseId, expiresAt: bundleItem.course?.expiryDate || null } });
            }
          }
        }
      }
    }

    res.json({ success: true, orderId: order.id });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// --- ORDERS (PURCHASE) ---
router.post("/orders", authMiddleware, async (req, res) => {
  const userId = (req as any).user.userId;
  const { items, total, sessionId, billingDetails, paymentMethod, paymentProofUrl } = req.body; 
  
  try {
    if (total > 0 && paymentMethod !== 'MANUAL') {
      const stripeSetting = await prisma.setting.findUnique({ where: { key: 'STRIPE_CONFIG' } });
      if (stripeSetting) {
        const stripeConfig = JSON.parse(stripeSetting.value);
        if (stripeConfig.enabled && stripeConfig.secretKey) {
          if (!sessionId) {
             return res.status(400).json({ error: 'Payment session ID is required' });
          }
          const stripe = new Stripe(stripeConfig.secretKey);
          const session = await stripe.checkout.sessions.retrieve(sessionId);
          if (session.payment_status !== 'paid') {
             return res.status(400).json({ error: 'Payment has not been completed' });
          }
        }
      }
    }

    const isPending = total > 0 && paymentMethod === 'MANUAL';

    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: isPending ? "PENDING" : "COMPLETED",
        paymentMethod: paymentMethod || "STRIPE",
        billingDetails,
        paymentProofUrl,
        items: {
          create: items.map((it: any) => ({
            itemType: it.itemType,
            itemId: it.itemId,
            editionId: it.editionId || null,
            price: it.price
          }))
        }
      },
      include: { items: true }
    });

    if (isPending) {
      return res.json({ success: true, orderId: order.id, pending: true });
    }

    // Process items immediately if COMPLETED
    for (const item of order.items) {
      const todayDate = new Date().toLocaleDateString();
      if (item.itemType === "COURSE") {
        const existing = await prisma.userCourse.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId: item.itemId
            }
          }
        });
        if (!existing) {
          const c = await prisma.course.findUnique({ where: { id: item.itemId } });
          let expiresAt: Date | null = null;
          if (c && c.expiryDate) {
            expiresAt = c.expiryDate;
          }
          await prisma.userCourse.create({
            data: { userId, courseId: item.itemId, expiresAt }
          });
          if (c) {
             sendAutomatedEmail(userId, 'COURSE_PURCHASE', {
                course_name: c.title,
                price: String(item.price),
                date: todayDate
             });
          }
        }
      } else if (item.itemType === "MEMBERSHIP") {
        const membership = await prisma.membership.findUnique({ where: { id: item.itemId } });
        if (membership) {
          let expiresAt: Date | null = null;
          if (membership.expiryDate) {
            expiresAt = membership.expiryDate;
          }
          await prisma.membershipOrder.create({
            data: { userId, membershipId: membership.id, editionId: item.editionId || null, expiresAt }
          });
          if (item.editionId) {
             await prisma.membershipEdition.update({
               where: { id: item.editionId },
               data: { availableSeats: { decrement: 1 } }
             });
          }
          sendAutomatedEmail(userId, 'MEMBERSHIP_PURCHASE', {
             membership_name: membership.label || membership.type,
             price: String(item.price),
             date: todayDate
          });
        }
      } else if (item.itemType === "EVENT") {
        await prisma.booking.create({
          data: { userId, eventId: item.itemId }
        });
        const evt = await prisma.event.update({
          where: { id: item.itemId },
          data: { availableSeats: { decrement: 1 } }
        });
        sendAutomatedEmail(userId, 'EVENT_BOOKING', {
           event_name: evt.title,
           price: String(item.price),
           date: todayDate
        });
      } else if (item.itemType === "BUNDLE") {
        const bundle = await prisma.courseBundle.findUnique({
          where: { id: item.itemId },
          include: { courses: { include: { course: true } } }
        });
        if (bundle) {
          for (const bundleItem of bundle.courses) {
            const courseId = bundleItem.courseId;
            const existing = await prisma.userCourse.findUnique({
              where: { userId_courseId: { userId, courseId } }
            });
            if (!existing) {
              let expiresAt: Date | null = null;
              if (bundleItem.course && bundleItem.course.expiryDate) {
                expiresAt = bundleItem.course.expiryDate;
              }
              await prisma.userCourse.create({
                data: { userId, courseId, expiresAt }
              });
            }
          }
          sendAutomatedEmail(userId, 'COURSE_PURCHASE', {
            course_name: bundle.title + ' (Bundle)',
            price: String(item.price),
            date: todayDate
          });
        }
      }
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// --- INSTRUCTORS ---
router.get("/instructors", async (req, res) => {
  const instructors = await prisma.instructor.findMany();
  res.json(instructors);
});

// --- FAVORITES ---
router.get("/favorites", authMiddleware, async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: (req as any).user.userId }
    });
    res.json(favorites);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/favorites", authMiddleware, async (req, res) => {
  try {
    const { itemType, itemId } = req.body;
    const existing = await prisma.favorite.findUnique({
      where: { userId_itemType_itemId: { userId: (req as any).user.userId, itemType, itemId } }
    });
    if (existing) return res.json(existing);
    const favorite = await prisma.favorite.create({
      data: { userId: (req as any).user.userId, itemType, itemId }
    });
    res.json(favorite);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/favorites/:id", authMiddleware, async (req, res) => {
  try {
    const favorite = await prisma.favorite.findUnique({ where: { id: req.params.id } });
    if (!favorite) return res.status(404).json({ error: "Not found" });
    if (favorite.userId !== (req as any).user.userId) return res.status(403).json({ error: "Forbidden" });
    await prisma.favorite.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/instructors", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  const { name, imageUrl, bio, email } = req.body;
  const instructor = await prisma.instructor.create({ data: { name, imageUrl, bio, email } });
  res.json(instructor);
});

router.put("/instructors/:id", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  const { name, imageUrl, bio, email } = req.body;
  const instructor = await prisma.instructor.update({ where: { id: req.params.id }, data: { name, imageUrl, bio, email } });
  res.json(instructor);
});

router.delete("/instructors/:id", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  await prisma.instructor.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// --- CATEGORIES ---
router.get("/categories", async (req, res) => {
  const categories = await prisma.category.findMany({ 
    orderBy: { name: 'asc' },
    include: { translations: true }
  });
  res.json(categories);
});

router.post("/admin/categories", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  const { name, description, translations, type } = req.body;
  const category = await prisma.category.create({ data: { name, description, type: type || 'COURSE' } });
  
  if (translations && translations.length) {
    await prisma.categoryTranslation.createMany({
      data: translations.map((t: any) => ({ ...t, categoryId: category.id }))
    });
  }
  
  res.json(category);
});

router.put("/admin/categories/:id", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  const { name, description, translations, type } = req.body;
  
  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (type !== undefined) updateData.type = type;

  const category = await prisma.category.update({ 
    where: { id: req.params.id }, 
    data: updateData
  });
  
  if (translations !== undefined) {
    await prisma.categoryTranslation.deleteMany({ where: { categoryId: category.id } });
    if (translations.length) {
      await prisma.categoryTranslation.createMany({
        data: translations.map((t: any) => ({ ...t, categoryId: category.id }))
      });
    }
  }
  
  res.json(category);
});

router.delete("/admin/categories/:id", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// --- LANGUAGES ---
router.get("/languages", async (req, res) => {
  let languages = await prisma.language.findMany({ orderBy: { createdAt: 'asc' } });
  if (languages.length === 0) {
    const enTrans = JSON.stringify({
      "nav": {
        "home": "Home",
        "courses": "Courses",
        "memberships": "Memberships",
        "contact": "Contact",
        "dashboard": "Dashboard",
        "admin": "Admin",
        "cart": "Cart",
        "login": "Login",
        "register": "Register",
        "logout": "Logout"
      },
      "footer": {
         "about": "An educational platform offering the best courses.",
         "links": "Quick Links",
         "contact": "Contact Us",
         "rights": "All rights reserved",
         "about_title": "About"
      },
      "home": {
         "hero_title": "Learn and grow",
         "hero_subtitle": "The best educational platforms to elevate your level.",
         "get_started": "Get Started",
         "view_courses": "View Courses",
         "top_categories": "Top Categories",
         "featured_courses": "Featured Courses",
         "upcoming_events": "Events"
      },
      "courses": {
         "all_courses": "All Courses",
         "details": "Details",
         "course_content": "Course Content",
         "about_lesson": "About this lesson",
         "meet_instructor": "Meet Your Instructor",
         "feedback": "Feedback & Reviews",
         "your_rating": "Your rating",
         "submit_review": "Submit",
         "no_reviews": "There are no reviews yet.",
         "add_to_cart": "Add to Cart",
         "go_to_course": "Go to Course",
         "add_favorite": "Add to favorite",
         "remove_favorite": "Remove from favorites",
         "course_includes": "This course includes:",
         "learners": "Learners",
         "students": "Students",
         "lessons": "Lessons",
         "duration": "Duration",
         "language": "Language",
         "share": "Share",
         "report": "Report",
         "no_content": "No content available yet."
      },
      "memberships": {
         "title": "Programs & Memberships",
         "all_programs": "All Programs",
         "view_details": "View Details",
         "real_value": "Real Value:",
         "who_is_for": "Who Is This For?",
         "what_you_get": "What You Will Get",
         "entry_condition": "Entry Condition",
         "available_editions": "Available Editions",
         "seats_left": "Seats Left",
         "sold_out": "Sold Out",
         "membership_details": "Membership details:",
         "members": "Members",
         "type": "Type",
         "no_programs": "No programs available."
      },
      "events": {
         "title": "Live Bookings",
         "book_seat": "Book Seat",
         "sold_out": "Sold Out",
         "seats": "Seats",
         "no_events": "No events right now.",
         "online_room": "Online Room"
      },
      "cart": {
         "title": "Your Cart",
         "empty": "Cart is empty.",
         "browse": "Browse catalog ←",
         "remove": "Remove",
         "order_total": "Order Total",
         "checkout": "Complete Checkout",
         "success": "Order placed successfully!"
      },
      "dashboard": {
         "student_portal": "Student Portal",
         "welcome": "Welcome back",
         "memberships": "Membership Tiers",
         "no_memberships": "No active memberships.",
         "active": "Active",
         "purchased": "Purchased",
         "learning_path": "My Learning Path",
         "no_courses": "No courses purchased yet.",
         "progress": "Complete",
         "continue": "Continue",
         "upcoming_events": "Events",
         "no_events": "No booked events."
      },
      "wishlist": {
         "title": "Your Wishlist",
         "login_required": "Please login to view your wishlist.",
         "empty": "No favorites yet.",
         "view": "View",
         "remove": "Remove"
      },
      "admin": {
         "portal": "Administration Portal",
         "seed": "Test Seed Data",
         "total_revenue": "Total Revenue",
         "total_users": "Total Users",
         "leads": "Interested Users / Leads",
         "course_purchases": "Course Purchases",
         "membership_sales": "Membership Sales",
         "event_bookings": "Event Bookings",
         "chart_area": "Chart Visualization Area",
         "coming_soon": "Coming Soon"
      },
      "auth": {
         "email": "Email Address",
         "password": "Password",
         "name": "Full Name",
         "login": "Login",
         "register": "Register",
         "no_account": "Don't have an account?",
         "have_account": "Already have an account?"
      }
    });

    const arTrans = JSON.stringify({
      "nav": {
        "home": "الرئيسية",
        "courses": "الدورات",
        "memberships": "العضويات",
        "contact": "تواصل معنا",
        "dashboard": "لوحة التحكم",
        "admin": "الإدارة",
        "cart": "عربة التسوق",
        "login": "تسجيل الدخول",
        "register": "إنشاء حساب",
        "logout": "تسجيل خروج"
      },
      "footer": {
         "about": "منصة تعليمية تقدم أفضل الدورات والبرامج.",
         "links": "روابط سريعة",
         "contact": "تواصل معنا",
         "rights": "جميع الحقوق محفوظة",
         "about_title": "عن المنصة"
      },
      "home": {
         "hero_title": "تعلم وطور مهاراتك",
         "hero_subtitle": "أفضل المنصات التعليمية للارتقاء بمستواك.",
         "get_started": "ابدأ الآن",
         "view_courses": "تصفح الدورات",
         "top_categories": "أهم التصنيفات",
         "featured_courses": "دورات مميزة",
         "upcoming_events": "الفعاليات"
      },
      "courses": {
         "all_courses": "جميع الدورات",
         "details": "التفاصيل",
         "course_content": "محتوى الدورة",
         "about_lesson": "عن هذا الدرس",
         "meet_instructor": "تعرف على المدرب",
         "feedback": "التقييمات والمراجعات",
         "your_rating": "تقييمك",
         "submit_review": "إرسال التقييم",
         "no_reviews": "لا توجد تقييمات بعد.",
         "add_to_cart": "أضف للسلة",
         "go_to_course": "اذهب للدورة",
         "add_favorite": "أضف للمفضلة",
         "remove_favorite": "إزالة من المفضلة",
         "course_includes": "هذه الدورة تشمل:",
         "learners": "المتعلمين",
         "students": "طلاب",
         "lessons": "دروس",
         "duration": "المدة",
         "language": "اللغة",
         "share": "مشاركة",
         "report": "إبلاغ المراجع",
         "no_content": "لا يتوفر محتوى بعد."
      },
      "memberships": {
         "title": "البرامج والعضويات",
         "all_programs": "جميع البرامج",
         "view_details": "عرض التفاصيل",
         "real_value": "القيمة الحقيقية:",
         "who_is_for": "لمن هذا البرنامج؟",
         "what_you_get": "ماذا ستحصل",
         "entry_condition": "شروط القبول",
         "available_editions": "النسخ المتاحة",
         "seats_left": "مقاعد متبقية",
         "sold_out": "نفد",
         "membership_details": "تفاصيل العضوية:",
         "members": "أعضاء",
         "type": "النوع",
         "no_programs": "لا توجد برامج متاحة."
      },
      "events": {
         "title": "الحجوزات الحية",
         "book_seat": "احجز مقعد",
         "sold_out": "نفد",
         "seats": "مقاعد",
         "no_events": "لا توجد فعاليات حالياً.",
         "online_room": "غرفة أونلاين"
      },
      "cart": {
         "title": "عربة التسوق",
         "empty": "العربة فارغة.",
         "browse": "تصفح الكتالوج ←",
         "remove": "إزالة",
         "order_total": "إجمالي الطلب",
         "checkout": "إتمام الدفع",
         "success": "تم إنشاء الطلب بنجاح!"
      },
      "dashboard": {
         "student_portal": "بوابة الطالب",
         "welcome": "مرحباً بعودتك",
         "memberships": "عضوياتك",
         "no_memberships": "لا توجد عضويات مفعلة.",
         "active": "نشط",
         "purchased": "تاريخ الشراء",
         "learning_path": "مسارك التعليمي",
         "no_courses": "لم تقم بشراء دورات.",
         "progress": "مكتمل",
         "continue": "متابعة",
         "upcoming_events": "الفعاليات",
         "no_events": "لا توجد حجوزات."
      },
      "wishlist": {
         "title": "المفضلة",
         "login_required": "يرجى تسجيل الدخول.",
         "empty": "المفضلة فارغة.",
         "view": "عرض",
         "remove": "حذف"
      },
      "admin": {
         "portal": "بوابة الإدارة",
         "seed": "تعبئة البيانات التجريبية",
         "total_revenue": "إجمالي الإيرادات",
         "total_users": "إجمالي المستخدمين",
         "leads": "المهتمين / العملاء المحتملين",
         "course_purchases": "مبيعات الدورات",
         "membership_sales": "مبيعات العضويات",
         "event_bookings": "حجوزات الفعاليات",
         "chart_area": "منطقة الرسم البياني",
         "coming_soon": "قريباً"
      },
      "auth": {
         "email": "البريد الإلكتروني",
         "password": "كلمة المرور",
         "name": "الاسم كامل",
         "login": "دخول",
         "register": "حساب جديد",
         "no_account": "ليس لديك حساب؟",
         "have_account": "لديك حساب بالفعل؟"
      }
    });

    const frTrans = JSON.stringify({
      "nav": {
        "home": "Accueil",
        "courses": "Cours",
        "memberships": "Adhésions",
        "contact": "Contact",
        "dashboard": "Tableau de Bord",
        "admin": "Admin",
        "cart": "Panier",
        "login": "Connexion",
        "register": "S'inscrire",
        "logout": "Déconnexion"
      },
      "footer": {
         "about": "Une plateforme éducative offrant les meilleurs cours.",
         "links": "Liens Rapides",
         "contact": "Contactez-nous",
         "rights": "Tous droits réservés",
         "about_title": "À Propos"
      },
      "home": {
         "hero_title": "Apprenez et grandissez",
         "hero_subtitle": "Les meilleures plateformes éducatives pour élever votre niveau.",
         "get_started": "Commencer",
         "view_courses": "Voir les cours",
         "top_categories": "Top Catégories",
         "featured_courses": "Cours Vedettes",
         "upcoming_events": "Événements"
      },
      "courses": {
         "all_courses": "Tous les Cours",
         "details": "Détails",
         "course_content": "Contenu du cours",
         "about_lesson": "À propos de cette leçon",
         "meet_instructor": "Rencontrez votre instructeur",
         "feedback": "Commentaires et avis",
         "your_rating": "Votre note",
         "submit_review": "Soumettre",
         "no_reviews": "Il n'y a pas encore d'avis.",
         "add_to_cart": "Ajouter au panier",
         "go_to_course": "Aller au cours",
         "add_favorite": "Ajouter aux favoris",
         "remove_favorite": "Retirer des favoris",
         "course_includes": "Ce cours comprend :",
         "learners": "Apprenants",
         "students": "Étudiants",
         "lessons": "Leçons",
         "duration": "Durée",
         "language": "Langue",
         "share": "Partager",
         "report": "Signaler",
         "no_content": "Aucun contenu disponible pour le moment."
      },
      "memberships": {
         "title": "Programmes et Adhésions",
         "all_programs": "Tous les Programmes",
         "view_details": "Voir les détails",
         "real_value": "Valeur Réelle :",
         "who_is_for": "Pour qui est-ce ?",
         "what_you_get": "Ce que vous obtiendrez",
         "entry_condition": "Conditions d'entrée",
         "available_editions": "Éditions disponibles",
         "seats_left": "Places restantes",
         "sold_out": "Complet",
         "membership_details": "Détails de l'adhésion :",
         "members": "Membres",
         "type": "Type",
         "no_programs": "Aucun programme disponible."
      },
      "events": {
         "title": "Réservations en Direct",
         "book_seat": "Réserver une place",
         "sold_out": "Complet",
         "seats": "Places",
         "no_events": "Aucun événement pour le moment.",
         "online_room": "Salle en Ligne"
      },
      "cart": {
         "title": "Votre Panier",
         "empty": "Le panier est vide.",
         "browse": "Parcourir le catalogue ←",
         "remove": "Retirer",
         "order_total": "Total de la commande",
         "checkout": "Terminer le paiement",
         "success": "Commande passée avec succès !"
      },
      "dashboard": {
         "student_portal": "Portail Étudiant",
         "welcome": "Bon retour",
         "memberships": "Niveaux d'adhésion",
         "no_memberships": "Aucune adhésion active.",
         "active": "Actif",
         "purchased": "Acheté le",
         "learning_path": "Mon parcours d'apprentissage",
         "no_courses": "Aucun cours acheté pour le moment.",
         "progress": "Terminé",
         "continue": "Continuer",
         "upcoming_events": "Événements",
         "no_events": "Aucun événement réservé."
      },
      "wishlist": {
         "title": "Votre Liste de Souhaits",
         "login_required": "Veuillez vous connecter pour voir votre liste de souhaits.",
         "empty": "Aucun favori pour le moment.",
         "view": "Voir",
         "remove": "Retirer"
      },
      "admin": {
         "portal": "Portail d'Administration",
         "seed": "Données de Test",
         "total_revenue": "Revenu Total",
         "total_users": "Utilisateurs Totaux",
         "leads": "Utilisateurs Intéressés",
         "course_purchases": "Achats de Cours",
         "membership_sales": "Ventes d'Adhésions",
         "event_bookings": "Réservations d'Événements",
         "chart_area": "Zone de Graphique",
         "coming_soon": "Bientôt Disponible"
      },
      "auth": {
         "email": "Adresse Email",
         "password": "Mot de passe",
         "name": "Nom complet",
         "login": "Se connecter",
         "register": "S'inscrire",
         "no_account": "Pas de compte ?",
         "have_account": "Vous avez déjà un compte ?"
      }
    });

    const defaultLangs = [
      { code: 'en', name: 'English', isDefault: false, isActive: true, translations: enTrans },
      { code: 'ar', name: 'Arabic', isDefault: true, isActive: true, translations: arTrans },
      { code: 'fr', name: 'French', isDefault: false, isActive: true, translations: frTrans },
    ];
    for (const lang of defaultLangs) {
      await prisma.language.create({ data: lang });
    }
    languages = await prisma.language.findMany({ orderBy: { createdAt: 'asc' } });
  }
  res.json(languages);
});

router.post("/admin/languages", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  const { code, name, isDefault, isActive, translations } = req.body;
  if (isDefault) {
    await prisma.language.updateMany({ data: { isDefault: false } });
  }
  
  const dataToCreate: any = { code, name, isDefault, isActive };
  if (translations !== undefined) {
    dataToCreate.translations = translations;
  }
  
  const lang = await prisma.language.create({ data: dataToCreate });
  res.json(lang);
});

router.put("/admin/languages/:id", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  const { name, isDefault, isActive, translations } = req.body;
  if (isDefault) {
    await prisma.language.updateMany({ data: { isDefault: false } });
  }
  
  const dataToUpdate: any = { name, isDefault, isActive };
  if (translations !== undefined) {
    dataToUpdate.translations = translations;
  }
  
  const lang = await prisma.language.update({ where: { id: req.params.id }, data: dataToUpdate });
  res.json(lang);
});

router.delete("/admin/languages/:id", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  await prisma.language.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// --- EMAILS ---
router.get("/admin/campaigns", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  const campaigns = await prisma.emailCampaign.findMany({ 
    orderBy: { createdAt: 'desc' },
    include: { logs: { include: { user: true } } }
  });
  res.json(campaigns);
});

// --- EMAIL TEMPLATES & SETTINGS ---

router.get("/settings", async (req, res) => {
  const settings = await prisma.setting.findMany({
    where: {
      key: { notIn: ["SMTP_CONFIG", "GOOGLE_MEET_CONFIG"] }
    }
  });

  const safeSettings = settings.map(setting => {
    if (setting.key === 'FIREBASE_CONFIG') {
      try {
        const config = JSON.parse(setting.value);
        delete config.serviceAccountJson;
        return { ...setting, value: JSON.stringify(config) };
      } catch (e) {
        return setting;
      }
    }
    return setting;
  });

  res.json(safeSettings);
});

router.get("/admin/settings", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  const settings = await prisma.setting.findMany();
  res.json(settings);
});

router.post("/admin/settings", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  const { key, value } = req.body;
  const setting = await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });
  res.json(setting);
});

// --- SEO ENDPOINTS ---
router.get("/seo/:entityType/:entityId", async (req, res) => {
  const { entityType, entityId } = req.params;
  const seo = await prisma.seoMeta.findUnique({
    where: { entityType_entityId: { entityType, entityId } }
  });
  res.json(seo || {});
});

router.post("/admin/seo", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  const { entityType, entityId, title, description, keywords } = req.body;
  const seo = await prisma.seoMeta.upsert({
    where: { entityType_entityId: { entityType, entityId } },
    update: { title, description, keywords },
    create: { entityType, entityId, title, description, keywords }
  });
  res.json(seo);
});

router.get("/admin/email-templates", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  const templates = await prisma.emailTemplate.findMany();
  res.json(templates);
});

router.post("/admin/email-templates", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  const { type, subject, content } = req.body;
  const template = await prisma.emailTemplate.upsert({
    where: { type },
    update: { subject, content },
    create: { type, subject, content }
  });
  res.json(template);
});

router.post("/admin/campaigns", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  const { subject, message, type, targetId, selectedUserIds, scheduledAt } = req.body;
  
  let targetUsers: any[] = [];
  if (type === 'ALL') {
    targetUsers = await prisma.user.findMany();
  } else if (type === 'COURSE') {
    if (!targetId) return res.status(400).json({ error: "Course ID is required for COURSE type" });
    const userCourses = await prisma.userCourse.findMany({ where: { courseId: targetId }, include: { user: true } });
    targetUsers = userCourses.map(uc => uc.user);
  } else if (type === 'MEMBERSHIP') {
    if (!targetId) return res.status(400).json({ error: "Membership ID is required for MEMBERSHIP type" });
    const memberships = await prisma.membershipOrder.findMany({ where: { membershipId: targetId }, include: { user: true } });
    targetUsers = memberships.map(uc => uc.user);
  } else if (type === 'SELECTED') {
    if (!selectedUserIds || !selectedUserIds.length) return res.status(400).json({ error: "No users selected" });
    targetUsers = await prisma.user.findMany({ where: { id: { in: selectedUserIds } } });
  }

  const isScheduled = !!scheduledAt;
  const status = isScheduled ? "PENDING" : "SENT";

  const campaign = await prisma.emailCampaign.create({
    data: { 
      subject, 
      message, 
      type, 
      targetId, 
      status, 
      scheduledAt: isScheduled ? new Date(scheduledAt) : null 
    }
  });

  if (!isScheduled) {
    for (const u of targetUsers) {
      const personalizedMessage = message.replace(/\{\{name\}\}/g, u.name);
      const personalizedSubject = subject.replace(/\{\{name\}\}/g, u.name);
      console.log(`[EMAIL SIMULATOR] Sending to ${u.email}: ${personalizedSubject}`);
      
      const sent = await sendEmail(u.email, personalizedSubject, personalizedMessage);
      
      await prisma.emailLog.create({
        data: {
          campaignId: campaign.id,
          userId: u.id,
          status: sent ? "SENT" : "FAILED"
        }
      });
    }
  }

  res.json({ success: true, count: targetUsers.length, campaign });
});

// --- BLOGS ---
router.get("/blogs", async (req, res) => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
      include: { translations: true }
    });
    res.json(blogs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/blogs/:id", async (req, res) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: req.params.id },
      include: { translations: true }
    });
    if (!blog) return res.status(404).json({ error: "Not found" });
    res.json(blog);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- BLOGS (ADMIN) ---
router.post("/admin/blogs", authMiddleware, async (req, res) => {
  try {
    if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
    const { title, category, imageUrl, content, published, translations } = req.body;
    const blog = await prisma.blog.create({
      data: {
        title,
        category,
        imageUrl,
        content,
        published,
        translations: {
          create: translations?.map((t: any) => ({
            languageCode: t.languageCode,
            title: t.title,
            content: t.content
          })) || []
        }
      }
    });
    res.json(blog);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/admin/blogs/:id", authMiddleware, async (req, res) => {
  try {
    if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
    const { title, category, imageUrl, content, published, translations } = req.body;
    
    const blog = await prisma.blog.update({
      where: { id: req.params.id },
      data: {
        title,
        category,
        imageUrl,
        content,
        published
      }
    });

    if (translations) {
      await prisma.blogTranslation.deleteMany({
        where: { blogId: req.params.id }
      });
      for (const trans of translations) {
        await prisma.blogTranslation.create({
          data: {
            blogId: req.params.id,
            languageCode: trans.languageCode,
            title: trans.title,
            content: trans.content
          }
        });
      }
    }

    res.json(blog);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/admin/blogs/:id", authMiddleware, async (req, res) => {
  try {
    if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
    await prisma.blog.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- COURSE BUNDLES (PUBLIC) ---
router.get("/public/course-bundles", async (req, res) => {
  try {
    const bundles = await prisma.courseBundle.findMany({
      where: { isActive: true },
      include: {
        courses: { include: { course: true } },
        translations: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bundles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- COURSE BUNDLES (ADMIN) ---
router.get("/admin/course-bundles", authMiddleware, async (req, res) => {
  try {
    if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
    const bundles = await prisma.courseBundle.findMany({
      include: {
        courses: { include: { course: true } },
        translations: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bundles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/admin/course-bundles", authMiddleware, async (req, res) => {
  try {
    if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
    const { title, description, price, realPrice, imageUrl, bannerVideoUrl, isActive, isFeatured, courses, translations } = req.body;
    
    const bundle = await prisma.courseBundle.create({
      data: {
        title, description, price: parseFloat(price), realPrice: realPrice ? parseFloat(realPrice) : null, imageUrl, bannerVideoUrl, isActive, isFeatured,
        courses: {
          create: (courses || []).map((courseId: string) => ({ courseId }))
        },
        translations: {
          create: (translations || []).map((t: any) => ({
            languageCode: t.languageCode, title: t.title, description: t.description
          }))
        }
      }
    });

    res.json(bundle);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/admin/course-bundles/:id", authMiddleware, async (req, res) => {
  try {
    if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
    const { id } = req.params;
    const { title, description, price, realPrice, imageUrl, bannerVideoUrl, isActive, isFeatured, courses, translations } = req.body;
    
    // update primary info
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (realPrice !== undefined) updateData.realPrice = realPrice ? parseFloat(realPrice) : null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (bannerVideoUrl !== undefined) updateData.bannerVideoUrl = bannerVideoUrl;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

    const bundle = await prisma.courseBundle.update({ where: { id }, data: updateData });

    // update courses
    if (courses && Array.isArray(courses)) {
      await prisma.courseBundleItem.deleteMany({ where: { bundleId: id } });
      if (courses.length > 0) {
        await prisma.courseBundleItem.createMany({
          data: courses.map(courseId => ({ bundleId: id, courseId }))
        });
      }
    }

    // update translations
    if (translations) {
      await prisma.courseBundleTranslation.deleteMany({ where: { bundleId: id } });
      for (const t of translations) {
        await prisma.courseBundleTranslation.create({
          data: { bundleId: id, languageCode: t.languageCode, title: t.title, description: t.description }
        });
      }
    }

    res.json(bundle);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/admin/course-bundles/:id", authMiddleware, async (req, res) => {
  try {
    if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
    await prisma.courseBundle.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- COURSES (ADMIN) ---
router.post("/admin/courses", authMiddleware, async (req, res) => {
  try {
    if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
    const { 
      lessons, translations, editions, labels, title, description, price, realPrice, imageUrl, bannerVideoUrl, 
      instructorId, categoryId, membershipIds, isFeatured, isUpcoming, isActive, 
      language, level, duration, meetingLink, meetingDate, meetingNotes, expiryDate
    } = req.body;
    
    let parsedInstructorId = instructorId === '' ? null : instructorId;
    let parsedCategoryId = categoryId === '' ? null : categoryId;
    let membershipConnections = Array.isArray(membershipIds) ? membershipIds.map((id:string) => ({ id })) : [];
    
    const course = await prisma.course.create({
      data: {
        title, description, price: parseFloat(price), realPrice: realPrice ? parseFloat(realPrice) : null, imageUrl, bannerVideoUrl,
        instructorId: parsedInstructorId,
        categoryId: parsedCategoryId,
        memberships: { connect: membershipConnections },
        labels: labels || [],
        isFeatured, isUpcoming, isActive, language, level, duration,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        meetingLink, meetingDate: meetingDate ? new Date(meetingDate) : null, meetingNotes
      }
    });
    if (lessons && lessons.length > 0) {
      for (const les of lessons) {
        await prisma.lesson.create({
          data: {
            title: les.title || "",
            videoUrl: les.videoUrl,
            content: les.content,
            duration: les.duration,
            description: les.description,
            showAboutCourse: les.showAboutCourse !== undefined ? les.showAboutCourse : true,
            order: les.order,
            courseId: course.id,
            translations: {
              create: (les.translations || []).filter((t: any) => !!t.title).map((t: any) => ({
                languageCode: t.languageCode, title: t.title, description: t.description || ''
              }))
            }
          }
        });
      }
    }
    if (translations && translations.length > 0) {
      for (const t of translations) {
        await prisma.courseTranslation.create({
          data: {
            courseId: course.id,
            languageCode: t.languageCode,
            title: t.title,
            description: t.description
          }
        });
      }
    }
    if (editions && editions.length > 0) {
      for (const ed of editions) {
        await prisma.courseEdition.create({
          data: {
            courseId: course.id,
            title: ed.title,
            content: ed.content,
            mode: ed.mode,
            date: ed.date ? new Date(ed.date) : null,
            totalSeats: ed.totalSeats ? parseInt(ed.totalSeats) : null,
            availableSeats: ed.availableSeats ? parseInt(ed.availableSeats) : null,
            translations: {
              create: (ed.translations || []).filter((t: any) => !!t.title).map((t: any) => ({
                languageCode: t.languageCode, title: t.title
              }))
            }
          }
        });
      }
    }
    res.json(course);
  } catch (err: any) {
    console.error("Error creating course:", err);
    res.status(500).json({ error: err.message });
  }
});
router.put("/admin/courses/:id", authMiddleware, async (req, res) => {
  try {
    console.log("PUT /admin/courses/:id CALLED for id:", req.params.id);
    console.log("PAYLOAD:", JSON.stringify(req.body, null, 2));
    if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
    const { 
      lessons, translations, editions, labels, title, description, price, realPrice, imageUrl, bannerVideoUrl, instructorId, categoryId, membershipIds,
      isFeatured, isUpcoming, isActive, language, level, duration, meetingLink, meetingDate, meetingNotes, expiryDate
    } = req.body;
    
    let parsedInstructorId = instructorId === '' ? null : instructorId;
    let parsedCategoryId = categoryId === '' ? null : categoryId;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (realPrice !== undefined) updateData.realPrice = realPrice === '' || !realPrice ? null : parseFloat(realPrice);
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (bannerVideoUrl !== undefined) updateData.bannerVideoUrl = bannerVideoUrl;
    if (instructorId !== undefined) updateData.instructorId = parsedInstructorId;
    if (categoryId !== undefined) updateData.categoryId = parsedCategoryId;
    if (membershipIds !== undefined) {
      updateData.memberships = { set: Array.isArray(membershipIds) ? membershipIds.map((id:string) => ({ id })) : [] };
    }
    if (labels !== undefined) updateData.labels = labels;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isUpcoming !== undefined) updateData.isUpcoming = isUpcoming;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (language !== undefined) updateData.language = language;
    if (level !== undefined) updateData.level = level;
    if (duration !== undefined) updateData.duration = duration;
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink;
    if (meetingDate !== undefined) updateData.meetingDate = meetingDate ? new Date(meetingDate) : null;
    if (meetingNotes !== undefined) updateData.meetingNotes = meetingNotes;

    const course = await prisma.course.update({ 
      where: { id: req.params.id }, 
      data: updateData
    });
    
    // Only sync lessons if they were explicitly provided in the payload
    if (lessons !== undefined) {
      await prisma.lesson.deleteMany({ where: { courseId: req.params.id } });
      if (lessons.length > 0) {
        for (const les of lessons) {
          await prisma.lesson.create({
            data: {
              title: les.title || "",
              videoUrl: les.videoUrl,
              content: les.content,
              duration: les.duration,
              description: les.description,
              showAboutCourse: les.showAboutCourse !== undefined ? les.showAboutCourse : true,
              order: les.order,
              courseId: course.id,
              translations: {
                create: (les.translations || []).filter((t: any) => !!t.title).map((t: any) => ({
                  languageCode: t.languageCode, title: t.title, description: t.description || ''
                }))
              }
            }
          });
        }
      }
    }

    // Only sync translations if they were explicitly provided
    if (translations !== undefined) {
      await prisma.courseTranslation.deleteMany({ where: { courseId: course.id } });
      if (translations.length > 0) {
        for (const t of translations) {
          await prisma.courseTranslation.create({
            data: {
              courseId: course.id,
              languageCode: t.languageCode,
              title: t.title,
              description: t.description
            }
          });
        }
      }
    }

    if (editions !== undefined) {
      await prisma.courseEdition.deleteMany({ where: { courseId: course.id } });
      if (editions.length > 0) {
        for (const ed of editions) {
          await prisma.courseEdition.create({
            data: {
              courseId: course.id,
              title: ed.title,
              content: ed.content,
              mode: ed.mode,
              date: ed.date ? new Date(ed.date) : null,
              totalSeats: ed.totalSeats ? parseInt(ed.totalSeats) : null,
              availableSeats: ed.availableSeats ? parseInt(ed.availableSeats) : null,
              translations: {
                create: (ed.translations || []).filter((t: any) => !!t.title).map((t: any) => ({
                  languageCode: t.languageCode, title: t.title
                }))
              }
            }
          });
        }
      }
    }

    console.log("Update success. Course:", course.id);
    res.json(course);
  } catch (err: any) {
    console.error("Error updating course:", err);
    res.status(500).json({ error: err.message });
  }
});
router.delete("/admin/courses/:id", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  await prisma.course.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

router.get("/admin/stats", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  
  const { period } = req.query;
  const now = new Date();
  let whereClause: any = {};
  
  if (period === 'today') {
      const today = new Date();
      today.setHours(0,0,0,0);
      whereClause = { createdAt: { gte: today } };
  } else if (period === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      whereClause = { createdAt: { gte: weekAgo } };
  } else if (period === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      whereClause = { createdAt: { gte: monthAgo } };
  } else if (period === '6months') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      whereClause = { createdAt: { gte: sixMonthsAgo } };
  } else if (period === 'yearly') {
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      whereClause = { createdAt: { gte: yearAgo } };
  }

  const coursePurchases = await prisma.userCourse.count({ where: whereClause });
  const membershipPurchases = await prisma.membershipOrder.count({ where: whereClause });
  const eventTicketSales = await prisma.booking.count({ where: whereClause });
  const inquiries = await prisma.inquiry.count({ where: whereClause });
  const totalUsers = await prisma.user.count({ where: whereClause });

  const orders = await prisma.order.aggregate({
      where: { ...whereClause, status: 'COMPLETED' },
      _sum: { total: true }
  });

  console.log("DEBUG STATS - FULL:", { 
      coursePurchases, membershipPurchases, eventTicketSales, inquiries, totalUsers, 
      ordersAggregate: orders, 
      revenue: orders._sum.total 
  });
  
  const topCourses = await prisma.userCourse.groupBy({
      by: ['courseId'],
      where: whereClause,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
  });
  const coursesWithDetails = await Promise.all(topCourses.map(async (c) => {
      const course = await prisma.course.findUnique({ where: { id: c.courseId } });
      return { ...course, count: c._count.id };
  }));

  const topMemberships = await prisma.membershipOrder.groupBy({
      by: ['membershipId'],
      where: whereClause,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
  });
  const membershipsWithDetails = await Promise.all(topMemberships.map(async (m) => {
      const membership = await prisma.membership.findUnique({ where: { id: m.membershipId } });
      return { ...membership, count: m._count.id };
  }));
  
  const topEvents = await prisma.booking.groupBy({
      by: ['eventId'],
      where: whereClause,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
  });
  const eventsWithDetails = await Promise.all(topEvents.map(async (e) => {
      const event = await prisma.event.findUnique({ where: { id: e.eventId } });
      return { ...event, count: e._count.id };
  }));

  res.json({
    coursePurchases,
    membershipPurchases,
    eventTicketSales,
    inquiries,
    totalUsers,
    revenue: orders._sum.total || 0,
    topCourses: coursesWithDetails,
    topMemberships: membershipsWithDetails,
    topEvents: eventsWithDetails,
    analyticsData: []
  });
});
  router.post("/admin/clear-data/:entity", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  const { entity } = req.params;
  try {
      if (entity === 'orders') {
        await prisma.orderItem.deleteMany({});
        await prisma.order.deleteMany({});
        await prisma.userCourse.deleteMany({});
        await prisma.membershipOrder.deleteMany({});
        await prisma.booking.deleteMany({});
      }
      else if (entity === 'courseOrders' || entity === 'userCourses') {
          const items = await prisma.orderItem.findMany({ where: { itemType: 'COURSE' } });
          for (const item of items) {
             await prisma.order.updateMany({ where: { id: item.orderId }, data: { total: { decrement: item.price } }});
          }
          await prisma.orderItem.deleteMany({ where: { itemType: 'COURSE' } });
          await prisma.userCourse.deleteMany({});
      }
      else if (entity === 'membershipOrders') {
          const items = await prisma.orderItem.findMany({ where: { itemType: 'MEMBERSHIP' } });
          for (const item of items) {
             await prisma.order.updateMany({ where: { id: item.orderId }, data: { total: { decrement: item.price } }});
          }
          await prisma.orderItem.deleteMany({ where: { itemType: 'MEMBERSHIP' } });
          await prisma.membershipOrder.deleteMany({});
      }
      else if (entity === 'bookings') {
          const items = await prisma.orderItem.findMany({ where: { itemType: 'EVENT' } });
          for (const item of items) {
             await prisma.order.updateMany({ where: { id: item.orderId }, data: { total: { decrement: item.price } }});
          }
          await prisma.orderItem.deleteMany({ where: { itemType: 'EVENT' } });
          await prisma.booking.deleteMany({});
      }
      else return res.status(400).json({ error: "Invalid entity" });

      // Clean up orphaned or 0-total orders
      await prisma.order.deleteMany({
          where: { OR: [ { items: { none: {} } }, { total: { lte: 0.01 } } ] }
      });

      res.json({ success: true });
  } catch(e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to clear data" });
  }
});

router.get("/admin/backup", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  
  // Create a simple JSON backup of all tables
  const backup = {
      courses: await prisma.course.findMany(),
      users: await prisma.user.findMany(),
      orders: await prisma.order.findMany(),
      memberships: await prisma.membership.findMany(),
      events: await prisma.event.findMany()
  };
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=backup.json');
  res.send(JSON.stringify(backup, null, 2));
});

router.post("/admin/restore", authMiddleware, upload.single("backup"), async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  if (!req.file) return res.status(400).json({ error: "No backup file" });

  try {
      const backup = JSON.parse(req.file.buffer.toString());
      
      // Simple restoration (requires careful ordering due to foreign keys)
      // NOTE: This is a basic implementation and might fail with complex relations
      await prisma.event.deleteMany({});
      await prisma.membership.deleteMany({});
      await prisma.order.deleteMany({});
      await prisma.user.deleteMany({});
      await prisma.course.deleteMany({});
      
      await prisma.course.createMany({ data: backup.courses });
      await prisma.user.createMany({ data: backup.users });
      await prisma.order.createMany({ data: backup.orders });
      await prisma.membership.createMany({ data: backup.memberships });
      await prisma.event.createMany({ data: backup.events });
      
      res.json({ success: true });
  } catch(e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to restore database" });
  }
});

router.get("/admin/users", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  try {
    const { rows: users } = await query('SELECT id, email, phone, name, role, "createdAt" FROM "User"');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.put("/admin/users/:id", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  const { name, email, role, password, phone } = req.body;
  
  const updateData: any = { name, email, role, phone };
  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: updateData
  });
  res.json(user);
});

router.delete("/admin/users/:id", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// --- MEMBERSHIPS (ADMIN) ---
router.post("/admin/memberships", authMiddleware, async (req, res) => {
  try {
    if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
    const { contents, editions, type, label, offerPrice, realPrice, imageUrl, categoryId, meetingLink, meetingDate, meetingNotes, expiryDate } = req.body;
    let parsedCategoryId = categoryId === '' ? null : categoryId;
    const membership = await prisma.membership.create({
      data: { 
        type, label, offerPrice, realPrice, imageUrl, categoryId: parsedCategoryId,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        meetingLink, meetingDate: meetingDate ? new Date(meetingDate) : null, meetingNotes
      }
    });
    if (contents && contents.length) {
      await prisma.membershipContent.createMany({
        data: contents.map((c: any) => ({ ...c, membershipId: membership.id }))
      });
    }
    if (editions && editions.length) {
      await prisma.membershipEdition.createMany({
        data: editions.map((e: any) => ({ ...e, membershipId: membership.id }))
      });
    }
    const full = await prisma.membership.findUnique({ where: { id: membership.id }, include: { contents: true, editions: true }});
    res.json(full);
  } catch (err: any) {
    console.error("Error creating membership:", err);
    res.status(500).json({ error: err.message });
  }
});
router.put("/admin/memberships/:id", authMiddleware, async (req, res) => {
  try {
    if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
    const { contents, editions, type, label, offerPrice, realPrice, imageUrl, categoryId, meetingLink, meetingDate, meetingNotes, expiryDate } = req.body;
    let parsedCategoryId = categoryId === '' ? null : categoryId;
    const membership = await prisma.membership.update({ 
      where: { id: req.params.id }, 
      data: { 
        type, label, offerPrice, realPrice, imageUrl, categoryId: parsedCategoryId,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        meetingLink, meetingDate: meetingDate ? new Date(meetingDate) : null, meetingNotes
      }
    });
    
    if (contents) {
      await prisma.membershipContent.deleteMany({ where: { membershipId: membership.id } });
      await prisma.membershipContent.createMany({
        data: contents.map((c: any) => ({ ...c, membershipId: membership.id }))
      });
    }
    if (editions) {
      await prisma.membershipEdition.deleteMany({ where: { membershipId: membership.id } });
      await prisma.membershipEdition.createMany({
        data: editions.map((e: any) => ({ ...e, membershipId: membership.id }))
      });
    }
    
    const full = await prisma.membership.findUnique({ where: { id: membership.id }, include: { contents: true, editions: true }});
    res.json(full);
  } catch (err: any) {
    console.error("Error updating membership:", err);
    res.status(500).json({ error: err.message });
  }
});
router.delete("/admin/memberships/:id", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  await prisma.membership.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// --- REVIEWS ---
router.get("/reviews", async (req, res) => {
  const { courseId, membershipId } = req.query;
  const where: any = {};
  if (courseId) where.courseId = String(courseId);
  if (membershipId) where.membershipId = String(membershipId);

  const reviews = await prisma.review.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, title: true } },
      membership: { select: { id: true, label: true, type: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(reviews);
});

router.post("/reviews", authMiddleware, async (req, res) => {
  const { rating, comment, courseId, membershipId } = req.body;
  const userId = (req as any).user.userId;
  
  if (!courseId && !membershipId) {
    console.error("Reviews POST error: Missing Target ID. Body:", req.body);
    return res.status(400).json({ error: "Missing Target ID" });
  }

  // Check if user has purchased the item
  try {
    if (courseId) {
      const cid = String(courseId);
      const enrollment = await prisma.userCourse.findFirst({
          where: { userId, courseId: cid }
      });
      if (!enrollment) {
          return res.status(403).json({ error: `You must purchase the course to review it.` });
      }
    } else if (membershipId) {
      const mid = String(membershipId);
      const order = await prisma.membershipOrder.findFirst({
          where: { userId, membershipId: mid }
      });
      if (!order) {
          return res.status(403).json({ error: `You must purchase the membership to review it.` });
      }
    }
  } catch (error) {
    console.error("Error checking purchase:", error);
    return res.status(500).json({ error: "Internal server error checking purchase status." });
  }
  
  const review = await prisma.review.create({
    data: {
      rating: Number(rating),
      comment,
      courseId: courseId ? String(courseId) : null,
      membershipId: membershipId ? String(membershipId) : null,
      userId
    }
  });
  res.json(review);
});

router.put("/admin/reviews/:id", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  const { rating, comment } = req.body;
  const review = await prisma.review.update({
    where: { id: req.params.id },
    data: { rating: Number(rating), comment }
  });
  res.json(review);
});

router.delete("/admin/reviews/:id", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  await prisma.review.delete({
    where: { id: req.params.id }
  });
  res.json({ success: true });
});

// --- ADMIN ROUTES ---
// I'll skip full admin crud for brevity, let's just make it possible to seed.
export async function seedDummyData() {
  const existingAdmin = await prisma.user.findUnique({ where: { email: "admin@lms.pro" } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: { email: "admin@lms.pro", name: "Admin", passwordHash, role: "ADMIN" }
    });
  }
  
  const courseCount = await prisma.course.count();
  if (courseCount === 0) {
      const course = await prisma.course.create({
        data: {
          title: "Advanced React & Next.js Masterclass",
          description: "Learn building modern web applications.",
          price: 99.99,
          imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80"
        }
      });
      
      await prisma.lesson.create({ data: { title: "Introduction", order: 1, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", content: "Welcome to this masterclass.", courseId: course.id } });
      await prisma.lesson.create({ data: { title: "Setup Environment", order: 2, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", content: "Install Node and VS Code.", courseId: course.id } });
  }

  const memCount = await prisma.membership.count();
  if (memCount === 0) {
      await prisma.membership.create({
        data: {
          type: "STANDARD",
          label: "All Access",
          offerPrice: 29.99,
          realPrice: 49.99,
          contents: {
             create: [
                { language: 'en', title: "Pro Access", description: "All content access.", benefits: "Every course\nEvery Event" }
             ]
          }
        }
      });
  }

  const evtCount = await prisma.event.count();
  if (evtCount === 0) {
      await prisma.event.create({
        data: {
          title: "Live React Architecture Q&A",
          description: "Join our experts for a live architecture session.",
          date: new Date(new Date().getTime() + 86400000 * 7),
          totalSeats: 100,
          availableSeats: 100,
          price: 15.00,
          location: "Zoom"
        }
      });
  }

  const sliderCount = await prisma.slider.count();
  if (sliderCount === 0) {
      await prisma.slider.create({
        data: {
          title: "Welcome Theme",
          imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000"
        }
      });
  }

  const studentCount = await prisma.user.count({ where: { email: "student@lms.pro" } });
  if (studentCount === 0) {
      const studentPwd = await bcrypt.hash("student123", 10);
      await prisma.user.create({
        data: {
          email: "student@lms.pro",
          name: "Sample Student",
          role: "USER",
          passwordHash: studentPwd
        }
      });
  }

  const manualConfigSetting = await prisma.setting.findUnique({ where: { key: 'MANUAL_PAYMENT_CONFIG' } });
  if (!manualConfigSetting) {
    await prisma.setting.create({
      data: {
        key: 'MANUAL_PAYMENT_CONFIG',
        value: JSON.stringify({
          enabled: true,
          bankDetails: "Bank Name: Nesrina Universal Bank\nAccount Number: 1009-8837-1122\nIFSC: NSBXX990\nAccount Holder: Nesrina LMS Admin",
          qrCodeUrl: "",
          instructions: "Please send the total payment to the bank coordinates shown above, then upload a screenshot or physical copy of your receipt/proof of transfer."
        })
      }
    });
  }

  const stripeConfigSetting = await prisma.setting.findUnique({ where: { key: 'STRIPE_CONFIG' } });
  if (!stripeConfigSetting) {
    await prisma.setting.create({
      data: {
        key: 'STRIPE_CONFIG',
        value: JSON.stringify({
          enabled: false,
          publishableKey: "",
          secretKey: ""
        })
      }
    });
  }
}


router.get("/admin/orders", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  try {
    const orders = await prisma.orderItem.findMany({
      include: {
        order: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        order: {
          createdAt: 'desc'
        }
      }
    });
    
    // We also need details of the purchased item
    const formatted = await Promise.all(orders.map(async (oi) => {
      let itemName = "Unknown";
      if (oi.itemType === 'COURSE') {
        const c = await prisma.course.findUnique({ where: { id: oi.itemId } });
        itemName = c?.title || "Course";
      } else if (oi.itemType === 'MEMBERSHIP') {
        const mc = await prisma.membershipContent.findFirst({ where: { membershipId: oi.itemId } });
        itemName = mc?.title || "Membership";
      } else if (oi.itemType === 'EVENT') {
        const e = await prisma.event.findUnique({ where: { id: oi.itemId } });
        itemName = e?.title || "Event";
      } else if (oi.itemType === 'BUNDLE') {
        const b = await prisma.courseBundle.findUnique({ where: { id: oi.itemId } });
        itemName = b?.title || "Course Bundle";
      }
      return {
        id: oi.id,
        orderId: oi.orderId,
        user: oi.order.user,
        itemType: oi.itemType,
        itemName,
        price: oi.price,
        status: oi.order.status,
        createdAt: oi.order.createdAt,
        billingDetails: oi.order.billingDetails,
        paymentMethod: oi.order.paymentMethod,
        paymentProofUrl: oi.order.paymentProofUrl,
        rejectReason: oi.order.rejectReason
      };
    }));
    
    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/admin/orders/pending", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  try {
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          paymentMethod: 'MANUAL',
          status: { in: ['PENDING', 'REJECTED'] }
        }
      },
      include: {
        order: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        order: {
          createdAt: 'desc'
        }
      }
    });

    const formatted = await Promise.all(orderItems.map(async (oi) => {
      let itemName = "Unknown";
      if (oi.itemType === 'COURSE') {
        const c = await prisma.course.findUnique({ where: { id: oi.itemId } });
        itemName = c?.title || "Course";
      } else if (oi.itemType === 'MEMBERSHIP') {
        const mc = await prisma.membershipContent.findFirst({ where: { membershipId: oi.itemId } });
        itemName = mc?.title || "Membership";
      } else if (oi.itemType === 'EVENT') {
        const e = await prisma.event.findUnique({ where: { id: oi.itemId } });
        itemName = e?.title || "Event";
      } else if (oi.itemType === 'BUNDLE') {
        const b = await prisma.courseBundle.findUnique({ where: { id: oi.itemId } });
        itemName = b?.title || "Course Bundle";
      }
      return {
        id: oi.id,
        orderId: oi.orderId,
        user: oi.order.user,
        itemType: oi.itemType,
        itemName,
        price: oi.price,
        status: oi.order.status,
        createdAt: oi.order.createdAt,
        billingDetails: oi.order.billingDetails,
        paymentMethod: oi.order.paymentMethod,
        paymentProofUrl: oi.order.paymentProofUrl,
        rejectReason: oi.order.rejectReason
      };
    }));
    
    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/admin/orders/:id/status", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  try {
    const { id } = req.params;
    const { status, rejectReason } = req.body; // COMPLETED or REJECTED, and optional rejectReason
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, user: true }
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    await prisma.order.update({ 
      where: { id }, 
      data: { 
        status,
        rejectReason: status === 'REJECTED' ? (rejectReason || "Payment verification failed.") : null
      } 
    });
    
    // If approved, provision the items
    if (status === 'COMPLETED' && order.status !== 'COMPLETED') {
      const todayDate = new Date().toLocaleDateString();
      for (const item of order.items) {
        if (item.itemType === "COURSE") {
          const existing = await prisma.userCourse.findUnique({
            where: { userId_courseId: { userId: order.userId, courseId: item.itemId } }
          });
          if (!existing) {
            const c = await prisma.course.findUnique({ where: { id: item.itemId } });
            await prisma.userCourse.create({ data: { userId: order.userId, courseId: item.itemId, expiresAt: c?.expiryDate || null } });
            if (c) sendAutomatedEmail(order.userId, 'COURSE_PURCHASE', { course_name: c.title, price: String(item.price), date: todayDate });
          }
        } else if (item.itemType === "MEMBERSHIP") {
          const membership = await prisma.membership.findUnique({ where: { id: item.itemId } });
          if (membership) {
            await prisma.membershipOrder.create({ data: { userId: order.userId, membershipId: membership.id, editionId: item.editionId || null, expiresAt: membership.expiryDate || null } });
            if (item.editionId) await prisma.membershipEdition.update({ where: { id: item.editionId }, data: { availableSeats: { decrement: 1 } } });
            sendAutomatedEmail(order.userId, 'MEMBERSHIP_PURCHASE', { membership_name: membership.label || membership.type, price: String(item.price), date: todayDate });
          }
        } else if (item.itemType === "EVENT") {
          await prisma.booking.create({ data: { userId: order.userId, eventId: item.itemId } });
          await prisma.event.update({ where: { id: item.itemId }, data: { availableSeats: { decrement: 1 } } });
          const evt = await prisma.event.findUnique({ where: { id: item.itemId } });
          if (evt) sendAutomatedEmail(order.userId, 'EVENT_BOOKING', { event_name: evt.title, date: todayDate });
        } else if (item.itemType === "BUNDLE") {
          const bundle = await prisma.courseBundle.findUnique({ where: { id: item.itemId }, include: { courses: { include: { course: true } } } });
          if (bundle) {
            for (const bundleItem of bundle.courses) {
              const existing = await prisma.userCourse.findUnique({ where: { userId_courseId: { userId: order.userId, courseId: bundleItem.courseId } } });
              if (!existing) {
                await prisma.userCourse.create({ data: { userId: order.userId, courseId: bundleItem.courseId, expiresAt: bundleItem.course?.expiryDate || null } });
              }
            }
          }
        }
      }
    }
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status or similar can be added here if needed in the future

// --- LEADS / CONTACT US ---
router.post("/leads", async (req, res) => {
  const { name, email, message, source } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const lead = await prisma.lead.create({
      data: { name, email, message, source: source || "CONTACT_FORM" }
    });

    try {
      const emailConfig = await prisma.setting.findUnique({ where: { key: 'SMTP_CONFIG' } });
      const adminEmail = req.body.adminEmail || (emailConfig ? JSON.parse(emailConfig.value).user : "no-reply@example.com"); // Fallback

      await sendEmail(
        adminEmail, // Send the lead to the admin's email
        `New Contact Us Message from ${name}`,
        `<h3>New Message Received</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>`
      );
    } catch (emailErr) {
      console.error("Failed to send lead email:", emailErr);
    }

    res.json(lead);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/admin/leads", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(leads);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

import admin from 'firebase-admin';

// Simple global log to store recent notifications for client polling/fallback
if (!(global as any).notificationLog) {
  (global as any).notificationLog = [];
}

router.get("/notifications/active", async (req, res) => {
  const log = (global as any).notificationLog || [];
  res.json(log);
});

router.post("/admin/notifications/send", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  
  const { title, body, url } = req.body;
  if (!title || !body) return res.status(400).json({ error: "Title and body are required" });

  try {
     const settings = await prisma.setting.findUnique({ where: { key: 'FIREBASE_CONFIG' } });
     if (!settings) return res.status(400).json({ error: "Firebase config missing" });
     const config = JSON.parse(settings.value);

     // Log notification globally for client-side pulling fallback
     const newNotif = {
        id: Math.random().toString(36).substring(2, 9),
        title,
        body,
        url: url || "/",
        createdAt: Date.now()
     };
     if (!(global as any).notificationLog) {
        (global as any).notificationLog = [];
     }
     (global as any).notificationLog.push(newNotif);
     if ((global as any).notificationLog.length > 50) {
        (global as any).notificationLog.shift();
     }

     const tokens = await prisma.pushToken.findMany({ select: { token: true } });
     const tokenList = tokens.map(t => t.token);
     if (tokenList.length === 0) return res.status(400).json({ error: "No subscribers found to send notifications to." });

     // Separate actual FCM tokens vs local simulated tokens
     const genuineTokens = tokenList.filter(t => !t.startsWith("local_simulated_"));
     let successCount = tokenList.length - genuineTokens.length; // Simulated subscribers always receive them via client-side polling
     let failureCount = 0;

     if (genuineTokens.length > 0 && config.serviceAccountJson) {
        const actualAdmin = admin.apps ? admin : (admin as any).default;

        if (!actualAdmin.apps.length) {
          actualAdmin.initializeApp({
            credential: actualAdmin.credential.cert(JSON.parse(config.serviceAccountJson))
          });
        }

        const payload = {
           notification: {
              title,
              body
           },
           data: {
              url: url || "/"
           },
           tokens: genuineTokens
        };

        try {
           const response = await actualAdmin.messaging().sendEachForMulticast(payload);
           successCount += response.successCount;
           failureCount += response.failureCount;
        } catch (fcmErr) {
           console.error("FCM Send attempt failed, falling back to local push stream:", fcmErr);
           // Handle case where credentials are bad but we still delivered to the client via fallback
        }
     }

     res.json({ success: true, successCount, failureCount });
  } catch (error) {
     console.error(error);
     res.status(500).json({ error: "Failed to send notifications. Check your Service Account JSON and configuration." });
  }
});

router.post("/notifications/subscribe", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Token is required" });
  
  let user = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
     const jwtToken = authHeader.substring(7);
     try {
       const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwt";
       const decoded = jwt.verify(jwtToken, JWT_SECRET) as any;
       user = await prisma.user.findUnique({ where: { id: decoded.id } });
     } catch (err) {}
  }

  try {
     const existing = await prisma.pushToken.findUnique({ where: { token } });
     if (!existing) {
       await prisma.pushToken.create({
          data: {
             token,
             userId: user ? user.id : null
          }
       });
     } else if (user && existing.userId !== user.id) {
       await prisma.pushToken.update({
          where: { token },
          data: { userId: user.id }
       });
     }
     res.json({ success: true });
  } catch (error) {
     console.error(error);
     res.status(500).json({ error: "Failed to save token" });
  }
});

// --- CATCH ALL FOR MISSING API ROUTES ---
router.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found: " + req.method + " " + req.originalUrl });
});

export default router;
