import fs from 'fs/promises';
import path from 'path';
import type { UserRole } from './auth';

// ─── Interfaces ───────────────────────────────────────────────────────────────
export interface DbUser {
  id: string;
  fullName: string;
  mobile: string;
  hashedPin: string;
  role: UserRole;
  ward_no?: number;
  createdAt: string;
}

export interface DbSettings {
  smsProvider: string;
  smsApiKey: string;
  smsSenderId: string;
  enableAadhaarVerification: boolean;
  enableDigilockerSync: boolean;
  enableDscSigning: boolean;
  dscSignerName: string;
}

export interface DbAuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface DbCertificate {
  id: string;
  applicantName: string;
  applicantNameMr: string;
  type: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  ward_no: number;
  appliedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  certificateNumber?: string;
}

export interface DbComplaint {
  id: string;
  filerName: string;
  category: string;
  description: string;
  ward_no: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
}

interface DatabaseSchema {
  users: DbUser[];
  settings: DbSettings;
  auditLogs: DbAuditLog[];
  certificates: DbCertificate[];
  complaints: DbComplaint[];
}

const DB_FILE = path.join(process.cwd(), 'db.json');

const DEFAULT_SETTINGS: DbSettings = {
  smsProvider: 'MSG91',
  smsApiKey: 'MOCK_API_KEY_12345',
  smsSenderId: 'GMPNCH',
  enableAadhaarVerification: true,
  enableDigilockerSync: false,
  enableDscSigning: false,
  dscSignerName: 'Suresh Wankhede (Gram Sevak)',
};

// Seed initial users & records
const SEED_USERS = [
  {
    id: 'user-super-admin',
    fullName: 'Suresh Wankhede',
    mobile: '9876543210',
    // Hash for PIN "1234"
    hashedPin: '$2a$10$qR69a.t3fP18104E9M/BJuC5Wp815p0Vee0.uV4p3iSgK471D1Oqu',
    role: 'SUPER_ADMIN' as UserRole,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-admin-ward1',
    fullName: 'Ramesh Patil',
    mobile: '9876543211',
    hashedPin: '$2a$10$qR69a.t3fP18104E9M/BJuC5Wp815p0Vee0.uV4p3iSgK471D1Oqu',
    role: 'ADMIN' as UserRole,
    ward_no: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-admin-ward2',
    fullName: 'Maruti Rao',
    mobile: '9876543212',
    hashedPin: '$2a$10$qR69a.t3fP18104E9M/BJuC5Wp815p0Vee0.uV4p3iSgK471D1Oqu',
    role: 'ADMIN' as UserRole,
    ward_no: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-citizen',
    fullName: 'Ram Pawar',
    mobile: '9876543213',
    hashedPin: '$2a$10$qR69a.t3fP18104E9M/BJuC5Wp815p0Vee0.uV4p3iSgK471D1Oqu',
    role: 'USER' as UserRole,
    ward_no: 1,
    createdAt: new Date().toISOString(),
  },
];

const SEED_CERTIFICATES: DbCertificate[] = [
  {
    id: 'cert-1',
    applicantName: 'Ram Pawar',
    applicantNameMr: 'राम पवार',
    type: 'INCOME',
    status: 'PENDING',
    ward_no: 1,
    appliedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'cert-2',
    applicantName: 'Sanjay Deshmukh',
    applicantNameMr: 'संजय देशमुख',
    type: 'BIRTH',
    status: 'PENDING',
    ward_no: 2,
    appliedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: 'cert-3',
    applicantName: 'Sunita Gadkari',
    applicantNameMr: 'सुनीता गडकरी',
    type: 'DOMICILE',
    status: 'APPROVED',
    ward_no: 1,
    appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'Suresh Wankhede',
    certificateNumber: 'GP/2026/004812',
  },
];

const SEED_COMPLAINTS: DbComplaint[] = [
  {
    id: 'comp-1',
    filerName: 'Ram Pawar',
    category: 'Water Supply',
    description: 'No water supply in Ward 1 pipeline since last 2 days.',
    ward_no: 1,
    status: 'OPEN',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'comp-2',
    filerName: 'Anil Shinde',
    category: 'Roads & Sanitation',
    description: 'Pothole blockages at Ward 2 main intersection causing minor traffic accidents.',
    ward_no: 2,
    status: 'IN_PROGRESS',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const SEED_AUDIT_LOGS: DbAuditLog[] = [
  {
    id: 'log-1',
    userId: 'user-super-admin',
    userName: 'Suresh Wankhede',
    userRole: 'SUPER_ADMIN',
    action: 'SYSTEM_BOOT',
    details: 'Database seeding completed successfully.',
    ipAddress: '127.0.0.1',
    createdAt: new Date().toISOString(),
  },
];

export async function initDb(): Promise<void> {
  try {
    await fs.access(DB_FILE);
  } catch {
    const defaultData: DatabaseSchema = {
      users: SEED_USERS,
      settings: DEFAULT_SETTINGS,
      auditLogs: SEED_AUDIT_LOGS,
      certificates: SEED_CERTIFICATES,
      complaints: SEED_COMPLAINTS,
    };
    await fs.writeFile(DB_FILE, JSON.stringify(defaultData, null, 2));
  }
}

async function readDb(): Promise<DatabaseSchema> {
  await initDb();
  const raw = await fs.readFile(DB_FILE, 'utf-8');
  return JSON.parse(raw);
}

async function writeDb(data: DatabaseSchema): Promise<void> {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

// ─── Users Queries ─────────────────────────────────────────────────────────────
export async function getUsers(): Promise<DbUser[]> {
  const db = await readDb();
  return db.users;
}

export async function findUserByMobile(mobile: string): Promise<DbUser | null> {
  const users = await getUsers();
  return users.find((u) => u.mobile === mobile) ?? null;
}

export async function saveUser(user: {
  fullName: string;
  mobile: string;
  hashedPin: string;
  role: UserRole;
  ward_no?: number;
}): Promise<DbUser> {
  const db = await readDb();

  const existing = db.users.find((u) => u.mobile === user.mobile);
  if (existing) {
    throw new Error('User with this mobile number already exists');
  }

  const newUser: DbUser = {
    id: Date.now().toString(),
    ...user,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  await writeDb(db);
  return newUser;
}

// ─── Settings Queries ──────────────────────────────────────────────────────────
export async function getSettings(): Promise<DbSettings> {
  const db = await readDb();
  return db.settings;
}

export async function saveSettings(settings: DbSettings): Promise<void> {
  const db = await readDb();
  db.settings = settings;
  await writeDb(db);
}

// ─── Audit Log Queries ─────────────────────────────────────────────────────────
export async function getAuditLogs(): Promise<DbAuditLog[]> {
  const db = await readDb();
  return db.auditLogs;
}

export async function addAuditLog(log: Omit<DbAuditLog, 'id' | 'createdAt'>): Promise<void> {
  const db = await readDb();
  const newLog: DbAuditLog = {
    id: 'log-' + Date.now().toString(),
    ...log,
    createdAt: new Date().toISOString(),
  };
  db.auditLogs.unshift(newLog); // Put new logs first
  await writeDb(db);
}

// ─── Certificates Queries ──────────────────────────────────────────────────────
export async function getCertificates(): Promise<DbCertificate[]> {
  const db = await readDb();
  return db.certificates;
}

export async function saveCertificate(cert: Omit<DbCertificate, 'id' | 'appliedAt'>): Promise<DbCertificate> {
  const db = await readDb();
  const newCert: DbCertificate = {
    id: 'cert-' + Date.now().toString(),
    ...cert,
    appliedAt: new Date().toISOString(),
  };
  db.certificates.unshift(newCert);
  await writeDb(db);
  return newCert;
}

export async function updateCertificateStatus(
  certId: string,
  status: DbCertificate['status'],
  updaterName: string
): Promise<void> {
  const db = await readDb();
  const cert = db.certificates.find((c) => c.id === certId);
  if (!cert) throw new Error('Certificate application not found');

  cert.status = status;
  if (status === 'APPROVED') {
    cert.approvedAt = new Date().toISOString();
    cert.approvedBy = updaterName;
    cert.certificateNumber = 'GP/2026/' + Math.floor(100000 + Math.random() * 900000).toString();
  }
  await writeDb(db);
}

// ─── Complaints Queries ────────────────────────────────────────────────────────
export async function getComplaints(): Promise<DbComplaint[]> {
  const db = await readDb();
  return db.complaints;
}

export async function saveComplaint(complaint: Omit<DbComplaint, 'id' | 'createdAt'>): Promise<DbComplaint> {
  const db = await readDb();
  const newComp: DbComplaint = {
    id: 'comp-' + Date.now().toString(),
    ...complaint,
    createdAt: new Date().toISOString(),
  };
  db.complaints.unshift(newComp);
  await writeDb(db);
  return newComp;
}

export async function updateComplaintStatus(
  complaintId: string,
  status: DbComplaint['status']
): Promise<void> {
  const db = await readDb();
  const complaint = db.complaints.find((c) => c.id === complaintId);
  if (!complaint) throw new Error('Complaint not found');

  complaint.status = status;
  await writeDb(db);
}
