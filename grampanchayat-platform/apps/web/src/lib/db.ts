import { prisma } from './prisma';
import type { UserRole } from './auth';
import bcrypt from 'bcryptjs';

export const PrismaUserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;
export type PrismaUserRole = typeof PrismaUserRole[keyof typeof PrismaUserRole];

export const CertificateType = {
  BIRTH: 'BIRTH',
  DEATH: 'DEATH',
  INCOME: 'INCOME',
  CASTE: 'CASTE',
  DOMICILE: 'DOMICILE',
  RESIDENCE: 'RESIDENCE',
} as const;
export type CertificateType = typeof CertificateType[keyof typeof CertificateType];

export const ApplicationStatus = {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];

export const ComplaintStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;
export type ComplaintStatus = typeof ComplaintStatus[keyof typeof ComplaintStatus];

// ─── Interfaces (Mapped to original UI/API types) ─────────────────────────────
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
  latitude?: number;
  longitude?: number;
}

// ─── DB SEEDING UTILITY ────────────────────────────────────────────────────────
// Run during initDb to populate PostgreSQL if no user table records exist.
export async function initDb(): Promise<void> {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) return; // DB already has data

    const hashedPin = await bcrypt.hash('1234', 10);

    // 1. Create Default Config Settings
    const defaultGp = await prisma.gpConfig.create({
      data: {
        gp_name: 'Wandhale Gram Panchayat',
        gp_name_marathi: 'वांधळे ग्रामपंचायत',
        district: 'Nagpur',
        taluka: 'Ramtek',
        state: 'Maharashtra',
        pincode: '441106',
        address: 'Gram Panchayat Office, Wandhale, Ramtek, Nagpur',
        population: 5240,
        ward_count: 6,
        theme_color: '#FF6600',
        sms_provider: 'MSG91',
        sms_api_key: 'MOCK_API_KEY_12345',
        sms_sender_id: 'GMPNCH',
        enable_aadhaar_verify: true,
        enable_digilocker: false,
        enable_dsc_signing: false,
        dsc_signer_name: 'Suresh Wankhede (Gram Sevak)',
      },
    });

    // 2. Create Users
    const superAdmin = await prisma.user.create({
      data: {
        name: 'Suresh Wankhede',
        mobile: '9876543210',
        hashed_pin: hashedPin,
        role: PrismaUserRole.SUPER_ADMIN,
        is_verified: true,
        consent_given: true,
        consent_given_at: new Date(),
      },
    });

    const adminWard1 = await prisma.user.create({
      data: {
        name: 'Ramesh Patil',
        mobile: '9876543211',
        hashed_pin: hashedPin,
        role: PrismaUserRole.ADMIN,
        ward_no: 1,
        is_verified: true,
        consent_given: true,
        consent_given_at: new Date(),
      },
    });

    await prisma.user.create({
      data: {
        name: 'Maruti Rao',
        mobile: '9876543212',
        hashed_pin: hashedPin,
        role: PrismaUserRole.ADMIN,
        ward_no: 2,
        is_verified: true,
        consent_given: true,
        consent_given_at: new Date(),
      },
    });

    const citizenUser = await prisma.user.create({
      data: {
        name: 'Ram Pawar',
        mobile: '9876543213',
        hashed_pin: hashedPin,
        role: PrismaUserRole.USER,
        ward_no: 1,
        is_verified: true,
        consent_given: true,
        consent_given_at: new Date(),
      },
    });

    // Link default GP config sarpanch/gramsevak FKs
    await prisma.gpConfig.update({
      where: { id: defaultGp.id },
      data: {
        sarpanch_user_id: adminWard1.id,
        gramsevak_user_id: superAdmin.id,
      },
    });

    // 3. Create Certificates
    await prisma.certificateApplication.createMany({
      data: [
        {
          user_id: citizenUser.id,
          type: CertificateType.INCOME,
          applicant_name: 'Ram Pawar',
          applicant_name_mr: 'राम पवार',
          applicant_mobile: '9876543213',
          address: 'Ward No 1, Wandhale',
          status: ApplicationStatus.PENDING,
          supporting_docs: '[]',
          ward_no: 1,
        },
        {
          user_id: citizenUser.id,
          type: CertificateType.BIRTH,
          applicant_name: 'Sanjay Deshmukh',
          applicant_name_mr: 'संजय देशमुख',
          applicant_mobile: '9876543213',
          address: 'Ward No 2, Wandhale',
          status: ApplicationStatus.PENDING,
          supporting_docs: '[]',
          ward_no: 2,
        },
        {
          user_id: citizenUser.id,
          type: CertificateType.DOMICILE,
          applicant_name: 'Sunita Gadkari',
          applicant_name_mr: 'सुनीता गडकरी',
          applicant_mobile: '9876543213',
          address: 'Ward No 1, Wandhale',
          status: ApplicationStatus.APPROVED,
          supporting_docs: '[]',
          ward_no: 1,
          approved_at: new Date(),
          approved_by: superAdmin.id,
          certificate_number: 'GP/2026/004812',
        },
      ],
    });

    // 4. Create Complaints
    await prisma.complaint.createMany({
      data: [
        {
          user_id: citizenUser.id,
          filer_name: 'Ram Pawar',
          filer_mobile: '9876543213',
          category: 'Water Supply',
          description: 'No water supply in Ward 1 pipeline since last 2 days.',
          ward_no: 1,
          status: ComplaintStatus.OPEN,
          photo_urls: '[]',
        },
        {
          user_id: citizenUser.id,
          filer_name: 'Ram Pawar',
          filer_mobile: '9876543213',
          category: 'Roads & Sanitation',
          description: 'Pothole blockages at Ward 2 main intersection causing minor traffic accidents.',
          ward_no: 2,
          status: ComplaintStatus.IN_PROGRESS,
          photo_urls: '[]',
        },
      ],
    });

    // 5. Create Initial Audit Logs
    await prisma.auditLog.create({
      data: {
        user_id: superAdmin.id,
        action: 'SYSTEM_BOOT',
        entity_type: 'SYSTEM',
        entity_id: 'SYSTEM_ID',
        new_value: { info: 'System database initialized with seeded PostgreSQL values' },
        ip_address: '127.0.0.1',
      },
    });

    console.log('PostgreSQL database seeded successfully with initial profiles!');
  } catch (error) {
    console.error('Database initialization seed error:', error);
  }
}

// ─── Users Queries ─────────────────────────────────────────────────────────────
export async function getUsers(): Promise<DbUser[]> {
  const users = await prisma.user.findMany();
  return users.map((u: {
    id: string;
    name: string;
    mobile: string;
    hashed_pin: string;
    role: string;
    ward_no: number | null;
    created_at: Date;
  }) => ({
    id: u.id,
    fullName: u.name,
    mobile: u.mobile,
    hashedPin: u.hashed_pin,
    role: u.role as UserRole,
    ward_no: u.ward_no ?? undefined,
    createdAt: u.created_at.toISOString(),
  }));
}

export async function findUserByMobile(mobile: string): Promise<DbUser | null> {
  const u = await prisma.user.findUnique({ where: { mobile } });
  if (!u) return null;
  return {
    id: u.id,
    fullName: u.name,
    mobile: u.mobile,
    hashedPin: u.hashed_pin,
    role: u.role as UserRole,
    ward_no: u.ward_no ?? undefined,
    createdAt: u.created_at.toISOString(),
  };
}

export async function saveUser(user: {
  fullName: string;
  mobile: string;
  hashedPin: string;
  role: UserRole;
  ward_no?: number;
  aadhaar?: string;
}): Promise<DbUser> {
  const u = await prisma.user.create({
    data: {
      name: user.fullName,
      mobile: user.mobile,
      hashed_pin: user.hashedPin,
      role: user.role as PrismaUserRole,
      ward_no: user.ward_no,
      aadhaar_last4: user.aadhaar || null,
      is_verified: true,
      consent_given: true,
      consent_given_at: new Date(),
    },
  });

  return {
    id: u.id,
    fullName: u.name,
    mobile: u.mobile,
    hashedPin: u.hashed_pin,
    role: u.role as UserRole,
    ward_no: u.ward_no ?? undefined,
    createdAt: u.created_at.toISOString(),
  };
}

// ─── Settings Queries ──────────────────────────────────────────────────────────
export async function getSettings(): Promise<DbSettings> {
  let config = await prisma.gpConfig.findFirst();
  if (!config) {
    // Fallback if config is missing
    config = await prisma.gpConfig.create({
      data: {
        gp_name: 'Wandhale Gram Panchayat',
        gp_name_marathi: 'वांधळे ग्रामपंचायत',
        district: 'Nagpur',
        taluka: 'Ramtek',
        pincode: '441106',
        address: 'Wandhale',
        population: 5240,
        ward_count: 6,
      },
    });
  }

  return {
    smsProvider: config.sms_provider,
    smsApiKey: config.sms_api_key,
    smsSenderId: config.sms_sender_id,
    enableAadhaarVerification: config.enable_aadhaar_verify,
    enableDigilockerSync: config.enable_digilocker,
    enableDscSigning: config.enable_dsc_signing,
    dscSignerName: config.dsc_signer_name,
  };
}

export async function saveSettings(settings: DbSettings): Promise<void> {
  const config = await prisma.gpConfig.findFirst();
  if (!config) return;

  await prisma.gpConfig.update({
    where: { id: config.id },
    data: {
      sms_provider: settings.smsProvider,
      sms_api_key: settings.smsApiKey,
      sms_sender_id: settings.smsSenderId,
      enable_aadhaar_verify: settings.enableAadhaarVerification,
      enable_digilocker: settings.enableDigilockerSync,
      enable_dsc_signing: settings.enableDscSigning,
      dsc_signer_name: settings.dscSignerName,
    },
  });
}

// ─── Audit Log Queries ─────────────────────────────────────────────────────────
export async function getAuditLogs(): Promise<DbAuditLog[]> {
  const logs = await prisma.auditLog.findMany({
    include: { user: true },
    orderBy: { created_at: 'desc' },
  });

  return logs.map((l: {
    id: string;
    user_id: string;
    user: { name: string; role: string };
    action: string;
    entity_type: string;
    new_value: unknown;
    ip_address: string | null;
    created_at: Date;
  }) => ({
    id: l.id,
    userId: l.user_id,
    userName: l.user.name,
    userRole: l.user.role as UserRole,
    action: l.action,
    details: `${l.entity_type} Update. Details: ${JSON.stringify(l.new_value)}`,
    ipAddress: l.ip_address || '127.0.0.1',
    createdAt: l.created_at.toISOString(),
  }));
}

export async function addAuditLog(log: Omit<DbAuditLog, 'id' | 'createdAt'>): Promise<void> {
  await prisma.auditLog.create({
    data: {
      user_id: log.userId,
      action: log.action,
      entity_type: 'ACTION_LOG',
      entity_id: log.userId,
      new_value: { details: log.details },
      ip_address: log.ipAddress,
    },
  });
}

// ─── Certificates Queries ──────────────────────────────────────────────────────
export async function getCertificates(): Promise<DbCertificate[]> {
  const certs = await prisma.certificateApplication.findMany({
    include: { applicant: true },
    orderBy: { applied_at: 'desc' },
  });

  return certs.map((c) => ({
    id: c.id,
    applicantName: c.applicant_name || c.applicant?.name || 'Applicant',
    applicantNameMr: c.applicant_name_mr || '',
    type: c.type.toString(),
    status: c.status as DbCertificate['status'],
    ward_no: c.ward_no ?? 1,
    appliedAt: c.applied_at.toISOString(),
    approvedAt: c.approved_at?.toISOString(),
    approvedBy: c.approved_by || undefined,
    certificateNumber: c.certificate_number || undefined,
  }));
}

export async function saveCertificate(cert: Omit<DbCertificate, 'id' | 'appliedAt'>): Promise<DbCertificate> {
  const c = await prisma.certificateApplication.create({
    data: {
      user_id: cert.approvedBy || undefined,
      type: cert.type as CertificateType,
      applicant_name: cert.applicantName,
      applicant_name_mr: cert.applicantNameMr,
      applicant_mobile: '9876543213',
      address: 'Ward No ' + cert.ward_no + ', Wandhale',
      status: cert.status as ApplicationStatus,
      supporting_docs: '[]',
      ward_no: cert.ward_no,
    },
  });

  return {
    id: c.id,
    applicantName: cert.applicantName,
    applicantNameMr: c.applicant_name_mr,
    type: c.type,
    status: cert.status,
    ward_no: c.ward_no ?? 1,
    appliedAt: c.applied_at.toISOString(),
  };
}

export async function updateCertificateStatus(
  certId: string,
  status: DbCertificate['status'],
  updaterName: string
): Promise<void> {
  const user = await prisma.user.findFirst({ where: { name: updaterName } });

  const updateData: {
    status: ApplicationStatus;
    approved_at?: Date;
    approved_by?: string;
    certificate_number?: string;
  } = {
    status: status as ApplicationStatus,
  };

  if (status === 'APPROVED') {
    updateData.approved_at = new Date();
    updateData.approved_by = user?.id;
    updateData.certificate_number = 'GP/2026/' + Math.floor(100000 + Math.random() * 900000).toString();
  }

  await prisma.certificateApplication.update({
    where: { id: certId },
    data: updateData,
  });
}

// ─── Complaints Queries ────────────────────────────────────────────────────────
export async function getComplaints(): Promise<DbComplaint[]> {
  const comps = await prisma.complaint.findMany({
    include: { filer: true },
    orderBy: { created_at: 'desc' },
  });

  return comps.map((c) => ({
    id: c.id,
    filerName: c.filer_name || c.filer?.name || 'Villager',
    category: c.category,
    description: c.description,
    ward_no: c.ward_no ?? 1,
    status: c.status as DbComplaint['status'],
    createdAt: c.created_at.toISOString(),
    latitude: c.geo_lat ? Number(c.geo_lat) : undefined,
    longitude: c.geo_lng ? Number(c.geo_lng) : undefined,
  }));
}

export async function saveComplaint(complaint: Omit<DbComplaint, 'id' | 'createdAt'>): Promise<DbComplaint> {
  const user = await prisma.user.findFirst({ where: { name: complaint.filerName } });

  const c = await prisma.complaint.create({
    data: {
      user_id: user?.id || undefined,
      filer_name: complaint.filerName,
      filer_mobile: '9876543213',
      category: complaint.category,
      description: complaint.description,
      ward_no: complaint.ward_no,
      status: complaint.status as ComplaintStatus,
      geo_lat: complaint.latitude || null,
      geo_lng: complaint.longitude || null,
      photo_urls: '[]',
    },
  });

  return {
    id: c.id,
    filerName: complaint.filerName,
    category: complaint.category,
    description: complaint.description,
    ward_no: c.ward_no ?? 1,
    status: complaint.status,
    createdAt: c.created_at.toISOString(),
    latitude: c.geo_lat ? Number(c.geo_lat) : undefined,
    longitude: c.geo_lng ? Number(c.geo_lng) : undefined,
  };
}

export async function updateComplaintStatus(
  complaintId: string,
  status: DbComplaint['status']
): Promise<void> {
  await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      status: status as ComplaintStatus,
    },
  });
}
