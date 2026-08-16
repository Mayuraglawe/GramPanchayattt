---
name: append-only-store
description: >-
  Use this skill whenever you need to implement a database schema or business logic 
  for state-wise or append-only data storage (Event Sourcing). It provides rules for inserting states 
  rather than editing existing records.
---

# Append-Only / State-Wise Data Store

When instructed to design or modify a database schema or write logic that uses a "state-wise" or "append-only" data store (such as Event Sourcing for payments, orders, or approvals), strictly adhere to the following rules.

## 1. Core Principles
- **No Overwrites**: Existing database rows are NEVER updated or deleted.
- **New Row per Change**: Every state transition (event) requires a new `INSERT` operation.
- **Full Audit Trail**: Every historical state is preserved forever.
- **Current State Derivation**: The current state is always derived from the latest row for a given entity ID.

## 2. Database Schema Design
When defining Prisma models or SQL schemas for state-wise logging, use a central log table. 

**Example Prisma Schema:**
```prisma
model EntityStateLog {
  id            Int      @id @default(autoincrement())
  entityId      String   // e.g. "PAY-001"
  entityType    String   // e.g. "payment"
  state         String   // e.g. "PAID", "PROCESSING"
  payload       Json     // full data snapshot
  triggeredBy   String?  // agent/system name
  createdAt     DateTime @default(now())

  @@index([entityId, createdAt(sort: Desc)])
}
```

## 3. Operations
When writing backend code, queries, or procedures:
1. **Never use `UPDATE` or `DELETE`** on state log entries.
2. **`INSERT` a new row** for every state change. Make sure to capture the entire state context in the `payload` JSON field, not just the diff.
3. **Get Current State**: Query the latest row for the `entityId` by ordering by `createdAt DESC` and taking the first record (`LIMIT 1`).
4. **Get History**: Query all rows for the `entityId` ordering by `createdAt ASC`.

## 4. Implementation Details
- **Timestamping**: Provide meaningful timestamps automatically (e.g. `@default(now())` in Prisma).
- **Status Changes**: If an entity undergoes a status change (e.g., from `PENDING` to `SUCCESS`), insert the new row with `state: "SUCCESS"` and keep the old `PENDING` rows untouched.
- **Payload Completeness**: Ensure the `payload` field contains everything needed to completely reconstruct the entity state at that exact point in time.
