# 🏛️ Gram Panchayat Digital Platform
## Master Project Document — Research, Architecture & Agent Rules

---

## 📌 TABLE OF CONTENTS
1. [Project Overview](#1-project-overview)
2. [Pre-Build Checklist](#2-pre-build-checklist)
3. [Tech Stack Decision](#3-tech-stack-decision)
4. [System Architecture](#4-system-architecture)
5. [Database Schema](#5-database-schema)
6. [Feature Modules](#6-feature-modules)
7. [Agent Rules & Permission System](#7-agent-rules--permission-system)
8. [Folder Structure](#8-folder-structure)
9. [API Design](#9-api-design)
10. [Security Rules](#10-security-rules)
11. [Deployment Architecture](#11-deployment-architecture)
12. [Legal & Compliance](#12-legal--compliance)
13. [Build Order / Sprint Plan](#13-build-order--sprint-plan)
14. [PWA — Progressive Web App](#14-pwa--progressive-web-app)
15. [Data Legal Safety](#15-data-legal-safety)
16. [Pricing Strategy](#16-pricing-strategy)

---

## 1. PROJECT OVERVIEW

### What We Are Building
A **multi-tenant, self-hostable Gram Panchayat Digital Platform** that can be sold/deployed to any Gram Panchayat in Maharashtra (and later pan-India). Each Panchayat gets its own branded instance.

### Business Model
- One-time setup fee per Gram Panchayat
- Annual maintenance contract
- GeM Portal listing for easy government procurement
- White-label per district/taluka (bulk licensing)

### Core Goals
| Goal | Description |
|------|-------------|
| Citizen-First | Simple UI for low digital literacy users |
| Marathi First | All UI in Marathi, English toggle available |
| Transparent | All funds, projects, members visible publicly |
| Offline-Ready | Works on 2G/3G (PWA, lazy loading) |
| Multi-tenant | One codebase → many panchayats |
| Agent-Driven | AI agents handle repetitive admin tasks |

---

## 2. PRE-BUILD CHECKLIST

### 2.1 Legal / Business Pre-requisites
- [ ] Register company (Private Ltd or OPC recommended)
- [ ] Get GST Number
- [ ] Register on **GeM Portal** (gem.gov.in) as IT service seller
- [ ] Register on **MahaTenders** (mahatenders.gov.in) as vendor
- [ ] Get **Class 3 DSC** (Digital Signature Certificate)
- [ ] Prepare MOU / Agreement template for Gram Panchayat
- [ ] Prepare pricing sheet (setup + AMC)

### 2.2 Technical Pre-requisites
- [ ] Domain strategy decided (subdomain per GP: `{village}.gramportal.in` or custom)
- [ ] Hosting vendor selected (see deployment section)
- [ ] SSL certificate strategy (wildcard SSL for subdomains)
- [ ] SMS Gateway account (Fast2SMS / MSG91 / Textlocal)
- [ ] Email SMTP configured (SendGrid / AWS SES)
- [ ] Payment gateway (Razorpay — government-friendly, supports UPI)
- [ ] WhatsApp Business API account (optional but high-value)
- [ ] S3-compatible object storage for documents
- [ ] CDN for static assets
- [ ] Backup strategy documented

### 2.3 Design Pre-requisites
- [ ] Marathi font selected (Noto Sans Devanagari — Google Fonts, free)
- [ ] Government color palette decided (saffron/green/white — tricolor theme)
- [ ] Logo template for each GP (auto-generated with GP name)
- [ ] Mobile-first wireframes approved
- [ ] Accessibility checklist (WCAG 2.1 AA minimum — government requirement)

### 2.4 Content Pre-requisites
- [ ] List of all 27,951 Maharashtra GPs with district/taluka mapping
- [ ] Default Marathi content templates for all pages
- [ ] Government scheme data (PM Awas, MGNREGA, etc.) pre-loaded
- [ ] Maharashtra Village Panchayat Act 1958 compliance checklist

---

## 3. TECH STACK DECISION

### Frontend
```
Framework:     Next.js 14 (App Router)
Language:      TypeScript
Styling:       Tailwind CSS + shadcn/ui
i18n:          next-intl (Marathi + English)
State:         Zustand (global) + React Query (server state)
Forms:         React Hook Form + Zod validation
PWA:           next-pwa (offline support, installable, push notifications — see Section 14)
Charts:        Recharts (budget/expenditure graphs)
Maps:          Leaflet.js (project geo-tagging)
```

### Backend
```
Runtime:       Node.js + Express OR Next.js API Routes
Language:      TypeScript
Auth:          NextAuth.js (JWT + session)
ORM:           Prisma
Validation:    Zod
Queue:         BullMQ (Redis-backed job queue)
Cron:          node-cron (scheduled reports)
File Upload:   Multer + S3
PDF Generate:  Puppeteer (certificate generation)
```

### Database
```
Primary DB:    PostgreSQL (via Supabase or self-hosted)
Cache:         Redis (sessions, rate limiting, queues)
Search:        PostgreSQL Full-Text Search (or Meilisearch for scale)
File Storage:  AWS S3 / Cloudflare R2 / MinIO (self-hosted)
```

### AI / Agent Layer
```
Agent Runtime: LangChain.js OR custom orchestrator
LLM:           Claude claude-sonnet-4-6 via Anthropic API
Vector DB:     pgvector (Postgres extension) for document search
Agent Tools:   Custom tools (see Agent Rules section)
```

### DevOps
```
Containerization:  Docker + Docker Compose
CI/CD:             GitHub Actions
Hosting:           Hetzner VPS (cost-effective for India) OR AWS
Reverse Proxy:     Nginx (wildcard subdomain routing)
SSL:               Let's Encrypt (wildcard cert via Certbot)
Monitoring:        Uptime Kuma + Grafana
Logging:           Winston + Loki
```

---

## 4. SYSTEM ARCHITECTURE

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    INTERNET / USERS                      │
└────────────────────────┬────────────────────────────────┘
                         │
                    ┌────▼────┐
                    │  Nginx  │  (Reverse Proxy + SSL + Subdomain Routing)
                    └────┬────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌──────▼─────┐  ┌────▼────┐
    │ Next.js │    │  Next.js   │  │ Next.js │
    │  GP 1   │    │   GP 2     │  │  GP N   │
    │(village1│    │(village2   │  │(villageN│
    │.gram.in)│    │.gram.in)   │  │.gram.in)│
    └────┬────┘    └──────┬─────┘  └────┬────┘
         └───────────────┼───────────────┘
                         │
              ┌──────────▼──────────┐
              │   API Layer         │
              │  (Next.js Routes    │
              │   or Express)       │
              └──────────┬──────────┘
                         │
         ┌───────────────┼──────────────────┐
         │               │                  │
    ┌────▼────┐    ┌──────▼─────┐    ┌──────▼─────┐
    │Postgres │    │   Redis    │    │  S3/Minio  │
    │(Primary │    │  (Cache +  │    │  (Files +  │
    │   DB)   │    │   Queue)   │    │   Docs)    │
    └─────────┘    └────────────┘    └────────────┘
                         │
              ┌──────────▼──────────┐
              │   AGENT LAYER       │
              │  (AI Orchestrator)  │
              │  - Certificate Agent│
              │  - Notification Agent│
              │  - Report Agent     │
              │  - Grievance Agent  │
              └─────────────────────┘
```

### 4.2 Multi-Tenant Strategy

**Approach: Shared Database, Separate Schema per Tenant**

```
postgres/
├── public/           ← shared tables (plans, gp_registry)
├── gp_nagpur_01/     ← schema for Nagpur GP 1
├── gp_nagpur_02/     ← schema for Nagpur GP 2
├── gp_pune_01/       ← schema for Pune GP 1
└── ...
```

Each Gram Panchayat = one PostgreSQL schema. Prisma middleware injects schema name from subdomain at request time.

### 4.3 Request Flow (Citizen applies for certificate)

```
Citizen → Form Submit
    → Next.js API Route
    → Middleware: Identify GP from subdomain
    → Middleware: Auth check (if required)
    → Zod validation
    → Prisma → GP Schema in Postgres
    → BullMQ → Certificate Queue
    → Agent picks up job
    → Agent asks PERMISSION (see Agent Rules)
    → If approved → Puppeteer generates PDF
    → Upload to S3
    → SMS/WhatsApp notification to citizen
    → Update DB status
    → Citizen downloads certificate
```

---

## 5. DATABASE SCHEMA

### Core Tables (per GP schema)

```sql
-- GRAM PANCHAYAT CONFIG
gp_config {
  id, gp_name, gp_name_marathi, district, taluka,
  sarpanch_name, gramsevak_name, contact_email,
  contact_phone, address, logo_url, ward_count,
  population, established_year, pincode,
  created_at, updated_at
}

-- USERS & ROLES
users {
  id, name, mobile, email, aadhaar_last4,
  role: [CITIZEN | OPERATOR | GRAMSEVAK | SARPANCH | ADMIN],
  ward_no, is_verified, created_at
}

-- CERTIFICATES
certificate_applications {
  id, user_id, type: [BIRTH|DEATH|INCOME|CASTE|DOMICILE|RESIDENCE],
  applicant_name, applicant_name_mr, dob, address,
  supporting_docs: jsonb, status: [PENDING|UNDER_REVIEW|APPROVED|REJECTED],
  remarks, certificate_url, applied_at, approved_at,
  approved_by (user_id), certificate_number
}

-- PROPERTY TAX
properties {
  id, owner_name, survey_no, ward_no, area_sqft,
  property_type, annual_tax_amount, last_paid_date
}
tax_payments {
  id, property_id, amount, period, paid_at,
  payment_id (razorpay), receipt_url
}

-- COMPLAINTS / GRIEVANCES
complaints {
  id, user_id, category, description, location,
  photo_urls: jsonb, status: [OPEN|IN_PROGRESS|RESOLVED|CLOSED],
  assigned_to, resolution_note, created_at, resolved_at
}

-- PROJECTS / WORKS
projects {
  id, name, name_mr, category, budget_allocated,
  budget_spent, contractor_name, start_date, end_date,
  status: [PLANNED|IN_PROGRESS|COMPLETED|STALLED],
  geo_lat, geo_lng, photos: jsonb, scheme_name,
  ward_no, created_by
}

-- GRAM SABHA MEETINGS
gram_sabha {
  id, meeting_date, agenda: jsonb, attendees_count,
  minutes_url, decisions: jsonb, created_by
}

-- NOTICES & ANNOUNCEMENTS
notices {
  id, title, title_mr, body, body_mr,
  type: [TENDER|GENERAL|URGENT|SCHEME],
  attachment_url, published_at, expires_at, created_by
}

-- BUDGET
budget_heads {
  id, financial_year, head_name, head_name_mr,
  allocated_amount, spent_amount, category
}

-- AGENT AUDIT LOG (every agent action logged)
agent_audit {
  id, agent_name, action, payload: jsonb,
  permission_requested, permission_granted_by,
  permission_granted_at, outcome, created_at
}
```

---

## 6. FEATURE MODULES

### Module 1: Public Portal (No Login Required)
- Home page with GP info, Sarpanch photo, contact
- Village profile & statistics
- Notice board (tenders, announcements)
- Elected members with photos & ward info
- Project/works tracker with map
- Budget & expenditure (charts)
- Gram Sabha decisions archive
- Government schemes list
- Photo gallery
- RTI request form

### Module 2: Citizen Services (Login Required)
- Certificate applications (Birth, Death, Income, Caste, Domicile, Residence)
- Application status tracker (via mobile OTP — no password needed)
- Property tax view & online payment
- Water bill payment
- Complaint/grievance filing with photo upload
- Complaint status tracking
- Download issued certificates

### Module 3: Admin Dashboard (Gram Sevak / Operator)
- Certificate approval workflow
- Complaint management & assignment
- Notice publishing
- Project creation & update
- Budget entry
- Gram Sabha meeting creation
- Beneficiary list management
- Reports (daily, monthly, annual)
- Member management

### Module 4: Sarpanch Dashboard
- Overview stats (pending applications, open complaints, budget status)
- Approve high-level actions
- View agent permission requests
- Digital signature on certificates
- Gram Sabha scheduling

### Module 5: AI Agent Panel
- Agent activity log
- Pending permissions queue
- Agent-generated reports
- Notification history

---

## 7. AGENT RULES & PERMISSION SYSTEM

> ⚠️ CRITICAL SECTION — All agents MUST follow these rules without exception.

### 7.1 Core Agent Philosophy

```
RULE #0 (THE GOLDEN RULE):
An agent NEVER takes an action that affects real data, sends a real
message, modifies a record, or triggers a payment — WITHOUT first
requesting and receiving explicit human permission.

Even if the action seems trivial. Even if it did the same thing
100 times before. Every. Single. Time.
```

### 7.2 Agent Permission Levels

```
LEVEL 0 — READ ONLY (No permission needed)
  ✅ Read database records
  ✅ Generate internal reports
  ✅ Classify/analyze text
  ✅ Suggest next action (but NOT execute)
  ✅ Log observations

LEVEL 1 — LOW IMPACT (Auto-approved after 5s timeout if no response)
  🟡 Send status UPDATE SMS (not first contact)
  🟡 Move complaint status from IN_PROGRESS → same status
  🟡 Generate PDF draft (not final, not sent)
  🟡 Create internal notification (not external)
  Requires: Operator role or above

LEVEL 2 — MEDIUM IMPACT (Must wait for explicit approval)
  🟠 Send first-time SMS/WhatsApp to citizen
  🟠 Change application status (PENDING → UNDER_REVIEW)
  🟠 Upload generated certificate (draft, not delivered)
  🟠 Create a new record (complaint, notice draft)
  Requires: Gram Sevak approval within 30 minutes

LEVEL 3 — HIGH IMPACT (Must wait, dual approval)
  🔴 APPROVE a certificate application
  🔴 REJECT a certificate application (with reason)
  🔴 Send final certificate to citizen (SMS + WhatsApp + Email)
  🔴 Publish a notice publicly
  🔴 Mark a complaint as RESOLVED
  🔴 Change project status
  Requires: Gram Sevak + Sarpanch both approve

LEVEL 4 — CRITICAL (Blocked — agents CANNOT do these)
  ⛔ Trigger any payment or refund
  ⛔ Delete any record (only soft-delete by humans)
  ⛔ Modify budget figures
  ⛔ Access Aadhaar numbers or full personal data
  ⛔ Change user roles
  ⛔ Modify agent rules themselves
  ⛔ Access other GP's data (strict schema isolation)
```

### 7.3 Permission Request Format

Every agent action MUST be logged with this structure:

```typescript
interface AgentPermissionRequest {
  requestId: string;           // UUID
  agentName: string;           // e.g. "CertificateAgent"
  actionLevel: 0 | 1 | 2 | 3; // from above
  action: string;              // human-readable action name
  reason: string;              // WHY the agent wants to do this
  affectedEntity: string;      // "Certificate #123 for Ram Patil"
  payload: object;             // exact data that will be used
  alternativeIfDenied: string; // what happens if rejected
  requestedAt: Date;
  expiresAt: Date;             // Level 1: +5s, Level 2: +30min, Level 3: +24hr
  requiredApprovers: string[]; // roles that must approve
  approvals: Approval[];
}

interface Approval {
  approvedBy: string;   // user ID
  approvedAt: Date;
  role: string;
  comment?: string;
}
```

### 7.4 Agents List & Responsibilities

#### 🤖 Agent 1: CertificateAgent
```
PURPOSE: Handle certificate application lifecycle
ALLOWED ACTIONS (with permission):
  - Verify completeness of submitted documents (Level 0)
  - Flag incomplete applications with reason (Level 0)
  - Draft certificate PDF from template (Level 1)
  - Notify applicant of status change (Level 2)
  - Route to approver with summary (Level 2)
BLOCKED ACTIONS:
  - Cannot approve/reject on its own (Level 3 = human only)
  - Cannot access Aadhaar numbers
TRIGGERS:
  - New application submitted
  - 48 hours with no human action on PENDING application
```

#### 🤖 Agent 2: GrievanceAgent
```
PURPOSE: Manage complaint routing and follow-up
ALLOWED ACTIONS (with permission):
  - Classify complaint by category & urgency (Level 0)
  - Suggest which department to assign to (Level 0)
  - Draft assignment notification (Level 1)
  - Send follow-up SMS if complaint > 7 days unresolved (Level 2)
  - Escalate to Sarpanch if > 15 days (Level 2)
BLOCKED ACTIONS:
  - Cannot mark complaint resolved (Level 3 = human only)
  - Cannot delete complaints
TRIGGERS:
  - New complaint filed
  - Daily scan for overdue complaints
```

#### 🤖 Agent 3: NotificationAgent
```
PURPOSE: Send SMS/WhatsApp/Email notifications
ALLOWED ACTIONS (with permission):
  - Queue notification (Level 0)
  - Send Level 1 update SMS (Level 1 — auto after 5s)
  - Send new citizen SMS (Level 2)
  - Batch notify all citizens about Gram Sabha (Level 2)
BLOCKED ACTIONS:
  - Cannot send bulk marketing messages
  - Cannot contact citizens outside 8AM-8PM IST
  - Cannot send without template approval
TRIGGERS:
  - Triggered ONLY by other agents or human actions, never self-triggered
```

#### 🤖 Agent 4: ReportAgent
```
PURPOSE: Generate periodic reports and summaries
ALLOWED ACTIONS:
  - Generate daily/weekly/monthly summaries (Level 0)
  - Email report to Gram Sevak (Level 1)
  - Create public-facing budget summary (Level 2 — Sarpanch approval)
BLOCKED ACTIONS:
  - Cannot publish anything publicly without Level 3 approval
TRIGGERS:
  - Scheduled cron (daily 9AM, weekly Monday, monthly 1st)
```

#### 🤖 Agent 5: SchemeMatchAgent
```
PURPOSE: Match citizens to eligible government schemes
ALLOWED ACTIONS:
  - Analyze citizen profile against scheme criteria (Level 0)
  - Generate eligibility report for Gram Sevak (Level 0)
  - Notify citizen about eligible schemes (Level 2)
BLOCKED ACTIONS:
  - Cannot enroll citizen in scheme (human action only)
  - Cannot modify citizen profile
TRIGGERS:
  - When citizen registers or updates profile
  - When new scheme is added to the system
```

### 7.5 Agent Communication Rules

```
1. Agents communicate through a MESSAGE BUS (Redis pub/sub)
   — never call each other directly

2. Every inter-agent message must include:
   - sender agent name
   - receiver agent name
   - correlation ID (trace the full chain)
   - timestamp
   - payload

3. If an agent receives a message it doesn't understand,
   it MUST log it and alert a human. Never silently ignore.

4. Agent chains (A triggers B triggers C) must be declared
   upfront in AGENT_CHAINS config. Undeclared chains are blocked.

5. Max chain depth: 3 agents. If more needed, human must intervene.

6. Agents CANNOT create new agents or spawn sub-agents.

7. ALL agent errors go to a DEAD LETTER QUEUE.
   A human must review and resolve DLQ items daily.
```

### 7.6 Agent Failure Handling

```
IF agent fails mid-action:
  1. ROLLBACK any partial DB changes (use transactions)
  2. Log failure with full context to agent_audit table
  3. Set action status = FAILED
  4. Alert Gram Sevak via dashboard notification
  5. DO NOT retry automatically for Level 3 actions
  6. For Level 1/2: retry max 3 times with exponential backoff
  7. If all retries fail → escalate to human
```

---

## 8. FOLDER STRUCTURE

```
grampanchayat-platform/
│
├── apps/
│   ├── web/                          # Next.js frontend
│   │   ├── app/
│   │   │   ├── [locale]/             # i18n routing (mr, en)
│   │   │   │   ├── (public)/         # No auth required
│   │   │   │   │   ├── page.tsx      # Home
│   │   │   │   │   ├── members/
│   │   │   │   │   ├── projects/
│   │   │   │   │   ├── notices/
│   │   │   │   │   ├── budget/
│   │   │   │   │   └── schemes/
│   │   │   │   ├── (citizen)/        # Citizen login
│   │   │   │   │   ├── apply/
│   │   │   │   │   ├── my-applications/
│   │   │   │   │   ├── complaints/
│   │   │   │   │   └── payments/
│   │   │   │   ├── (admin)/          # Gram Sevak / Operator
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── certificates/
│   │   │   │   │   ├── complaints/
│   │   │   │   │   ├── projects/
│   │   │   │   │   ├── notices/
│   │   │   │   │   ├── budget/
│   │   │   │   │   ├── agents/       # Agent permission panel
│   │   │   │   │   └── reports/
│   │   │   │   └── (sarpanch)/      # Sarpanch dashboard
│   │   │   ├── api/
│   │   │   │   ├── auth/
│   │   │   │   ├── certificates/
│   │   │   │   ├── complaints/
│   │   │   │   ├── projects/
│   │   │   │   ├── payments/
│   │   │   │   ├── notices/
│   │   │   │   ├── agents/           # Agent permission endpoints
│   │   │   │   └── webhooks/         # Razorpay, SMS callbacks
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn components
│   │   │   ├── public/               # Public page components
│   │   │   ├── citizen/
│   │   │   ├── admin/
│   │   │   └── agent/                # Agent permission UI
│   │   ├── lib/
│   │   │   ├── db.ts                 # Prisma client
│   │   │   ├── auth.ts               # NextAuth config
│   │   │   ├── tenant.ts             # GP identification from subdomain
│   │   │   ├── queue.ts              # BullMQ setup
│   │   │   └── s3.ts                 # File storage
│   │   ├── messages/
│   │   │   ├── mr.json               # Marathi translations
│   │   │   └── en.json               # English translations
│   │   └── middleware.ts             # Tenant + auth middleware
│   │
│   └── agents/                       # Agent workers (separate process)
│       ├── src/
│       │   ├── core/
│       │   │   ├── AgentBase.ts      # Base class all agents extend
│       │   │   ├── PermissionManager.ts
│       │   │   ├── MessageBus.ts
│       │   │   ├── AuditLogger.ts
│       │   │   └── DeadLetterQueue.ts
│       │   ├── agents/
│       │   │   ├── CertificateAgent.ts
│       │   │   ├── GrievanceAgent.ts
│       │   │   ├── NotificationAgent.ts
│       │   │   ├── ReportAgent.ts
│       │   │   └── SchemeMatchAgent.ts
│       │   ├── tools/                # Agent tool implementations
│       │   │   ├── generatePDF.ts
│       │   │   ├── sendSMS.ts
│       │   │   ├── sendWhatsApp.ts
│       │   │   ├── uploadS3.ts
│       │   │   └── queryDB.ts
│       │   └── config/
│       │       └── AGENT_CHAINS.ts   # Declared agent chains
│       └── index.ts                  # Worker entry point
│
├── packages/
│   ├── database/                     # Prisma schema + migrations
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── shared-types/                 # Shared TypeScript types
│   └── email-templates/              # Certificate & email templates
│
├── infra/
│   ├── docker-compose.yml
│   ├── nginx/
│   │   └── nginx.conf               # Wildcard subdomain routing
│   ├── scripts/
│   │   ├── new-gp.sh                # Onboard new Gram Panchayat
│   │   └── backup.sh
│   └── .env.example
│
└── docs/
    ├── GRAMPANCHAYAT_PROJECT.md     # THIS FILE
    ├── API.md
    ├── AGENT_RULES.md               # Extracted agent rules
    └── ONBOARDING.md                # How to add a new GP
```

---

## 9. API DESIGN

### Convention
- All APIs: `/api/v1/...`
- Auth: Bearer JWT token
- Tenant: Inferred from subdomain (X-GP-ID header as fallback)
- Response format:
```json
{
  "success": true,
  "data": {},
  "message": "Certificate submitted successfully",
  "timestamp": "2025-08-11T10:00:00Z"
}
```

### Key Endpoints

```
AUTH
POST  /api/v1/auth/otp/send         Send OTP to mobile
POST  /api/v1/auth/otp/verify        Verify OTP → return JWT
POST  /api/v1/auth/admin/login        Admin login (email+password)

CERTIFICATES
POST  /api/v1/certificates/apply      Submit application
GET   /api/v1/certificates/:id        Get status
GET   /api/v1/certificates/track/:mobile  Track by mobile (public)
PATCH /api/v1/certificates/:id/approve  Admin: approve
PATCH /api/v1/certificates/:id/reject   Admin: reject
GET   /api/v1/certificates/:id/download Download PDF

COMPLAINTS
POST  /api/v1/complaints              File complaint
GET   /api/v1/complaints/:id          Get status
GET   /api/v1/complaints/track/:id    Public tracking
PATCH /api/v1/complaints/:id/assign   Admin: assign
PATCH /api/v1/complaints/:id/resolve  Admin: resolve

PAYMENTS
POST  /api/v1/payments/tax/initiate   Start Razorpay order
POST  /api/v1/payments/tax/verify     Verify payment (webhook)
GET   /api/v1/payments/history        Payment history

PROJECTS (Public)
GET   /api/v1/projects                List all projects
GET   /api/v1/projects/:id            Project detail + photos

NOTICES (Public)
GET   /api/v1/notices                 List notices
GET   /api/v1/notices/:id             Notice detail

AGENTS (Admin only)
GET   /api/v1/agents/permissions      Pending permission requests
POST  /api/v1/agents/permissions/:id/approve
POST  /api/v1/agents/permissions/:id/reject
GET   /api/v1/agents/audit            Agent audit log
```

---

## 10. SECURITY RULES

```
AUTHENTICATION
  - OTP-based login for citizens (no passwords to forget)
  - Email+password for admin roles
  - JWT with 24hr expiry, refresh token 30 days
  - All admin routes: server-side session validation

DATA ISOLATION
  - Prisma middleware enforces GP schema on every query
  - Row-level security (RLS) on PostgreSQL
  - API middleware validates GP from subdomain matches JWT claim
  - Cross-GP data access = immediate 403 + security alert

INPUT VALIDATION
  - Zod schema validation on ALL inputs
  - File uploads: type check + virus scan (ClamAV)
  - Max file size: 5MB per document
  - Rate limiting: 10 req/min per IP for public, 60 for auth'd

SENSITIVE DATA
  - Aadhaar numbers: NEVER stored, only last 4 digits
  - Mobile numbers: encrypted at rest (AES-256)
  - Certificates: stored in private S3 bucket, signed URLs only
  - Signed URL expiry: 15 minutes

AGENT SECURITY
  - Agents run in isolated Docker container
  - Agents have READ-ONLY DB user by default
  - Write access granted per-operation via permission token
  - Permission token expires in 60 seconds
  - Agent cannot access filesystem outside /tmp

GENERAL
  - HTTPS only (redirect HTTP → HTTPS)
  - CORS: only allowed subdomains of gramportal.in
  - CSP headers configured
  - SQL injection: prevented by Prisma parameterized queries
  - XSS: sanitize all user-generated content (DOMPurify)
```

---

## 11. DEPLOYMENT ARCHITECTURE

### Production Setup (Single Server — MVP)

```
Server: Hetzner CX31 or CX41 (4 vCPU, 8GB RAM, ~₹2000/month)
OS: Ubuntu 22.04 LTS

Services running via Docker Compose:
  - nginx (port 80/443)
  - nextjs-app (port 3000)
  - agents-worker (port 3001)
  - postgresql (port 5432, internal only)
  - redis (port 6379, internal only)
  - minio (port 9000, internal only — if not using S3)

Backups:
  - Postgres: pg_dump daily at 2AM → encrypted → Backblaze B2
  - S3/Minio: versioning enabled
  - Retention: 30 days
```

### Subdomain Routing (Nginx)

```nginx
server {
    listen 443 ssl;
    server_name ~^(?<subdomain>.+)\.gramportal\.in$;

    ssl_certificate /etc/letsencrypt/live/gramportal.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gramportal.in/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-GP-Subdomain $subdomain;
    }
}
```

### Onboarding New Gram Panchayat

```bash
# Run this script to onboard a new GP
./infra/scripts/new-gp.sh \
  --subdomain "wandhale" \
  --gp-name "Wandhale Gram Panchayat" \
  --district "Nagpur" \
  --taluka "Ramtek" \
  --sarpanch "Ramesh Patil" \
  --gramsevak "Suresh Wankhede" \
  --phone "9876543210"

# Script does:
# 1. Creates new Postgres schema
# 2. Runs migrations on new schema
# 3. Seeds default data (schemes, templates)
# 4. Creates admin user
# 5. Issues SSL cert (if custom domain)
# 6. Sends welcome SMS to Gram Sevak
```

---

## 12. LEGAL & COMPLIANCE

### Maharashtra Village Panchayat Act 1958
- All records must be maintained as per Section 58 (accounts)
- Notice board obligations covered by digital notices module
- Gram Sabha minutes must be preserved (stored in S3, never deleted)

### Data Protection (IT Act 2000 + DPDP Act 2023)
- [ ] Privacy policy in Marathi and English
- [ ] Consent taken at registration
- [ ] Data deletion request flow implemented
- [ ] No data sold to third parties (in ToS)
- [ ] Aadhaar data: comply with UIDAI guidelines (no storage)

### Payment Compliance
- [ ] Razorpay merchant account (KYC done)
- [ ] Tax collection receipt (GST invoice on payment)
- [ ] Reconciliation report for Gram Panchayat accounts

### Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Screen reader support
- [ ] Minimum font size 16px
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] All images have alt text in Marathi

### GeM Portal Listing Checklist
- [ ] Service listed under "IT Services — Website Development & Maintenance"
- [ ] OEM declaration submitted
- [ ] Pricing declared (annual contract)
- [ ] Sample work uploaded
- [ ] Udyam registration done (MSME benefit)

---

## 13. BUILD ORDER / SPRINT PLAN

### Sprint 0 — Setup (Week 1)
- [ ] Monorepo setup (Turborepo)
- [ ] Next.js + TypeScript base
- [ ] PostgreSQL + Prisma setup
- [ ] Redis setup
- [ ] Auth (OTP login) working
- [ ] Multi-tenant middleware working
- [ ] First GP schema migrations
- [ ] Basic CI/CD (GitHub Actions → deploy to server)

### Sprint 1 — Public Portal (Week 2)
- [ ] Home page (GP info, Sarpanch photo)
- [ ] Members page
- [ ] Notices board
- [ ] Projects list with map
- [ ] Budget display (charts)
- [ ] Marathi translations
- [ ] Mobile responsive

### Sprint 2 — Citizen Services (Week 3-4)
- [ ] Certificate application form (all types)
- [ ] Document upload to S3
- [ ] Application status tracking
- [ ] Certificate PDF generation (Puppeteer)
- [ ] SMS notification on status change

### Sprint 3 — Admin Dashboard (Week 5-6)
- [ ] Gram Sevak login & dashboard
- [ ] Certificate approval workflow
- [ ] Complaint management
- [ ] Notice publishing
- [ ] Project CRUD
- [ ] Budget entry

### Sprint 4 — Payments (Week 7)
- [ ] Razorpay integration
- [ ] Property tax payment
- [ ] Payment receipt generation
- [ ] Reconciliation report

### Sprint 5 — Agent Layer (Week 8-9)
- [ ] AgentBase class
- [ ] PermissionManager
- [ ] MessageBus (Redis pub/sub)
- [ ] AuditLogger
- [ ] CertificateAgent
- [ ] GrievanceAgent
- [ ] NotificationAgent
- [ ] Agent permission UI for admins

### Sprint 6 — Polish & Launch (Week 10)
- [ ] Security audit
- [ ] Performance optimization (Lighthouse score > 90)
- [ ] Accessibility audit
- [ ] Load testing
- [ ] PWA audit (Lighthouse PWA score 100)
- [ ] Test install flow on Android devices (₹5000 range phones)
- [ ] Test offline mode on 2G/3G throttled network
- [ ] Documentation
- [ ] GeM portal listing
- [ ] First pilot GP onboarded

---

## ✅ QUICK REFERENCE — AGENT DECISION TREE

```
Agent wants to do something
         │
         ▼
  Is it READ ONLY?
  ─────────────────
  YES → Do it. Log it. Done.
  NO  → ↓

  What level is the action?
  ──────────────────────────
  LEVEL 4? → STOP. BLOCKED. Alert human.
  LEVEL 3? → Request dual approval (Gram Sevak + Sarpanch)
             Wait up to 24 hours.
             If no response → escalate, DO NOT proceed.
  LEVEL 2? → Request Gram Sevak approval.
             Wait up to 30 minutes.
             If no response → DO NOT proceed. Log & alert.
  LEVEL 1? → Log request. Wait 5 seconds.
             If no rejection → proceed.
             Always reversible actions only.

  After any action:
  → Write to agent_audit table
  → Update job status in queue
  → Notify relevant human of outcome
```

---

## 14. PWA — PROGRESSIVE WEB APP

### 14.1 Decision: PWA Yes, Native App No

We ship ONE codebase — Next.js website — that is ALSO a fully installable mobile app via PWA. No separate Android/iOS build. No Play Store. No App Store.

**The pitch to every Sarpanch:**
> *"Sir, website भी मिलेगी, और mobile app भी — एक ही price में।"*

### 14.2 PWA vs Native App Comparison

| Factor | Native App (Android/iOS) | PWA (Our Choice) |
|---|---|---|
| Extra build cost | ₹3–5 lakh | ₹0 (same codebase) |
| Play Store approval | Weeks, can be rejected | Not needed |
| Update process | User must manually update | Auto-updates silently |
| Works on 2G/3G | Heavy 50–100MB download | Lightweight, ~1–2MB |
| Device storage used | 50–100MB | 1–2MB |
| Offline mode | Complex to build separately | Built-in via Service Worker |
| Install method | Download from Play Store | One tap from browser |
| Push notifications | Full support | Full support on Android |
| Camera access | Yes | Yes |
| GPS access | Yes | Yes |
| iOS support | Full | Limited (no push notifs) |
| Target market fit | Overkill | Perfect (95%+ Android in rural MH) |

### 14.3 What Citizens Can Do From PWA App

```
✅ Tap "Add to Home Screen" from Chrome → app icon appears
✅ Open app — looks exactly like native, no browser bar
✅ Browse village info, notices, projects OFFLINE
✅ Apply for certificates (online required for submit)
✅ Track application status offline (cached last state)
✅ File complaint with photo from camera
✅ Geo-tag location from GPS
✅ Receive push notifications (certificate ready, notice published)
✅ Pay property tax (online required)
✅ Works on any Android phone — even ₹4,000–5,000 range
```

### 14.4 PWA Technical Setup (Next.js)

#### Step 1 — Install next-pwa
```bash
npm install next-pwa
npm install -D webpack
```

#### Step 2 — next.config.ts
```typescript
import withPWA from 'next-pwa';

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      // Cache all API GET requests for offline use
      urlPattern: /^https:\/\/.*\.gramportal\.in\/api\/v1\/(projects|notices|members|budget).*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-cache',
        expiration: { maxEntries: 200, maxAgeSeconds: 24 * 60 * 60 }, // 24hrs
      },
    },
    {
      // Cache static pages
      urlPattern: /^https:\/\/.*\.gramportal\.in\/(projects|notices|members|budget|schemes).*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'pages-cache',
        expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    {
      // Cache images and documents
      urlPattern: /\.(png|jpg|jpeg|svg|webp|ico|woff2)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 }, // 7 days
      },
    },
  ],
});

export default config({
  // your existing Next.js config here
});
```

#### Step 3 — Web App Manifest (public/manifest.json)
```json
{
  "name": "{{GP_NAME}} ग्राम पंचायत",
  "short_name": "{{GP_SHORT_NAME}}",
  "description": "{{GP_NAME}} Gram Panchayat — नागरिक सेवा पोर्टल",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#FF6600",
  "orientation": "portrait",
  "lang": "mr",
  "icons": [
    { "src": "/icons/icon-72x72.png", "sizes": "72x72", "type": "image/png" },
    { "src": "/icons/icon-96x96.png", "sizes": "96x96", "type": "image/png" },
    { "src": "/icons/icon-128x128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "shortcuts": [
    {
      "name": "अर्ज करा",
      "short_name": "अर्ज",
      "description": "नवीन प्रमाणपत्रासाठी अर्ज करा",
      "url": "/apply",
      "icons": [{ "src": "/icons/shortcut-apply.png", "sizes": "96x96" }]
    },
    {
      "name": "तक्रार नोंदवा",
      "short_name": "तक्रार",
      "description": "तक्रार किंवा सूचना नोंदवा",
      "url": "/complaints/new",
      "icons": [{ "src": "/icons/shortcut-complaint.png", "sizes": "96x96" }]
    },
    {
      "name": "स्थिती तपासा",
      "short_name": "स्थिती",
      "description": "अर्जाची स्थिती तपासा",
      "url": "/track",
      "icons": [{ "src": "/icons/shortcut-track.png", "sizes": "96x96" }]
    }
  ]
}
```

**Note:** Manifest is dynamically generated per GP at `/api/manifest.json` so each GP gets its own name, colors, and icon.

#### Step 4 — Push Notifications (Web Push API)
```typescript
// lib/push-notifications.ts

// Register service worker and subscribe to push
export async function subscribeToPush(userId: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  });

  // Save subscription to our DB for this user
  await fetch('/api/v1/push/subscribe', {
    method: 'POST',
    body: JSON.stringify({ subscription, userId }),
    headers: { 'Content-Type': 'application/json' },
  });
}

// Send push from server (called by NotificationAgent)
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: { title: string; body: string; url: string; icon: string }
) {
  const webpush = require('web-push');
  webpush.setVapidDetails(
    'mailto:support@gramportal.in',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  await webpush.sendNotification(subscription, JSON.stringify(payload));
}
```

#### Step 5 — Offline Fallback Page
```
app/offline/page.tsx

Shows when user opens the app with no internet and the page
isn't cached. Display:
- GP name and logo (cached)
- "इंटरनेट उपलब्ध नाही" message in Marathi
- Last cached data timestamp
- List of pages available offline
- "पुन्हा प्रयत्न करा" (Retry) button
```

### 14.5 Pages That Work Offline (Cached by Service Worker)

```
ALWAYS CACHED (available offline):
  / (home page)
  /members (elected members list)
  /projects (project list)
  /notices (notice board)
  /budget (budget display)
  /schemes (government schemes)
  /contact (GP contact info)

REQUIRES INTERNET (not cached — show message):
  /apply (form submission)
  /complaints/new (requires photo upload)
  /payments (Razorpay needs internet)
  /track (real-time status)
```

### 14.6 Auto-Generate Icons Per GP

Each GP gets branded icons with their name auto-generated:

```typescript
// scripts/generate-gp-icons.ts
// Uses sharp + canvas to generate icons with:
// - Government emblem or GP logo
// - GP name in Devanagari
// - Consistent brand colors per GP
// Runs during GP onboarding script
```

### 14.7 PWA Checklist Before Launch

```
Installation
  [ ] "Add to Home Screen" prompt appears on Android Chrome
  [ ] Icon appears correctly on home screen
  [ ] App opens in standalone mode (no browser bar)
  [ ] Splash screen shows correctly
  [ ] App name shows in Marathi

Offline
  [ ] Home page loads offline
  [ ] Members page loads offline
  [ ] Projects page loads offline
  [ ] Notices page loads offline
  [ ] Offline fallback page appears for uncached pages
  [ ] Cached data shows timestamp (so user knows it's old)

Performance (Lighthouse)
  [ ] Performance score ≥ 90
  [ ] PWA score = 100
  [ ] Accessibility score ≥ 90
  [ ] First Contentful Paint < 2s on 3G
  [ ] Tested on Android 8+ devices

Push Notifications
  [ ] Permission prompt works
  [ ] Certificate ready notification delivered
  [ ] New notice notification delivered
  [ ] Notifications link to correct page on tap
  [ ] Notifications only sent 8AM–8PM IST
```

### 14.8 iOS Limitations (Be Honest With Clients)

```
iPhone users CAN:
  ✅ Install to home screen (via Safari Share → Add to Home Screen)
  ✅ Use all features when online
  ✅ View cached pages offline

iPhone users CANNOT:
  ❌ Receive push notifications (Safari limitation)
  ❌ Background sync

Reality check: In rural Maharashtra, iPhone users are < 5% of
the target market. This is not a business problem.

If a GP specifically asks for iOS push notifications in the future:
→ Option 1: Build a simple React Native wrapper (Expo) for iOS only
→ Option 2: Use SMS as fallback for iOS users (already in our stack)
```

---

## 15. DATA LEGAL SAFETY

### 15.1 What Data We Collect — Risk Classification

#### 🟢 SAFE DATA — Public, No Restrictions
These are public government records. Collect and display freely:

| Data | Why Safe |
|---|---|
| GP name, address, ward info | Public government info |
| Sarpanch / member names & photos | Public office — no privacy right |
| Project details, budget figures | Transparency mandate by law |
| Notice board content | Public announcements |
| Gram Sabha minutes | Public record by Maharashtra GP Act |
| Government scheme information | Public domain |
| Village population, area stats | Public census data |

**Rule:** If it appears on a government notice board — it is public, it is safe.

#### 🟡 CAREFUL DATA — Personal, Collect With Consent + Purpose Only

| Data | Law | What You Must Do |
|---|---|---|
| Citizen name | DPDP Act 2023 | Consent + state purpose |
| Mobile number | DPDP Act 2023 | Encrypt at rest, never share |
| Residential address | DPDP Act 2023 | Only for service delivery |
| Date of birth | DPDP Act 2023 | Minimum necessary only |
| Property survey details | Maharashtra GP Act | Only for tax purpose |
| Complaint text + photos | DPDP Act 2023 | Never publish without consent |
| Application supporting documents | DPDP Act 2023 | Private S3 bucket, signed URLs only |

#### 🔴 DANGEROUS DATA — Do NOT Collect OR Handle With Extreme Care

| Data | Law | Risk |
|---|---|---|
| Full Aadhaar number (12 digits) | Aadhaar Act 2016 | Imprisonment up to 3 years |
| Aadhaar card scan / photocopy | Aadhaar Act + SPDI Rules | Treated as biometric = SPDI |
| Biometric data (fingerprint, iris) | SPDI Rules 2011 | Highest protected category |
| Children's data (under 16) | DPDP Act 2023 | Needs verifiable parental consent |
| Full bank account / card number | SPDI Rules 2011 | Cannot store — Razorpay token only |

### 15.2 The 8 Non-Negotiable Rules

```
RULE 1 — NEVER store full Aadhaar number
  Store: last 4 digits only (e.g. XXXX-XXXX-4567)
  Never: full 12 digits, never a scan, never a photo of the card
  Penalty for violation: imprisonment up to 3 years (Section 40, Aadhaar Act)

RULE 2 — NEVER store bank or card details
  Razorpay handles all payment data
  We store only: razorpay_payment_id (a reference token)
  Never: card numbers, CVV, UPI IDs, account numbers

RULE 3 — Consent screen before ANY data collection
  Show: clear Marathi + English screen before form
  State: exactly what you collect and why
  Log: consent with user ID + timestamp in DB
  Example text: "आपले नाव आणि मोबाईल नंबर फक्त
  प्रमाणपत्र अर्जासाठी वापरले जाईल."

RULE 4 — Purpose limitation — use data ONLY for stated purpose
  Collected mobile for certificate SMS → only use for that
  Using it for marketing = illegal under DPDP Act

RULE 5 — Children under 16 → parent/guardian consent required
  Birth certificate for a child → applicant is parent = fine
  Any child directly submitting → need parental consent flow
  Never collect child's data without verified parent consent

RULE 6 — Data deletion on request (Right to Erasure)
  Every citizen must be able to request deletion of their data
  Build: "माझा डेटा हटवा" (Delete My Data) feature
  Process: acknowledge within 72 hours, delete within 30 days
  Exception: records required by law (GP Act) cannot be deleted

RULE 7 — Privacy Policy in Marathi + English
  Must be: live on website, visible from every page footer
  Must state: what you collect, why, how long, how to delete
  Language: plain language — no legal jargon
  Full enforcement: May 13, 2027 (DPDP Act deadline)

RULE 8 — Appoint a Grievance Officer publicly
  Name one person (founder / co-founder is fine)
  Publish: name + email + phone on website
  Required by: SPDI Rules 2011 (currently active)
  Handle: data complaints within 30 days
```

### 15.3 DPDP Act 2023 — Key Dates & Penalties

```
Presidential assent:    August 11, 2023
DPDP Rules notified:   November 13, 2025
Full enforcement:       May 13, 2027

Maximum penalty:        ₹250 crore per breach
Typical startup risk:   ₹10–50 crore range for serious violations

Phases:
  Phase 1 (Now):        Data Protection Board being constituted
  Phase 2 (2026):       Consent and notice requirements active
  Phase 3 (May 2027):   ALL provisions fully enforced with penalties
```

### 15.4 Data We Store on Indian Servers Only

**Host everything in India.** This avoids cross-border data transfer rules:

```
Database (PostgreSQL):    Mumbai AWS (ap-south-1) OR Hetzner Helsinki*
File Storage (S3):        AWS S3 Mumbai (ap-south-1)
Redis Cache:              Same server as DB
SMS Gateway:              Indian provider (Fast2SMS / MSG91)
Email:                    SendGrid (US-based but allowed under DPDP)

*Hetzner Helsinki is outside India — preferred option is AWS Mumbai
 for full compliance. If using Hetzner, add DPA (Data Processing
 Agreement) clause in your GP contract.
```

### 15.5 Data Retention Policy

```
Certificate applications:    7 years (Maharashtra GP Act requirement)
Tax payment records:         7 years (financial records law)
Complaint records:           3 years after resolution
Gram Sabha minutes:          Permanent (never delete)
Citizen login/OTP logs:      90 days
Push notification tokens:    Until user unsubscribes or deletes account
Agent audit logs:            2 years
```

### 15.6 Security Measures for Data Protection

```
Encryption at rest:       AES-256 for all personal data fields
Encryption in transit:    TLS 1.3 (HTTPS everywhere)
Mobile numbers:           Encrypted column in Postgres
Certificate PDFs:         Private S3 bucket + 15-minute signed URLs
Admin access:             2FA mandatory for all admin roles
DB access:                No direct internet access — VPN only
Breach response plan:     72-hour notification to DPBI (once active)
Penetration testing:      Annual (required for SDF classification)
```

### 15.7 Your Complete Legal Safety Checklist

```
Before launch:
  [ ] Privacy Policy published in Marathi + English
  [ ] Consent screen on all data-collection forms
  [ ] Grievance Officer named publicly on website
  [ ] Aadhaar field: last 4 digits only, validated
  [ ] Bank data: Razorpay token only, never raw data
  [ ] Mobile numbers: encrypted in DB
  [ ] Documents: private S3, signed URLs only
  [ ] Data deletion flow built and tested
  [ ] All data on Indian servers (or DPA clause in contract)
  [ ] Children under 16: parent consent flow active
  [ ] Agent audit logs: every data access logged
  [ ] Terms of Service: "we never sell data" clause

After launch:
  [ ] Review DPDP Act updates every 6 months
  [ ] Annual security audit
  [ ] Grievance Officer responds to complaints within 30 days
  [ ] Data breach response plan tested
  [ ] By May 2027: full DPDP Act compliance audit done
```

---

## 16. PRICING STRATEGY

### 16.1 GP Budget Reality

Maharashtra released ₹714 crore across 26,407 eligible GPs in one installment — approximately **₹2.5–3 lakh per GP per instalment** from 15th Finance Commission alone. Plus own-source revenue (property tax, water tax).

Typical GP usable annual budget: **₹3–8 lakh/year** depending on village size.

### 16.2 Pricing Tiers

#### 🥉 Tier 1 — Basic (Population < 2,000)
```
One-time setup:     ₹15,000 – ₹20,000
Annual AMC:         ₹6,000 – ₹8,000/year

Includes:
  ✅ Public info pages
  ✅ Notices & announcements
  ✅ Elected members list
  ✅ Village profile
  ✅ Contact page
  ✅ PWA (installable app)
  ✅ Marathi + English
  ✅ 1 year hosting included
  ✅ SSL certificate
  ✅ 500 SMS/month in AMC
```

#### 🥈 Tier 2 — Standard (Population 2,000–5,000)
```
One-time setup:     ₹25,000 – ₹35,000
Annual AMC:         ₹12,000 – ₹15,000/year

Everything in Tier 1, plus:
  ✅ Certificate applications (all types)
  ✅ Application status tracking
  ✅ PDF certificate generation
  ✅ Complaint / grievance system
  ✅ Project tracker with map
  ✅ Budget & expenditure display
  ✅ WhatsApp notifications
  ✅ 1,000 SMS/month in AMC
```

#### 🥇 Tier 3 — Premium (Population 5,000+)
```
One-time setup:     ₹45,000 – ₹60,000
Annual AMC:         ₹18,000 – ₹24,000/year

Everything in Tier 2, plus:
  ✅ Online property tax payment (Razorpay)
  ✅ Water bill payment
  ✅ AI Agents (Certificate + Grievance + Notification)
  ✅ Auto-reports for Gram Sevak (daily/weekly)
  ✅ Scheme eligibility matcher
  ✅ Gram Sabha digital minutes
  ✅ 2,000 SMS/month in AMC
  ✅ Priority support (WhatsApp response within 4 hours)
```

### 16.3 Special Packages

#### Taluka Bundle (30–60 GPs in one taluka)
```
Approach: Panchayat Samiti (block level) directly
Offer:    20% discount on all tiers
Benefit:  One sale = ₹5–15 lakh
Process:  Single tender, single contract with Panchayat Samiti
```

#### GeM Portal Listing
```
List as:          Annual Website + App Service for Gram Panchayat
Price on GeM:     ₹25,000/year (all-inclusive, under direct purchase limit)
Benefit:          No tender needed for orders under ₹25,000
Target:           GPs with available untied grants
```

### 16.4 Revenue Projections

#### Conservative (100 GPs — Nagpur District Focus)
```
Setup fees avg ₹30,000:    100 × ₹30,000 = ₹30,00,000
AMC Year 1 avg ₹12,000:   100 × ₹12,000 = ₹12,00,000
Total Year 1:                               ₹42,00,000
AMC from Year 2 (recurring):               ₹12,00,000/year
```

#### Growth (500 GPs — 2 Districts)
```
Setup fees avg ₹30,000:    500 × ₹30,000 = ₹1,50,00,000
AMC Year 1 avg ₹12,000:   500 × ₹12,000 = ₹60,00,000
Total Year 1:                               ₹2,10,00,000
AMC from Year 2 (recurring):               ₹60,00,000/year
```

### 16.5 Pricing Tips

```
✅ Never go below ₹15,000 setup — looks untrustworthy to govt buyers
✅ Include SMS credits in AMC — don't charge per SMS (creates friction)
✅ Payment terms: 50% upfront, 50% on launch
✅ AMC: allow quarterly payments (GPs get grants in instalments too)
✅ First 5–10 pilots: ₹20,000 setup + ₹10,000 AMC (get testimonials fast)
✅ Raise prices after 10 live clients with references
✅ Taluka package discount: 20% off — still profitable, much faster scale
✅ Mention PWA in pitch: "website + app = one price" closes deals
```

---

## ✅ QUICK REFERENCE — AGENT DECISION TREE

```
Agent wants to do something
         │
         ▼
  Is it READ ONLY?
  ─────────────────
  YES → Do it. Log it. Done.
  NO  → ↓

  What level is the action?
  ──────────────────────────
  LEVEL 4? → STOP. BLOCKED. Alert human.
  LEVEL 3? → Request dual approval (Gram Sevak + Sarpanch)
             Wait up to 24 hours.
             If no response → escalate, DO NOT proceed.
  LEVEL 2? → Request Gram Sevak approval.
             Wait up to 30 minutes.
             If no response → DO NOT proceed. Log & alert.
  LEVEL 1? → Log request. Wait 5 seconds.
             If no rejection → proceed.
             Always reversible actions only.

  After any action:
  → Write to agent_audit table
  → Update job status in queue
  → Notify relevant human of outcome
```

---

*Document Version: 2.0.0*
*Created: August 2026*
*Updated: August 2026 — Added Section 14 (PWA), Section 15 (Data Legal Safety), Section 16 (Pricing Strategy)*
*Platform: Gram Panchayat Digital Platform — Maharashtra First, India Next*
*Next Review: After Sprint 0 completion*
