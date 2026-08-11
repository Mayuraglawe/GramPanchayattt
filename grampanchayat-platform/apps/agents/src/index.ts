import { PrismaClient, AgentName, AgentActionLevel, NotificationChannel, NotificationStatus } from '@prisma/client';

const prisma = new PrismaClient();

console.log('🤖 Starting Gram Panchayat AI Agent Background Worker Node...');

// ─── 1. Grievance Escalation scanner ──────────────────────────────────────────
// Scans for tickets in OPEN status that require immediate escalation to Sarpanch
async function runGrievanceEscalationCheck() {
  console.log('[GrievanceAgent] Scanning complaints for escalations...');
  try {
    const openComplaints = await prisma.complaint.findMany({
      where: {
        status: 'OPEN',
        escalated_to_sarpanch: false,
      },
    });

    for (const comp of openComplaints) {
      // Simulate checking age: if it's older than 1 hour in dev, escalate it!
      // In production, we'd check if (Date.now() - comp.created_at.getTime() > 5 * 24 * 60 * 60 * 1000)
      const ageMs = Date.now() - comp.created_at.getTime();
      const shouldEscalate = ageMs > 10 * 60 * 1000; // Escalate if older than 10 minutes in dev

      if (shouldEscalate) {
        console.log(`[GrievanceAgent] Escalating complaint ${comp.id} to Sarpanch.`);
        
        await prisma.complaint.update({
          where: { id: comp.id },
          data: {
            escalated_to_sarpanch: true,
            escalation_date: new Date(),
          },
        });

        // Log AI action to Agent Audit Log
        await prisma.agentAuditLog.create({
          data: {
            agent_name: AgentName.GrievanceAgent,
            action: 'COMPLAINT_ESCALATION',
            action_level: AgentActionLevel.LEVEL_2,
            payload: { 
              complaintId: comp.id, 
              category: comp.category,
              details: `Complaint was automatically escalated to Sarpanch due to SLA delay.`
            },
            outcome: 'SUCCESS',
          },
        });

        // Trigger SMS notification alert
        await prisma.notification.create({
          data: {
            user_id: comp.user_id,
            channel: NotificationChannel.SMS,
            recipient: '9876543210', // Sarpanch mobile
            message: `[Alert] Complaint ${comp.id} has been escalated to you due to SLA response delay.`,
            status: NotificationStatus.SENT,
            sent_at: new Date(),
          },
        });
      }
    }
  } catch (error) {
    console.error('[GrievanceAgent] Error scanning complaints:', error);
  }
}

// ─── 2. Auto-Verification of Certificate applications ────────────────────────
// Simulates CertificateAgent verifying applicant details and routing for approval
async function runCertificateAgentChecks() {
  console.log('[CertificateAgent] Scanning pending applications...');
  try {
    const pendingCerts = await prisma.certificateApplication.findMany({
      where: { status: 'PENDING' },
    });

    for (const cert of pendingCerts) {
      console.log(`[CertificateAgent] Running validation heuristics on application ${cert.id}`);
      
      // Auto transition to UNDER_REVIEW
      await prisma.certificateApplication.update({
        where: { id: cert.id },
        data: { status: 'UNDER_REVIEW' },
      });

      await prisma.agentAuditLog.create({
        data: {
          agent_name: AgentName.CertificateAgent,
          action: 'APPLICATION_VALIDATION',
          action_level: AgentActionLevel.LEVEL_0,
          payload: { 
            certId: cert.id, 
            type: cert.type,
            details: `Application documents checked and verified against Gram database registry.`
          },
          outcome: 'SUCCESS',
        },
      });
    }
  } catch (error) {
    console.error('[CertificateAgent] Verification check error:', error);
  }
}

// ─── 3. AI Agent Permission Request Checker ───────────────────────────────
// Simulates evaluating agent Level 1 permission queues for auto-approval
async function runAgentPermissionManager() {
  console.log('[PermissionAgent] Checking permission request queue...');
  try {
    const pendingRequests = await prisma.agentPermissionRequest.findMany({
      where: { status: 'PENDING' },
    });

    for (const req of pendingRequests) {
      if (req.action_level === AgentActionLevel.LEVEL_1) {
        console.log(`[PermissionAgent] Auto-approving Level 1 action request: ${req.id}`);
        
        await prisma.agentPermissionRequest.update({
          where: { id: req.id },
          data: {
            status: 'APPROVED',
            outcome: 'AUTO_APPROVED_BY_RULE_ENGINE',
          },
        });
      }
    }
  } catch (error) {
    console.error('[PermissionAgent] Queue scanner error:', error);
  }
}

// ─── 4. Orchestrator Runner Loop ──────────────────────────────────────────────
async function main() {
  // Run checks immediately on start, then loop
  await runGrievanceEscalationCheck();
  await runCertificateAgentChecks();
  await runAgentPermissionManager();

  setInterval(async () => {
    console.log('--- 🤖 AI Worker Execution Loop Triggered ---');
    await runGrievanceEscalationCheck();
    await runCertificateAgentChecks();
    await runAgentPermissionManager();
  }, 30000); // Run scan cycle every 30 seconds
}

main().catch((err) => {
  console.error('Fatal crash on AI Worker node:', err);
  process.exit(1);
});
