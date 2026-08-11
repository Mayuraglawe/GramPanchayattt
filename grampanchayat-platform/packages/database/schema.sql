-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "CertificateType" AS ENUM ('BIRTH', 'DEATH', 'INCOME', 'CASTE', 'DOMICILE', 'RESIDENCE');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'STALLED');

-- CreateEnum
CREATE TYPE "NoticeType" AS ENUM ('TENDER', 'GENERAL', 'URGENT', 'SCHEME');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('INITIATED', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "AgentActionLevel" AS ENUM ('LEVEL_0', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3');

-- CreateEnum
CREATE TYPE "AgentPermissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'AUTO_APPROVED');

-- CreateEnum
CREATE TYPE "AgentName" AS ENUM ('CertificateAgent', 'GrievanceAgent', 'NotificationAgent', 'ReportAgent', 'SchemeMatchAgent');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('SMS', 'WHATSAPP', 'EMAIL', 'PUSH');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "GenderType" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'AGRICULTURAL', 'INDUSTRIAL', 'MIXED');

-- CreateEnum
CREATE TYPE "WaterConnectionType" AS ENUM ('DOMESTIC', 'COMMERCIAL', 'AGRICULTURAL');

-- CreateTable
CREATE TABLE "gp_registry" (
    "id" UUID NOT NULL,
    "subdomain" TEXT NOT NULL,
    "gp_name" TEXT NOT NULL,
    "gp_name_marathi" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "taluka" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'Maharashtra',
    "pincode" CHAR(6) NOT NULL,
    "address" TEXT NOT NULL,
    "population" INTEGER NOT NULL,
    "ward_count" INTEGER NOT NULL,
    "established_year" INTEGER,
    "logo_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tier" INTEGER NOT NULL DEFAULT 2,
    "schema_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gp_registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gp_config" (
    "id" UUID NOT NULL,
    "gp_name" TEXT NOT NULL,
    "gp_name_marathi" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "taluka" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'Maharashtra',
    "pincode" CHAR(6) NOT NULL,
    "address" TEXT NOT NULL,
    "address_marathi" TEXT,
    "population" INTEGER NOT NULL,
    "ward_count" INTEGER NOT NULL,
    "area_sq_km" DECIMAL(10,4),
    "established_year" INTEGER,
    "logo_url" TEXT,
    "banner_url" TEXT,
    "theme_color" TEXT NOT NULL DEFAULT '#FF6600',
    "sarpanch_user_id" UUID,
    "gramsevak_user_id" UUID,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "whatsapp_phone" TEXT,
    "website_url" TEXT,
    "vapid_public_key" TEXT,
    "sms_quota_monthly" INTEGER NOT NULL DEFAULT 500,
    "sms_used_this_month" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gp_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "name_marathi" TEXT,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "aadhaar_last4" CHAR(4),
    "gender" "GenderType",
    "dob" TIMESTAMP(3),
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "ward_no" INTEGER,
    "address" TEXT,
    "photo_url" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "consent_given" BOOLEAN NOT NULL DEFAULT false,
    "consent_given_at" TIMESTAMP(3),
    "deletion_requested" BOOLEAN NOT NULL DEFAULT false,
    "deletion_requested_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "mobile" TEXT NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh_key" TEXT NOT NULL,
    "auth_key" TEXT NOT NULL,
    "device_info" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "purpose" TEXT NOT NULL,
    "consented" BOOLEAN NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "name" TEXT NOT NULL,
    "name_marathi" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "designation_mr" TEXT NOT NULL,
    "ward_no" INTEGER,
    "party" TEXT,
    "photo_url" TEXT,
    "contact_phone" TEXT,
    "contact_email" TEXT,
    "term_start" TIMESTAMP(3) NOT NULL,
    "term_end" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate_applications" (
    "id" UUID NOT NULL,
    "certificate_number" TEXT,
    "user_id" UUID NOT NULL,
    "type" "CertificateType" NOT NULL,
    "applicant_name" TEXT NOT NULL,
    "applicant_name_mr" TEXT NOT NULL,
    "applicant_relation" TEXT,
    "dob" TIMESTAMP(3),
    "gender" "GenderType",
    "address" TEXT NOT NULL,
    "address_mr" TEXT,
    "father_name" TEXT,
    "mother_name" TEXT,
    "ward_no" INTEGER,
    "supporting_docs" JSONB NOT NULL DEFAULT '[]',
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "certificate_url" TEXT,
    "certificate_s3_key" TEXT,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "under_review_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "approved_by" UUID,
    "fee_amount" DECIMAL(10,2),
    "payment_id" TEXT,
    "deceased_name" TEXT,
    "date_of_death" TIMESTAMP(3),
    "annual_income" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificate_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" UUID NOT NULL,
    "owner_user_id" UUID,
    "owner_name" TEXT NOT NULL,
    "owner_name_mr" TEXT,
    "survey_no" TEXT NOT NULL,
    "ward_no" INTEGER NOT NULL,
    "area_sqft" DECIMAL(10,2) NOT NULL,
    "property_type" "PropertyType" NOT NULL,
    "address" TEXT NOT NULL,
    "geo_lat" DECIMAL(10,7),
    "geo_lng" DECIMAL(10,7),
    "annual_tax_amount" DECIMAL(10,2) NOT NULL,
    "tax_due_date" TIMESTAMP(3),
    "last_paid_date" TIMESTAMP(3),
    "last_paid_amount" DECIMAL(10,2),
    "arrears" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "is_tax_exempt" BOOLEAN NOT NULL DEFAULT false,
    "exemption_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_payments" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "period" TEXT NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'INITIATED',
    "razorpay_order_id" TEXT,
    "razorpay_payment_id" TEXT,
    "receipt_url" TEXT,
    "receipt_s3_key" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tax_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "water_connections" (
    "id" UUID NOT NULL,
    "connection_number" TEXT NOT NULL,
    "owner_user_id" UUID,
    "owner_name" TEXT NOT NULL,
    "ward_no" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "connection_type" "WaterConnectionType" NOT NULL DEFAULT 'DOMESTIC',
    "monthly_rate" DECIMAL(10,2) NOT NULL,
    "meter_number" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "water_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "water_bills" (
    "id" UUID NOT NULL,
    "connection_id" UUID NOT NULL,
    "billing_month" TEXT NOT NULL,
    "units_consumed" DECIMAL(10,2),
    "amount_due" DECIMAL(10,2) NOT NULL,
    "penalty" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'INITIATED',
    "razorpay_order_id" TEXT,
    "razorpay_payment_id" TEXT,
    "receipt_url" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "water_bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" UUID NOT NULL,
    "tracking_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "category_mr" TEXT,
    "sub_category" TEXT,
    "description" TEXT NOT NULL,
    "description_mr" TEXT,
    "location" TEXT,
    "geo_lat" DECIMAL(10,7),
    "geo_lng" DECIMAL(10,7),
    "ward_no" INTEGER,
    "photo_urls" JSONB NOT NULL DEFAULT '[]',
    "status" "ComplaintStatus" NOT NULL DEFAULT 'OPEN',
    "urgency" INTEGER NOT NULL DEFAULT 2,
    "assigned_to" UUID,
    "resolution_note" TEXT,
    "resolution_note_mr" TEXT,
    "escalated_to_sarpanch" BOOLEAN NOT NULL DEFAULT false,
    "escalation_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "name_mr" TEXT NOT NULL,
    "description" TEXT,
    "description_mr" TEXT,
    "category" TEXT NOT NULL,
    "scheme_name" TEXT,
    "budget_allocated" DECIMAL(15,2) NOT NULL,
    "budget_spent" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "contractor_name" TEXT,
    "contractor_phone" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "actual_end_date" TIMESTAMP(3),
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNED',
    "ward_no" INTEGER,
    "geo_lat" DECIMAL(10,7),
    "geo_lng" DECIMAL(10,7),
    "photos" JSONB NOT NULL DEFAULT '[]',
    "tender_number" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_progress_updates" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "note" TEXT NOT NULL,
    "note_mr" TEXT,
    "progress_pct" INTEGER NOT NULL DEFAULT 0,
    "photos" JSONB NOT NULL DEFAULT '[]',
    "updated_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_progress_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_heads" (
    "id" UUID NOT NULL,
    "financial_year" TEXT NOT NULL,
    "head_code" TEXT NOT NULL,
    "head_name" TEXT NOT NULL,
    "head_name_mr" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "allocated_amount" DECIMAL(15,2) NOT NULL,
    "spent_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_heads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_entries" (
    "id" UUID NOT NULL,
    "head_id" UUID NOT NULL,
    "voucher_number" TEXT,
    "entry_type" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "description" TEXT NOT NULL,
    "description_mr" TEXT,
    "entry_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,
    "attachment_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gram_sabha" (
    "id" UUID NOT NULL,
    "meeting_date" TIMESTAMP(3) NOT NULL,
    "meeting_type" TEXT NOT NULL DEFAULT 'REGULAR',
    "venue" TEXT,
    "agenda" JSONB NOT NULL DEFAULT '[]',
    "attendees_count" INTEGER NOT NULL DEFAULT 0,
    "quorum_met" BOOLEAN NOT NULL DEFAULT false,
    "minutes_url" TEXT,
    "decisions" JSONB NOT NULL DEFAULT '[]',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gram_sabha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notices" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "title_mr" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "body_mr" TEXT NOT NULL,
    "type" "NoticeType" NOT NULL DEFAULT 'GENERAL',
    "attachment_url" TEXT,
    "published_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schemes" (
    "id" UUID NOT NULL,
    "scheme_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_mr" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "description_mr" TEXT NOT NULL,
    "government_level" TEXT NOT NULL DEFAULT 'CENTRAL',
    "ministry" TEXT,
    "eligibility" JSONB NOT NULL DEFAULT '{}',
    "benefits" TEXT NOT NULL,
    "benefits_mr" TEXT NOT NULL,
    "application_url" TEXT,
    "helpline" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schemes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheme_eligibilities" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "scheme_id" UUID NOT NULL,
    "is_eligible" BOOLEAN NOT NULL DEFAULT true,
    "matched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "notified_at" TIMESTAMP(3),
    "enrolled" BOOLEAN NOT NULL DEFAULT false,
    "enrolled_at" TIMESTAMP(3),

    CONSTRAINT "scheme_eligibilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rti_requests" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "applicant_name" TEXT NOT NULL,
    "applicant_phone" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requested_docs" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "response_url" TEXT,
    "response_note" TEXT,
    "deadline_date" TIMESTAMP(3),
    "filed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rti_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_permission_requests" (
    "id" UUID NOT NULL,
    "agent_name" "AgentName" NOT NULL,
    "action_level" "AgentActionLevel" NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "affected_entity" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "alternative_if_denied" TEXT NOT NULL,
    "status" "AgentPermissionStatus" NOT NULL DEFAULT 'PENDING',
    "required_approvers" TEXT[],
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "outcome" TEXT,
    "correlation_id" TEXT,

    CONSTRAINT "agent_permission_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_permission_approvals" (
    "id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "approved_by" UUID NOT NULL,
    "role" "UserRole" NOT NULL,
    "approved" BOOLEAN NOT NULL,
    "comment" TEXT,
    "approved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_permission_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_audit_logs" (
    "id" UUID NOT NULL,
    "agent_name" "AgentName" NOT NULL,
    "action" TEXT NOT NULL,
    "action_level" "AgentActionLevel" NOT NULL,
    "payload" JSONB NOT NULL,
    "permission_request_id" UUID,
    "permission_granted_by" UUID,
    "permission_granted_at" TIMESTAMP(3),
    "outcome" TEXT NOT NULL,
    "error_message" TEXT,
    "correlation_id" TEXT,
    "duration_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_dead_letter_queue" (
    "id" UUID NOT NULL,
    "agent_name" "AgentName" NOT NULL,
    "job_id" TEXT,
    "action" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "error_message" TEXT NOT NULL,
    "stack_trace" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_by" UUID,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_dead_letter_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "recipient" TEXT NOT NULL,
    "template_id" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'QUEUED',
    "sent_at" TIMESTAMP(3),
    "error" TEXT,
    "job_id" TEXT,
    "correlation_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "old_value" JSONB,
    "new_value" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "report_type" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "pdf_s3_key" TEXT,
    "pdf_url" TEXT,
    "generated_by" "AgentName",
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gp_registry_subdomain_key" ON "gp_registry"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "gp_registry_schema_name_key" ON "gp_registry"("schema_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_mobile_key" ON "users"("mobile");

-- CreateIndex
CREATE INDEX "users_mobile_idx" ON "users"("mobile");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "otp_sessions_mobile_idx" ON "otp_sessions"("mobile");

-- CreateIndex
CREATE INDEX "otp_sessions_expires_at_idx" ON "otp_sessions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_user_id_idx" ON "push_subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "consent_logs_user_id_idx" ON "consent_logs"("user_id");

-- CreateIndex
CREATE INDEX "members_ward_no_idx" ON "members"("ward_no");

-- CreateIndex
CREATE UNIQUE INDEX "certificate_applications_certificate_number_key" ON "certificate_applications"("certificate_number");

-- CreateIndex
CREATE INDEX "certificate_applications_user_id_idx" ON "certificate_applications"("user_id");

-- CreateIndex
CREATE INDEX "certificate_applications_status_idx" ON "certificate_applications"("status");

-- CreateIndex
CREATE INDEX "certificate_applications_type_idx" ON "certificate_applications"("type");

-- CreateIndex
CREATE INDEX "certificate_applications_applied_at_idx" ON "certificate_applications"("applied_at");

-- CreateIndex
CREATE INDEX "properties_survey_no_idx" ON "properties"("survey_no");

-- CreateIndex
CREATE INDEX "properties_ward_no_idx" ON "properties"("ward_no");

-- CreateIndex
CREATE UNIQUE INDEX "tax_payments_razorpay_order_id_key" ON "tax_payments"("razorpay_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "tax_payments_razorpay_payment_id_key" ON "tax_payments"("razorpay_payment_id");

-- CreateIndex
CREATE INDEX "tax_payments_property_id_idx" ON "tax_payments"("property_id");

-- CreateIndex
CREATE INDEX "tax_payments_payment_status_idx" ON "tax_payments"("payment_status");

-- CreateIndex
CREATE UNIQUE INDEX "water_connections_connection_number_key" ON "water_connections"("connection_number");

-- CreateIndex
CREATE INDEX "water_connections_owner_user_id_idx" ON "water_connections"("owner_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "water_bills_razorpay_order_id_key" ON "water_bills"("razorpay_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "water_bills_razorpay_payment_id_key" ON "water_bills"("razorpay_payment_id");

-- CreateIndex
CREATE INDEX "water_bills_connection_id_idx" ON "water_bills"("connection_id");

-- CreateIndex
CREATE INDEX "water_bills_billing_month_idx" ON "water_bills"("billing_month");

-- CreateIndex
CREATE UNIQUE INDEX "complaints_tracking_id_key" ON "complaints"("tracking_id");

-- CreateIndex
CREATE INDEX "complaints_user_id_idx" ON "complaints"("user_id");

-- CreateIndex
CREATE INDEX "complaints_status_idx" ON "complaints"("status");

-- CreateIndex
CREATE INDEX "complaints_category_idx" ON "complaints"("category");

-- CreateIndex
CREATE INDEX "complaints_tracking_id_idx" ON "complaints"("tracking_id");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_ward_no_idx" ON "projects"("ward_no");

-- CreateIndex
CREATE INDEX "projects_category_idx" ON "projects"("category");

-- CreateIndex
CREATE INDEX "project_progress_updates_project_id_idx" ON "project_progress_updates"("project_id");

-- CreateIndex
CREATE INDEX "budget_heads_financial_year_idx" ON "budget_heads"("financial_year");

-- CreateIndex
CREATE UNIQUE INDEX "budget_heads_financial_year_head_code_key" ON "budget_heads"("financial_year", "head_code");

-- CreateIndex
CREATE UNIQUE INDEX "budget_entries_voucher_number_key" ON "budget_entries"("voucher_number");

-- CreateIndex
CREATE INDEX "budget_entries_head_id_idx" ON "budget_entries"("head_id");

-- CreateIndex
CREATE INDEX "budget_entries_entry_date_idx" ON "budget_entries"("entry_date");

-- CreateIndex
CREATE INDEX "gram_sabha_meeting_date_idx" ON "gram_sabha"("meeting_date");

-- CreateIndex
CREATE INDEX "notices_is_published_idx" ON "notices"("is_published");

-- CreateIndex
CREATE INDEX "notices_type_idx" ON "notices"("type");

-- CreateIndex
CREATE INDEX "notices_published_at_idx" ON "notices"("published_at");

-- CreateIndex
CREATE UNIQUE INDEX "schemes_scheme_code_key" ON "schemes"("scheme_code");

-- CreateIndex
CREATE INDEX "schemes_is_active_idx" ON "schemes"("is_active");

-- CreateIndex
CREATE INDEX "scheme_eligibilities_user_id_idx" ON "scheme_eligibilities"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "scheme_eligibilities_user_id_scheme_id_key" ON "scheme_eligibilities"("user_id", "scheme_id");

-- CreateIndex
CREATE INDEX "rti_requests_status_idx" ON "rti_requests"("status");

-- CreateIndex
CREATE INDEX "agent_permission_requests_status_idx" ON "agent_permission_requests"("status");

-- CreateIndex
CREATE INDEX "agent_permission_requests_agent_name_idx" ON "agent_permission_requests"("agent_name");

-- CreateIndex
CREATE INDEX "agent_permission_requests_requested_at_idx" ON "agent_permission_requests"("requested_at");

-- CreateIndex
CREATE INDEX "agent_permission_approvals_request_id_idx" ON "agent_permission_approvals"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "agent_audit_logs_permission_request_id_key" ON "agent_audit_logs"("permission_request_id");

-- CreateIndex
CREATE INDEX "agent_audit_logs_agent_name_idx" ON "agent_audit_logs"("agent_name");

-- CreateIndex
CREATE INDEX "agent_audit_logs_created_at_idx" ON "agent_audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "agent_audit_logs_correlation_id_idx" ON "agent_audit_logs"("correlation_id");

-- CreateIndex
CREATE INDEX "agent_dead_letter_queue_resolved_idx" ON "agent_dead_letter_queue"("resolved");

-- CreateIndex
CREATE INDEX "agent_dead_letter_queue_agent_name_idx" ON "agent_dead_letter_queue"("agent_name");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_channel_idx" ON "notifications"("channel");

-- CreateIndex
CREATE INDEX "notifications_sent_at_idx" ON "notifications"("sent_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "reports_report_type_idx" ON "reports"("report_type");

-- CreateIndex
CREATE INDEX "reports_created_at_idx" ON "reports"("created_at");

-- AddForeignKey
ALTER TABLE "otp_sessions" ADD CONSTRAINT "otp_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_logs" ADD CONSTRAINT "consent_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_applications" ADD CONSTRAINT "certificate_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_applications" ADD CONSTRAINT "certificate_applications_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_payments" ADD CONSTRAINT "tax_payments_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "water_bills" ADD CONSTRAINT "water_bills_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "water_connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_progress_updates" ADD CONSTRAINT "project_progress_updates_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_entries" ADD CONSTRAINT "budget_entries_head_id_fkey" FOREIGN KEY ("head_id") REFERENCES "budget_heads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_permission_approvals" ADD CONSTRAINT "agent_permission_approvals_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "agent_permission_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_permission_approvals" ADD CONSTRAINT "agent_permission_approvals_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_audit_logs" ADD CONSTRAINT "agent_audit_logs_permission_request_id_fkey" FOREIGN KEY ("permission_request_id") REFERENCES "agent_permission_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

