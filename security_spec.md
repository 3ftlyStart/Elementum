# Security Specification: Elementum Assay Lab

## Data Invariants
- A Sample must have a valid `submittedById` matching the authenticated user's UID.
- Users can only read samples they submitted, or all samples if they are a 'Technician' or 'Admin'.
- Only 'Technician' or 'Admin' roles can update `elements` (assay results).
- `createdAt` is immutable.
- `jobId` and `clientName` are immutable after creation.
- User roles in `/users/{userId}` can only be set by an Admin.

## Dirty Dozen Payloads
1. **Unauthorized Create**: Sample with `submittedById` != `request.auth.uid`.
2. **Identity Spoofing**: User profile creation with `role: 'Admin'` by a non-admin.
3. **Malicious Update**: Client changing `elements` (assay results) on their own sample.
4. **Data Injection**: Sample `jobId` longer than 128 characters.
5. **Role Escalation**: User trying to change their own role from 'Client' to 'Technician'.
6. **Orphaned Samples**: Creating a sample with a non-existent `clientName` (if validated against a list).
7. **Terminal State Bypass**: Updating a 'Finalized' sample.
8. **Shadow Field Injection**: Adding `isApproved: true` to a sample payload.
9. **Invalid Type**: Setting `gold` concentration to a string instead of a number.
10. **Timestamp Poisoning**: Setting `collectedAt` to a future date or `createdAt` to a client-provided time.
11. **Blanket Read Attempt**: Querying all samples without being a technician.
12. **Path Variable Attack**: Using a 2KB string as a `sampleId`.

## Test Runner (Logic)
- `service cloud.firestore { ... }` rules should block all the above.
