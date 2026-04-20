# Security Specification - Elementum Assay Lab

## Data Invariants
1. **Technician Authority**: Only users with the 'Technician' or 'Admin' role can finalize assays or approve requisitions.
2. **Client Isolation**: Users with the 'Client' role can ONLY see samples and invoices where the `clientName` matches their `displayName`.
3. **Requisition Integrity**: A requisition must be linked to a valid item and cannot be created with a requested quantity less than or equal to zero.
4. **Invoice Immutability**: Once an invoice is 'Paid', no further modifications are allowed except by an Admin for corrections.
5. **Audit Trail**: Every update to a sample or requisition must increment the history size or update the `updatedAt` timestamp.

## The "Dirty Dozen" Payloads (Deny Targets)

1. **Identity Spoofing**: Client attempting to read all samples without matching clientName.
2. **Privilege Escalation**: User attempting to update their own role from 'Client' to 'Admin'.
3. **Shadow Update**: Adding a `hidden_flag` to an inventory item to bypass filters.
4. **Orphaned Requisition**: Creating a requisition for an item ID that contains malicious characters.
5. **State Shortcut**: Client marking an invoice as 'Paid' without actually paying.
6. **Resource Poisoning**: Sending a 1MB string as a sample ID.
7. **Cross-Tenant Leak**: User A reading User B's private user profile.
8. **Negative Reorder**: Requesting -500 units of a reagent.
9. **History Deletion**: Updating a sample while shrinking the history array.
10. **Admin Door-Kicking**: Attempting to read the `users` collection list as a 'Technician'.
11. **Future Invoicing**: Creating an invoice with a `date` in the year 3000.
12. **Unauthorized Approval**: Role 'Client' attempting to set requisition status to 'Approved'.

## Verification Plan
1. Apply rules to handle `requisitions` and `invoices`.
2. Ensure `isTechnician()` and `isAdmin()` helpers are robust.
3. Validate schema constraints for all write operations.
